# Admin Setup Guide

## Vấn đề hiện tại
Admin status bị mất do:
1. Bảng `profiles` chưa được tạo hoặc chưa có dữ liệu
2. RLS (Row Level Security) chưa được setup đúng
3. User chưa được gán role admin

## Giải pháp

### Cách 1: Sử dụng AdminTestPanel (Khuyến nghị)
1. Mở website trong development mode
2. Đăng nhập với tài khoản của bạn
3. Bạn sẽ thấy "Admin Test Panel" ở góc trên bên phải
4. Click "Make Me Admin" để tự động setup admin
5. Click "Run Admin Test" để kiểm tra

### Cách 2: Setup thủ công trong Supabase
1. Mở Supabase Dashboard
2. Vào SQL Editor
3. Chạy script `database/setup-admin-user.sql`
4. Thay thế `your-user-id-here` bằng User ID thực tế của bạn

### Cách 3: Sử dụng email pattern
Thêm email của bạn vào danh sách admin trong `AuthContext.tsx`:
```typescript
const adminEmails = [
  'admin@example.com', 
  'admin@slc.com', 
  'tuan@admin.com',
  'your-email@example.com' // Thêm email của bạn
];
```

## Kiểm tra Admin Status

### Debug Panel (Development)
- Hiển thị real-time admin status
- Có thể refresh status manually
- Chỉ hiển thị trong development mode

### Console Logs
Mở Developer Tools > Console để xem logs:
- `🔍 Checking admin status for user ID: ...`
- `📊 Profile query result: ...`
- `✅ Admin logged in` hoặc `👤 Normal user`

## Troubleshooting

### Nếu vẫn không work:
1. Kiểm tra bảng `profiles` có tồn tại không
2. Kiểm tra RLS policies
3. Kiểm tra user có trong bảng `profiles` không
4. Thử logout và login lại
5. Kiểm tra console logs để debug

### Reset Admin Status:
1. Xóa user khỏi bảng `profiles`
2. Logout và login lại
3. Sử dụng AdminTestPanel để setup lại

## Files liên quan:
- `lib/contexts/AuthContext.tsx` - Logic check admin
- `components/AdminTestPanel.tsx` - Test panel
- `components/AdminStatusDebug.tsx` - Debug display
- `database/setup-admin-user.sql` - Database setup script
