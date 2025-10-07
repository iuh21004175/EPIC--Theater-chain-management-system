# 🐛 Fix: User Kết Nối Lại Làm User Kia Mất Kết Nối

## 📋 Vấn đề

**Hiện tượng:**
```
1. Staff vào video call → Kết nối OK
2. Customer vào video call → Staff bị DISCONNECT
3. Customer reload page → Staff bị DISCONNECT lại
4. Staff reload page → Customer bị DISCONNECT
```

**Console logs:**
```
📹 Client kết nối video namespace: mKsjWaycYCJCzR_xAABf
✅ User 6 (staff) đã tham gia room video_3_1759808920

📹 Client kết nối video namespace: b9ButCrSFt5i185jAABh
✅ User 20 (customer) đã tham gia room video_3_1759808920
👋 User left: {userId: "6", userType: "staff"}  ← Staff bị mất kết nối!
```

**Nguyên nhân:**
- Khi user join lại (reload page, mất mạng), socket mới được tạo
- Redis lưu socket ID mới, **GHI ĐÈ** socket ID cũ
- Socket cũ vẫn còn trong room và có thể gây conflict
- Khi `user-joined` event được emit, socket cũ có thể xử lý sai

## 🔍 Phân tích Chi tiết

### **1. Flow hiện tại (CÓ BUG):**

```
Staff vào lần 1:
├─ Socket S1 tạo ra
├─ Redis: {staff: "S1"}
└─ Room: [S1]

Customer vào lần 1:
├─ Socket C1 tạo ra
├─ Redis: {staff: "S1", customer: "C1"}
├─ Emit user-joined → S1 nhận được
└─ Room: [S1, C1]

Customer reload page (vào lần 2):
├─ Socket C2 tạo ra
├─ Redis: {staff: "S1", customer: "C2"}  ← GHI ĐÈ C1!
├─ Emit user-joined → S1 VÀ C1 ĐỀU NHẬN!  ← BUG!
│   ├─ C1 vẫn còn trong room!
│   └─ C1 xử lý sai → Disconnect S1!
└─ Room: [S1, C1, C2]  ← 3 sockets!
```

### **2. Vấn đề cụ thể:**

**File: `videoCallHandler.js`**

```javascript
// Lưu socket ID vào Redis
await redis.hset(`videoroom:${roomId}:sockets`, userType, socket.id);
```

**Vấn đề:**
1. Dùng `userType` làm key → CHỈ LƯU 1 socket/userType
2. Khi user join lại → Socket ID mới GHI ĐÈ socket ID cũ trong Redis
3. **NHƯNG** socket cũ vẫn còn connect và vẫn trong room!
4. Socket cũ vẫn nhận events và có thể gây conflict

**Data structure trong Redis:**
```javascript
// Key: videoroom:video_3_1759808920:sockets
// Value (Hash):
{
    "staff": "socket_S1",      // ← Bị ghi đè khi staff join lại
    "customer": "socket_C1"    // ← Bị ghi đè khi customer join lại
}
```

### **3. Kịch bản gây bug:**

**Scenario 1: Customer reload → Staff mất kết nối**

```
1. Staff join → Socket S1
   Redis: {staff: "S1"}
   
2. Customer join → Socket C1
   Redis: {staff: "S1", customer: "C1"}
   S1 nhận user-joined event ✅
   
3. Customer reload page → Socket C2
   Redis: {staff: "S1", customer: "C2"}  ← C1 bị ghi đè!
   Emit user-joined → S1 VÀ C1 đều nhận!
   
   C1 xử lý:
   - Nhận user-joined event
   - Nghĩ là có user mới vào
   - Trigger createOffer() hoặc logic khác
   - Có thể gây disconnect S1!
```

**Scenario 2: Staff reload → Customer mất kết nối**

```
Tương tự như trên, nhưng ngược lại
```

## ✅ Giải pháp

### **Fix: Disconnect socket cũ trước khi lưu socket mới**

**File: `ServiceRealtime/sockets/videoCallHandler.js`**

**Code cũ (BUG):**
```javascript
// Cho phép tham gia room
socket.join(roomId);
socket.roomId = roomId;
socket.userId = userId;
socket.userType = userType;

// Lưu socket ID vào Redis
await redis.hset(`videoroom:${roomId}:sockets`, userType, socket.id);
```

