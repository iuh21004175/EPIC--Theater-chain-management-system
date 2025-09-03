<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Epic Cinema</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .btn-outline-primary-custom {
            color: #007bff;
            background-color: transparent;
            border: 1px solid #007bff;
        }

        .btn-outline-primary-custom:hover {
            color: #fff;
            background-color: #007bff;
            border-color: #007bff;
        }

        nav a {
            text-decoration: none !important;
        }

        nav a:hover {
            text-decoration: none !important;
        }

        /* Modal chính */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.4);
            justify-content: center;
            align-items: center;
        }

        /* Nội dung của modal */
        .modal-content {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            position: relative;
        }

        /* Class để hiển thị modal */
        .modal.is-open {
            display: flex;
        }

        /* Vô hiệu hóa thanh cuộn của body khi modal mở */
        body.modal-open {
            overflow: hidden;
        }

        .modal-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }

        .modal-header .close {
            position: absolute;
            right: 15px;
            top: 15px;
            font-size: 1.5rem;
            font-weight: bold;
            color: #aaa;
            cursor: pointer;
            background: none;
            border: none;
        }

        .modal-header .close:hover {
            color: #000;
        }

        .modal-body {
            padding-bottom: 15px;
        }

        .modal-footer {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            border-top: 1px solid #e5e5e5;
            padding-top: 15px;
        }
    </style>
</head>
<body class="bg-gray-100">

<header class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto max-w-screen-xl px-4 py-2 flex justify-between items-center">
        <a href="/">
            <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1756391269/logo_cinema_z2pcda.jpg" alt="Cinema Logo" class="h-14">
        </a>
        <nav class="hidden md:flex items-center space-x-8 relative">
            <a href="{{$_ENV['URL_WEB_BASE']}}/" class="text-gray-600 hover:text-red-600 font-semibold text-base transition duration-300 no-underline">Trang chủ</a>
            <a href="{{$_ENV['URL_WEB_BASE']}}/lich-chieu" class="text-gray-600 hover:text-red-600 font-semibold text-base transition duration-300 no-underline">Đặt vé</a>
            <a href="{{$_ENV['URL_WEB_BASE']}}/phim" class="text-gray-600 hover:text-red-600 font-semibold text-base transition duration-300 no-underline">Phim</a>
            <div class="relative group">
                <button class="text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1">
                    Rạp
                    <svg class="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="absolute left-0 top-full bg-white border border-gray-200 rounded-md shadow-lg min-w-[250px] max-w-[400px] w-auto z-50 transition duration-300 ease-in-out opacity-0 group-hover:opacity-100 invisible group-hover:visible">
                    <a href="{{$_ENV['URL_WEB_BASE']}}/rap" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap">Galaxy Nguyễn Du</a>
                    <a href="/rap/galaxy-sala" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap">Galaxy Sala</a>
                    <a href="/rap/galaxy-tan-binh" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap">Galaxy Tân Bình</a>
                    <a href="/rap/galaxy-kinh-duong-vuong" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap">Galaxy Kinh Dương Vương</a>
                    <a href="/rap/galaxy-quang-trung" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap">Galaxy Quang Trung</a>
                </div>
            </div>
            <a href="{{$_ENV['URL_WEB_BASE']}}/tin-tuc" class="text-gray-600 hover:text-red-600 font-semibold text-base transition duration-300 no-underline">Tin tức</a>
        </nav>
        <div>
            <button id="btn-login" class="bg-red-600 text-white font-bold py-2 px-5 rounded-md hover:bg-red-700 transition duration-300 text-sm">Đăng nhập</button>
        </div>
    </div>
</header>

