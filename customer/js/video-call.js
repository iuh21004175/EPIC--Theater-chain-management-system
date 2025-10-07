import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const waitingScreen = document.getElementById('waitingScreen');
    const joinCallBtn = document.getElementById('joinCallBtn');
    const videoCallContainer = document.getElementById('videoCallContainer');
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const toggleMicBtn = document.getElementById('toggleMic');
    const toggleVideoBtn = document.getElementById('toggleVideo');
    const shareScreenBtn = document.getElementById('shareScreen');
    const endCallBtn = document.getElementById('endCall');
    const connectionStatus = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    const callEndedModal = document.getElementById('callEndedModal');
    const callAgainBtn = document.getElementById('callAgain');
    const sidePanel = document.getElementById('sidePanel');
    const callTimer = document.querySelector('.call-timer');
    const callQuality = document.getElementById('callQuality');

    // WebRTC variables
    let localStream = null;
    let remoteStream = null;
    let peerConnection = null;
    let roomId = null;
    let callStartTimestamp = null;
    let timerInterval = null;
    let isAudioMuted = false;
    let isVideoMuted = false;
    let isScreenSharing = false;
    let originalLocalStream = null;
    let socket = null;
    let userId = null;
    let userType = 'customer';

    // Lấy thông tin từ URL và session
    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('room');
    userId = document.getElementById('userid')?.value;
    
    // Lấy userType từ hidden input (auto-detect từ PHP session)
    const userTypeInput = document.getElementById('usertype')?.value;
    userType = userTypeInput || 'customer'; // Default to customer nếu không có
    
    console.log('🔍 User info:', { userId, userType, roomId });
    
    if (!roomId) {
        alert('Thiếu thông tin phòng gọi video');
        window.location.href = '/';
        return;
    }
    
    if (!userId) {
        alert('Vui lòng đăng nhập để tham gia cuộc gọi');
        window.location.href = '/';
        return;
    }

    // Tự động tham gia cuộc gọi khi load trang (KHÔNG yêu cầu camera/mic)
    window.addEventListener('load', async function() {
        try {
            await initVideoCall();
        } catch (error) {
            console.error('Lỗi tham gia cuộc gọi:', error);
            alert('Không thể tham gia cuộc gọi. Vui lòng thử lại.');
        }
    });

    // Hàm khởi tạo video call (KHÔNG yêu cầu camera/mic)
    async function initVideoCall() {
        try {
            // Hiển thị video call container ngay lập tức
            videoCallContainer.classList.remove('hidden');
            
            // Thiết lập kết nối Socket.IO
            updateStatus('Đang kết nối đến máy chủ...');
            await setupSocketConnection();
            
            // Bắt đầu timer
            startCallTimer();
            updateCallStartTime();
            
            console.log('✅ Đã tham gia cuộc gọi (chưa bật camera/mic)');
            
        } catch (error) {
            throw error;
        }
    }


    // Thiết lập luồng video local (CHỈ GỌI KHI NGƯỜI DÙNG BẬT CAMERA/MIC)
    async function setupLocalStream() {
        try {
            // Nếu đã có stream rồi thì return
            if (localStream) {
                return localStream;
            }
            
            localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            
            originalLocalStream = localStream;
            localVideo.srcObject = localStream;
            
            // Thêm tracks vào peer connection nếu đã có
            if (peerConnection) {
                localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, localStream);
                    console.log('➕ Added track:', track.kind);
                });
            }
            
            console.log('✅ Local stream setup successfully');
            return localStream;
        } catch (error) {
            console.error('Lỗi truy cập media:', error);
            throw error;
        }
    }

    // Xử lý lỗi khởi tạo
    function handleInitError(error) {
        let errorMessage = 'Không thể kết nối cuộc gọi';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Bạn đã từ chối quyền truy cập camera/microphone.\n\nVui lòng:\n1. Nhấn vào biểu tượng khóa/camera trên thanh địa chỉ\n2. Cho phép truy cập Camera và Microphone\n3. Tải lại trang và thử lại';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'Không tìm thấy camera hoặc microphone.\n\nVui lòng kiểm tra:\n• Camera/microphone đã được kết nối\n• Thiết bị hoạt động bình thường\n• Không có ứng dụng nào khác đang sử dụng';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Không thể truy cập camera/microphone.\n\nCó thể một ứng dụng khác đang sử dụng thiết bị.';
        }
        
        alert(errorMessage);
        
        // Reset nút và cho phép thử lại
        joinCallBtn.disabled = false;
        joinCallBtn.innerHTML = '<i class="fas fa-phone-alt mr-2"></i>Thử lại';
    }
    
    // Cập nhật trạng thái hiển thị
    function updateStatus(message) {
        if (statusText) {
            statusText.textContent = message;
        }
    }

    // Thiết lập kết nối Socket.IO
    function setupSocketConnection() {
        // Kết nối Socket.IO
        socket = io('http://localhost:3000/video', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });
        
        // Kết nối thành công
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            updateStatus('Đang tham gia phòng...');
            
            // Join room với thông tin xác thực
            socket.emit('join-room', {
                roomId: roomId,
                userId: userId,
                userType: userType
            });
        });

        // Join room thành công
        socket.on('room-joined', async (data) => {
            console.log('✅ Đã tham gia room:', data);
            
            // Đếm số người trong room
            const participantCount = data.participants ? Object.keys(data.participants).length : 1;
            console.log('👥 Số người trong room:', participantCount);
            
            // Nếu đã có 2 người → Tự động bật camera/mic và tạo kết nối
            if (participantCount >= 2) {
                console.log('🎥 Có 2 người, tự động bật camera/mic và thiết lập kết nối...');
                updateStatus('Đang kết nối camera/microphone...');
                
                try {
                    // Bật camera/mic
                    await setupLocalStream();
                    
                    // Chờ 500ms để stream ổn định
                    setTimeout(async () => {
                        // Tạo peer connection với local stream
                        createPeerConnection();
                        
                        // Người vào TRƯỚC (customer) tạo offer
                        if (userType === 'customer') {
                            updateStatus('Đang thiết lập kết nối với nhân viên...');
                            await createOffer();
                        } else {
                            updateStatus('Đang thiết lập kết nối với khách hàng...');
                        }
                    }, 500);
                    
                } catch (error) {
                    console.error('❌ Lỗi bật camera/mic:', error);
                    updateStatus('Không thể truy cập camera/microphone');
                }
            } else {
                // Chỉ có 1 người → Hiển thị trạng thái chờ
                if (userType === 'customer') {
                    updateStatus('Đang chờ nhân viên tư vấn...');
                } else if (userType === 'staff') {
                    updateStatus('Đang chờ khách hàng...');
                } else {
                    updateStatus('Đã tham gia phòng');
                }
            }
        });

        // Join room thất bại
        socket.on('join-error', (data) => {
            console.error('❌ Lỗi join room:', data.message);
            alert(data.message);
            window.location.href = '/';
        });

        // Có người tham gia
        socket.on('user-joined', async (data) => {
            console.log('👤 User joined:', data);
            
            // Reset peer connection cũ nếu có
            if (peerConnection) {
                console.log('🔄 Reset peer connection cũ để tạo kết nối mới');
                peerConnection.close();
                peerConnection = null;
            }
            
            // Dừng remote stream cũ
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
                remoteVideo.srcObject = null;
                remoteStream = null;
            }
            
            // CHỈ bật camera/mic nếu là người vào SAU và chưa có local stream
            // Khi test trên cùng 1 máy, chỉ browser đầu tiên có thể bật camera/mic
            if (!localStream) {
                console.log('⚠️ Chưa có local stream, nhưng sẽ không tự động bật để tránh conflict camera/mic');
                console.log('💡 Người dùng có thể bật camera/mic thủ công bằng nút điều khiển');
                updateStatus('Đang chờ kết nối...');
            }
            
            // Tạo peer connection mới
            createPeerConnection();
            
            // Hiển thị thông báo phù hợp và tạo offer
            if (userType === 'customer' && data.userType === 'staff') {
                updateStatus('Nhân viên tư vấn đã vào phòng. Đang thiết lập kết nối...');
                
                // Customer tạo offer cho staff
                setTimeout(async () => {
                    console.log('📤 Customer tạo offer cho staff...');
                    await createOffer();
                }, 1000);
                
            } else if (userType === 'staff' && data.userType === 'customer') {
                updateStatus('Khách hàng đã vào phòng. Đang thiết lập kết nối...');
                
                // Staff tạo offer cho customer
                setTimeout(async () => {
                    console.log('📤 Staff tạo offer cho customer...');
                    await createOffer();
                }, 1000);
                
            } else {
                updateStatus('Đang thiết lập kết nối...');
                
                // Trường hợp khác cũng tạo offer
                setTimeout(async () => {
                    await createOffer();
                }, 1000);
            }
        });

        // Nhận offer
        socket.on('offer', async (data) => {
            console.log('📥 Nhận offer từ:', data.from);
            await handleOffer(data.offer);
        });

        // Nhận answer
        socket.on('answer', async (data) => {
            console.log('📥 Nhận answer từ:', data.from);
            await handleAnswer(data.answer);
        });

        // Nhận ICE candidate
        socket.on('ice-candidate', async (data) => {
            console.log('🧊 Nhận ICE candidate từ:', data.from);
            await handleIceCandidate(data.candidate);
        });

        // Người khác rời phòng
        socket.on('user-left', (data) => {
            console.log('👋 User left:', data);
            
            // Reset peer connection để sẵn sàng kết nối lại
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
            
            // Dừng remote stream
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
                remoteVideo.srcObject = null;
                remoteStream = null;
            }
            
            // Hiển thị thông báo chờ người kia quay lại
            if (userType === 'customer') {
                updateStatus('Nhân viên tư vấn đã ngắt kết nối. Đang chờ kết nối lại...');
            } else if (userType === 'staff') {
                updateStatus('Khách hàng đã ngắt kết nối. Đang chờ kết nối lại...');
            } else {
                updateStatus('Người dùng khác đã ngắt kết nối. Đang chờ kết nối lại...');
            }
            
            showConnectionStatus();
            
            console.log('⏳ Đã reset peer connection, sẵn sàng kết nối lại khi người kia quay lại');
        });
        
        // Bị force disconnect (đăng nhập từ thiết bị khác)
        socket.on('force-disconnect', (data) => {
            console.log('⚠️ Force disconnect:', data);
            alert(data.message || 'Bạn đã đăng nhập từ thiết bị khác');
            endCall();
        });
        
        // Lỗi kết nối
        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            updateStatus('Lỗi kết nối máy chủ. Đang thử lại...');
        });
    }

    // Tạo Peer Connection
    function createPeerConnection() {
        if (peerConnection) return peerConnection;

        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };

        peerConnection = new RTCPeerConnection(configuration);

        // CHỈ thêm local tracks NẾU ĐÃ CÓ localStream
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
                console.log('➕ Added track:', track.kind);
            });
        }

        // Nhận remote stream
        peerConnection.ontrack = (event) => {
            console.log('📺 Nhận remote stream:', event.streams[0].id);
            if (remoteVideo.srcObject !== event.streams[0]) {
                remoteVideo.srcObject = event.streams[0];
                remoteStream = event.streams[0];
                updateStatus('Đã kết nối thành công!');
                
                // Cập nhật label remote user dựa trên userType
                const remoteUserLabel = document.getElementById('remoteUserLabel');
                if (remoteUserLabel) {
                    if (userType === 'customer') {
                        remoteUserLabel.textContent = 'Nhân viên tư vấn';
                    } else if (userType === 'staff') {
                        remoteUserLabel.textContent = 'Khách hàng';
                    } else {
                        remoteUserLabel.textContent = 'Người dùng khác';
                    }
                }
                
                setTimeout(() => hideConnectionStatus(), 2000);
            }
        };

        // ICE candidate
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('🧊 Gửi ICE candidate:', event.candidate.type, event.candidate.candidate);
                socket.emit('ice-candidate', {
                    roomId: roomId,
                    candidate: event.candidate
                });
            } else {
                console.log('✅ ICE gathering complete');
            }
        };

        // Connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log('🔗 Connection state:', peerConnection.connectionState);
            
            switch (peerConnection.connectionState) {
                case 'connected':
                    console.log('✅ Peer connection established');
                    hideConnectionStatus();
                    setCallQuality('Tốt');
                    break;
                case 'connecting':
                    updateStatus('Đang kết nối...');
                    break;
                case 'disconnected':
                    updateStatus('Mất kết nối. Đang thử kết nối lại...');
                    setCallQuality('Kém');
                    break;
                case 'failed':
                    alert('Kết nối thất bại. Vui lòng thử lại.');
                    endCall();
                    break;
                case 'closed':
                    console.log('Connection closed');
                    break;
            }
        };

        // ICE connection state
        peerConnection.oniceconnectionstatechange = () => {
            console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
        };
        
        // ICE gathering state
        peerConnection.onicegatheringstatechange = () => {
            console.log('📡 ICE gathering state:', peerConnection.iceGatheringState);
        };

        console.log('✅ Peer connection created');
        return peerConnection;
    }

    // Tạo offer
    async function createOffer() {
        try {
            createPeerConnection();
            
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            console.log('📤 Gửi offer');
            socket.emit('offer', {
                roomId: roomId,
                offer: offer
            });
        } catch (error) {
            console.error('Lỗi tạo offer:', error);
        }
    }

    // Xử lý offer
    async function handleOffer(offer) {
        try {
            // KHÔNG tự động bật camera/mic khi nhận offer
            // Vì khi test trên cùng 1 máy, camera/mic đã bị browser kia chiếm dụng
            if (!localStream) {
                console.log('⚠️ Nhận offer nhưng chưa có local stream');
                console.log('💡 Tạo peer connection mà không có local tracks (chỉ nhận video)');
            }
            
            createPeerConnection();
            
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            console.log('📤 Gửi answer');
            socket.emit('answer', {
                roomId: roomId,
                answer: answer
            });
        } catch (error) {
            console.error('Lỗi xử lý offer:', error);
        }
    }

    // Xử lý answer
    async function handleAnswer(answer) {
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('✅ Đã set remote description');
        } catch (error) {
            console.error('Lỗi xử lý answer:', error);
        }
    }

    // Xử lý ICE candidate
    async function handleIceCandidate(candidate) {
        try {
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                console.log('✅ Đã thêm ICE candidate');
            }
        } catch (error) {
            console.error('Lỗi xử lý ICE candidate:', error);
        }
    }

    // Hiển thị trạng thái kết nối
    function showConnectionStatus() {
        if (connectionStatus) {
            connectionStatus.classList.remove('hidden');
        }
    }

    // Ẩn trạng thái kết nối
    function hideConnectionStatus() {
        if (connectionStatus) {
            connectionStatus.classList.add('hidden');
        }
    }

    // Hàm kết thúc cuộc gọi
    function endCall() {
        console.log('🔴 Kết thúc cuộc gọi');
        
        // Dừng tất cả local tracks
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
                console.log('⏹️ Stopped track:', track.kind);
            });
            localStream = null;
        }
        
        // Dừng tất cả remote tracks
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            remoteStream = null;
        }
        
        // Đóng peer connection
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        
        // Ngắt kết nối Socket.IO
        if (socket) {
            socket.emit('leave-room');
            socket.disconnect();
        }
        
        // Dừng timer
        stopCallTimer();
        
        // Hiển thị modal kết thúc
        showCallEndedModal();
    }

    // Hiển thị modal kết thúc cuộc gọi
    function showCallEndedModal() {
        if (callEndedModal) {
            callEndedModal.classList.remove('hidden');
            callEndedModal.classList.add('flex');
        }
    }
    async function toggleMicrophone() {
        // Nếu chưa có localStream, yêu cầu quyền truy cập
        if (!localStream) {
            try {
                toggleMicBtn.disabled = true;
                toggleMicBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xl"></i>';
                await setupLocalStream();
                toggleMicBtn.disabled = false;
                // Sau khi có stream, mic đã BẬT sẵn
                isAudioMuted = false;
                toggleMicBtn.innerHTML = '<i class="fas fa-microphone text-xl"></i>';
                toggleMicBtn.classList.add('bg-gray-700');
                toggleMicBtn.classList.remove('bg-red-600');
                return;
            } catch (error) {
                toggleMicBtn.disabled = false;
                toggleMicBtn.innerHTML = '<i class="fas fa-microphone-slash text-xl"></i>';
                alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền trình duyệt.');
                return;
            }
        }
        
        // Nếu đã có localStream, toggle mute
        const audioTracks = localStream.getAudioTracks();
        if (audioTracks.length > 0) {
            isAudioMuted = !isAudioMuted;
            audioTracks[0].enabled = !isAudioMuted;
            
            // Cập nhật UI
            if (isAudioMuted) {
                toggleMicBtn.innerHTML = '<i class="fas fa-microphone-slash text-xl"></i>';
                toggleMicBtn.classList.add('bg-red-600');
                toggleMicBtn.classList.remove('bg-gray-700');
            } else {
                toggleMicBtn.innerHTML = '<i class="fas fa-microphone text-xl"></i>';
                toggleMicBtn.classList.add('bg-gray-700');
                toggleMicBtn.classList.remove('bg-red-600');
            }
        }
    }

    // Bật/tắt camera
    async function toggleCamera() {
        // Nếu chưa có localStream, yêu cầu quyền truy cập
        if (!localStream) {
            try {
                toggleVideoBtn.disabled = true;
                toggleVideoBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xl"></i>';
                await setupLocalStream();
                toggleVideoBtn.disabled = false;
                // Sau khi có stream, camera đã BẬT sẵn
                isVideoMuted = false;
                toggleVideoBtn.innerHTML = '<i class="fas fa-video text-xl"></i>';
                toggleVideoBtn.classList.add('bg-gray-700');
                toggleVideoBtn.classList.remove('bg-red-600');
                return;
            } catch (error) {
                toggleVideoBtn.disabled = false;
                toggleVideoBtn.innerHTML = '<i class="fas fa-video-slash text-xl"></i>';
                alert('Không thể truy cập camera. Vui lòng kiểm tra quyền trình duyệt.');
                return;
            }
        }
        
        // Nếu đã có localStream, toggle mute
        const videoTracks = localStream.getVideoTracks();
        if (videoTracks.length > 0) {
            isVideoMuted = !isVideoMuted;
            videoTracks[0].enabled = !isVideoMuted;
            
            // Cập nhật UI
            if (isVideoMuted) {
                toggleVideoBtn.innerHTML = '<i class="fas fa-video-slash text-xl"></i>';
                toggleVideoBtn.classList.add('bg-red-600');
                toggleVideoBtn.classList.remove('bg-gray-700');
            } else {
                toggleVideoBtn.innerHTML = '<i class="fas fa-video text-xl"></i>';
                toggleVideoBtn.classList.add('bg-gray-700');
                toggleVideoBtn.classList.remove('bg-red-600');
            }
        }
    }

    // Chia sẻ màn hình
    async function toggleScreenSharing() {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: true,
                    audio: true
                });
                
                // Lưu trữ localStream gốc
                if (!originalLocalStream) {
                    originalLocalStream = localStream;
                }
                
                // Thay thế video track trong peer connection
                const videoTrack = screenStream.getVideoTracks()[0];
                const senders = peerConnection.getSenders();
                const videoSender = senders.find(sender => 
                    sender.track && sender.track.kind === 'video'
                );
                
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack);
                }
                
                // Cập nhật local stream và UI
                localVideo.srcObject = screenStream;
                localStream = screenStream;
                
                // Xử lý khi người dùng dừng chia sẻ màn hình
                videoTrack.addEventListener('ended', () => {
                    stopScreenSharing();
                });
                
                isScreenSharing = true;
                shareScreenBtn.innerHTML = '<i class="fas fa-desktop text-xl"></i>';
                shareScreenBtn.classList.add('bg-red-600');
                shareScreenBtn.classList.remove('bg-gray-700');
                
            } catch (error) {
                console.error('Lỗi khi chia sẻ màn hình:', error);
            }
        } else {
            stopScreenSharing();
        }
    }

    // Dừng chia sẻ màn hình
    function stopScreenSharing() {
        if (isScreenSharing && originalLocalStream) {
            // Lấy video track từ localStream gốc
            const videoTrack = originalLocalStream.getVideoTracks()[0];
            
            // Thay thế trong peer connection
            const senders = peerConnection.getSenders();
            const videoSender = senders.find(sender => 
                sender.track && sender.track.kind === 'video'
            );
            
            if (videoSender && videoTrack) {
                videoSender.replaceTrack(videoTrack);
            }
            
            // Dừng tất cả các track của stream màn hình
            localStream.getTracks().forEach(track => track.stop());
            
            // Khôi phục localStream gốc
            localStream = originalLocalStream;
            localVideo.srcObject = originalLocalStream;
            
            isScreenSharing = false;
            shareScreenBtn.innerHTML = '<i class="fas fa-desktop text-xl"></i>';
            shareScreenBtn.classList.add('bg-gray-700');
            shareScreenBtn.classList.remove('bg-red-600');
        }
    }

    // Bắt đầu đếm thời gian cuộc gọi
    function startCallTimer() {
        callStartTimestamp = Date.now();
        updateCallTimer();
        
        timerInterval = setInterval(updateCallTimer, 1000);
    }

    // Cập nhật đồng hồ đếm thời gian cuộc gọi
    function updateCallTimer() {
        const elapsedTime = Math.floor((Date.now() - callStartTimestamp) / 1000);
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        callTimer.textContent = `${minutes}:${seconds}`;
    }

    // Dừng đếm thời gian cuộc gọi
    function stopCallTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Cập nhật thời gian bắt đầu cuộc gọi
    function updateCallStartTime() {
        const callStartTimeEl = document.getElementById('callStartTime');
        if (callStartTimeEl) {
            const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            callStartTimeEl.textContent = startTime;
        }
    }

    // Cập nhật chất lượng cuộc gọi
    function setCallQuality(quality) {
        if (!callQuality) return; // Nếu element không tồn tại
        
        callQuality.textContent = quality;
        
        if (quality === 'Tốt') {
            callQuality.className = 'text-green-500';
        } else if (quality === 'Trung bình') {
            callQuality.className = 'text-yellow-500';
        } else {
            callQuality.className = 'text-red-500';
        }
    }

    // Tạo room ID ngẫu nhiên
    function generateRandomRoomId() {
        return Math.random().toString(36).substring(2, 15);
    }


    // Event listeners
    if (toggleMicBtn) toggleMicBtn.addEventListener('click', toggleMicrophone);
    if (toggleVideoBtn) toggleVideoBtn.addEventListener('click', toggleCamera);
    if (shareScreenBtn) shareScreenBtn.addEventListener('click', toggleScreenSharing);
    if (endCallBtn) endCallBtn.addEventListener('click', endCall);
    if (callAgainBtn) {
        callAgainBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    // Xử lý khi người dùng rời đi
    window.addEventListener('beforeunload', () => {
        if (socket && socket.connected) {
            socket.emit('leave-room');
        }
        if (peerConnection) {
            peerConnection.close();
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
    });
});