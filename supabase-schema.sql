-- ========================================================
-- DHAMMIKA MOTOR SUPPLIERS - SUPABASE DATABASE INITIALIZATION
-- ========================================================
-- Run this complete script in your Supabase SQL Editor:
-- (Supabase Dashboard -> Your Project -> SQL Editor -> New Query -> Run)

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Auto Parts Table
CREATE TABLE IF NOT EXISTS public.parts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    part_number TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    image_url TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Categories
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" 
    ON public.categories FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can insert categories" ON public.categories;
CREATE POLICY "Public can insert categories" 
    ON public.categories FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update categories" ON public.categories;
CREATE POLICY "Public can update categories" 
    ON public.categories FOR UPDATE 
    USING (true);

DROP POLICY IF EXISTS "Public can delete categories" ON public.categories;
CREATE POLICY "Public can delete categories" 
    ON public.categories FOR DELETE 
    USING (true);

-- 5. Policies for Auto Parts
DROP POLICY IF EXISTS "Public can view parts" ON public.parts;
CREATE POLICY "Public can view parts" 
    ON public.parts FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Public can insert parts" ON public.parts;
CREATE POLICY "Public can insert parts" 
    ON public.parts FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update parts" ON public.parts;
CREATE POLICY "Public can update parts" 
    ON public.parts FOR UPDATE 
    USING (true);

DROP POLICY IF EXISTS "Public can delete parts" ON public.parts;
CREATE POLICY "Public can delete parts" 
    ON public.parts FOR DELETE 
    USING (true);

-- 6. Storage Bucket Setup for Part Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('parts-images', 'parts-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Storage Policies
DROP POLICY IF EXISTS "Public can view parts-images" ON storage.objects;
CREATE POLICY "Public can view parts-images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'parts-images');

DROP POLICY IF EXISTS "Public can upload parts-images" ON storage.objects;
CREATE POLICY "Public can upload parts-images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'parts-images');

DROP POLICY IF EXISTS "Public can update parts-images" ON storage.objects;
CREATE POLICY "Public can update parts-images" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'parts-images');

DROP POLICY IF EXISTS "Public can delete parts-images" ON storage.objects;
CREATE POLICY "Public can delete parts-images" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'parts-images');

-- 8. Seed Initial Categories
INSERT INTO public.categories (id, name, slug)
VALUES
    ('cat-1', 'Brake Parts', 'brake-parts'),
    ('cat-2', 'Engine & Filters', 'engine-filters'),
    ('cat-3', 'Suspension & Steering', 'suspension-steering'),
    ('cat-4', 'Clutch & Transmission', 'clutch-transmission'),
    ('cat-5', 'Electrical & Ignition', 'electrical-ignition')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Initial 18 Auto Parts