<div id="modalLogin" class="modal">
    <div class="modal-content">
        <form name='formDangNhap' method="POST" action="">
            <div class="modal-header">
                <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1756390333/icon-login.fbbf1b2d_qfrlwb.svg" alt="Login Icon" class="mb-2" style="width:190px; height:120px;">
                <h5 class="modal-title w-100 text-lg font-bold">Đăng Nhập Tài Khoản</h5>
                <button type="button" class="close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group mb-4">
                    <label class="block text-gray-700">Email</label>
                    <input type="text" id="loginEmail" name="loginEmail" class="form-control w-full border border-gray-300 rounded-md p-2 mt-1" placeholder="Nhập Email">
                    <span id="tbLoginEmail" class="text-red-500 text-sm"></span>
                </div>
                <div class="form-group mb-4">
                    <label class="block text-gray-700">Mật khẩu</label>
                    <input type="password" id="loginPassword" name="loginPassword" class="form-control w-full border border-gray-300 rounded-md p-2 mt-1" placeholder="Nhập Mật khẩu">
                    <span id="tbLoginPassword" class="text-red-500 text-sm"></span>
                </div>
                <div class="form-group mb-4">
                    <button type="submit" class="btn btn-primary btn-block w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300" name="btnLogin" id="btnLogin">Đăng nhập</button>
                </div>
                <div class="form-group mb-4">
                    <a href="#" class="w-full bg-red-600 text-white font-semibold py-2 rounded-md text-center inline-block hover:bg-red-700 transition duration-300" id="btnLoginGoogle">
                        Đăng nhập bằng Google
                    </a>
                </div>
                <div class="form-group text-center">
                    <a href="#" id="btnForgotPassword" class="text-blue-600 hover:underline">Quên mật khẩu?</a>
                </div>
            </div>
            <div class="modal-footer">
                <p class="mb-2 text-gray-600">Bạn chưa có tài khoản?</p>
                <button type="button" class="btn btn-outline-primary-custom btn-block w-full py-2 rounded-md" id="btnRegister">Đăng ký</button>
            </div>
        </form>
    </div>
</div>

<div id="modalRegister" class="modal">
    <div class="modal-content">
        <form id="registerForm" name="formDangKy" method="POST" action="">
            <div class="modal-header">
                
                <h5 class="modal-title w-100 text-lg font-bold">Đăng Ký Tài Khoản</h5>
                <button type="button" class="close">&times;</button>
            </div>
            <div class="modal-body space-y-4">
                <div class="form-group">
                    <label class="block text-gray-700 font-medium">Họ tên</label>
                    <input type="text" id="registerName" name="registerName" class="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Nhập Họ tên của bạn">
                    <span id="tbRegisterName" class="text-red-500 text-sm mt-1 block"></span>
                </div>

                <div class="form-group">
                    <label class="block text-gray-700 font-medium">Email</label>
                    <input type="email" id="registerEmail" name="registerEmail" class="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Nhập Email của bạn">
                    <span id="tbRegisterEmail" class="text-red-500 text-sm mt-1 block"></span>
                </div>

                <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div class="form-group flex-1">
                        <label for="sexSelect" class="block text-gray-700 font-medium">Giới tính</label>
                        <select id="sexSelect" name="sex" class="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">-- Chọn --</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                        <span id="tbSex" class="text-red-500 text-sm mt-1 block"></span>
                    </div>

                    <div class="form-group flex-1">
                        <label class="block text-gray-700 font-medium">Ngày sinh</label>
                        <input type="date" id="txtNgaySinh" name="txtNgaySinh" class="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500">
                        <span id="tbNgaySinh" class="text-red-500 text-sm mt-1 block"></span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="block text-gray-700 font-medium">Mật khẩu</label>
                    <input type="password" id="registerPassword" name="registerPassword" class="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Tạo mật khẩu mạnh">
                    <span id="tbRegisterPassword" class="text-red-500 text-sm mt-1 block"></span>
                </div>
                <div class="form-group">
                    <label class="block text-gray-700 font-medium">Nhập lại mật khẩu</label>
                    <input type="password" id="registerPasswordConfirm" name="registerPasswordConfirm" class="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Nhập lại mật khẩu">
                    <span id="tbRegisterPasswordConfirm" class="text-red-500 text-sm mt-1 block"></span>
                </div>
                
                <div class="form-group flex items-center">
                    <input type="checkbox" id="termsCheckbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                    <label for="termsCheckbox" class="ml-2 text-sm text-gray-600">
                        Tôi đồng ý với 
                        <a href="#" id="btnTerms" class="text-blue-600 hover:underline">Điều khoản dịch vụ</a>
                    </label>
                </div>
                
                <button type="submit" class="w-full bg-blue-400 text-white font-semibold py-2 rounded-md transition duration-300 cursor-not-allowed" id="btnSave" disabled>
                    Đăng Ký
                </button>
            </div>
        </form>
        <div class="modal-footer">
            <p class="text-sm text-gray-500">
                Đã có tài khoản? <a href="#" id="btnBackToLogin" class="text-blue-600 hover:underline">Đăng nhập</a>
            </p>
        </div>
    </div>
