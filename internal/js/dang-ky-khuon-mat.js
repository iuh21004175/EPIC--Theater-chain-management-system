document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const btnStart = document.getElementById('btnStartCapture');
    const faceNotify = document.getElementById('faceNotify') || createNotifyDiv();
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

    /** 🔹 Tải mô hình */
    async function loadModels() {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('./models')
        ]);
        modelsLoaded = true;
        startCamera();
    }

    /** 🔹 Bật camera */
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
            });
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                overlay.width = video.videoWidth;
                overlay.height = video.videoHeight;
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
        ctx.drawImage(video, 0, 0, overlay.width, overlay.height);

        if (modelsLoaded && !isAnalyzing) {
            isAnalyzing = true;
            faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .then(detection => {
                    if (detection && detection.detection) {
                        const box = detection.detection.box;
                        lastDetectionBox = box; // lưu khung mới nhất
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

    /** 🧩 Kiểm tra ảnh đạt chuẩn không */
    async function isFaceImageValid(canvas) {
        if (!modelsLoaded) return { valid: false, message: 'Chưa tải xong mô hình nhận diện.' };

        const detections = await faceapi
            .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

        if (detections.length === 0)
            return { valid: false, message: 'Không phát hiện khuôn mặt, hãy căn chỉnh lại vị trí khuôn mặt trong khung hình.' };
        if (detections.length > 1)
            return { valid: false, message: 'Có nhiều hơn 1 khuôn mặt trong khung hình, hãy đảm bảo chỉ có 1 người.' };

        const detection = detections[0];
        const box = detection.detection.box;

        // Độ sáng
        const brightness = getAverageBrightness(canvas);
        if (brightness < 60)
            return { valid: false, message: 'Ảnh quá tối, hãy chụp ở nơi có đủ ánh sáng.' };

        // Độ nét
        const sharpness = getFaceSharpness(canvas, box);
        const minSharpness = 200;
        if (sharpness < minSharpness)
            return { valid: false, message: 'Ảnh bị mờ, hãy chụp lại trong điều kiện sáng hơn.' };

        // Kích thước khuôn mặt
        const minSize = 240;
        if (box.width < minSize || box.height < minSize)
            return { valid: false, message: 'Khuôn mặt quá nhỏ, hãy đưa gần camera hơn.' };

        // Độ nghiêng
        const leftEye = detection.landmarks.getLeftEye();
        const rightEye = detection.landmarks.getRightEye();
        const eyeDx = Math.abs(leftEye[0].y - rightEye[0].y);
        if (eyeDx > 15)
            return { valid: false, message: 'Mặt nghiêng quá mức, hãy chỉnh lại cho thẳng.' };

        // Căn giữa
        const faceCenterX = box.x + box.width / 2;
        const frameCenterX = canvas.width / 2;
        if (Math.abs(faceCenterX - frameCenterX) > canvas.width * 0.25)
            return { valid: false, message: 'Khuôn mặt lệch sang một bên quá nhiều, hãy căn giữa.' };

        // Ổn định
        lastDetections.push({ x: box.x, y: box.y, sharpness });
        if (lastDetections.length > 5) lastDetections.shift();

        if (lastDetections.length >= 3) {
            const dx = Math.abs(lastDetections[4].x - lastDetections[0].x);
            const dy = Math.abs(lastDetections[4].y - lastDetections[0].y);
            const motion = Math.sqrt(dx * dx + dy * dy);
            const avgSharp = lastDetections.reduce((a, b) => a + b.sharpness, 0) / lastDetections.length;

            if (motion > 10)
                return { valid: false, message: 'Khuôn mặt di chuyển, hãy giữ yên để chụp rõ hơn.' };
            if (avgSharp < minSharpness)
                return { valid: false, message: 'Ảnh bị mờ do chuyển động, hãy giữ yên khuôn mặt.' };
        }

        return { valid: true, message: '✅ Ảnh đạt chuẩn, có thể dùng để đăng ký khuôn mặt.' };
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
            offCanvas.width = overlay.width;
            offCanvas.height = overlay.height;
            const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);

            const result = await isFaceImageValid(offCanvas);
            faceNotify.textContent = result.message;
            faceNotify.className = result.valid
                ? 'mt-4 w-full text-center text-base font-semibold text-green-700'
                : 'mt-4 w-full text-center text-base font-semibold text-red-600';

            if (result.valid) {
                clearInterval(intervalOfCapture);
                // Stop video and camera
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                video.srcObject = null;

                // Convert base64 to Blob
                const dataUrl = offCanvas.toDataURL('image/jpeg');
                const byteString = atob(dataUrl.split(',')[1]);
                const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });

                const formData = new FormData();
                formData.append('image', blob, 'face.jpg');
                formData.append('staff_id', window.staffId || document.body.dataset.staffId);

                const response = await fetch(document.body.dataset.url + '/api/cham-cong/dang-ky-khuon-mat', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    faceNotify.textContent = '✅ Đăng ký khuôn mặt thành công!';
                    faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-green-700';
                } else {
                    faceNotify.textContent = '❌ Đăng ký khuôn mặt thất bại, vui lòng thử lại.';
                    faceNotify.className = 'mt-4 w-full text-center text-base font-semibold text-red-700';  
                }
            }
        }, 1000);
    });
});
