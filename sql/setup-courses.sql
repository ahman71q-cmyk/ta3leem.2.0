-- ==========================================================
-- Ta3leem — Setup Courses & Lessons
-- شغّل الملف ده في Supabase SQL Editor
-- ==========================================================

-- ==========================================================
-- 1. CATEGORIES — التصنيفات
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'bi-book',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT USING (true);

-- ==========================================================
-- 2. COURSES — الدورات
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published')),
  rating_avg NUMERIC(3,2) DEFAULT 5.0,
  rating_count INT DEFAULT 0,
  students_count INT DEFAULT 0,
  duration_hours INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published courses viewable by everyone" ON public.courses;
CREATE POLICY "Published courses viewable by everyone"
  ON public.courses FOR SELECT USING (status = 'published');

-- للتجربة: اسمح بالإضافة من أي حد (هنتشالها في المرحلة 3)
DROP POLICY IF EXISTS "Temp insert courses" ON public.courses;
CREATE POLICY "Temp insert courses"
  ON public.courses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Temp update courses" ON public.courses;
CREATE POLICY "Temp update courses"
  ON public.courses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Temp delete courses" ON public.courses;
CREATE POLICY "Temp delete courses"
  ON public.courses FOR DELETE USING (true);

-- ==========================================================
-- 3. SECTIONS — أقسام الدورة
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.sections (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_course ON public.sections(course_id);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sections viewable by everyone" ON public.sections;
CREATE POLICY "Sections viewable by everyone"
  ON public.sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Temp all sections" ON public.sections;
CREATE POLICY "Temp all sections"
  ON public.sections FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- 4. LESSONS — الدروس
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_id BIGINT REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'article' CHECK (type IN ('article','video','live')),
  content TEXT,
  youtube_id TEXT,
  live_url TEXT,
  duration_min INT DEFAULT 10,
  position INT DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_section ON public.lessons(section_id);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons viewable by everyone" ON public.lessons;
CREATE POLICY "Lessons viewable by everyone"
  ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Temp all lessons" ON public.lessons;
CREATE POLICY "Temp all lessons"
  ON public.lessons FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- ✅ البيانات التجريبية — التصنيفات
-- ==========================================================
INSERT INTO public.categories (name_ar, name_en, slug, icon) VALUES
  ('برمجة', 'Programming', 'programming', 'bi-code-slash'),
  ('تصميم', 'Design', 'design', 'bi-palette'),
  ('لغات', 'Languages', 'languages', 'bi-translate'),
  ('تسويق', 'Marketing', 'marketing', 'bi-megaphone'),
  ('أعمال', 'Business', 'business', 'bi-briefcase')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================================
-- ✅ الدورات التجريبية
-- ==========================================================
INSERT INTO public.courses (title, slug, description, thumbnail_url, category_id, level, status, rating_avg, rating_count, students_count, duration_hours) VALUES
  (
    'أساسيات البرمجة بلغة Python',
    'python-basics',
    'دورة شاملة لتعلم Python من الصفر حتى الاحتراف.',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    (SELECT id FROM public.categories WHERE slug = 'programming'),
    'beginner', 'published', 4.8, 142, 1240, 12
  ),
  (
    'تصميم واجهات المستخدم UI/UX',
    'ui-ux-design',
    'تعلم أساسيات تصميم واجهات المستخدم باستخدام Figma.',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    (SELECT id FROM public.categories WHERE slug = 'design'),
    'beginner', 'published', 4.7, 98, 890, 10
  ),
  (
    'تعلم اللغة الإنجليزية للمبتدئين',
    'english-beginners',
    'كورس شامل لتعلم اللغة الإنجليزية من الصفر.',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
    (SELECT id FROM public.categories WHERE slug = 'languages'),
    'beginner', 'published', 4.9, 203, 2100, 20
  ),
  (
    'التسويق الرقمي الشامل',
    'digital-marketing',
    'كل ما تحتاجه لتصبح مسوّق رقمي محترف.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    (SELECT id FROM public.categories WHERE slug = 'marketing'),
    'intermediate', 'published', 4.6, 87, 650, 15
  ),
  (
    'إدارة المشاريع الاحترافية',
    'project-management',
    'تعلم إدارة المشاريع بمنهجيات Agile و Scrum.',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    (SELECT id FROM public.categories WHERE slug = 'business'),
    'intermediate', 'published', 4.5, 64, 420, 8
  ),
  (
    'جافاسكريبت المتقدمة',
    'advanced-javascript',
    'تعمّق في JavaScript.',
    'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    (SELECT id FROM public.categories WHERE slug = 'programming'),
    'advanced', 'published', 4.8, 156, 980, 18
  ),
  (
    'أساسيات HTML & CSS',
    'html-css-basics',
    'ابدأ رحلتك في تطوير الويب.',
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
    (SELECT id FROM public.categories WHERE slug = 'programming'),
    'beginner', 'published', 4.9, 312, 3200, 14
  ),
  (
    'تصميم الجرافيك من الصفر',
    'graphic-design',
    'تعلم Photoshop و Illustrator.',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
    (SELECT id FROM public.categories WHERE slug = 'design'),
    'beginner', 'published', 4.6, 78, 560, 16
  ),
  (
    'قواعد اللغة العربية',
    'arabic-grammar',
    'دورة شاملة في النحو والصرف.',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    (SELECT id FROM public.categories WHERE slug = 'languages'),
    'intermediate', 'published', 4.7, 145, 1500, 22
  ),
  (
    'إدارة الوقت والإنتاجية',
    'time-management',
    'تعلم كيف تنظم وقتك.',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    (SELECT id FROM public.categories WHERE slug = 'business'),
    'beginner', 'published', 4.8, 220, 1800, 6
  )
ON CONFLICT (slug) DO NOTHING;

-- ==========================================================
-- ✅ الأقسام للدورة الأولى (Python)
-- ==========================================================
INSERT INTO public.sections (course_id, title, position) VALUES
  ((SELECT id FROM public.courses WHERE slug = 'python-basics'), 'مقدمة إلى Python', 1),
  ((SELECT id FROM public.courses WHERE slug = 'python-basics'), 'الدوال والتحكم', 2)
ON CONFLICT DO NOTHING;

-- ==========================================================
-- ✅ الدروس
-- ==========================================================
INSERT INTO public.lessons (section_id, title, type, content, duration_min, position, is_free_preview)
SELECT
  s.id,
  l.title,
  'article',
  l.content,
  l.duration,
  l.pos,
  l.free
FROM public.sections s
CROSS JOIN (VALUES
  ('ما هي لغة Python؟', '<h3>مقدمة</h3><p>Python هي لغة برمجة عالية المستوى، سهلة التعلم.</p>', 5, 1, true),
  ('تثبيت Python', '<h3>خطوات التثبيت</h3><p>1. حمّل Python من python.org<br>2. شغّل المثبّت<br>3. اختر <code>Add to PATH</code></p>', 8, 2, false),
  ('المتغيرات', '<h3>المتغيرات</h3><p>مثال: <code>x = 5</code></p>', 10, 3, false)
) AS l(title, content, duration, pos, free)
WHERE s.title = 'مقدمة إلى Python'
  AND s.course_id = (SELECT id FROM public.courses WHERE slug = 'python-basics');

INSERT INTO public.lessons (section_id, title, type, content, duration_min, position, is_free_preview)
SELECT
  s.id,
  l.title,
  'article',
  l.content,
  l.duration,
  l.pos,
  l.free
FROM public.sections s
CROSS JOIN (VALUES
  ('الشروط (if / else)', '<h3>الشروط</h3><p>استخدم <code>if</code> و <code>else</code>.</p>', 7, 1, false),
  ('الحلقات التكرارية', '<h3>الحلقات</h3><p>استخدم <code>for</code> و <code>while</code>.</p>', 9, 2, false)
) AS l(title, content, duration, pos, free)
WHERE s.title = 'الدوال والتحكم'
  AND s.course_id = (SELECT id FROM public.courses WHERE slug = 'python-basics');

-- ==========================================================
-- ✅ تحقق
-- ==========================================================
SELECT 'categories' as table_name, COUNT(*) FROM public.categories
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'sections', COUNT(*) FROM public.sections
UNION ALL
SELECT 'lessons', COUNT(*) FROM public.lessons;