</div>
    

<div id="modalForgotPassword" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <img src="https://res.cloudinary.com/dtkm5uyx1/image/upload/v1756390333/icon-login.fbbf1b2d_qfrlwb.svg" alt="Forgot Password Icon" class="mb-2" style="width:190px; height:120px;">
            <h5 class="modal-title w-100 text-lg font-bold">Quên Mật Khẩu</h5>
            <button type="button" class="close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group mb-4">
                <label class="block text-gray-700">Email</label>
                <input type="text" id="forgotEmail" class="form-control w-full border border-gray-300 rounded-md p-2 mt-1" placeholder="Nhập Email">
                <span id="tbForgotEmail" class="text-red-500 text-sm"></span>
            </div>
            <div class="form-group">
                <button class="btn btn-primary btn-block w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300" id="btnSendReset">Gửi yêu cầu</button>
            </div>
        </div>
    </div>
</div>

<div id="modalTerms" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title w-100 text-lg font-bold">Điều khoản dịch vụ</h5>
            <button type="button" class="close">&times;</button>
        </div>
        <div class="modal-body space-y-3 text-gray-700 max-h-[400px] overflow-y-auto">
            <p>Chào mừng bạn đến với <b>Epic Cinema</b>! Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản sau:</p>
            <ul class="list-disc list-inside space-y-2">
                <li>Không được chia sẻ tài khoản cho người khác.</li>
                <li>Phải đảm bảo thông tin đăng ký là chính xác.</li>
                <li>Tôn trọng các quy định khi đặt vé và sử dụng dịch vụ.</li>
                <li>Mọi hành vi gian lận sẽ bị khóa tài khoản ngay lập tức.</li>
            </ul>
            <p class="font-semibold">Nếu bạn có thắc mắc, vui lòng liên hệ bộ phận CSKH để được hỗ trợ.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition" id="btnCloseTerms">Đã hiểu</button>
        </div>
    </div>
</div>


