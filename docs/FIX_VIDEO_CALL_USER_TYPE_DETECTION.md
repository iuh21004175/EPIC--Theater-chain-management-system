# 🎯 Fix: Phân Biệt Rõ Ràng Customer và Staff Trong Video Call

## 📋 Vấn đề

**Hiện tượng:**
- Nhân viên vào trang video call → Hiển thị alert: **"Nhân viên tư vấn đã rời khỏi cuộc gọi"**
- Label remote video luôn hiển thị: "Nhân viên tư vấn" (cả khi staff vào)
- Thông báo không phân biệt được ai là customer, ai là staff

**Screenshot console:**
```
✅ Socket connected: abc123
✅ Đã tham gia room: {roomId: "video_3_1759808920", participants: [...]}
👋 User left: {userId: "20", userType: "customer"}
❌ Alert: "Nhân viên tư vấn đã rời khỏi cuộc gọi"
```

**Nguyên nhân:**
Code không xem xét `userType` của người dùng hiện tại khi hiển thị thông báo và labels.

## 🔍 Phân tích Chi tiết

### **1. Vấn đề với thông báo "user-left":**

**Code cũ (SAI):**
```javascript
socket.on('user-left', (data) => {
    console.log('👋 User left:', data);
    alert('Nhân viên tư vấn đã rời khỏi cuộc gọi'); // ❌ Luôn hiển thị "Nhân viên"
    setTimeout(() => endCall(), 2000);
});
```

**Vấn đề:**
- Staff vào trang → Alert nói "Nhân viên đã rời đi"
- Customer vào trang → Alert cũng nói "Nhân viên đã rời đi"
- Không phân biệt được ai là ai!

### **2. Vấn đề với remote user label:**

**Code cũ (SAI):**
```html
<div id="remoteUserInfo">
    <span class="text-sm font-medium">Nhân viên tư vấn</span> <!-- ❌ Hardcode -->
</div>
```

**Vấn đề:**
- Staff nhìn vào màn hình → Thấy label "Nhân viên tư vấn" (sai, phải là "Khách hàng")
- Customer nhìn vào → Thấy "Nhân viên tư vấn" (đúng)

### **3. Vấn đề với trạng thái kết nối:**

**Code cũ (SAI):**
```javascript
socket.on('room-joined', (data) => {
    updateStatus('Đang chờ nhân viên tư vấn...'); // ❌ Luôn là "nhân viên"
});
```

**Vấn đề:**
- Staff vào → Hiển thị "Đang chờ nhân viên tư vấn..." (sai!)
- Customer vào → Hiển thị "Đang chờ nhân viên tư vấn..." (đúng)

## ✅ Giải pháp

### **Fix 1: Phân biệt thông báo user-left**

**Code mới:**
```javascript
socket.on('user-left', (data) => {
    console.log('👋 User left:', data);
    
    // Hiển thị thông báo phù hợp dựa trên userType của người dùng hiện tại
    let message = '';
    if (userType === 'customer') {
        message = 'Nhân viên tư vấn đã rời khỏi cuộc gọi';
    } else if (userType === 'staff') {
        message = 'Khách hàng đã rời khỏi cuộc gọi';
    } else {
        message = 'Người dùng khác đã rời khỏi cuộc gọi';
    }
    
    alert(message);
    setTimeout(() => endCall(), 2000);
});
```

**Kết quả:**
- ✅ Customer thấy: "Nhân viên tư vấn đã rời..."
- ✅ Staff thấy: "Khách hàng đã rời..."

### **Fix 2: Phân biệt trạng thái khi join room**

**Code mới:**
```javascript
socket.on('room-joined', (data) => {
    console.log('✅ Đã tham gia room:', data);
    
    // Hiển thị trạng thái phù hợp
    if (userType === 'customer') {
        updateStatus('Đang chờ nhân viên tư vấn...');
    } else if (userType === 'staff') {
        updateStatus('Đang chờ khách hàng...');
    } else {
        updateStatus('Đã tham gia phòng');
    }
    
    // Tự động tạo offer nếu là customer
    setTimeout(() => {
        if (data.participants && data.participants.length > 1) {
            createOffer();
        }
    }, 1000);
});
```

**Kết quả:**
- ✅ Customer thấy: "Đang chờ nhân viên tư vấn..."
- ✅ Staff thấy: "Đang chờ khách hàng..."

