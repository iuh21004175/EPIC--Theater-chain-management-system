/**
 * Quản lý hiển thị spinner loading trong ứng dụng
 */
const Spinner = {
    /**
     * Tạo và hiển thị spinner
     * @param {Object} options - Tùy chọn cấu hình spinner
     * @param {string} [options.target=document.body] - Phần tử chứa spinner (mặc định là body)
     * @param {string} [options.color='#E11D48'] - Màu sắc spinner (mặc định là red-600)
     * @param {string} [options.size='md'] - Kích thước spinner: sm, md, lg
     * @param {string} [options.overlay=true] - Hiển thị lớp phủ mờ
     * @param {string} [options.text=''] - Văn bản hiển thị dưới spinner
     * @returns {HTMLElement} Đối tượng spinner đã tạo
     */
    show: function(options = {}) {
        // Cấu hình mặc định
        const config = {
            target: options.target || document.body,
            color: options.color || '#E11D48',
            size: options.size || 'md',
            overlay: options.overlay !== undefined ? options.overlay : true,
            text: options.text || '',
            fullScreen: options.target ? false : true
        };

        // Xác định kích thước
        let spinnerSize = '40px';
        let borderWidth = '4px';
        
        switch(config.size) {
            case 'sm':
                spinnerSize = '24px';
                borderWidth = '3px';
                break;
            case 'lg':
                spinnerSize = '60px';
                borderWidth = '6px';
                break;
        }

        // Tạo container cho spinner
        const spinnerContainer = document.createElement('div');
        spinnerContainer.id = 'epic-spinner-' + Date.now();
        spinnerContainer.className = 'epic-spinner-container';
        
        // Thiết lập style cho container
        spinnerContainer.style.position = config.fullScreen ? 'fixed' : 'absolute';
        spinnerContainer.style.top = '0';
        spinnerContainer.style.left = '0';
        spinnerContainer.style.width = '100%';
        spinnerContainer.style.height = '100%';
        spinnerContainer.style.display = 'flex';
        spinnerContainer.style.flexDirection = 'column';
        spinnerContainer.style.alignItems = 'center';
        spinnerContainer.style.justifyContent = 'center';
        spinnerContainer.style.zIndex = '9999';
        
        if (config.overlay) {
            spinnerContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        }

        // Tạo spinner
        const spinner = document.createElement('div');
        spinner.className = 'epic-spinner';
        spinner.style.width = spinnerSize;
        spinner.style.height = spinnerSize;
        spinner.style.border = `${borderWidth} solid rgba(0, 0, 0, 0.1)`;
        spinner.style.borderRadius = '50%';
        spinner.style.borderTop = `${borderWidth} solid ${config.color}`;
        spinner.style.animation = 'epic-spin 1s linear infinite';
        
        // Thêm spinner vào container
        spinnerContainer.appendChild(spinner);
        
        // Thêm văn bản nếu có
        if (config.text) {
            const textElement = document.createElement('div');
            textElement.className = 'epic-spinner-text';
            textElement.textContent = config.text;
            textElement.style.marginTop = '12px';
            textElement.style.color = '#374151'; // gray-700
            textElement.style.fontSize = '14px';
            textElement.style.fontWeight = '500';
            spinnerContainer.appendChild(textElement);
        }
        
        // Thêm animation CSS nếu chưa có
        if (!document.getElementById('epic-spinner-style')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'epic-spinner-style';
            styleElement.textContent = `
                @keyframes epic-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Thêm vào target
        const targetElement = typeof config.target === 'string' 
            ? document.querySelector(config.target) 
            : config.target;
            
        if (targetElement === document.body) {
            // Nếu target là body, đảm bảo position relative cho spinner
            spinnerContainer.style.position = 'fixed';
        } else {
            // Đảm bảo container có position để định vị spinner
            if (window.getComputedStyle(targetElement).position === 'static') {
                targetElement.style.position = 'relative';
            }
        }
        
        targetElement.appendChild(spinnerContainer);
        return spinnerContainer;
    },
    
    /**
     * Ẩn spinner theo ID
     * @param {HTMLElement|string} spinner - Đối tượng spinner hoặc ID của spinner
     */
    hide: function(spinner) {
        if (!spinner) {
            // Nếu không chỉ định, xóa tất cả spinner
            const spinners = document.querySelectorAll('.epic-spinner-container');
            spinners.forEach(spin => spin.remove());
            return;
        }
        
        // Xác định đối tượng spinner
        const spinnerElement = typeof spinner === 'string' 
            ? document.getElementById(spinner) 
            : spinner;
            
        if (spinnerElement) {
            spinnerElement.remove();
        }
    },
    
    /**
     * Tạo spinner trong khi thực hiện một promise
     * @param {Promise} promise - Promise cần theo dõi
     * @param {Object} options - Tùy chọn spinner
     * @returns {Promise} Promise ban đầu
     */
    async during(promise, options = {}) {
        const spinnerElement = this.show(options);
        try {
            const result = await promise;
            return result;
        } finally {
            this.hide(spinnerElement);
        }
    }
};

// Export spinner để sử dụng ở các module khác
export default Spinner;