<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sơ đồ ghế</title>
  <link rel="stylesheet" href="{{$_ENV['URL_WEB_BASE']}}/css/tailwind.css">
</head>
<body class="bg-gray-100 min-h-screen flex flex-col items-center py-10">

  <!-- Màn hình -->
  <div class="w-full max-w-3xl bg-gradient-to-r from-black-700 to-black-900 text-black text-center py-3 rounded-lg mb-10 shadow-2xl tracking-wider font-bold text-lg">
    MÀN HÌNH
  </div>

  <!-- Ghế -->
  <div id="seatMap" class="grid gap-4"
       style="grid-template-columns: repeat(10, minmax(0, 1fr));">
  </div>

  <!-- Chú thích -->
  <div class="mt-10 space-y-3">
    <h2 class="text-lg font-semibold text-gray-700">Chú thích</h2>
    <div class="flex flex-wrap gap-6">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl border border-gray-400 bg-white shadow-md"></div>
        <span>Còn trống</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg"></div>
        <span>Đang chọn</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-gray-400 shadow-inner"></div>
        <span>Đã đặt</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl border border-yellow-500 bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-lg"></div>
        <span>Ghế VIP</span>
      </div>
    </div>
  </div>

 <script>
  const seatMap = document.getElementById("seatMap");

  const rows = 8;
  const cols = 10;

  // Danh sách ghế đã đặt
  const bookedSeats = ["A3", "A4", "B5", "C7", "D1"];

  // Cấu hình loại ghế
  const seatTypes = {
    "VIP": { color: "#ef4444", price: 40000, desc: "Ghế cao cấp với thiết kế thoải mái" },
    "Thường": { color: "#42adf0", price: 0, desc: "Ghế tiêu chuẩn" },
    "Premium": { color: "#d152ff", price: 70000, desc: "Ghế cao cấp với không gian rộng rãi" }
  };

  // Gán loại ghế theo hàng (ví dụ hàng H = VIP, hàng A-F = Thường, hàng G = Premium)
  const seatTypeByRow = {
    "A": "Thường",
    "B": "Thường",
    "C": "Thường",
    "D": "Thường",
    "E": "Thường",
    "F": "Thường",
    "G": "Premium",
    "H": "VIP"
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const rowLetter = String.fromCharCode(65 + r);
      const seatCode = rowLetter + c;

      const type = seatTypeByRow[rowLetter];
      const config = seatTypes[type];

      const seat = document.createElement("div");
      seat.textContent = seatCode;
      seat.dataset.type = type;
      seat.className =
        "flex items-center justify-center w-12 h-12 text-sm font-bold rounded-xl cursor-pointer transition transform hover:scale-105 select-none shadow-md";

      if (bookedSeats.includes(seatCode)) {
        // Đã đặt
        seat.classList.add("bg-gray-400", "text-white", "cursor-not-allowed", "shadow-inner");
      } else {
        // Ghế trống
        seat.style.backgroundColor = config.color;
        seat.classList.add("text-white", "hover:opacity-80");
        seat.addEventListener("click", () => toggleSeat(seat, config.color));
      }

      seatMap.appendChild(seat);
    }
  }

  function toggleSeat(seat, baseColor) {
    if (seat.classList.contains("ring-4")) {
      // Bỏ chọn → về màu gốc
      seat.style.backgroundColor = baseColor;
      seat.classList.remove("ring-4", "ring-red-600");
    } else {
      // Chọn → viền đỏ
      seat.classList.add("ring-4", "ring-red-600");
    }
  }
</script>

</body>
</html>
