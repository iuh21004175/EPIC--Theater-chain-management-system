document.addEventListener('DOMContentLoaded', function() {
        // Existing tab switching code
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all tabs
                tabBtns.forEach(btn => {
                    btn.classList.remove('bg-red-600', 'text-white');
                    btn.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                });
                
                // Add active class to clicked tab
                this.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                this.classList.add('bg-red-600', 'text-white');
                
                // Hide all tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show corresponding tab content
                const tabId = this.id.replace('tab-btn-', 'tab-');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Special styling for rounded corners on tabs
        document.getElementById('tab-btn-phim').classList.add('rounded-l-md');
        document.getElementById('tab-btn-theloai').classList.add('rounded-r-md');
        
        // Modals
        const modals = {
            addMovie: document.getElementById('add-movie-modal'),
            editMovie: document.getElementById('edit-movie-modal'),
            addGenre: document.getElementById('add-genre-modal'),
            editGenre: document.getElementById('edit-genre-modal'),
            confirmStatus: document.getElementById('confirm-status-modal')
        };
        
        // Open Add Movie Modal
        document.getElementById('btn-add-movie').addEventListener('click', function() {
            openModal(modals.addMovie);
        });
        
        // Open Add Genre Modal
        document.getElementById('btn-add-genre').addEventListener('click', function() {
            openModal(modals.addGenre);
        });
        
        // Movie rows click handler
        const movieItems = document.querySelectorAll('.movie-item');
        movieItems.forEach(item => {
            item.addEventListener('click', function() {
                const movieId = this.getAttribute('data-id');
                // Highlight selected row
                movieItems.forEach(row => row.classList.remove('bg-gray-100'));
                this.classList.add('bg-gray-100');
                
                // Load movie data and show edit modal
                loadMovieData(movieId);
                openModal(modals.editMovie);
            });
        });
        
        // Genre Edit Buttons
        const editGenreButtons = document.querySelectorAll('.btn-edit-genre');
        editGenreButtons.forEach(button => {
            button.addEventListener('click', function() {
                const genreId = this.getAttribute('data-id');
                // Load genre data and open edit modal
                loadGenreData(genreId);
                openModal(modals.editGenre);
            });
        });
        
        // Add Genre Form Submit
        document.getElementById('add-genre-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('genre-name').value;
            const description = document.getElementById('genre-description').value;
            
            let isValid = true;
            
            // Validate name (required)
            if (!name) {
                document.getElementById('genre-name-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('genre-name-error').classList.add('hidden');
            }
            
            if (isValid) {
                // Submit data via AJAX (would be implemented in a real system)
                // For demo purposes:
                alert('Thêm thể loại thành công!');
                closeModal(modals.addGenre);
                document.getElementById('add-genre-form').reset();
            }
        });
        
        // Edit Genre Form Submit
        document.getElementById('edit-genre-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('edit-genre-name').value;
            
            let isValid = true;
            
            // Validate name (required)
            if (!name) {
                document.getElementById('edit-genre-name-error').classList.remove('hidden');
                isValid = false;
            } else {
                document.getElementById('edit-genre-name-error').classList.add('hidden');
            }
            
            if (isValid) {
                // Submit data via AJAX (would be implemented in a real system)
                // For demo purposes:
                alert('Cập nhật thông tin thể loại thành công!');
                closeModal(modals.editGenre);
            }
        });
        
        // Close modals with close buttons
        const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Close modals when clicking on overlay
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Helper Functions
        function openModal(modal) {
            document.body.classList.add('modal-active');
            modal.classList.add('opacity-100');
            modal.classList.remove('opacity-0', 'pointer-events-none');
        }
        
        function closeModal(modal) {
            document.body.classList.remove('modal-active');
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.classList.remove('opacity-100');
        }
        
        function loadGenreData(genreId) {
            // In a real application, this would be an AJAX call to get genre data
            // For demo purposes, we'll use static data
            let genreName, genreDescription;
            
            switch(genreId) {
                case '1':
                    genreName = 'Hành động';
                    genreDescription = 'Thể loại phim về các pha hành động, đánh đấm, rượt đuổi';
                    break;
                case '2':
                    genreName = 'Kinh dị';
                    genreDescription = 'Phim với những tình tiết đáng sợ, gây sợ hãi cho người xem';
                    break;
                case '3':
                    genreName = 'Hài';
                    genreDescription = 'Phim mang tính chất hài hước, vui vẻ';
                    break;
                default:
                    genreName = '';
                    genreDescription = '';
            }
            
            document.getElementById('edit-genre-id').value = genreId;
            document.getElementById('edit-genre-name').value = genreName;
            document.getElementById('edit-genre-description').value = genreDescription;
        }
        
        function loadMovieData(movieId) {
            // In a real application, this would be an AJAX call to get movie data
            // For demo purposes, we'll use static data
            document.getElementById('edit-movie-id').value = movieId;
            
            if (movieId === '1') {
                document.getElementById('edit-movie-title').value = 'The Dark Knight';
                document.getElementById('edit-movie-director').value = 'Christopher Nolan';
                document.getElementById('edit-movie-actors').value = 'Christian Bale, Heath Ledger';
                document.getElementById('edit-movie-duration').value = '152';
                document.getElementById('edit-movie-description').value = 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.';
                document.getElementById('edit-movie-rating').value = 'C13';
                document.getElementById('edit-movie-status').value = 'now';
                document.getElementById('edit-movie-trailer').value = 'EXeTwQWrcwY';
                
                // Set current poster
                document.getElementById('current-poster-img').src = 'https://m.media-amazon.com/images/I/71rNJQ2Y-EL._AC_UF894,1000_QL80_.jpg';
                
                // Set genres (assuming multi-select)
                const genreSelect = document.getElementById('edit-movie-genres');
                Array.from(genreSelect.options).forEach(option => {
                    option.selected = ['1', '4'].includes(option.value);
                });
            } else if (movieId === '2') {
                document.getElementById('edit-movie-title').value = 'The Matrix';
                document.getElementById('edit-movie-director').value = 'Lana & Lilly Wachowski';
                document.getElementById('edit-movie-actors').value = 'Keanu Reeves, Laurence Fishburne';
                document.getElementById('edit-movie-duration').value = '136';
                document.getElementById('edit-movie-description').value = 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.';
                document.getElementById('edit-movie-rating').value = 'C16';
                document.getElementById('edit-movie-status').value = 'stopped';
                document.getElementById('edit-movie-trailer').value = 'm8e-FF8MsqU';
                
                // Set current poster
                document.getElementById('current-poster-img').src = 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg';
                
                // Set genres (assuming multi-select)
                const genreSelect = document.getElementById('edit-movie-genres');
                Array.from(genreSelect.options).forEach(option => {
                    option.selected = ['1', '5'].includes(option.value);
                });
            }
        }

        // NEW CODE: Status change handling
        document.getElementById('edit-movie-status').addEventListener('change', function() {
            const movieId = document.getElementById('edit-movie-id').value;
            const newStatus = this.value;
            let statusText = "";
            
            switch(newStatus) {
                case 'coming':
                    statusText = "Sắp chiếu";
                    break;
                case 'now':
                    statusText = "Đang chiếu";
                    break;
                case 'stopped':
                    statusText = "Ngừng chiếu";
                    break;
                default:
                    return; // Do nothing if no valid status is selected
            }
            
            // Set confirmation dialog values
            document.getElementById('confirm-movie-id').value = movieId;
            document.getElementById('confirm-status-value').value = newStatus;
            document.getElementById('confirm-status-message').textContent = 
                `Bạn có chắc chắn muốn thay đổi trạng thái phim thành "${statusText}" không?`;
            
            // Show confirmation dialog
            openModal(modals.confirmStatus);
        });
        
        // Confirm status change button
        document.getElementById('confirm-status-ok').addEventListener('click', function() {
            const movieId = document.getElementById('confirm-movie-id').value;
            const newStatus = document.getElementById('confirm-status-value').value;
            
            // In a real application, this would be an AJAX call to update the database
            // For demo purposes, we'll just update the UI
            const movieRow = document.querySelector(`.movie-item[data-id="${movieId}"]`);
            const statusCell = movieRow.querySelector('td:nth-child(4) span');
            
            // Remove all status classes
            statusCell.classList.remove('status-coming', 'status-now', 'status-stopped');
            
            // Update status text and class
            switch(newStatus) {
                case 'coming':
                    statusCell.textContent = "Sắp chiếu";
                    statusCell.classList.add('status-coming');
                    break;
                case 'now':
                    statusCell.textContent = "Đang chiếu";
                    statusCell.classList.add('status-now');
                    break;
                case 'stopped':
                    statusCell.textContent = "Ngừng chiếu";
                    statusCell.classList.add('status-stopped');
                    break;
            }
            
            // Close confirmation dialog and show success message
            closeModal(modals.confirmStatus);
            alert('Thay đổi trạng thái thành công');
        });
        
        // Cancel status change button
        document.getElementById('confirm-status-cancel').addEventListener('click', function() {
            // Restore original status in the dropdown
            const movieId = document.getElementById('confirm-movie-id').value;
            const originalStatus = document.querySelector(`.movie-item[data-id="${movieId}"]`).dataset.status;
            document.getElementById('edit-movie-status').value = originalStatus;
            
            // Close confirmation dialog
            closeModal(modals.confirmStatus);
        });

        // NEW CODE: Search and filter functionality
        const searchInput = document.getElementById('search');
        const statusFilter = document.getElementById('filter-status');
        const genreFilter = document.getElementById('filter-genre');
        const searchButton = document.querySelector('button[type="button"]'); // Filter button
        const movieRows = document.querySelectorAll('.movie-item');
        const noResultsMessage = document.getElementById('no-results-message');
        
        searchButton.addEventListener('click', performSearch);
        
        // Also allow searching by pressing Enter in the search field
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase();
            const statusValue = statusFilter.value;
            const genreValue = genreFilter.value;
            
            let hasVisibleRows = false;
            
            movieRows.forEach(row => {
                let matchesSearch = true;
                let matchesStatus = true;
                let matchesGenre = true;
                
                // Check if row matches search term
                if (searchTerm) {
                    const title = row.querySelector('td:first-child .text-sm.font-medium').textContent.toLowerCase();
                    matchesSearch = title.includes(searchTerm);
                }
                
                // Check if row matches status filter
                if (statusValue) {
                    const statusText = row.querySelector('td:nth-child(4) span').textContent.trim().toLowerCase();
                    switch (statusValue) {
                        case 'coming':
                            matchesStatus = statusText === 'sắp chiếu';
                            break;
                        case 'now':
                            matchesStatus = statusText === 'đang chiếu';
                            break;
                        case 'stopped':
                            matchesStatus = statusText === 'ngừng chiếu';
                            break;
                    }
                }
                
                // Check if row matches genre filter
                if (genreValue) {
                    const genres = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                    // This is simplified - in a real app, you'd have a more sophisticated way to match genres
                    switch (genreValue) {
                        case '1':
                            matchesGenre = genres.includes('hành động');
                            break;
                        case '2':
                            matchesGenre = genres.includes('kinh dị');
                            break;
                        case '3':
                            matchesGenre = genres.includes('hài');
                            break;
                        case '4':
                            matchesGenre = genres.includes('tình cảm');
                            break;
                    }
                }
                
                // Show/hide row based on all filters
                if (matchesSearch && matchesStatus && matchesGenre) {
                    row.classList.remove('hidden');
                    hasVisibleRows = true;
                } else {
                    row.classList.add('hidden');
                }
            });
            
            // Show/hide "No results" message
            if (!hasVisibleRows) {
                noResultsMessage.classList.remove('hidden');
                noResultsMessage.classList.add('flex');
            } else {
                noResultsMessage.classList.add('hidden');
                noResultsMessage.classList.remove('flex');
            }
        }
    });