### **Fix 3: Phân biệt thông báo user-joined**

**Code mới:**
```javascript
socket.on('user-joined', async (data) => {
    console.log('👤 User joined:', data);
    
    // Hiển thị thông báo phù hợp
    if (userType === 'customer' && data.userType === 'staff') {
        updateStatus('Nhân viên tư vấn đã vào phòng. Đang thiết lập kết nối...');
        await createOffer();
    } else if (userType === 'staff' && data.userType === 'customer') {
        updateStatus('Khách hàng đã vào phòng. Đang thiết lập kết nối...');
    } else {
        updateStatus('Đang thiết lập kết nối...');
    }
});
```

**Kết quả:**
- ✅ Customer thấy: "Nhân viên tư vấn đã vào phòng..."
- ✅ Staff thấy: "Khách hàng đã vào phòng..."

### **Fix 4: Dynamic remote user label**

**Blade template mới:**
```html
<div id="remoteUserInfo" class="absolute bottom-4 left-4 bg-black bg-opacity-60 py-1 px-3 rounded-lg">
    <span class="text-sm font-medium" id="remoteUserLabel">Đang kết nối...</span>
</div>
```

**JavaScript mới:**
```javascript
peerConnection.ontrack = (event) => {
    console.log('📺 Nhận remote stream:', event.streams[0].id);
    if (remoteVideo.srcObject !== event.streams[0]) {
        remoteVideo.srcObject = event.streams[0];
        remoteStream = event.streams[0];
        updateStatus('Đã kết nối thành công!');
        
        // Cập nhật label remote user dựa trên userType
        const remoteUserLabel = document.getElementById('remoteUserLabel');
        if (remoteUserLabel) {
            if (userType === 'customer') {
                remoteUserLabel.textContent = 'Nhân viên tư vấn';
            } else if (userType === 'staff') {
                remoteUserLabel.textContent = 'Khách hàng';
            } else {
                remoteUserLabel.textContent = 'Người dùng khác';
            }
        }
        
        setTimeout(() => hideConnectionStatus(), 2000);
    }
};
```

**Kết quả:**
- ✅ Customer thấy label: "Nhân viên tư vấn"
- ✅ Staff thấy label: "Khách hàng"

## 📊 So sánh Before/After

### **Scenario 1: Customer vào video call**

| Event | Before (Bug) | After (Fixed) |
|-------|-------------|---------------|
| **Join room** | "Đang chờ nhân viên tư vấn..." | ✅ "Đang chờ nhân viên tư vấn..." |
| **Staff joined** | "Đang thiết lập kết nối..." | ✅ "Nhân viên tư vấn đã vào phòng..." |
| **Connected** | Remote label: "Nhân viên tư vấn" | ✅ Remote label: "Nhân viên tư vấn" |
| **Staff left** | "Nhân viên tư vấn đã rời..." | ✅ "Nhân viên tư vấn đã rời..." |

### **Scenario 2: Staff vào video call**

| Event | Before (Bug) | After (Fixed) |
|-------|-------------|---------------|
| **Join room** | ❌ "Đang chờ nhân viên tư vấn..." | ✅ "Đang chờ khách hàng..." |
| **Customer joined** | ❌ "Đang thiết lập kết nối..." | ✅ "Khách hàng đã vào phòng..." |
| **Connected** | ❌ Remote label: "Nhân viên tư vấn" | ✅ Remote label: "Khách hàng" |
| **Customer left** | ❌ "Nhân viên tư vấn đã rời..." | ✅ "Khách hàng đã rời..." |

## 🧪 Test Cases

### **Test 1: Customer perspective**

**Steps:**
1. Login as customer
2. Vào `/video-call?room=test123`
3. Quan sát console và UI

**Expected:**
```
✅ Socket connected
✅ Đã tham gia room
Status: "Đang chờ nhân viên tư vấn..."
Remote label: "Đang kết nối..."

(Staff joins)
Status: "Nhân viên tư vấn đã vào phòng. Đang thiết lập kết nối..."
Remote label: "Nhân viên tư vấn"

(Staff leaves)
Alert: "Nhân viên tư vấn đã rời khỏi cuộc gọi"
```

### **Test 2: Staff perspective**

**Steps:**
1. Login as staff at `/internal/dang-nhap`
2. Vào `/internal/video-call?room=test123`
3. Quan sát console và UI

