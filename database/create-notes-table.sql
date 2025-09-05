-- First, let's check the structure of uk_agency table
-- Run this query first to see the actual column names:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'uk_agency';

-- Create agency_notes table (temporarily without foreign key)
CREATE TABLE IF NOT EXISTS agency_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id BIGINT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agency_notes_agency_id ON agency_notes(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_notes_user_id ON agency_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_notes_created_at ON agency_notes(created_at);

-- Enable Row Level Security
ALTER TABLE agency_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notes
CREATE POLICY "Users can view own notes" ON agency_notes
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own notes
CREATE POLICY "Users can insert own notes" ON agency_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own notes
CREATE POLICY "Users can update own notes" ON agency_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own notes
CREATE POLICY "Users can delete own notes" ON agency_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_agency_notes_updated_at 
  BEFORE UPDATE ON agency_notes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint to uk_agency table
ALTER TABLE agency_notes 
ADD CONSTRAINT fk_agency_notes_agency_id 
FOREIGN KEY (agency_id) REFERENCES uk_agency(ID) ON DELETE CASCADE;
