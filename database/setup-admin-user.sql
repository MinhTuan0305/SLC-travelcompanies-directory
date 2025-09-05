-- Setup admin user in profiles table
-- Run this after creating the profiles table

-- First, check if profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Create profiles table if it doesn't exist
        CREATE TABLE profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
            
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
            
        CREATE POLICY "Admins can view all profiles" ON profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
            
        -- Create trigger for updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Profiles table created successfully';
    ELSE
        RAISE NOTICE 'Profiles table already exists';
    END IF;
END $$;

-- Insert admin user (replace with your actual user ID)
-- You can get your user ID from Supabase Auth dashboard
-- Or run: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Example: Insert admin user (uncomment and replace with your user ID)
-- INSERT INTO profiles (id, role) 
-- VALUES ('your-user-id-here', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Check current users
SELECT 
    u.id,
    u.email,
    p.role,
    u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Instructions:
-- 1. Get your user ID from the query above
-- 2. Uncomment the INSERT statement
-- 3. Replace 'your-user-id-here' with your actual user ID
-- 4. Run the script
