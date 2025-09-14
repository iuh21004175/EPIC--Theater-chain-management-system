import Spinner from "./util/spinner.js";

document.addEventListener('DOMContentLoaded', function() {
    // Load combos data
    function loadCombos() {
        const spinner = Spinner.show({text: 'Đang tải danh sách combo...'});
        
        // In a real application, you would fetch from API
        // For demo purposes, we'll simulate loading
        setTimeout(() => {
            Spinner.hide(spinner);
            console.log('Combos loaded');
            // Here you would update the combos grid with fresh data
        }, 1000);
    }

    // Show success toast
    function showSuccessToast(message) {
        const toast = document.getElementById('success-toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.remove('opacity-0', 'translate-y-full');
            toast.classList.add('opacity-100', 'translate-y-0');
            
            setTimeout(() => {
                hideToast();
            }, 3000);
        }
    }

    function hideToast() {
        const toast = document.getElementById('success-toast');
        if (toast) {
            toast.classList.add('opacity-0', 'translate-y-full');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }
    }

    // Export loadCombos function for use in san-pham-an-uong.js
    window.loadCombos = loadCombos;
});