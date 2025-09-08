1. Khi mới push về phải chạy 2 lệnh:
  composer install
  npm install
2. Dự án sử dụng tailwind css. Mỗi khi chat AI render giao diện mới thì nên chạy 1 trong 2 lệnh sau:
  npm run build:css:internal --> Dành cho các giao diện trong nội bộ.
  npm run build:css:customer --> Dành cho các giao diện phục vụ cho khách hàng.
  * Để xem chi tiết lệnh thì mở file package.json
3. Lệnh để kết nối database vps (lưu ý là tắt mysql của xampp)
  ssh -L 3306:127.0.0.1:3306 root@103.130.213.112
4. Lệnh để kết nối với minio
  ssh -L 3306:127.0.0.1:3306 -L 9000:127.0.0.1:9000 -L 9001:127.0.0.1:9001 root@103.130.213.112