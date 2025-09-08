import Spinner from "./util/spinner.js";
document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const addMovieBtn = document.getElementById('btn-add-movie');
    const addMovieModal = document.getElementById('add-movie-modal');
    const addMovieForm = document.getElementById('add-movie-form');
    // Declared but will be used in future implementations
    const editMovieModal = document.getElementById('edit-movie-modal');
    const editMovieForm = document.getElementById('edit-movie-form');
    // Movie list element
    let movieList = document.getElementById('movie-list');
    // Modal functions
    function openModal(modalElement) {
        document.body.classList.add('modal-active');
        modalElement.classList.remove('opacity-0', 'pointer-events-none');
    }
    
    function closeModal() {
        document.body.classList.remove('modal-active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('opacity-0', 'pointer-events-none');
        });
    }
    
    // Add movie button click event
    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', function() {
            // Reset form if needed
            if (addMovieForm) {
                addMovieForm.reset();
            }
            
            // Clear any previous validation errors
            document.querySelectorAll('.text-red-500.text-xs.italic').forEach(errorMsg => {
                errorMsg.classList.add('hidden');
            });
            
            // Open modal
            openModal(addMovieModal);
        });
    }
    
    // Close buttons click events
    document.querySelectorAll('.modal-close-btn, .modal-close, .modal-overlay').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside the modal content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
    
    // Prevent closing when clicking inside the modal content
    document.querySelectorAll('.modal-container').forEach(container => {
        container.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Hàm lấy giá trị từ checkbox thể loại
    function getSelectedGenres(prefix = '') {
        const selectedGenres = [];
        document.querySelectorAll(`input[name="${prefix}movie-genres[]"]:checked`).forEach(checkbox => {
            selectedGenres.push(checkbox.value);
        });
        return selectedGenres;
    }

    // Hàm kiểm tra URL YouTube hợp lệ
    function isValidYoutubeUrl(url) {
        const pattern = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=.+$/;
        return pattern.test(url);
    }

    // Add movie form submission
    if (addMovieForm) {
        addMovieForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Kiểm tra validation
            let isValid = true;
            
            // Kiểm tra tên phim
            const movieTitle = document.getElementById('movie-title').value.trim();
            if (!movieTitle) {
                document.getElementById('movie-title-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-title-error').classList.add('hidden');
            }
            
            // Kiểm tra đạo diễn
            const movieDirector = document.getElementById('movie-director').value.trim();
            if (!movieDirector) {
                document.getElementById('movie-director-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-director-error').classList.add('hidden');
            }
            
            // Kiểm tra diễn viên
            const movieActors = document.getElementById('movie-actors').value.trim();
            if (!movieActors) {
                document.getElementById('movie-actors-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-actors-error').classList.add('hidden');
            }
            
            // Kiểm tra thể loại
            const selectedGenres = getSelectedGenres();
            if (selectedGenres.length === 0) {
                document.getElementById('movie-genres-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-genres-error').classList.add('hidden');
            }
            
            // Kiểm tra thời lượng
            const movieDuration = document.getElementById('movie-duration').value.trim();
            if (!movieDuration || isNaN(movieDuration) || parseInt(movieDuration) <= 0) {
                document.getElementById('movie-duration-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-duration-error').classList.add('hidden');
            }
            
            // Kiểm tra phân loại
            const movieRating = document.getElementById('movie-rating').value;
            if (!movieRating) {
                document.getElementById('movie-rating-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-rating-error').classList.add('hidden');
            }
            
            // Kiểm tra trạng thái
            const movieStatus = document.getElementById('movie-status').value;
            if (!movieStatus) {
                document.getElementById('movie-status-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-status-error').classList.add('hidden');
            }
            
            // Kiểm tra poster
            const moviePoster = document.getElementById('movie-poster').files[0];
            if (!moviePoster) {
                document.getElementById('movie-poster-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-poster-error').classList.add('hidden');
            }
            
            // Kiểm tra mô tả
            const movieDescription = document.getElementById('movie-description').value.trim();
            if (!movieDescription) {
                document.getElementById('movie-description-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('movie-description-error').classList.add('hidden');
            }
            
            // Nếu form không hợp lệ, dừng lại
            if (!isValid) {
                return;
            }
            
            // Tạo FormData để gửi lên server
            const formData = new FormData();
            formData.append('ten', movieTitle);
            formData.append('dao_dien', movieDirector);
            formData.append('dien_vien', movieActors);
            formData.append('thoi_luong', movieDuration);
            formData.append('do_tuoi', movieRating);
            formData.append('mo_ta', movieDescription);
            formData.append('trang_thai', movieStatus);
            
            // Thêm trailer nếu có
            const movieTrailer = document.getElementById('movie-trailer').value.trim();
            if (movieTrailer) {
                // Lấy video ID từ URL YouTube
                const videoId = getYouTubeVideoId(movieTrailer);
                if (videoId) {
                    formData.append('trailer_id', videoId);
                }
            }
            
            // Thêm poster
            formData.append('poster', moviePoster);
            
            // Thêm thể loại
            selectedGenres.forEach((genreId, index) => {
                formData.append(`the_loai_ids[${index}]`, genreId);
            });
            
            // Thêm ngày công chiếu - sử dụng ngày hiện tại cho demo
            const today = new Date();
            const dateString = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
            formData.append('ngay_cong_chieu', dateString);
            
            // Thêm quốc gia (mặc định "Việt Nam")
            formData.append('quoc_gia', 'Việt Nam');
            
            // Hiển thị spinner
            const spinner = Spinner.show({
                target: addMovieModal,
                text: 'Đang thêm phim...'
            });
            
            // Gửi request POST lên API
            fetch(`${movieList.dataset.url}/api/phim`, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Ẩn spinner
                Spinner.hide(spinner);
                
                if (data.success) {
                    // Đóng modal
                    closeModal();
                    
                    // Hiển thị thông báo thành công
                    showToast('Thêm phim thành công', false);
                    
                    // Tải lại danh sách phim
                    // loadMovies(); // Thêm hàm này sau nếu cần
                    
                    // Reset form
                    addMovieForm.reset();
                    
                    // Ẩn phần xem trước trailer nếu có
                    document.getElementById('movie-trailer-preview').classList.add('hidden');
                } else {
                    // Hiển thị thông báo lỗi
                    showToast(data.message || 'Thêm phim thất bại', true);
                    console.error('Error:', data.message);
                }
            })
            .catch(error => {
                // Ẩn spinner
                Spinner.hide(spinner);
                
                // Hiển thị thông báo lỗi
                console.error('Error:', error);
                showToast('Lỗi khi thêm phim: ' + error.message, true);
                console.error('Error:', error.message);
            });
        });
    }

    // Xử lý sự kiện paste cho ô nhập trailer
    const trailerInput = document.getElementById('movie-trailer');
    const editTrailerInput = document.getElementById('edit-movie-trailer');
    
    if (trailerInput) {
        trailerInput.addEventListener('paste', function(event) {
            // Sử dụng setTimeout để đảm bảo giá trị đã được dán vào input
            setTimeout(() => {
                const url = this.value.trim();
                handleYouTubeUrl(url, '');
            }, 100);
        });
    }
    
    if (editTrailerInput) {
        editTrailerInput.addEventListener('paste', function(event) {
            // Sử dụng setTimeout để đảm bảo giá trị đã được dán vào input
            setTimeout(() => {
                const url = this.value.trim();
                handleYouTubeUrl(url, 'edit-');
            }, 100);
        });
    }
    
    // Xử lý input change để bắt URL nhập vào
    if (trailerInput) {
        trailerInput.addEventListener('input', function() {
            const url = this.value.trim();
            handleYouTubeUrl(url, '');
        });
    }
    
    if (editTrailerInput) {
        editTrailerInput.addEventListener('input', function() {
            const url = this.value.trim();
            handleYouTubeUrl(url, 'edit-');
        });
    }
    
    // Hàm xử lý URL YouTube
    function handleYouTubeUrl(url, prefix) {
        if (isValidYoutubeUrl(url)) {
            const videoId = getYouTubeVideoId(url);
            if (videoId) {
                getYouTubeVideoInfo(videoId, prefix);
            }
        } else {
            // Ẩn phần xem trước nếu URL không hợp lệ
            document.getElementById(`${prefix}movie-trailer-preview`).classList.add('hidden');
        }
    }
    
    // Xóa hàm pasteFromClipboard không cần thiết nữa
    
    // Các hàm khác giữ nguyên
    function getYouTubeVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    }
    
    // Hàm lấy thông tin video từ YouTube
    function getYouTubeVideoInfo(videoId, prefix) {
        // URL cho thumbnail chất lượng cao
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        // Cập nhật thumbnail
        document.getElementById(`${prefix}movie-trailer-thumbnail`).src = thumbnailUrl;
        
        // Hiển thị container xem trước
        document.getElementById(`${prefix}movie-trailer-preview`).classList.remove('hidden');
        
        // Lấy thông tin metadata của video từ API noembed
        fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById(`${prefix}movie-trailer-title`).textContent = data.title || 'Video YouTube';
                document.getElementById(`${prefix}movie-trailer-channel`).textContent = data.author_name || 'YouTube Channel';
            })
            .catch(error => {
                console.error('Error fetching video info:', error);
                document.getElementById(`${prefix}movie-trailer-title`).textContent = 'Video YouTube';
                document.getElementById(`${prefix}movie-trailer-channel`).textContent = 'Không thể tải thông tin video';
            });
        
        // Thêm sự kiện click vào container thumbnail
        document.getElementById(`${prefix}movie-trailer-thumbnail-container`).onclick = function() {
            openVideoModal(videoId);
        };
    }
    
    // Mở modal xem video YouTube
    function openVideoModal(videoId) {
        // Cập nhật iframe với video id
        document.getElementById('youtube-iframe').src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        
        // Mở modal
        openModal(document.getElementById('video-modal'));
    }
    
    // Cập nhật sự kiện đóng modal video
    document.querySelectorAll('#video-modal .modal-close, #video-modal .modal-overlay').forEach(element => {
        element.addEventListener('click', function() {
            // Dừng video khi đóng modal
            document.getElementById('youtube-iframe').src = '';
            closeModal();
        });
    });
    
    // Thay thế đoạn CSS ở cuối file phim.js
    const videoModalStyle = document.createElement('style');
    videoModalStyle.textContent = `
        /* Modal container styles */
        #video-modal {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #video-modal .modal-container {
            width: 85%;
            max-width: 1000px;
            max-height: 80vh;
            background-color: black;
            border-radius: 8px;
            overflow: hidden;
        }
        
        /* Modal content styles */
        #video-modal .modal-content {
            padding: 12px;
            height: auto;
        }
        
        /* Title and close button area */
        #video-modal .flex.justify-between {
            margin-bottom: 8px;
        }
        
        /* Video container with proper aspect ratio */
        .aspect-w-16 {
            position: relative;
            padding-bottom: 56.25%; /* Tỷ lệ 16:9 */
            height: 0;
            overflow: hidden;
        }
        
        .aspect-w-16 iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            max-height: calc(80vh - 80px); /* Trừ đi phần header */
        }
        
        /* Đảm bảo iframe không vượt quá kích thước màn hình */
        #youtube-iframe {
            max-height: calc(80vh - 80px);
        }
        
        /* Responsive adjustments */
        @media (max-height: 600px) {
            #video-modal .modal-container {
                max-height: 90vh;
            }
            
            #video-modal .modal-content {
                padding: 8px;
            }
            
            .aspect-w-16 iframe, #youtube-iframe {
                max-height: calc(90vh - 60px);
            }
        }
    `;
    document.head.appendChild(videoModalStyle);
    
    // Hàm xử lý ảnh lỗi
    function handleImageErrors() {
        // Áp dụng cho tất cả ảnh poster phim
        document.querySelectorAll('.movie-poster-img').forEach(img => {
            img.onerror = function() {
                this.src = `${movieList.dataset.url}/img/placeholder-poster.jpg`;
                this.onerror = null; // Tránh vòng lặp vô hạn nếu placeholder cũng lỗi
            };
        });
        
        // Áp dụng cho ảnh xem trước trailer
        document.querySelectorAll('#movie-trailer-thumbnail, #edit-movie-trailer-thumbnail').forEach(img => {
            img.onerror = function() {
                this.src = `${movieList.dataset.url}/img/video-placeholder.jpg`;
                this.onerror = null;
            };
        });
    }

    // Gọi hàm này sau khi tải danh sách phim
    handleImageErrors();

    // Thêm gọi hàm này trong hàm renderMovies nếu có
    function renderMovies(movies) {
        // ...existing code...
        
        // Xử lý lỗi ảnh sau khi render
        handleImageErrors();
    }

    function showToast(message, isError = false) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed bottom-4 right-4 z-50';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `p-4 mb-3 rounded-md shadow-md transform transition-transform duration-300 ease-in-out ${isError ? 'bg-red-500' : 'bg-green-500'} text-white`;
        toast.innerHTML = `
            <div class="flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${isError 
                        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>' 
                        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'}
                </svg>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
});   // Implement YouTube API call here if needed