**Expected:**
```
✅ Socket connected
✅ Đã tham gia room
Status: "Đang chờ khách hàng..."
Remote label: "Đang kết nối..."

(Customer joins)
Status: "Khách hàng đã vào phòng. Đang thiết lập kết nối..."
Remote label: "Khách hàng"

(Customer leaves)
Alert: "Khách hàng đã rời khỏi cuộc gọi"
```

### **Test 3: Verify trong console**

**Console commands để test:**
```javascript
// Check userType của bản thân
console.log('My userType:', document.getElementById('usertype')?.value);

// Expected output:
// Customer: "customer"
// Staff: "staff"
```

## 🎯 Root Cause Analysis

### **Tại sao bug này xảy ra?**

1. **Copy-paste code từ customer:**
   - Code ban đầu được viết cho customer
   - Khi thêm staff support, quên update thông báo

2. **Hardcode strings:**
   - Thông báo được hardcode thay vì dynamic dựa trên userType
   - Labels được fix cứng trong HTML

3. **Không test đầy đủ:**
   - Chỉ test từ góc nhìn customer
   - Không test từ góc nhìn staff

## 🔧 Best Practices

### **1. Luôn sử dụng userType để render UI:**

```javascript
// ❌ BAD - Hardcode
alert('Nhân viên tư vấn đã rời...');

// ✅ GOOD - Dynamic
const message = userType === 'customer' 
    ? 'Nhân viên tư vấn đã rời...' 
    : 'Khách hàng đã rời...';
alert(message);
```

### **2. Function helper cho messages:**

```javascript
function getUserTypeLabel(type) {
    switch(type) {
        case 'customer': return 'Khách hàng';
        case 'staff': return 'Nhân viên tư vấn';
        default: return 'Người dùng';
    }
}

function getOtherUserTypeLabel(myType) {
    return myType === 'customer' ? 'Nhân viên tư vấn' : 'Khách hàng';
}

// Usage:
const remoteLabel = getOtherUserTypeLabel(userType);
```

### **3. Console log để debug:**

```javascript
console.log('🔍 User info:', { 
    userId, 
    userType, 
    roomId 
});

console.log('👤 User joined:', {
    joinedUserId: data.userId,
    joinedUserType: data.userType,
    myUserType: userType
});
```

### **4. Test từ cả 2 góc nhìn:**

Checklist khi test:
- [ ] Test as Customer
- [ ] Test as Staff
- [ ] Test Customer joins first, Staff joins later
- [ ] Test Staff joins first, Customer joins later
- [ ] Test disconnect scenarios
- [ ] Check all status messages
- [ ] Check all labels

## 📚 Related Files

### **Modified:**
1. ✅ `customer/js/video-call.js` - Fix dynamic messages dựa trên userType
2. ✅ `src/Views/customer/video-call.blade.php` - Dynamic remote user label

### **Already correct (no changes needed):**
- ✅ PHP session detection (customer vs staff)
- ✅ Hidden input với userType
- ✅ Socket.IO emit với userType

## ✨ Kết quả sau fix

### **Customer Experience:**

```
1. Vào video call
   → Status: "Đang chờ nhân viên tư vấn..."
   
2. Staff joins
   → Status: "Nhân viên tư vấn đã vào phòng..."
   → Remote label: "Nhân viên tư vấn"
   
3. Staff leaves
   → Alert: "Nhân viên tư vấn đã rời khỏi cuộc gọi"
```

### **Staff Experience:**

```
1. Vào video call
   → Status: "Đang chờ khách hàng..."
   
2. Customer joins
   → Status: "Khách hàng đã vào phòng..."
   → Remote label: "Khách hàng"
   
3. Customer leaves
   → Alert: "Khách hàng đã rời khỏi cuộc gọi"
```

### **Benefits:**

1. ✅ **Thông báo chính xác** cho từng loại user
2. ✅ **UI rõ ràng** - biết chính xác ai đang nói chuyện với ai
3. ✅ **UX tốt hơn** - không còn confusion
4. ✅ **Code maintainable** - dễ hiểu và mở rộng

---

**Fix date:** 2025-01-07  
**Issue:** Video call hiển thị thông báo sai cho staff  
**Root cause:** Hardcode messages, không check userType  
**Solution:** Dynamic messages dựa trên userType của user hiện tại  
**Status:** ✅ Fixed and tested
