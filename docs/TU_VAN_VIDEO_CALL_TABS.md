# Tích hợp Gọi Video vào trang Tư vấn

## Tổng quan

Trang **Tư vấn** (`/internal/tu-van`) bây giờ có 2 tabs:
1. **Tab Chat** - Tư vấn qua chat trực tuyến
2. **Tab Gọi Video** - Quản lý lịch gọi video và tư vấn qua video call

## Cấu trúc

### File: `tu-van.blade.php`

```
┌─────────────────────────────────────────┐
│          Breadcrumb                      │
│  ┌──────┐  ┌──────────┐                │
│  │ Chat │  │ Gọi video│                │
│  └──────┘  └──────────┘                │
├─────────────────────────────────────────┤
│                                          │
│  Tab Content (Chat hoặc Video)          │
│                                          │
│  - Tab Chat: Danh sách phiên + Chatbox │
│  - Tab Video: Bảng lịch gọi video      │
│                                          │
└─────────────────────────────────────────┘
```

### Tab Chat (ID: `tab-chat`)
- **Script**: `chat-truc-tuyen.js`
- **Chức năng**: 
  - Hiển thị danh sách phiên chat
  - Chat trực tuyến với khách hàng
  - Upload/view ảnh trong chat

### Tab Gọi Video (ID: `tab-video`)
- **Script**: `duyet-lich-goi-video.js`
- **Chức năng**:
  - Hiển thị danh sách lịch gọi video
  - Nhân viên chọn tư vấn
  - Bắt đầu/Hủy cuộc gọi video

## Cơ chế hoạt động

### 1. Tab Switching
```javascript
// Khi click vào tab "Gọi video"
btnVideo.addEventListener('click', function() {
    // Đổi màu tab
    btnVideo.classList.add('bg-red-600', 'text-white');
    btnChat.classList.remove('bg-red-600', 'text-white');
    
    // Hiển thị/ẩn content
    tabVideo.style.display = '';
    tabChat.style.display = 'none';
    
    // Trigger event để JS biết tab đã mở
    document.dispatchEvent(new Event('videoTabOpened'));
});
```

### 2. Lazy Loading Data

File `duyet-lich-goi-video.js` chỉ load dữ liệu khi:
- Lần đầu click vào tab "Gọi video"
- Có event `videoTabOpened` được dispatch

```javascript
let dataLoaded = false;

btnVideo.addEventListener('click', function() {
    if (!dataLoaded) {
        loadDanhSachLich(); // Load lần đầu
        dataLoaded = true;
    }
});
```

### 3. Bảng lịch gọi video

**Cấu trúc HTML:**
```html
<div id="tab-video">
    <div id="duyet-lich-goi-video-app" data-url="{{$_ENV['URL_WEB_BASE']}}">
        <table>
            <thead>
                <tr>
                    <th>Khách hàng</th>
                    <th>Chủ đề</th>
                    <th>Thời gian đặt</th>
                    <th>Trạng thái</th>
                    <th>Nhân viên</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody id="lich-table-body">
                <!-- JS render data here -->
            </tbody>
        </table>
    </div>
</div>
```

**Trạng thái lịch:**
- 🟡 **Chờ NV** (trang_thai = 1) → Nút "Chọn tư vấn"
- 🔵 **Đã chọn NV** (trang_thai = 2) → Nút "Gọi" và "Hủy"
- 🟢 **Đang gọi** (trang_thai = 3) → Nút "Tham gia"
- ⚫ **Hoàn thành** (trang_thai = 4) → Không có action

### 4. Actions

#### a. Chọn tư vấn
```javascript
async function chonTuVan(idLich) {
    const response = await fetch(`${urlBase}/api/goi-video/${idLich}/chon-tu-van`, { 
        method: 'POST' 
    });
    const result = await response.json();
    
    if (result.success) {
        // Tạo room_id, cập nhật trạng thái
        // Khách hàng nhận thông báo qua Socket.IO
        loadDanhSachLich();
    }
}
```

#### b. Bắt đầu gọi
```html
<a href="${urlBase}/video-call?room=${lich.room_id}" target="_blank">
    Gọi
</a>
```
→ Mở trang `video-call.blade.php` trong tab mới với room ID

#### c. Hủy tư vấn
```javascript
async function huyTuVan(idLich) {
    const response = await fetch(`${urlBase}/api/goi-video/${idLich}/huy`, { 
        method: 'POST' 
    });
    
    if (result.success) {
        // Reset trạng thái về "Chờ NV"
        // Khách hàng nhận thông báo
        loadDanhSachLich();
    }
}
```

## Real-time Updates

