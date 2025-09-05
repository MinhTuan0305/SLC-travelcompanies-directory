-- Check the structure of uk_agency table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'uk_agency' 
ORDER BY ordinal_position;

-- Also check if there are any primary key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'uk_agency' 
    AND tc.constraint_type = 'PRIMARY KEY';
