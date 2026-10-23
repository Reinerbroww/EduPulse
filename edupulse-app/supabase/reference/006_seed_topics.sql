-- Migration 006: Seed the topic catalog
-- Idempotent: safe to re-run. Admins can manage the catalog afterwards.
INSERT INTO public.topics (name, slug, description) VALUES
  ('Matematika', 'matematika', 'Aljabar, kalkulus, geometri, dan pemecahan masalah matematika.'),
  ('Fisika', 'fisika', 'Mekanika, termodinamika, listrik, dan fisika modern.'),
  ('Kimia', 'kimia', 'Kimia dasar, organik, anorganik, dan perhitungan kimia.'),
  ('Biologi', 'biologi', 'Biologi sel, genetika, ekologi, dan fisiologi.'),
  ('Statistika', 'statistika', 'Probabilitas, inferensi, dan analisis data statistik.'),
  ('Bahasa Inggris', 'bahasa-inggris', 'Percakapan, tata bahasa, menulis, dan persiapan tes.'),
  ('Bahasa Indonesia', 'bahasa-indonesia', 'Penulisan, tata bahasa, dan keterampilan berbahasa.'),
  ('Bahasa Jepang', 'bahasa-jepang', 'Kosakata, tata bahasa, dan latihan percakapan Jepang.'),
  ('Bahasa Korea', 'bahasa-korea', 'Dasar bahasa Korea dan latihan percakapan.'),
  ('Bahasa Arab', 'bahasa-arab', 'Dasar bahasa Arab, nahwu, dan latihan percakapan.'),
  ('Pemrograman', 'pemrograman', 'Dasar pemrograman, struktur data, dan algoritma.'),
  ('Pengembangan Web', 'pengembangan-web', 'HTML, CSS, JavaScript, dan framework web.'),
  ('Data Science', 'data-science', 'Analisis data, machine learning, dan visualisasi data.'),
  ('Desain UI/UX', 'desain-ui-ux', 'Riset pengguna, wireframe, dan desain antarmuka.'),
  ('Ekonomi', 'ekonomi', 'Mikro, makro, dan kebijakan ekonomi.'),
  ('Akuntansi', 'akuntansi', 'Akuntansi keuangan, biaya, dan laporan keuangan.'),
  ('Sejarah', 'sejarah', 'Sejarah dunia, nasional, dan analisis peristiwa.'),
  ('Geografi', 'geografi', 'Geografi fisik, manusia, dan pemetaan.'),
  ('Sosiologi', 'sosiologi', 'Struktur sosial, perubahan sosial, dan teori sosiologi.'),
  ('Public Speaking', 'public-speaking', 'Latihan berbicara di depan umum dan presentasi.'),
  ('Kewirausahaan', 'kewirausahaan', 'Ide bisnis, model bisnis, dan pengembangan usaha.'),
  ('Fotografi', 'fotografi', 'Teknik fotografi, komposisi, dan pengeditan.'),
  ('Musik', 'musik', 'Teori musik, instrumen, dan latihan bermain.'),
  ('Bahasa Asing Lainnya', 'bahasa-asing-lainnya', 'Topik bahasa asing lain sesuai permintaan.')
ON CONFLICT (slug) DO NOTHING;
