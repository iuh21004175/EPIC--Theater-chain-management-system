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

    /** 🧩 Kiểm tra ảnh đạt chuẩn để dùng với ArcFace (kèm phát hiện che mặt) */
    async function isFaceImageValid(canvas) {
        if (!modelsLoaded)
            return { valid: false, message: '⏳ Chưa tải xong mô hình nhận diện.' };

        // thử nhiều cấu hình để robust hơn
        const tryOptions = [
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 }),
            new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 }),
            new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.25 })
        ];

        try {
            let detection = null;
            let detections = null;

            // debug: lưu ảnh ra console để kiểm tra thủ công nếu cần
            try { console.debug('Debug canvas dataURL (first 120 chars):', (canvas.toDataURL().slice(0,120))); } catch(e){}

            // Thử detectSingleFace nhanh trước, fallback sang detectAllFaces nếu không có
            for (const options of tryOptions) {
                try {
                    detection = await faceapi.detectSingleFace(canvas, options).withFaceLandmarks();
                } catch (e) {
                    detection = null;
                }
                if (detection && detection.detection) break;
            }

            // nếu detectSingleFace không thành công, thử detectAllFaces (để biết có >1 face)
            if (!detection) {
                for (const options of tryOptions) {
                    try {
                        detections = await faceapi.detectAllFaces(canvas, options).withFaceLandmarks();
                    } catch (e) {
                        detections = null;
                    }
                    if (detections && detections.length > 0) {
                        if (detections.length > 1) {
                            return { valid: false, message: '⚠️ Có nhiều khuôn mặt trong khung. Hãy để 1 người duy nhất.' };
                        }
                        detection = detections[0];
                        break;
                    }
                }
            }

            console.debug('Final detection:', !!detection, detection);

            if (!detection || !detection.detection) {
                return { valid: false, message: '❌ Không phát hiện khuôn mặt. Hãy nhìn thẳng vào camera hoặc thử giảm threshold inputSize.' };
            }

            const box = detection.detection.box;
            const landmarks = detection.landmarks;

            // các kiểm tra tiếp theo (độ sáng, nét, tỷ lệ, che mặt...) giữ nguyên như cũ
            const brightness = getAverageBrightness(canvas);
            if (brightness < 70) return { valid: false, message: '💡 Ảnh quá tối. Hãy chụp ở nơi sáng hơn.' };
            if (brightness > 200) return { valid: false, message: '💡 Ảnh quá sáng. Hãy giảm ánh sáng hoặc tránh ngược sáng.' };

            const sharpness = getFaceSharpness(canvas, box);
            const minSharpness = 180;
            if (sharpness < minSharpness) return { valid: false, message: '🔍 Ảnh bị mờ. Hãy giữ yên khuôn mặt khi chụp.' };

            const faceRatio = (box.width * box.height) / (canvas.width * canvas.height);
            if (faceRatio < 0.35) return { valid: false, message: '📏 Khuôn mặt quá nhỏ. Hãy tiến lại gần hơn.' };
            if (faceRatio > 0.8) return { valid: false, message: '📏 Khuôn mặt quá gần. Hãy lùi ra một chút.' };

            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const eyeSlope = Math.abs(leftEye[0].y - rightEye[0].y);
            if (eyeSlope > 10) return { valid: false, message: '↔️ Mặt nghiêng quá mức. Hãy chỉnh lại cho thẳng.' };

            const faceCenterX = box.x + box.width / 2;
            const faceCenterY = box.y + box.height / 2;
            const frameCenterX = canvas.width / 2;
            const frameCenterY = canvas.height / 2;
            if (Math.abs(faceCenterX - frameCenterX) > canvas.width * 0.2)
                return { valid: false, message: '📸 Khuôn mặt lệch sang một bên. Hãy căn giữa.' };
            if (Math.abs(faceCenterY - frameCenterY) > canvas.height * 0.2)
                return { valid: false, message: '📸 Khuôn mặt quá cao hoặc thấp trong khung hình.' };

            // phát hiện che mặt cơ bản
            const nose = landmarks.getNose();
            const mouth = landmarks.getMouth();
            const jaw = landmarks.getJawOutline();
            const mouthTopY = mouth[0].y;
            const mouthBottomY = mouth[mouth.length - 1].y;
            const mouthHeight = mouthBottomY - mouthTopY;
            if (mouthHeight < 4) return { valid: false, message: '😷 Không thấy rõ vùng miệng. Có thể bạn đang đeo khẩu trang hoặc bị che mặt.' };

            // ổn định chuyển động (giữ logic hiện tại)
            lastDetections.push({ x: box.x, y: box.y, sharpness });
            if (lastDetections.length > 5) lastDetections.shift();
            if (lastDetections.length >= 3) {
                const dx = Math.abs(lastDetections[4].x - lastDetections[0].x);
                const dy = Math.abs(lastDetections[4].y - lastDetections[0].y);
                const motion = Math.sqrt(dx * dx + dy * dy);
                const avgSharp = lastDetections.reduce((a, b) => a + b.sharpness, 0) / lastDetections.length;
                if (motion > 8) return { valid: false, message: '📷 Khuôn mặt đang di chuyển. Hãy giữ yên.' };
                if (avgSharp < minSharpness) return { valid: false, message: '📷 Ảnh bị mờ do chuyển động. Hãy giữ yên khuôn mặt.' };
            }

            return { valid: true, message: '✅ Ảnh đạt chuẩn, có thể dùng cho nhận diện ArcFace.' };
        } catch (err) {
            console.error('Face detection error:', err);
            return { valid: false, message: '❌ Lỗi khi nhận diện khuôn mặt, kiểm tra console để biết chi tiết.' };
        }
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
    btnStart.addEventListener('click', function() {
        if (intervalOfCapture) clearInterval(intervalOfCapture);
        btnStart.disabled = true;
        btnStart.style.display = 'none';
        faceNotify.textContent = 'Đang lấy dữ liệu...';
        faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-blue-600';

        intervalOfCapture = setInterval(async () => {
            if (isAnalyzing) return;

            const offCanvas = document.createElement('canvas');
            // Make capture canvas exactly the same displayed size as overlay/video
            setCanvasSizeToElement(offCanvas, video);
            const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
            // offCanvas is not in DOM, so use its width/height properties (set by setCanvasSizeToElement)
            const w = offCanvas.width || video.clientWidth || 640;
            const h = offCanvas.height || video.clientHeight || 480;
            console.debug('Capture canvas size:', w, h, 'video native:', video.videoWidth, video.videoHeight);
            ctx.drawImage(video, 0, 0, w, h);

            const result = await isFaceImageValid(offCanvas);
            console.debug('isFaceImageValid =>', result);
            faceNotify.textContent = result.message;
            faceNotify.className = result.valid
                ? 'mt-4 w-full text-center text-base font-semibold text-green-700'
                : 'mt-4 w-full text-center text-base font-semibold text-red-600';

            if (result.valid) {
                clearInterval(intervalOfCapture);

                // ensure last frame drawn to offCanvas: wait one rAF
                await new Promise(r => requestAnimationFrame(r));

                // Convert base64 to Blob BEFORE stopping the camera
                const dataUrl = offCanvas.toDataURL('image/jpeg');
                if (!dataUrl || dataUrl.length < 100) {
                    console.error('Captured dataURL is empty or too small', dataUrl && dataUrl.length);
                }

                const byteString = atob(dataUrl.split(',')[1]);
                const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });

                // stop video AFTER we have the dataURL/blob
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                video.srcObject = null;

                const formData = new FormData();
                formData.append('image', blob, 'face.jpg');
                formData.append('staff_id', window.staffId || document.body.dataset.staffId);

                console.debug('Uploading image blob, size:', blob.size, 'canvas:', offCanvas.width, offCanvas.height);
                const response = await fetch(document.body.dataset.url + '/api/cham-cong/dang-ky-khuon-mat', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    faceNotify.textContent = '✅ Đăng ký khuôn mặt thành công!';
                    faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-green-700';
                } else {
                    faceNotify.textContent = '❌ Đăng ký khuôn mặt thất bại, Khuôn mặt không hợp lệ.';
                    faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-red-700';  
                }
            }
        }, 500);
    });
});
