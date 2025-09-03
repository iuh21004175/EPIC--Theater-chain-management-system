document.addEventListener('DOMContentLoaded', function() {
    function showModal(from, to) {
        $(from).on('hidden.bs.modal', function(){
            $(to).modal('show');
            $(from).off('hidden.bs.modal'); // hủy bind để không bind nhiều lần
        });
        $(from).modal('hide');
    }

    // Mở modal Login
    $("#btn-login").on("click", function(e){
        e.preventDefault();
        $("#modalLogin").modal("show");
    });

    // Login → Register
    $("#btnRegister").on("click", function(e){
        e.preventDefault();
        showModal("#modalLogin", "#modalRegister");
    });

    // Register → Login
    $("#btnBackToLogin").on("click", function(e){
        e.preventDefault();
        showModal("#modalRegister", "#modalLogin");
    });

    // Login → Forgot Password
    $("#btnForgotPassword").on("click", function(e){
        e.preventDefault();
        showModal("#modalLogin", "#modalForgotPassword");
    });
    // Check form Login
    // Check Email
    function checkEmail(input, errorTag) {
    var kt = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
    
    var value = input.val().trim();
    
    if (value === "") {
        errorTag.html("Email không được để trống!");
        return false;
    }
    if (!kt.test(value)) {
        errorTag.html("Email không hợp lệ!");
        return false;
    }
    
    errorTag.html("");
    return true;
    }

    // Gán sự kiện blur cho từng input
    $("#loginEmail").blur(function() {
        checkEmail($(this), $("#tbLoginEmail"));
    });

    $("#registerEmail").blur(function() {
        checkEmail($(this), $("#tbRegisterEmail"));
    });
    $("#forgotEmail").blur(function() {
        checkEmail($(this), $("#tbForgotEmail"));
    });

    
    // Check Mật khẩu
    var loginPassword = $("#loginPassword");
    var tbLoginPassword = $("#tbLoginPassword");

    var registerPassword = $("#registerPassword");
    var tbRegisterPassword = $("#tbRegisterPassword");

    var registerPasswordConfirm = $("#registerPasswordConfirm");
    var tbRegisterPasswordConfirm = $("#tbRegisterPasswordConfirm");

    // Hàm kiểm tra mật khẩu mạnh
    function checkPassword(input, errorTag) {
        var kt = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{}|;:',.<>?/]).{8,}$/;
        var value = input.val();

        if (value === "") {
            errorTag.html("Mật khẩu không được để trống!");
            return false;
        }
        if (value.length < 8) {
            errorTag.html("Mật khẩu phải có ít nhất 8 ký tự!");
            return false;
        }
        if (!kt.test(value)) {
            errorTag.html("Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt");
            return false;
        }
        errorTag.html("");
        return true;
    }
    
    // Hàm kiểm tra mật khẩu nhập lại
    function checkPasswordConfirm() {
        var pw = registerPassword.val();
        var value = registerPasswordConfirm.val();

        if (value === "") {
            tbRegisterPasswordConfirm.html("Nhập lại mật khẩu không được để trống!");
            return false;
        }   
        if (pw === "") {
            tbRegisterPasswordConfirm.html("Bạn chưa nhập mật khẩu chính!");
            return false;
        }   
        if (value !== pw) {
            tbRegisterPasswordConfirm.html("Mật khẩu nhập lại không khớp");
            return false;
        }
        tbRegisterPasswordConfirm.html("");
        return true;
    }
    // Gán sự kiện blur
    loginPassword.blur(function() {
        checkPassword(loginPassword, tbLoginPassword);
    });

    registerPassword.blur(function() {
        checkPassword(registerPassword, tbRegisterPassword);
        checkPasswordConfirm(); // kiểm lại confirm luôn nếu có nhập
    });

    registerPasswordConfirm.blur(function() {
        checkPasswordConfirm(registerPasswordConfirm, tbRegisterPasswordConfirm);
    });

    // Check Họ tên
    var registerName = $("#registerName");
    var tbRegisterName = $("#tbRegisterName");

    function checkName() {
        var kt = /^(([A-Z]{1})([a-z]+))(\s([A-Z]{1})([a-z]+)){1,}$/;
        if (registerName.val() == "") {
            tbRegisterName.html("Họ tên không được để trống!");
            return false;
        }
        if (!kt.test(registerName.val())) {
            tbRegisterName.html("Ký tự đầu viết hoa, ít nhất có 2 từ!");
            return false;
        }
        tbRegisterName.html("");
        return true;
    }
    registerName.blur(checkName);

    // Check tuổi
    var txtNgaySinh = $("#txtNgaySinh");
    var tbNgaySinh = $("#tbNgaySinh");

    function checkNgaySinh() {
        var value = txtNgaySinh.val();
        if (!value) {
            tbNgaySinh.html("Ngày sinh không được để trống!");
            return false;
        }
        var today = new Date();
        var todayStr = today.toISOString().split("T")[0]; // yyyy-mm-dd
        // Check không được sau hiện tại
        if (value > todayStr) {
            tbNgaySinh.html("Ngày sinh không được sau hiện tại!");
            return false;
        }
        // Tính tuổi
        var ngaySinh = new Date(value);
        var tuoi = today.getFullYear() - ngaySinh.getFullYear();
        var m = today.getMonth() - ngaySinh.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < ngaySinh.getDate())) {
            tuoi--;
        }
        if (tuoi < 13) {
            tbNgaySinh.html("Bạn phải từ 13 tuổi trở lên!");
            return false;
        }
        tbNgaySinh.html("");
        return true;
    }

    // gán sự kiện blur
    txtNgaySinh.blur(checkNgaySinh);

    // Check xem có chọn hay chưa
    function checkGender() {
        var checked = $("input[name='sex']:checked").length;
        if (checked === 0) {
            $("#tbSex").html("Giới tính không được để trống!");
            return false;
        }
        $("#tbSex").html("");
        return true;
    }

    $("input[name='sex']").change(checkGender);
    $("input[name='sex']").blur(checkGender);


    // Chỉ kiểm tra khi nhấn nút Login
    $("#btnLogin").on("click", function(e) {
        let isEmailValid = checkEmail($("#loginEmail"), $("#tbLoginEmail"));
        let isPasswordValid = checkPassword(loginPassword, tbLoginPassword);
        
        // Only proceed if both are valid
        if (!(isEmailValid && isPasswordValid)) {
            e.preventDefault(); // Prevent form submission
        }
    });

   $("#btnSave").on("click", function(e) {
    // Không chặn submit nếu hợp lệ
    let isNameValid = checkName();
    let isEmailValid = checkEmail($("#registerEmail"), $("#tbRegisterEmail"));
    let isGenderValid = checkGender();
    let isDateValid = checkNgaySinh();
    let isPasswordValid = checkPassword(registerPassword, tbRegisterPassword);
    let isPasswordConfirmValid = checkPasswordConfirm();

    if (!(isNameValid && isEmailValid && isDateValid && isPasswordValid && isPasswordConfirmValid && isGenderValid)) {
        e.preventDefault(); // chỉ chặn khi có lỗi
        console.log("Có lỗi -> không submit"); 
    } else {
        console.log("Tất cả hợp lệ -> submit form");
    }
    });

    $("#btnSendReset").on("click", function(e) {
        e.preventDefault();
        let isEmailValid = checkEmail($("#forgotEmail"), $("#tbForgotEmail"));
        if (!(isEmailValid)) {
        e.preventDefault(); // chỉ chặn khi có lỗi
            console.log("Có lỗi -> không submit"); 
    } else {
        console.log("Tất cả hợp lệ -> submit form");
    }
    });
})