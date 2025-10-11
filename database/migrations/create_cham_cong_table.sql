-- Migration: Tạo bảng chấm công
-- File: database/migrations/create_cham_cong_table.sql

CREATE TABLE IF NOT EXISTS `cham_cong` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_nhanvien` INT NOT NULL,
  `ngay_cham` DATE NOT NULL,
  `gio_vao` DATETIME NULL,
  `gio_ra` DATETIME NULL,
  `trang_thai` ENUM('Đúng giờ', 'Muộn', 'Sớm', 'Nghỉ') DEFAULT 'Đúng giờ',
  `loai_cham` ENUM('Khuôn mặt', 'Thủ công', 'QR Code') DEFAULT 'Khuôn mặt',
  `anh_checkin` VARCHAR(500) NULL COMMENT 'URL ảnh check-in',
  `anh_checkout` VARCHAR(500) NULL COMMENT 'URL ảnh check-out',
  `confidence_checkin` DECIMAL(5,2) NULL COMMENT 'Độ tin cậy nhận diện check-in (%)',
  `confidence_checkout` DECIMAL(5,2) NULL COMMENT 'Độ tin cậy nhận diện check-out (%)',
  `ghi_chu` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_nhanvien_ngay` (`id_nhanvien`, `ngay_cham`),
  KEY `idx_ngay_cham` (`ngay_cham`),
  KEY `idx_nhanvien` (`id_nhanvien`),
  CONSTRAINT `fk_chamcong_nhanvien` FOREIGN KEY (`id_nhanvien`) REFERENCES `nguoidung_internal` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng lưu lịch sử đăng ký khuôn mặt
CREATE TABLE IF NOT EXISTS `dang_ky_khuon_mat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_nhanvien` INT NOT NULL,
  `ngay_dang_ky` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `so_anh_dang_ky` INT NOT NULL DEFAULT 0,
  `trang_thai` ENUM('Đang hoạt động', 'Đã hủy') DEFAULT 'Đang hoạt động',
  `ghi_chu` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nhanvien` (`id_nhanvien`),
  CONSTRAINT `fk_dangky_nhanvien` FOREIGN KEY (`id_nhanvien`) REFERENCES `nguoidung_internal` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
-- INSERT INTO `cham_cong` (`id_nhanvien`, `ngay_cham`, `gio_vao`, `gio_ra`, `trang_thai`, `loai_cham`) 
-- VALUES (1, '2025-01-10', '2025-01-10 08:00:00', '2025-01-10 17:00:00', 'Đúng giờ', 'Khuôn mặt');
