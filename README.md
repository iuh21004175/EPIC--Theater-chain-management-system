1. Khi mới push về phải chạy 2 lệnh:
  composer install
  npm install
2. Dự án sử dụng tailwind css. Mỗi khi chat AI render giao diện mới thì nên chạy 1 trong 2 lệnh sau:
  npm run build:css:internal --> Dành cho các giao diện trong nội bộ.
  npm run build:css:customer --> Dành cho các giao diện phục vụ cho khách hàng.
  * Để xem chi tiết lệnh thì mở file package.json
