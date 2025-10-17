document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const btnStart = document.getElementById('btnStartCapture');
    const faceNotify = document.getElementById('faceNotify') || createNotifyDiv();
    // disable start until models loaded
    btnStart.disabled = true;
    function createNotifyDiv() {
        let div = document.createElement('div');
        div.id = 'faceNotify';
        div.className = 'mt-4 w-full text-center text-base font-semibold';
        btnStart.parentNode.insertBefore(div, btnStart);
        return div;
    }

    let stream = null;
    let intervalOfCapture = null;
    let modelsLoaded = false;
    let isAnalyzing = false;
    let lastDetectionBox = null;
    const lastDetections = [];

    // Đồng bộ kích thước canvas internal với kích thước hiển thị (CSS) của element
    function setCanvasSizeToElement(canvas, element) {
        const rect = element.getBoundingClientRect();
        // Gán internal pixel size = CSS display size để toDataURL trả ảnh đúng kích thước hiển thị
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    }

    // Scale bounding box from video native pixels -> overlay CSS pixels and handle mirror
    function scaleBoxToDisplay(box) {
        if (!video.videoWidth || !video.videoHeight) return box;
        const rect = overlay.getBoundingClientRect();
        const scaleX = rect.width / video.videoWidth;
        const scaleY = rect.height / video.videoHeight;
        const computed = getComputedStyle(video);
        const isFlipped = computed.transform && computed.transform.includes('-1');
        let x = box.x * scaleX;
        if (isFlipped) {
            // flip horizontally: newX = displayWidth - (box.x + box.width) * scaleX
            x = rect.width - (box.x + box.width) * scaleX;
        }
        return {
            x: x,
            y: box.y * scaleY,
            width: box.width * scaleX,
            height: box.height * scaleY
        };
    }

    /** 🔹 Tải mô hình */
    async function loadModels() {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('./models')
        ]);
        modelsLoaded = true;
        // enable start button when models ready
        btnStart.disabled = false;
        faceNotify.textContent = 'Mô hình đã sẵn sàng.';
        faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-green-600';
        startCamera();
    }

    /** 🔹 Bật camera */
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
            });
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                // Set overlay canvas size to match displayed video element size (CSS pixels)
                setCanvasSizeToElement(overlay, video);
                drawLoop(); // 🔥 Bắt đầu vòng lặp vẽ mượt
            });
        } catch (error) {
            alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
            console.error(error);
        }
    }

    /** 🔹 Vẽ video và khung khuôn mặt */
    async function drawLoop() {
        const ctx = overlay.getContext('2d', { willReadFrequently: true });
        const rect = overlay.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        // drawImage to CSS-size canvas so overlay and capture match display
        ctx.drawImage(video, 0, 0, rect.width, rect.height);

        if (modelsLoaded && !isAnalyzing) {
            isAnalyzing = true;
            faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .then(detection => {
                    if (detection && detection.detection) {
                        const box = detection.detection.box;
                        // scale to overlay display coords (and handle mirror)
                        lastDetectionBox = scaleBoxToDisplay(box);
                    }
                })
                .finally(() => (isAnalyzing = false));
        }

        // 🔲 Vẽ khung khuôn mặt nếu có
        if (lastDetectionBox) {
            ctx.save();
            ctx.strokeStyle = '#00e676';
            ctx.lineWidth = 3;
            ctx.strokeRect(lastDetectionBox.x, lastDetectionBox.y, lastDetectionBox.width, lastDetectionBox.height);
            ctx.restore();
        }

        requestAnimationFrame(drawLoop);
    }

    /** 🔹 Độ nét khuôn mặt */
    function getFaceSharpness(canvas, box) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const faceData = ctx.getImageData(box.x, box.y, box.width, box.height);
        const { data, width, height } = faceData;
        const gray = new Float32Array(width * height);

        for (let i = 0; i < data.length; i += 4)
            gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
        let variance = 0;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = (y + ky) * width + (x + kx);
                        sum += gray[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                    }
                }
                variance += sum * sum;
            }
        }
        return variance / (width * height);
    }

    /** 🔹 Độ sáng trung bình */
    function getAverageBrightness(canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4)
            sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        return sum / (data.length / 4);
    }

    /** 🔹 Khi nhấn "Bắt đầu" */
    loadModels();
    btnStart.addEventListener('click', async function() {
        // configuration: collect N targets uniformly between minRatio..maxRatio
        const totalSamples = 10;
        const minRatio = 0.10; // far
        const maxRatio = 0.30; // near
        const tolerance = 0.012; // acceptable +/- around target ratio

        btnStart.disabled = true;
        btnStart.style.display = 'none';
        faceNotify.textContent = `Đang lấy mẫu: 0/${totalSamples}`;
        faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-blue-600';

        const capturedBlobs = [];
        // prepare target ratios ascending: far -> near
        // Requirement: map the last 3 samples (8,9,10) into the range [0.233, 0.3]
        const splitPoint = 0.233; // boundary where last 3 samples start
        const lastCount = 3;
        const firstCount = Math.max(0, totalSamples - lastCount);

        // For the first segment we distribute values in [minRatio, splitPoint)
        // (use denom=firstCount so the last value is strictly less than splitPoint)
        const firstSegment = firstCount > 0
            ? Array.from({ length: firstCount }, (_, i) => {
                const denom = Math.max(1, firstCount);
                return minRatio + (i * (splitPoint - minRatio) / denom);
            })
            : [];

        const secondSegment = Array.from({ length: lastCount }, (_, i) => {
            // evenly distribute lastCount targets between splitPoint..maxRatio
            const denom = Math.max(1, lastCount - 1);
            return splitPoint + (i * (maxRatio - splitPoint) / denom);
        });

        const targetRatios = firstSegment.concat(secondSegment);

    // will keep trying until each target is captured
        for (let t = 0; t < targetRatios.length; t++) {
            const target = targetRatios[t];
            let got = false;
            // adaptive helpers: count attempts and allow progressive tolerance expansion
            let attempts = 0;
            let localTolerance = tolerance;
            const maxTolerance = 0.06; // safety cap to avoid capturing wildly off-target
            const expandEvery = 60; // attempts before expanding tolerance
            const fallbackAttempts = 240; // attempts before allowing fallback accept

            // try until captured (indefinite) but with adaptive fallback
            while (!got) {
                attempts++;
                // create offscreen canvas match display size
                const offCanvas = document.createElement('canvas');
                setCanvasSizeToElement(offCanvas, video);
                const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
                const w = offCanvas.width || 800;
                const h = offCanvas.height || 600;
                ctx.drawImage(video, 0, 0, w, h);

                // quick detect to get bounding box
                let detection = null;
                try {
                    detection = await faceapi.detectSingleFace(offCanvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.25 })).withFaceLandmarks();
                } catch (e) {
                    detection = null;
                }

                if (!detection || !detection.detection) {
                    faceNotify.textContent = `Không phát hiện khuôn mặt. Hãy căn chính giữa.`;
                    await new Promise(r => setTimeout(r, 400));
                    continue;
                }

                const box = detection.detection.box;
                const faceRatio = (box.width * box.height) / (w * h);

                // validate brightness / sharpness / occlusion (but DO NOT reject by fixed faceRatio)
                const brightness = getAverageBrightness(offCanvas);
                if (brightness < 60) {
                    faceNotify.textContent = `Ảnh quá tối (${Math.round(brightness)}). Hãy chụp ở nơi sáng hơn.`;
                    await new Promise(r => setTimeout(r, 400));
                    continue;
                }
                if (brightness > 240) {
                    faceNotify.textContent = `Ảnh quá sáng (${Math.round(brightness)}). Tránh ngược sáng.`;
                    await new Promise(r => setTimeout(r, 400));
                    continue;
                }
                const sharpness = getFaceSharpness(offCanvas, box);
                const minSharpness = 120; // relax a bit for live capture
                if (sharpness < minSharpness) {
                    faceNotify.textContent = `Ảnh bị mờ (sharp=${Math.round(sharpness)}). Hãy giữ yên.`;
                    await new Promise(r => setTimeout(r, 400));
                    continue;
                }

                const landmarks = detection.landmarks;
                const mouth = landmarks.getMouth();
                const mouthTopY = mouth[0].y;
                const mouthBottomY = mouth[mouth.length - 1].y;
                const mouthHeight = mouthBottomY - mouthTopY;
                if (mouthHeight < 4) {
                    faceNotify.textContent = 'Không thấy rõ vùng miệng. Có thể bạn đang đeo khẩu trang hoặc bị che mặt.';
                    await new Promise(r => setTimeout(r, 400));
                    continue;
                }

                // Guidance: tell user to move closer or further depending on target
                // apply localTolerance (adaptive) instead of fixed tolerance
                if (faceRatio < target - localTolerance) {
                    faceNotify.textContent = `Mẫu ${t + 1}. Hãy tiến lại gần một chút.`;
                    await new Promise(r => setTimeout(r, 300));
                    // expand tolerance every N attempts to avoid infinite wait
                    if (attempts % expandEvery === 0 && localTolerance < maxTolerance) {
                        localTolerance = Math.min(maxTolerance, localTolerance * 1.5);
                        faceNotify.textContent = `Không thể đạt mục tiêu chính xác — đang mở rộng dung sai lên ${localTolerance.toFixed(3)}...`;
                        await new Promise(r => setTimeout(r, 600));
                    }
                    // fallback acceptance after many attempts: accept nearer samples if quality ok
                    if (attempts >= fallbackAttempts && faceRatio >= Math.max(minRatio * 0.6, 0.06)) {
                        faceNotify.textContent = `Đã mở fallback — chấp nhận mẫu gần đủ (ratio=${faceRatio.toFixed(3)})`;
                        // capture below (fall through)
                    } else {
                        continue;
                    }
                } else if (faceRatio > target + localTolerance) {
                    faceNotify.textContent = `Mẫu ${t + 1}. Hãy lùi ra một chút.`;
                    await new Promise(r => setTimeout(r, 300));
                    if (attempts % expandEvery === 0 && localTolerance < maxTolerance) {
                        localTolerance = Math.min(maxTolerance, localTolerance * 1.5);
                        faceNotify.textContent = `Không thể đạt mục tiêu chính xác — đang mở rộng dung sai lên ${localTolerance.toFixed(3)}...`;
                        await new Promise(r => setTimeout(r, 600));
                    }
                    if (attempts >= fallbackAttempts && faceRatio <= Math.min(maxRatio * 1.2, 0.95)) {
                        faceNotify.textContent = `Đã mở fallback — chấp nhận mẫu gần đủ (ratio=${faceRatio.toFixed(3)})`;
                        // capture below (fall through)
                    } else {
                        continue;
                    }
                } else {
                    // in acceptable band -> capture
                    const blob = await new Promise(res => offCanvas.toBlob(res, 'image/jpeg', 0.9));
                    capturedBlobs.push({ blob, tag: `t${t + 1}`, target: target.toFixed(3), ratio: faceRatio.toFixed(3) });
                    console.log(`Captured sample ${t + 1}/${totalSamples} target=${target.toFixed(3)} got=${faceRatio.toFixed(3)}`);
                    faceNotify.textContent = `Đã lấy mẫu ${t + 1}/${totalSamples} (ratio=${faceRatio.toFixed(3)})`;
                    got = true;
                    // brief pause between targets
                    await new Promise(r => setTimeout(r, 500));
                }
            }

            // continue to next target only after successful capture
        }

        // stop camera BEFORE/AFTER depending on UX; we will stop now
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        video.srcObject = null;

        // build FormData with images[] and metadata
        const formData = new FormData();
        const staffId = window.staffId || document.body.dataset.staffId;
        formData.append('staff_id', staffId);
        // append images in order (far ... near)
        capturedBlobs.forEach((item, idx) => {
            formData.append('images[]', item.blob, `face_${item.tag}_${idx}.jpg`);
        });

        faceNotify.textContent = 'Đang tải ảnh lên server...';
        try {
            const response = await fetch(document.body.dataset.url + '/api/cham-cong/dang-ky-khuon-mat', {
                method: 'POST',
                body: formData
            });
            const resJson = await response.json();
            if (resJson.success) {
                faceNotify.textContent = '✅ Đăng ký khuôn mặt nhiều khung thành công!';
                faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-green-700';
            } else {
                faceNotify.textContent = resJson.message || '❌ Server trả về lỗi khi xử lý ảnh.';
                faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-red-700';
                btnStart.disabled = false;
                btnStart.style.display = '';
            }
        } catch (err) {
            console.error(err);
            faceNotify.textContent = '❌ Lỗi mạng khi upload ảnh.';
            faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-red-700';
            btnStart.disabled = false;
            btnStart.style.display = '';
        }
    });
});