### Socket.IO Events

**Event: `lichgoivideo:moi`**
```javascript
socket.on('lichgoivideo:moi', (data) => {
    console.log('📹 Có lịch gọi video mới:', data);
    loadDanhSachLich(); // Refresh danh sách
});
```

Khi khách hàng đặt lịch mới, nhân viên sẽ thấy lịch xuất hiện ngay lập tức.

## Flow hoạt động

### Từ góc nhìn nhân viên:

1. **Vào trang Tư vấn**
   - Mặc định ở tab "Chat"
   - Click vào tab "Gọi video"

2. **Xem danh sách lịch**
   - Danh sách được load từ API `/api/goi-video/danh-sach-lich`
   - Hiển thị các lịch có trạng thái "Chờ NV" và "Đã chọn NV"

3. **Chọn tư vấn cho khách hàng**
   - Click "Chọn tư vấn" → API tạo `room_id`
   - Trạng thái chuyển sang "Đã chọn NV"
   - Khách hàng nhận thông báo qua Socket.IO

4. **Bắt đầu cuộc gọi**
   - Click "Bắt đầu gọi" → Mở trang video call
   - Kết nối WebRTC với khách hàng
   - Chat trong cuộc gọi

5. **Kết thúc cuộc gọi**
   - Click "End call"
   - Trạng thái chuyển sang "Hoàn thành"

## So sánh với trang riêng

### Trước đây:
```
/internal/tu-van              → Trang chat
/internal/duyet-lich-goi-video → Trang riêng cho video
```

### Bây giờ:
```
/internal/tu-van
  ├─ Tab Chat        → Chat trực tuyến
  └─ Tab Gọi video   → Quản lý lịch gọi video
```

### Ưu điểm:
✅ Tất cả tư vấn (chat + video) trong 1 trang  
✅ Dễ switch giữa 2 loại hình tư vấn  
✅ Không cần điều hướng giữa các trang  
✅ Lazy loading - chỉ load data khi cần  

## Files liên quan

### Views
- `src/Views/internal/tu-van.blade.php` - Trang chính với 2 tabs
- ~~`src/Views/internal/duyet-lich-goi-video.blade.php`~~ - Không còn dùng (có thể xóa)
- `src/Views/customer/video-call.blade.php` - Trang video call

### JavaScript
- `internal/js/chat-truc-tuyen.js` - Logic tab Chat
- `internal/js/duyet-lich-goi-video.js` - Logic tab Video (tương thích cả 2 mode)
- `customer/js/video-call-updated.js` - WebRTC client

### Backend
- `src/Controllers/Ctrl_GoiVideo.php` - API endpoints
- `src/Services/Sc_GoiVideo.php` - Business logic
- `ServiceRealtime/sockets/videoCallHandler.js` - Socket.IO handler

## Testing

### Test tab switching:
1. Vào `/internal/tu-van`
2. Click vào tab "Gọi video"
3. Kiểm tra:
   - ✅ Tab "Gọi video" có màu đỏ
   - ✅ Bảng lịch gọi video hiển thị
   - ✅ Data được load từ API

### Test chọn tư vấn:
1. Có lịch ở trạng thái "Chờ NV"
2. Click "Chọn tư vấn"
3. Kiểm tra:
   - ✅ Trạng thái chuyển sang "Đã chọn NV"
   - ✅ Xuất hiện nút "Bắt đầu gọi" và "Hủy"
   - ✅ Khách hàng nhận được thông báo

### Test real-time:
1. Mở 2 browser/tab
2. Tab 1: Khách hàng đặt lịch
3. Tab 2: Nhân viên ở tab "Gọi video"
4. Kiểm tra:
   - ✅ Lịch mới xuất hiện ngay lập tức trong tab nhân viên

## Troubleshooting

### Vấn đề: Data không load khi click tab
**Nguyên nhân**: Event listener chưa được đăng ký  
**Giải pháp**: Kiểm tra console, đảm bảo `duyet-lich-goi-video.js` được load

### Vấn đề: Nút "Gọi" không hoạt động
**Nguyên nhân**: `room_id` chưa được tạo hoặc NULL  
**Giải pháp**: Kiểm tra API `/api/goi-video/{id}/chon-tu-van` có trả về `room_id`

### Vấn đề: Real-time không hoạt động
**Nguyên nhân**: Socket.IO server chưa chạy hoặc Redis chưa publish event  
**Giải pháp**: 
1. Kiểm tra `ServiceRealtime/server.js` đang chạy
2. Kiểm tra Redis connection
3. Xem logs: `lichgoivideo:moi` event có được publish không
