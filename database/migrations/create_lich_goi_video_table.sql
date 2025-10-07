-- Bảng lưu lịch đặt gọi video
CREATE TABLE IF NOT EXISTS LichGoiVideo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_khachhang INT NOT NULL,
    id_rapphim INT NOT NULL,
    id_nhanvien INT NULL, -- NULL: chưa có nhân viên nhận, NOT NULL: đã có nhân viên
    chu_de VARCHAR(255) NOT NULL,
    mo_ta TEXT NULL,
    thoi_gian_dat DATETIME NOT NULL, -- Thời gian khách hàng muốn gọi
    room_id VARCHAR(100) NULL, -- ID room WebRTC, được tạo khi nhân viên chọn tư vấn
    trang_thai TINYINT NOT NULL DEFAULT 1, -- 1: Chờ nhân viên, 2: Đã chọn NV, 3: Đang gọi, 4: Hoàn thành, 5: Hủy
    thoi_gian_bat_dau DATETIME NULL, -- Thời gian thực tế bắt đầu cuộc gọi
    thoi_gian_ket_thuc DATETIME NULL, -- Thời gian kết thúc cuộc gọi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_khachhang) REFERENCES KhachHang(id) ON DELETE CASCADE,
    FOREIGN KEY (id_rapphim) REFERENCES RapPhim(id) ON DELETE CASCADE,
    FOREIGN KEY (id_nhanvien) REFERENCES NhanVien(id) ON DELETE SET NULL,
    
    INDEX idx_rapphim_trangthai (id_rapphim, trang_thai),
    INDEX idx_nhanvien (id_nhanvien),
    INDEX idx_room_id (room_id),
    INDEX idx_khachhang (id_khachhang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng lưu trạng thái kết nối WebRTC
CREATE TABLE IF NOT EXISTS WebRTCSession (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_lich_goi_video INT NOT NULL,
    room_id VARCHAR(100) NOT NULL,
    peer_id_khachhang VARCHAR(100) NULL, -- Peer ID của khách hàng
    peer_id_nhanvien VARCHAR(100) NULL, -- Peer ID của nhân viên
    trang_thai TINYINT NOT NULL DEFAULT 1, -- 1: Đang chờ, 2: Đã kết nối, 3: Đã ngắt kết nối
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_lich_goi_video) REFERENCES LichGoiVideo(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