INSERT INTO public.parts (id, part_number, name, category_id, category_name, price, image_url, is_available, description)
VALUES
    ('part-1', '#TY-BRK-4091', 'Front Ceramic Brake Pads - Hilux KDH', 'cat-1', 'Brake Parts', 8500, 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80', true, 'High performance heat-resistant ceramic brake pads for Toyota Hilux KDH200 series.'),
    ('part-2', '#TY-BRK-2210', 'Rear Brake Shoes Set - Toyota Hiace LH113', 'cat-1', 'Brake Parts', 5200, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80', true, 'OEM quality rear drum brake shoe set for Hiace LH113 / Dolphin models.'),
    ('part-3', '#NIS-BRK-5542', 'Ventilated Front Brake Disc Rotors - Nissan Caravan', 'cat-1', 'Brake Parts', 14800, 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80', false, 'High-grade cast iron vented front brake discs for Nissan Caravan E25 / NV350.'),
    ('part-4', '#MIT-BRK-3199', 'Master Brake Cylinder Assembly - Mitsubishi Canter', 'cat-1', 'Brake Parts', 19500, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80', true, 'Heavy duty dual-circuit brake master cylinder for Mitsubishi Canter FE639 / FE649.'),
    ('part-5', '#NIS-FLT-15208', 'Oil Filter Element - Nissan Patrol & Navara D40', 'cat-2', 'Engine & Filters', 2450, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', true, 'Multi-layered synthetic blend spin-on oil filter for Nissan YD25 diesel engines.'),
    ('part-6', '#TY-ENG-90915', 'Heavy-Duty Oil Filter - Toyota Land Cruiser Prado 150', 'cat-2', 'Engine & Filters', 3800, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80', true, 'OEM standard engine oil filter element compatible with 1KD-FTV and 1GD engines.'),
    ('part-7', '#TY-AIR-17801', 'High Flow Engine Air Filter - Toyota Corolla Axio / Fielder', 'cat-2', 'Engine & Filters', 3200, 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80', true, 'Polyurethane framed dry air cleaner element ensuring peak intake airflow.'),
    ('part-8', '#HON-FLT-17048', 'In-Tank High Pressure Fuel Filter - Honda Vezel / Fit GP5', 'cat-2', 'Engine & Filters', 7600, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', false, 'Original specification fuel pump strainer & micro filter for direct injection engines.'),
    ('part-9', '#TY-SUS-43330', 'Front Lower Suspension Ball Joint - Hilux Revo', 'cat-3', 'Suspension & Steering', 6400, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80', true, 'Forged alloy steel lower ball joint with dust boot seal for rugged road conditions.'),
    ('part-10', '#TY-SUS-48510', 'Gas-Charged Front Shock Absorber - Toyota Prius 30', 'cat-3', 'Suspension & Steering', 18500, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80', true, 'Twin-tube nitrogen gas pressurized strut for enhanced stability and smooth ride.'),
    ('part-11', '#NIS-STR-48520', 'Tie Rod End Outer Pair - Nissan Sunny FB15', 'cat-3', 'Suspension & Steering', 4900, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=80', true, 'Precision engineered steering outer tie rod ends ensuring exact wheel alignment.'),
    ('part-12', '#TY-CLT-31210', 'Heavy Duty Clutch Pressure Plate - Toyota Dyna', 'cat-4', 'Clutch & Transmission', 24500, 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=600&q=80', true, 'Reinforced diaphragm spring clutch cover for commercial hauling endurance.'),
    ('part-13', '#ISU-CLT-89737', 'Clutch Disc Friction Plate - Isuzu Elf NLR85', 'cat-4', 'Clutch & Transmission', 16200, 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80', true, 'High friction organic clutch plate with torsion vibration damper springs.'),
    ('part-14', '#MIT-CLT-31826', 'Hydraulic Clutch Release Bearing - L200 Sportero', 'cat-4', 'Clutch & Transmission', 9800, 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80', false, 'Concentric slave cylinder with integrated release bearing for smooth gear shifts.'),
    ('part-15', '#DEN-ELC-10421', 'Alternator Assembly 12V 90A - Toyota Vitz / Yaris 1KR', 'cat-5', 'Electrical & Ignition', 36000, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80', true, 'High output compact 12V 90Amp alternator with built-in internal IC regulator.'),
    ('part-16', '#NGK-ELC-6441', 'Iridium Laser Spark Plugs (Pack of 4) - Suzuki Wagon R', 'cat-5', 'Electrical & Ignition', 9200, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80', true, 'Long-life iridium tip spark plugs designed for Suzuki K10B / R06A turbo engines.'),
    ('part-17', '#BOS-ELC-0001', 'Starter Motor Reduction Type 12V 2.2kW - Mitsubishi Pajero', 'cat-5', 'Electrical & Ignition', 42000, 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=600&q=80', true, 'Planetary gear reduction high-torque starter motor for 4M40 / 4M41 diesel engines.'),
    ('part-18', '#TY-ELC-84820', 'Power Window Master Control Switch - Toyota Hiace KDH', 'cat-5', 'Electrical & Ignition', 7800, 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80', true, 'Driver door master control module with auto-down feature and child window lock.')
ON CONFLICT (id) DO NOTHING;

