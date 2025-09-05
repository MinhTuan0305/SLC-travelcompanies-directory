-- Create news table for UK Agency News feature
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(featured);

-- Enable Row Level Security (RLS)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read published news
CREATE POLICY "Public can read published news" ON news
  FOR SELECT USING (published = true);

-- Only authenticated users can read all news (for admin)
CREATE POLICY "Authenticated users can read all news" ON news
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can insert news
CREATE POLICY "Only admins can insert news" ON news
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update news
CREATE POLICY "Only admins can update news" ON news
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete news
CREATE POLICY "Only admins can delete news" ON news
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_news_updated_at();

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Insert sample news data
INSERT INTO news (title, slug, content, excerpt, featured, published) VALUES
(
  'UK Travel Industry Sees Record Growth in 2024',
  'uk-travel-industry-sees-record-growth-2024',
  'The UK travel industry has experienced unprecedented growth in 2024, with travel agencies reporting record bookings and revenue. This surge is attributed to increased consumer confidence, new destination partnerships, and innovative service offerings.

Key highlights include:
- 35% increase in international bookings
- Strong performance in European destinations
- Growing demand for sustainable travel options
- Digital transformation driving customer engagement

Industry experts predict this positive trend will continue throughout the year, with summer bookings already showing strong momentum.',
  'The UK travel industry has experienced unprecedented growth in 2024, with travel agencies reporting record bookings and revenue.',
  true,
  true
),
(
  'New Travel Regulations for European Destinations',
  'new-travel-regulations-european-destinations',
  'Recent updates to travel regulations for European destinations have been announced, affecting UK travelers planning trips to EU countries. These changes include updated visa requirements, health documentation, and border control procedures.

Important changes:
- Updated ETIAS requirements for 2024
- New health insurance documentation standards
- Streamlined border control processes
- Enhanced digital travel authorization

Travel agencies are advised to stay updated with these changes and inform their clients accordingly to ensure smooth travel experiences.',
  'Recent updates to travel regulations for European destinations have been announced, affecting UK travelers planning trips to EU countries.',
  false,
  true
),
(
  'Sustainable Travel Trends Shaping the Industry',
  'sustainable-travel-trends-shaping-industry',
  'Sustainability has become a key focus in the travel industry, with both agencies and travelers increasingly prioritizing eco-friendly options. This shift is driving innovation in travel services and destination choices.

Key trends include:
- Carbon-neutral travel packages
- Eco-friendly accommodation partnerships
- Local community engagement programs
- Sustainable transportation options

UK travel agencies are leading the way in implementing these sustainable practices, offering travelers more responsible travel choices while maintaining high-quality service standards.',
  'Sustainability has become a key focus in the travel industry, with both agencies and travelers increasingly prioritizing eco-friendly options.',
  false,
  true
);

-- Grant necessary permissions
GRANT ALL ON news TO authenticated;
GRANT SELECT ON news TO anon;
