-- FAQ Schema
-- Run this SQL in your Supabase SQL Editor

-- Create faq_categories table
CREATE TABLE IF NOT EXISTS public.faq_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'ri-question-line',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.faq_categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faq_categories_active ON public.faq_categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs(is_published);

-- Enable Row Level Security
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active FAQ categories" ON public.faq_categories;
DROP POLICY IF EXISTS "Admins can view all FAQ categories" ON public.faq_categories;
DROP POLICY IF EXISTS "Admins can create FAQ categories" ON public.faq_categories;
DROP POLICY IF EXISTS "Admins can update FAQ categories" ON public.faq_categories;
DROP POLICY IF EXISTS "Admins can delete FAQ categories" ON public.faq_categories;

DROP POLICY IF EXISTS "Anyone can view published FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can view all FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can create FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can update FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON public.faqs;

-- RLS Policies for faq_categories table

-- Policy: Anyone can view active FAQ categories
CREATE POLICY "Anyone can view active FAQ categories"
    ON public.faq_categories
    FOR SELECT
    USING (is_active = TRUE);

-- Policy: Admins can view all FAQ categories
CREATE POLICY "Admins can view all FAQ categories"
    ON public.faq_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can create FAQ categories
CREATE POLICY "Admins can create FAQ categories"
    ON public.faq_categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update FAQ categories
CREATE POLICY "Admins can update FAQ categories"
    ON public.faq_categories
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete FAQ categories
CREATE POLICY "Admins can delete FAQ categories"
    ON public.faq_categories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for faqs table

-- Policy: Anyone can view published FAQs
CREATE POLICY "Anyone can view published FAQs"
    ON public.faqs
    FOR SELECT
    USING (
        is_published = TRUE AND
        EXISTS (
            SELECT 1 FROM public.faq_categories
            WHERE id = faqs.category_id AND is_active = TRUE
        )
    );

-- Policy: Admins can view all FAQs
CREATE POLICY "Admins can view all FAQs"
    ON public.faqs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can create FAQs
CREATE POLICY "Admins can create FAQs"
    ON public.faqs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update FAQs
CREATE POLICY "Admins can update FAQs"
    ON public.faqs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete FAQs
CREATE POLICY "Admins can delete FAQs"
    ON public.faqs
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_faq_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_faq_categories_updated_at ON public.faq_categories;
CREATE TRIGGER update_faq_categories_updated_at
    BEFORE UPDATE ON public.faq_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_faq_categories_updated_at();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON public.faqs;
CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_faqs_updated_at();

-- Function to increment FAQ views
CREATE OR REPLACE FUNCTION public.increment_faq_views(faq_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.faqs
    SET views_count = views_count + 1
    WHERE id = faq_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON public.faq_categories TO authenticated, anon;
GRANT ALL ON public.faq_categories TO authenticated;
GRANT SELECT ON public.faqs TO authenticated, anon;
GRANT ALL ON public.faqs TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_faq_views TO authenticated, anon;

-- Insert default FAQ categories
INSERT INTO public.faq_categories (name, icon, display_order) VALUES
('General', 'ri-information-line', 1),
('Regulatory Impact Assessment', 'ri-file-chart-line', 2),
('Submissions', 'ri-file-upload-line', 3),
('Consultations', 'ri-discuss-line', 4),
('Services', 'ri-customer-service-2-line', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'What is the Business Regulatory Review Agency (BRRA)?',
    'The Business Regulatory Review Agency (BRRA) is a statutory body established to improve the business regulatory environment in Zambia. We coordinate regulatory impact assessments, manage regulatory services centres, and ensure that business regulations are effective, efficient, and conducive to economic growth.',
    id,
    1
FROM public.faq_categories WHERE name = 'General'
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'How can I contact BRRA?',
    'You can contact us through multiple channels: Visit our Contact page on this website, email us at info@brra.org.zm, call our main office, or visit any of our Regulatory Services Centres (RSCs) located across Zambia.',
    id,
    2
FROM public.faq_categories WHERE name = 'General'
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'What is a Regulatory Impact Assessment (RIA)?',
    'A Regulatory Impact Assessment (RIA) is a systematic approach to critically assessing the positive and negative effects of proposed and existing regulations. It helps ensure that regulations are necessary, effective, and impose the least burden on businesses while achieving policy objectives.',
    id,
    1
FROM public.faq_categories WHERE name = 'Regulatory Impact Assessment'
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'Who needs to conduct a RIA?',
    'All regulatory agencies in Zambia are required to conduct RIAs for new regulations or significant amendments to existing regulations that may impact businesses. This ensures evidence-based policy making and reduces unnecessary regulatory burden.',
    id,
    2
FROM public.faq_categories WHERE name = 'Regulatory Impact Assessment'
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'How do I make a submission to BRRA?',
    'You can make submissions through our online portal, by email to submissions@brra.org.zm, or by visiting any of our Regulatory Services Centres. Please ensure your submission includes all required documentation and follows the guidelines provided for the specific consultation or regulatory review.',
    id,
    1
FROM public.faq_categories WHERE name = 'Submissions'
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'What is the deadline for submissions?',
    'Submission deadlines vary depending on the specific consultation or regulatory review. Deadlines are clearly stated in the consultation notice and on our website. We recommend submitting well before the deadline to ensure your input is considered.',
    id,
    2
FROM public.faq_categories WHERE name = 'Submissions'
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'How can I participate in public consultations?',
    'Public consultations are announced on our website and through various media channels. You can participate by attending consultation meetings, submitting written comments, or engaging through our online consultation platform. All stakeholders are encouraged to participate.',
    id,
    1
FROM public.faq_categories WHERE name = 'Consultations'
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'What services do Regulatory Services Centres (RSCs) provide?',
    'RSCs provide one-stop-shop services for business registration and regulatory compliance. Services include business registration, licensing, tax registration, social security registration, and other regulatory requirements. Multiple agencies operate under one roof for your convenience.',
    id,
    1
FROM public.faq_categories WHERE name = 'Services'
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category_id, display_order)
SELECT 
    'Where are RSCs located?',
    'We have fully operational RSCs in Chipata, Kabwe, Kitwe, Livingstone, Lusaka, and Solwezi. Additional centres in Chinsali and Kasama are also operational. Visit our RSCs page for detailed location information and contact details.',
    id,
    2
FROM public.faq_categories WHERE name = 'Services'
ON CONFLICT DO NOTHING;