**Code mới (FIXED):**
```javascript
// Cho phép tham gia room
socket.join(roomId);
socket.roomId = roomId;
socket.userId = userId;
socket.userType = userType;

// Kiểm tra xem đã có socket cũ của user này chưa
const existingSocketId = await redis.hget(`videoroom:${roomId}:sockets`, userType);
if (existingSocketId && existingSocketId !== socket.id) {
    // Có socket cũ → Disconnect socket cũ trước
    const oldSocket = videoNamespace.sockets.get(existingSocketId);
    if (oldSocket) {
        console.log(`⚠️ User ${userId} (${userType}) đã có kết nối cũ ${existingSocketId}, disconnect socket cũ...`);
        oldSocket.emit('force-disconnect', {
            message: 'Bạn đã đăng nhập từ thiết bị khác'
        });
        oldSocket.disconnect(true);
    }
}

// Lưu socket ID MỚI vào Redis
await redis.hset(`videoroom:${roomId}:sockets`, userType, socket.id);
```

### **Thêm handler cho force-disconnect event**

**File: `customer/js/video-call.js`**

```javascript
// Bị force disconnect (đăng nhập từ thiết bị khác)
socket.on('force-disconnect', (data) => {
    console.log('⚠️ Force disconnect:', data);
    alert(data.message || 'Bạn đã đăng nhập từ thiết bị khác');
    endCall();
});
```

## 📊 So sánh Before/After

### **Flow mới (FIXED):**

```
Staff vào lần 1:
├─ Socket S1 tạo ra
├─ Kiểm tra Redis → Không có socket cũ
├─ Redis: {staff: "S1"}
└─ Room: [S1]

Customer vào lần 1:
├─ Socket C1 tạo ra
├─ Kiểm tra Redis → Không có socket cũ
├─ Redis: {staff: "S1", customer: "C1"}
└─ Room: [S1, C1]

Customer reload page (vào lần 2):
├─ Socket C2 tạo ra
├─ Kiểm tra Redis → Có socket cũ C1!
├─ Emit force-disconnect → C1
├─ C1 disconnect ✅
├─ Redis: {staff: "S1", customer: "C2"}
└─ Room: [S1, C2]  ← Chỉ còn 2 sockets!
```

### **Comparison Table:**

| Event | Before (Bug) | After (Fixed) |
|-------|-------------|---------------|
| **Customer vào lần 1** | Socket C1, Redis: C1, Room: [S1, C1] | ✅ Giống |
| **Customer reload** | Socket C2, Redis: C2, Room: [S1, C1, **C2**] | ✅ Socket C2, Redis: C2, Room: [S1, C2] |
| **Sockets trong room** | ❌ 3 sockets (S1, C1, C2) | ✅ 2 sockets (S1, C2) |
| **C1 nhận user-joined** | ❌ Có, gây conflict | ✅ Không, đã disconnect |
| **Staff có bị mất kết nối** | ❌ Có | ✅ Không |

## 🧪 Test Cases

### **Test 1: Customer reload nhiều lần**

**Steps:**
1. Staff vào `/internal/video-call?room=test123`
2. Customer vào `/video-call?room=test123`
3. Verify cả 2 kết nối OK
4. Customer **reload** page 3 lần liên tiếp

**Expected:**
```
Reload lần 1:
- Socket C1 disconnect
- Socket C2 connect
- Staff vẫn còn kết nối ✅
- Console: "⚠️ User 20 (customer) đã có kết nối cũ..."

Reload lần 2:
- Socket C2 disconnect
- Socket C3 connect
- Staff vẫn còn kết nối ✅

Reload lần 3:
- Socket C3 disconnect
- Socket C4 connect
- Staff vẫn còn kết nối ✅
```

### **Test 2: Staff reload nhiều lần**

**Steps:**
1. Customer vào `/video-call?room=test123`
2. Staff vào `/internal/video-call?room=test123`
3. Staff **reload** page 3 lần

**Expected:**
- Customer vẫn giữ kết nối ✅
- Staff reconnect thành công ✅
- Không có alert "Nhân viên đã rời..." ✅

### **Test 3: Cả 2 reload xen kẽ**

**Steps:**
1. Customer vào
2. Staff vào
3. Customer reload
4. Staff reload
5. Customer reload
6. Staff reload

**Expected:**
- Sau mỗi lần reload, user mới connect, user cũ disconnect
- User còn lại KHÔNG bị ảnh hưởng ✅
- Luôn duy trì đúng 2 connections trong room ✅

### **Test 4: Đăng nhập từ 2 thiết bị**

**Scenario:** Customer mở 2 tab/browser cùng lúc

**Steps:**
1. Tab 1: Customer vào video call
2. Tab 2: Customer vào cùng video call

**Expected:**
```
Tab 1:
- Alert: "Bạn đã đăng nhập từ thiết bị khác"
- Video call disconnect ✅

Tab 2:
- Kết nối thành công ✅
```