<script>
    document.addEventListener('DOMContentLoaded', function() {
        const modalLogin = document.getElementById('modalLogin');
        const modalRegister = document.getElementById('modalRegister');
        const modalForgotPassword = document.getElementById('modalForgotPassword');
        const body = document.body;
        const btnSave = document.getElementById('btnSave');
        const termsCheckbox = document.getElementById('termsCheckbox');

        function openModal(modal) {
            modal.classList.add('is-open');
            body.classList.add('modal-open');
        }

        function closeModal(modal) {
            modal.classList.remove('is-open');
            body.classList.remove('modal-open');
        }

        function switchModal(fromModal, toModal) {
            closeModal(fromModal);
            openModal(toModal);
        }
        
        // Cập nhật trạng thái nút Đăng Ký dựa trên checkbox
        function toggleSubmitButton() {
            if (termsCheckbox.checked) {
                btnSave.disabled = false;
                btnSave.classList.remove('bg-blue-400', 'cursor-not-allowed');
                btnSave.classList.add('bg-blue-600', 'hover:bg-blue-700');
            } else {
                btnSave.disabled = true;
                btnSave.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                btnSave.classList.add('bg-blue-400', 'cursor-not-allowed');
            }
        }

        // Event listeners for opening and closing modals
        document.getElementById('btn-login').addEventListener('click', () => openModal(modalLogin));

        document.querySelectorAll('.modal .close').forEach(button => {
            button.addEventListener('click', (event) => {
                const modal = event.target.closest('.modal');
                if (modal) closeModal(modal);
            });
        });

        modalLogin.addEventListener('click', (event) => {
            if (event.target === modalLogin) {
                closeModal(modalLogin);
            }
        });
        modalRegister.addEventListener('click', (event) => {
            if (event.target === modalRegister) {
                closeModal(modalRegister);
            }
        });
        modalForgotPassword.addEventListener('click', (event) => {
            if (event.target === modalForgotPassword) {
                closeModal(modalForgotPassword);
            }
        });

        // Event listeners for switching modals
        document.getElementById('btnRegister').addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(modalLogin, modalRegister);
        });

        document.getElementById('btnBackToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(modalRegister, modalLogin);
        });

        document.getElementById('btnForgotPassword').addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(modalLogin, modalForgotPassword);
        });

        // Event listener cho checkbox
        termsCheckbox.addEventListener('change', toggleSubmitButton);
        
        // Kiểm tra trạng thái ban đầu của nút khi trang tải
        toggleSubmitButton();

        // --- Form Validation Functions ---
        function checkEmail(inputElement, errorElement) {
            const kt = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
            const value = inputElement.value.trim();
            if (value === "") {
                errorElement.textContent = "Email không được để trống!";
                return false;
            }
            if (!kt.test(value)) {
                errorElement.textContent = "Email không hợp lệ!";
                return false;
            }
            errorElement.textContent = "";
            return true;
        }

        function checkPassword(inputElement, errorElement) {
            const kt = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|;:',.<>?/]).{8,}$/;
            const value = inputElement.value;
            if (value === "") {
                errorElement.textContent = "Mật khẩu không được để trống!";
                return false;
            }
            if (value.length < 8) {
                errorElement.textContent = "Mật khẩu phải có ít nhất 8 ký tự!";
                return false;
            }
            if (!kt.test(value)) {
                errorElement.textContent = "Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt";
                return false;
            }
            errorElement.textContent = "";
            return true;
        }

        function checkPasswordConfirm() {
            const pw = document.getElementById('registerPassword').value;
            const value = document.getElementById('registerPasswordConfirm').value;
            const errorElement = document.getElementById('tbRegisterPasswordConfirm');
            if (value === "") {
                errorElement.textContent = "Nhập lại mật khẩu không được để trống!";
                return false;
            }
            if (pw === "") {
                errorElement.textContent = "Bạn chưa nhập mật khẩu chính!";
                return false;
            }
            if (value !== pw) {
                errorElement.textContent = "Mật khẩu nhập lại không khớp";
                return false;
            }
            errorElement.textContent = "";
            return true;
        }

        function checkName() {
            const inputElement = document.getElementById('registerName');
            const errorElement = document.getElementById('tbRegisterName');
            const kt = /^(([A-Z]{1})([a-z]+))(\s([A-Z]{1})([a-z]+)){1,}$/;
            if (inputElement.value.trim() === "") {
                errorElement.textContent = "Họ tên không được để trống!";
                return false;
            }
            if (!kt.test(inputElement.value)) {
                errorElement.textContent = "Ký tự đầu viết hoa, ít nhất có 2 từ!";
                return false;
            }
            errorElement.textContent = "";
            return true;
        }

        function checkNgaySinh() {
            const inputElement = document.getElementById('txtNgaySinh');
            const errorElement = document.getElementById('tbNgaySinh');
            const value = inputElement.value;
            if (!value) {
                errorElement.textContent = "Ngày sinh không được để trống!";
                return false;
            }
            const today = new Date();
            const todayStr = today.toISOString().split("T")[0];
            if (value > todayStr) {
                errorElement.textContent = "Ngày sinh không được sau hiện tại!";
                return false;
            }
            const ngaySinh = new Date(value);
            let tuoi = today.getFullYear() - ngaySinh.getFullYear();
            const m = today.getMonth() - ngaySinh.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < ngaySinh.getDate())) {
                tuoi--;
            }
            if (tuoi < 13) {
                errorElement.textContent = "Bạn phải từ 13 tuổi trở lên!";
                return false;
            }
            errorElement.textContent = "";
            return true;
        }

        function checkGender() {
            const selectElement = document.getElementById('sexSelect');
            const errorElement = document.getElementById('tbSex');
            if (selectElement.value === "") {
                errorElement.textContent = "Giới tính không được để trống!";
                return false;
            }
            errorElement.textContent = "";
            return true;
        }

        // --- Event Listeners for validation on blur/change ---
        document.getElementById('loginEmail').addEventListener('blur', (e) => checkEmail(e.target, document.getElementById('tbLoginEmail')));
        document.getElementById('registerEmail').addEventListener('blur', (e) => checkEmail(e.target, document.getElementById('tbRegisterEmail')));
        document.getElementById('forgotEmail').addEventListener('blur', (e) => checkEmail(e.target, document.getElementById('tbForgotEmail')));
        document.getElementById('loginPassword').addEventListener('blur', (e) => checkPassword(e.target, document.getElementById('tbLoginPassword')));
        document.getElementById('registerPassword').addEventListener('blur', (e) => {
            checkPassword(e.target, document.getElementById('tbRegisterPassword'));
            checkPasswordConfirm();
        });
        document.getElementById('registerPasswordConfirm').addEventListener('blur', checkPasswordConfirm);
        document.getElementById('registerName').addEventListener('blur', checkName);
        document.getElementById('txtNgaySinh').addEventListener('blur', checkNgaySinh);
        document.getElementById('sexSelect').addEventListener('change', checkGender);

        // --- Form Submission Validation ---
        document.getElementById('btnLogin').addEventListener('click', function(e) {
            let isEmailValid = checkEmail(document.getElementById('loginEmail'), document.getElementById('tbLoginEmail'));
            let isPasswordValid = checkPassword(document.getElementById('loginPassword'), document.getElementById('tbLoginPassword'));
            if (!isEmailValid || !isPasswordValid) {
                e.preventDefault();
            }
        });

        document.getElementById('btnSave').addEventListener('click', function(e) {
            let isNameValid = checkName();
            let isEmailValid = checkEmail(document.getElementById('registerEmail'), document.getElementById('tbRegisterEmail'));
            let isGenderValid = checkGender();
            let isDateValid = checkNgaySinh();
            let isPasswordValid = checkPassword(document.getElementById('registerPassword'), document.getElementById('tbRegisterPassword'));
            let isPasswordConfirmValid = checkPasswordConfirm();
            let isTermsAccepted = termsCheckbox.checked;

            if (!(isNameValid && isEmailValid && isGenderValid && isDateValid && isPasswordValid && isPasswordConfirmValid && isTermsAccepted)) {
                e.preventDefault();
                if (!isTermsAccepted) {
                    alert('Vui lòng đồng ý với Điều khoản dịch vụ để tiếp tục.');
                }
            }
        });

        document.getElementById('btnSendReset').addEventListener('click', function(e) {
            let isEmailValid = checkEmail(document.getElementById('forgotEmail'), document.getElementById('tbForgotEmail'));
            if (!isEmailValid) {
                e.preventDefault();
            }
        });

        const modalTerms = document.getElementById('modalTerms');
        const btnTerms = document.getElementById('btnTerms');
        const btnCloseTerms = document.getElementById('btnCloseTerms');

        // Mở modal điều khoản
        btnTerms.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(modalTerms);
        });

        // Đóng modal khi bấm nút Đã hiểu
        btnCloseTerms.addEventListener('click', () => closeModal(modalTerms));

        // Đóng modal khi click ra ngoài
        modalTerms.addEventListener('click', (event) => {
            if (event.target === modalTerms) {
                closeModal(modalTerms);
            }
        });
    });

</script>

</body>
</html>