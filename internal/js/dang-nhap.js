import Spinner from "./util/spinner.js";
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-dang-nhap');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Hiển thị spinner khi đang đăng nhập
        const spinner = Spinner.show({
            text: 'Đang đăng nhập...',
            color: '#E11D48', // Màu đỏ của Epic Cinema
            overlay: true
        });
        const formData = new FormData(form);
        fetch(form.action, {
            method: form.method,
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.redirect;
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});