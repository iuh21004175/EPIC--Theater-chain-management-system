# API Đặt Lịch Gọi Video

## Endpoint
```
POST http://localhost/rapphim/api/dat-lich-goi-video
```

## Request Headers
```
Content-Type: application/json
```

## Request Body
```json
{
    "id_rap": "1",
    "ngay": "2025-10-07",
    "gio": "11:00",
    "noi_dung": "Tư vấn về lịch chiếu phim",
    "so_dien_thoai": "0902599450"
}
```

### Tham số
| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id_rap | string | Có | ID của rạp chiếu phim |
| ngay | string | Có | Ngày đặt lịch (format: YYYY-MM-DD) |
| gio | string | Có | Giờ đặt lịch (format: HH:mm) |
| noi_dung | string | Có | Nội dung tư vấn |
| so_dien_thoai | string | Có | Số điện thoại liên hệ |

## Response

### Thành công (200)
```json
{
    "success": true,
    "message": "Đặt lịch thành công. Vui lòng chờ nhân viên xác nhận.",
    "data": {
        "id": 1,
        "id_rap": "1",
        "ngay": "2025-10-07",
        "gio": "11:00",
        "noi_dung": "Tư vấn về lịch chiếu phim",
        "so_dien_thoai": "0902599450",
        "thoi_gian_dat": "2025-10-07 11:00:00",
        "trang_thai": "Chờ xác nhận"
    }
}
```

### Lỗi (400/500)
```json
{
    "success": false,
    "message": "Thông báo lỗi cụ thể"
}
```

## Validation Rules

1. **id_rap**: Bắt buộc phải có
2. **ngay**: 
   - Bắt buộc phải có
   - Format: YYYY-MM-DD
   - Không được là ngày trong quá khứ
3. **gio**: 
   - Bắt buộc phải có
   - Format: HH:mm (24h)
   - Kết hợp với ngày không được là thời điểm trong quá khứ
4. **noi_dung**: Bắt buộc phải có và không được để trống
5. **so_dien_thoai**: Bắt buộc phải có và không được để trống

## Error Messages

- `"Vui lòng đăng nhập để đặt lịch"` - Người dùng chưa đăng nhập
- `"Vui lòng chọn rạp chiếu phim"` - Thiếu id_rap
- `"Vui lòng chọn ngày"` - Thiếu ngày
- `"Vui lòng chọn giờ"` - Thiếu giờ
- `"Vui lòng nhập nội dung tư vấn"` - Thiếu nội dung
- `"Vui lòng nhập số điện thoại"` - Thiếu số điện thoại
- `"Định dạng ngày không hợp lệ. Vui lòng sử dụng YYYY-MM-DD"` - Format ngày sai
- `"Định dạng giờ không hợp lệ. Vui lòng sử dụng HH:mm"` - Format giờ sai
- `"Không thể đặt lịch trong quá khứ"` - Thời gian đặt đã qua

## Example với cURL

```bash
curl -X POST http://localhost/rapphim/api/dat-lich-goi-video \
  -H "Content-Type: application/json" \
  -d '{
    "id_rap": "1",
    "ngay": "2025-10-07",
    "gio": "11:00",
    "noi_dung": "Tư vấn về lịch chiếu phim",
    "so_dien_thoai": "0902599450"
  }'
```

## Example với JavaScript (Fetch API)

```javascript
fetch('http://localhost/rapphim/api/dat-lich-goi-video', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        id_rap: "1",
        ngay: "2025-10-07",
        gio: "11:00",
        noi_dung: "Tư vấn về lịch chiếu phim",
        so_dien_thoai: "0902599450"
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Đặt lịch thành công:', data.data);
    } else {
        console.error('Lỗi:', data.message);
    }
})
.catch(error => console.error('Error:', error));
```

## Notes

- API yêu cầu người dùng phải đăng nhập (có session)
- Số điện thoại sẽ được lưu vào trường `mo_ta` của bảng `lich_goi_video` với format: "Số điện thoại: [số điện thoại]"
- Sau khi đặt lịch thành công, hệ thống sẽ publish event qua Redis để thông báo cho nhân viên
- Trạng thái ban đầu của lịch là "Chờ nhân viên" (TRANG_THAI_CHO_NHAN_VIEN = 1)

## Related APIs

- **GET /api/lich-goi-video-theo-ngay?ngay=YYYY-MM-DD** - Lấy danh sách lịch đã đặt theo ngày
- **GET /api/rap-phim-khach** - Lấy danh sách rạp chiếu phim
