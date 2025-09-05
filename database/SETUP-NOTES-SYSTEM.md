# Setup Notes System - Step by Step

## Lỗi hiện tại:
```
ERROR: 42703: column "id" referenced in foreign key constraint does not exist
```

## Giải pháp:

### Bước 1: Kiểm tra cấu trúc bảng uk_agency
1. Mở Supabase SQL Editor
2. Chạy file `check-uk-agency-structure.sql` để xem cấu trúc bảng
3. Tìm tên cột primary key (có thể là `id`, `ID`, hoặc tên khác)

### Bước 2: Tạo bảng agency_notes
1. Chạy file `create-notes-table.sql` (đã được sửa để không có foreign key)
2. Bảng sẽ được tạo thành công

### Bước 3: Thêm foreign key constraint
Sau khi biết tên cột primary key của bảng `uk_agency`, chạy lệnh:

```sql
-- Thay 'ACTUAL_COLUMN_NAME' bằng tên cột thực tế
ALTER TABLE agency_notes 
ADD CONSTRAINT fk_agency_notes_agency_id 
FOREIGN KEY (agency_id) REFERENCES uk_agency(ACTUAL_COLUMN_NAME) ON DELETE CASCADE;
```

### Bước 4: Kiểm tra
```sql
-- Kiểm tra bảng đã được tạo
SELECT * FROM agency_notes LIMIT 1;

-- Kiểm tra foreign key constraint
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'agency_notes' 
    AND tc.constraint_type = 'FOREIGN KEY';
```

## Các tên cột có thể:
- `id` (lowercase)
- `ID` (uppercase) 
- `agency_id`
- `pk_id`
- Hoặc tên khác

## Sau khi setup xong:
1. Notes system sẽ hoạt động trong ứng dụng
2. Mỗi user chỉ thấy note của chính họ
3. Notes sẽ tự động xóa khi agency bị xóa