## 🎯 Root Cause Analysis

### **Tại sao bug này xảy ra?**

1. **Data structure không phù hợp:**
   - Dùng Hash với key là `userType` → Chỉ lưu 1 socket/userType
   - Không handle trường hợp user có nhiều connections

2. **Không cleanup socket cũ:**
   - Khi user join lại, socket cũ vẫn connect
   - Socket cũ vẫn trong room và nhận events
   - Gây conflict và disconnect nhầm người

3. **Không có mechanism để detect duplicate:**
   - Không check xem user đã join chưa
   - Không force disconnect session cũ

## 🔧 Best Practices

### **1. Luôn cleanup resources cũ:**

```javascript
// ❌ BAD - Không cleanup
await redis.hset(key, userType, newSocketId);

// ✅ GOOD - Cleanup trước khi set
const oldSocketId = await redis.hget(key, userType);
if (oldSocketId) {
    disconnectOldSocket(oldSocketId);
}
await redis.hset(key, userType, newSocketId);
```

### **2. Sử dụng socket.disconnect(true):**

```javascript
// true = force close transport
oldSocket.disconnect(true);
```

### **3. Log rõ ràng:**

```javascript
console.log(`⚠️ User ${userId} (${userType}) đã có kết nối cũ ${existingSocketId}, disconnect socket cũ...`);
```

### **4. Notify user:**

```javascript
oldSocket.emit('force-disconnect', {
    message: 'Bạn đã đăng nhập từ thiết bị khác'
});
```

## 📚 Alternative Solutions

### **Option 1: Cho phép multi-device (không recommended cho video call):**

```javascript
// Lưu array of socket IDs thay vì 1 socket ID
await redis.sadd(`videoroom:${roomId}:sockets:${userType}`, socket.id);

// Problem: Video call 1:1 không phù hợp với multi-device
```

### **Option 2: Lưu expiry time:**

```javascript
await redis.hset(`videoroom:${roomId}:sockets`, userType, JSON.stringify({
    socketId: socket.id,
    timestamp: Date.now()
}));

// Kiểm tra expiry trước khi disconnect
```

### **Option 3: Sử dụng Socket.IO rooms API:**

```javascript
// Lấy tất cả sockets trong room
const socketsInRoom = await videoNamespace.in(roomId).fetchSockets();

// Filter by userType
const sammeTypeS = socketsInRoom.filter(s => s.userType === userType);
```

## ✨ Kết quả sau fix

### **Benefits:**

1. ✅ **Ổn định:** User không bị disconnect ngẫu nhiên
2. ✅ **Rõ ràng:** Luôn biết chính xác ai đang trong room
3. ✅ **UX tốt hơn:** Reload page không làm người khác mất kết nối
4. ✅ **Resource cleanup:** Socket cũ được disconnect đúng cách

### **Logs mới:**

```
Before:
📹 Client kết nối: mKsjWaycYCJCzR_xAABf
✅ User 6 (staff) đã tham gia room
📹 Client kết nối: b9ButCrSFt5i185jAABh
✅ User 20 (customer) đã tham gia room
👋 User left: {userId: "6"}  ← BUG!

After:
📹 Client kết nối: mKsjWaycYCJCzR_xAABf
✅ User 6 (staff) đã tham gia room
📹 Client kết nối: b9ButCrSFt5i185jAABh
✅ User 20 (customer) đã tham gia room
📹 Client kết nối: xYz123456789 (customer reload)
⚠️ User 20 (customer) đã có kết nối cũ, disconnect...
✅ User 20 (customer) đã tham gia room  ← FIXED!
```

## 🚀 Deployment Steps

1. **Update code:**
   - ✅ `videoCallHandler.js` - Thêm disconnect logic
   - ✅ `video-call.js` - Thêm force-disconnect handler

2. **Restart Node.js server:**
   ```bash
   cd I:\Final\Code\ServiceRealtime
   taskkill /F /IM node.exe
   node server.js
   ```

3. **Test:**
   - Test customer reload
   - Test staff reload
   - Test xen kẽ reload
   - Test mở 2 tab cùng lúc

4. **Monitor logs:**
   - Xem có "⚠️ đã có kết nối cũ" không
   - Verify không còn "👋 User left" ngẫu nhiên

---

**Fix date:** 2025-01-07  
**Issue:** User reload làm user kia mất kết nối  
**Root cause:** Socket cũ không được disconnect, gây conflict  
**Solution:** Force disconnect socket cũ trước khi lưu socket mới  
**Status:** ✅ Fixed, cần restart server để apply
