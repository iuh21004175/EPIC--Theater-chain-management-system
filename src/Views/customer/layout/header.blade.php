<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Epic Cinema</title>
   <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
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
            z-index: 1001;
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
        /* Toast animation */
    @keyframes slideIn {
      0% { transform: translateX(100%); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      0% { transform: translateX(0); opacity: 1; }
      100% { transform: translateX(100%); opacity: 0; }
    }
    .toast { animation: slideIn 0.5s forwards; }
    .toast-hide { animation: slideOut 0.5s forwards; }
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
            <!-- <a href="{{$_ENV['URL_WEB_BASE']}}/phim" class="text-gray-600 hover:text-red-600 font-semibold text-base transition duration-300 no-underline">Phim</a> -->
            <div class="relative group" id="phim-dropdown">
                <button class="text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1">
                    Phim
                    <svg class="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="phim-menu" class="absolute left-0 top-full bg-white border border-gray-200 rounded-md shadow-lg min-w-[250px] max-w-[400px] w-auto z-50 transition duration-300 ease-in-out opacity-0 group-hover:opacity-100 invisible group-hover:visible">
                    
                </div>
            </div>
            <div class="relative group" id="rap-dropdown">
                <button class="text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1">
                    Rạp
                    <svg class="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="rap-menu" class="absolute left-0 top-full bg-white border border-gray-200 rounded-md shadow-lg min-w-[250px] max-w-[400px] w-auto z-50 transition duration-300 ease-in-out opacity-0 group-hover:opacity-100 invisible group-hover:visible">
                </div>
            </div>
            <a href="{{$_ENV['URL_WEB_BASE']}}/tin-tuc" class="text-gray-600 hover:text-red-600 font-semibold text-base transition duration-300 no-underline">Góc điện ảnh</a>
            <a href="{{$_ENV['URL_WEB_BASE']}}/lich-chieu" class="text-gray-600 hover:text-red-600 font-semibold text-base transition duration-300 no-underline">Xem phim trực tuyến</a>
            <a href="{{$_ENV['URL_WEB_BASE']}}/lich-chieu" class="text-gray-600 hover:text-red-600 font-semibold text-base transition duration-300 no-underline">Epic Streaming</a>
            <div class="relative group" id="rap-dropdown">
                <button class="text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1">
                    Tư vấn
                    <svg class="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="tu-van-menu" class="absolute left-0 top-full bg-white border border-gray-200 rounded-md shadow-lg min-w-[250px] max-w-[400px] w-auto z-50 transition duration-300 ease-in-out opacity-0 group-hover:opacity-100 invisible group-hover:visible">
                    <a class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap" href="{{$_ENV['URL_WEB_BASE']}}/tu-van/chat-truc-tuyen">Chat trực tuyến</a>
                    <a class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap" href="{{$_ENV['URL_WEB_BASE']}}/tu-van/goi-video">Gọi video</a>
                </div>
            </div>
        </nav>
        <div id="user-area">
            <?php if (isset($_SESSION['user'])): 
                $user = $_SESSION['user']; 
            ?>
                <!-- Dropdown user -->
                <div id="user-dropdown" class="relative group">
                    <button id="btn-user" class="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition">
                        <span id="user-name"><?= htmlspecialchars($user['ho_ten']) ?></span>
                        <svg class="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div id="dropdown-menu" class="absolute right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 opacity-0 invisible transition-opacity duration-300 group-hover:opacity-100 group-hover:visible">
                        <div class="px-4 py-2 text-gray-500 border-b border-gray-200">
                            Xin chào, <?= htmlspecialchars($user['ho_ten']) ?>
                        </div>
                        <a href="{{ $_ENV['URL_WEB_BASE'] }}/thong-tin-ca-nhan" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white">Thông tin cá nhân</a>
                        <a href="{{ $_ENV['URL_WEB_BASE'] }}/ve-cua-toi" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white">Vé của tôi</a>
                        <a href="{{ $_ENV['URL_WEB_BASE'] }}/the-qua-tang" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white">Thẻ quà tặng</a>
                        <a href="{{ $_ENV['URL_WEB_BASE'] }}/doi-mat-khau" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white">Đổi mật khẩu</a>
                        <a href="{{ $_ENV['URL_WEB_BASE'] }}/dang-xuat" class="block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white">Đăng xuất</a>
                        <!-- <form method="POST" action="{{ $_ENV['URL_WEB_BASE'] }}/dang-xuat">
                            <button type="submit" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white">Đăng xuất</button>
                        </form> -->
                    </div>
                </div>
            <?php else: ?>
                <!-- Nút đăng nhập -->
                <button id="btn-login" class="bg-red-600 text-white font-bold py-2 px-5 rounded-md hover:bg-red-700 transition duration-300 text-sm">
                    Đăng nhập
                </button>
            <?php endif; ?>
        </div>
    </div>
</header>

<div id="modalLogin" class="modal">
    <div class="modal-content">
        <form action="{{ $_ENV['URL_WEB_BASE'] }}/api/dang-nhap-khach-hang" id="loginForm" name='formDangNhap' method="POST">
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
                    <a href="<?= $_ENV['URL_WEB_BASE'] ?>/api/google" 
                        class="w-full bg-red-600 text-white font-semibold py-2 rounded-md text-center inline-block hover:bg-red-700 transition duration-300">
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
        <form action="{{ $_ENV['URL_WEB_BASE'] }}/api/dang-ky" id="registerForm" name="formDangKy" method="POST">
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
                            <option value="1">Nam</option>
                            <option value="0">Nữ</option>
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
                <button type="button" class="w-full bg-blue-400 text-white font-semibold py-2 rounded-md transition duration-300 cursor-not-allowed" id="btnSave" disabled>
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

</body>
<script>
    const baseUrl = "{{ $_ENV['URL_WEB_BASE'] }}";
    const salt = "{{ $_ENV['URL_SALT'] }}";
    const rapMenu = document.getElementById('rap-menu');
    const phimMenu = document.getElementById('phim-menu');
    function base64Encode(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
    function slugify(str) {
        return str
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
            .replace(/[^a-z0-9]+/g, "-") // thay ký tự đặc biệt thành "-"
            .replace(/^-+|-+$/g, ""); // bỏ dấu - thừa
    }
   
if (rapMenu) {
    fetch(baseUrl + "/api/rap-phim-khach")
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                data.data.forEach(rap => {
                    const encoded = base64Encode(rap.id + salt);
                    const a = document.createElement('a');
                    a.href = `${baseUrl}/rap/${slugify(rap.ten)}-${encoded}`;
                    a.textContent = rap.ten;
                    a.className = "block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap";
                    rapMenu.appendChild(a);
                });
            } else {
                rapMenu.innerHTML = `<div class="px-4 py-2 text-gray-500">Không có rạp nào</div>`;
            }
        })
        .catch(err => console.error('Lỗi load rạp:', err));
}

if (phimMenu) {
    fetch(baseUrl + "/api/loai-phim")
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                phimMenu.innerHTML = "";
                data.data.forEach(loai => {
                    const a = document.createElement("a");
                    a.href = `${baseUrl}/phim?theLoai=${loai.id}`; 
                    a.textContent = loai.ten;
                    a.className = "block px-4 py-2 text-gray-700 hover:bg-red-600 hover:text-white whitespace-nowrap";
                    phimMenu.appendChild(a);
                });
            } else {
                phimMenu.innerHTML = '<div class="px-4 py-2 text-gray-500">Không có thể loại</div>';
            }
        })
        .catch(err => console.error("Lỗi load thể loại:", err));
}


document.getElementById('btnSendReset').addEventListener('click', function() {
    const btn = this; // nút
    const email = document.getElementById('forgotEmail').value.trim();
    const tbForgotEmail = document.getElementById('tbForgotEmail');

    if(email === '') {
        tbForgotEmail.textContent = 'Vui lòng nhập email.';
        return;
    }

    // đổi chữ nút
    const originalText = btn.textContent;
    btn.textContent = 'Đang gửi...';
    btn.disabled = true;

    fetch(baseUrl + "/api/reset-password", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
    })
    .then(res => res.json())
    .then(data => {
        tbForgotEmail.textContent = data.message; 
    })
    .catch(err => {
        console.error('Lỗi kiểm tra email / gửi mail:', err);
        tbForgotEmail.textContent = 'Có lỗi xảy ra, vui lòng thử lại.';
    })
    .finally(() => {
        // trả lại chữ nút
        btn.textContent = originalText;
        btn.disabled = false;
    });
    
});

document.querySelectorAll("nav a").forEach(link => {
    const currentPath = window.location.pathname.replace(/\/$/, "");
    const linkPath = new URL(link.href).pathname.replace(/\/$/, "");
    
    if (linkPath === currentPath) {
        link.classList.remove("text-gray-600", "hover:text-red-600");
        link.classList.add("text-red-600", "font-bold");
    }
});

</script>
<script src="{{ $_ENV['URL_WEB_BASE'] }}/customer/js/auth.js"></script>
</html>