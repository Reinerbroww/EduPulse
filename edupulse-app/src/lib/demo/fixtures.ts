import type { GroupCoverKey } from "@/lib/groups/covers";

/**
 * Demo mode.
 *
 * The fixtures below are *static content rendered by the UI* — they are never
 * inserted into the database, so they can never mix with real accounts or land
 * in production data. Demo mode is off unless explicitly enabled with
 * `NEXT_PUBLIC_DEMO_MODE=true` (see docs/demo-mode.md) and every demo card is
 * labelled "Contoh Demo".
 */

export const DEMO_LABEL = "Contoh Demo";

export const DEMO_MENTOR_DISCLAIMER =
  "Kartu ini hanya contoh. Mentor demo tidak menerima pemesanan nyata dan bukan mentor terverifikasi.";

export const DEMO_PARTNER_DISCLAIMER =
  "Profil ini hanya contoh tampilan. Data nyata muncul setelah kamu dan pengguna lain melengkapi profil.";

export const DEMO_GOAL_DISCLAIMER =
  "Tujuan contoh ini hanya tampilan. Tujuan milikmu yang asli muncul setelah kamu membuatnya.";

export const DEMO_SESSION_DISCLAIMER =
  "Ini contoh isi sesi. Sesi nyata dibuat di dalam kelompok yang kamu ikuti.";

export const DEMO_DASHBOARD_DISCLAIMER =
  "Angka dan kartu contoh ini memperlihatkan tampilan saat akunmu sudah aktif. Tidak dihitung dari data nyata.";

export interface DemoGroup {
  slug: string;
  name: string;
  description: string;
  topic: string;
  coverKey: GroupCoverKey;
  memberCount: number;
  maxMembers: number;
  agenda: string[];
}

export interface DemoMentor {
  slug: string;
  name: string;
  expertise: string;
  summary: string;
  topics: string[];
  experienceYears: number;
  service: {
    mode: string;
    durationMinutes: number;
    priceLabel: string;
  };
}

export const DEMO_GROUPS: readonly DemoGroup[] = [
  {
    slug: "python-pemula",
    name: "Belajar Python dari Nol",
    description:
      "Latihan dasar Python lewat soal kecil mingguan: variabel, percabangan, perulangan, dan fungsi. Cocok buat yang baru kenal coding!",
    topic: "Pemrograman",
    coverKey: "programming",
    memberCount: 6,
    maxMembers: 10,
    agenda: [
      "Minggu 1 — variabel dan tipe data",
      "Minggu 2 — percabangan dan perulangan",
      "Minggu 3 — fungsi dan struktur data sederhana",
      "Minggu 4 — mini project: kalkulator sederhana",
    ],
  },
  {
    slug: "aljabar-trigonometri",
    name: "Aljabar & Trigonometri",
    description:
      "Kelompok latihan soal aljabar dan trigonometri dengan pembahasan langkah demi langkah. Fokus pada pemahaman konsep, bukan hafalan.",
    topic: "Matematika",
    coverKey: "mathematics",
    memberCount: 4,
    maxMembers: 8,
    agenda: [
      "Sesi 1 — persamaan linear dan kuadrat",
      "Sesi 2 — identitas trigonometri",
      "Sesi 3 — latihan soal campuran",
      "Sesi 4 — try out mini persiapan ujian",
    ],
  },
  {
    slug: "speaking-bahasa-inggris",
    name: "Latihan Speaking Bahasa Inggris",
    description:
      "Ruang aman untuk berlatih percakapan bahasa Inggris 30 menit setiap pekan. Fokus pada kepercayaan diri, bukan kesempurnaan.",
    topic: "Bahasa",
    coverKey: "language",
    memberCount: 5,
    maxMembers: 8,
    agenda: [
      "Pekan 1 — perkenalan diri & ice breaking",
      "Pekan 2 — bercerita pengalaman harian",
      "Pekan 3 — diskusi topik pilihan",
      "Pekan 4 — roleplay situasi nyata (wawancara, belanja, dll)",
    ],
  },
  {
    slug: "persiapan-ujian-ipa",
    name: "Persiapan Ujian IPA",
    description:
      "Belajar bersama materi IPA SMP dan latihan soal ujian, lengkap dengan kisi-kisi dan trik cepat mengerjakan soal.",
    topic: "Sains",
    coverKey: "science",
    memberCount: 7,
    maxMembers: 12,
    agenda: [
      "Sesi 1 — fisika dasar (gerak, gaya)",
      "Sesi 2 — biologi dan ekosistem",
      "Sesi 3 — kimia dasar & tabel periodik",
      "Sesi 4 — simulasi ujian + pembahasan",
    ],
  },
  {
    slug: "ui-ux-dasar",
    name: "UI/UX Dasar untuk Pemula",
    description:
      "Belajar dasar desain antarmuka dan pengalaman pengguna bareng. Praktik langsung bikin wireframe sederhana pakai tools gratis.",
    topic: "Desain",
    coverKey: "design",
    memberCount: 3,
    maxMembers: 8,
    agenda: [
      "Sesi 1 — prinsip dasar UI/UX",
      "Sesi 2 — wireframing & user flow",
      "Sesi 3 — warna, tipografi, dan spacing",
      "Sesi 4 — proyek mini: redesign halaman sederhana",
    ],
  },
  {
    slug: "belajar-bersama-snbt",
    name: "Belajar Bareng Persiapan SNBT",
    description:
      "Kelompok diskusi dan latihan soal SNBT dengan strategi time management. Saling dukung, saling semangat!",
    topic: "Persiapan Ujian",
    coverKey: "language",
    memberCount: 8,
    maxMembers: 15,
    agenda: [
      "Minggu 1 — Tes Potensi Skolastik (TPS)",
      "Minggu 2 — Literasi Bahasa Indonesia & Inggris",
      "Minggu 3 — Penalaran Matematika",
      "Minggu 4 — Try out full + evaluasi strategi",
    ],
  },
];

export const DEMO_MENTORS: readonly DemoMentor[] = [
  {
    slug: "mentor-python",
    name: "Rani (Contoh Demo)",
    expertise: "Python, algoritma, dan logika pemrograman",
    summary:
      "Mendampingi pemula memahami dasar pemrograman secara bertahap dengan latihan praktis setiap sesi. Fokus pada 'belajar dengan membuat'.",
    topics: ["Python", "Algoritma", "Struktur data"],
    experienceYears: 4,
    service: {
      mode: "Sesi contoh (tanpa pemesanan)",
      durationMinutes: 45,
      priceLabel: "Gratis (contoh)",
    },
  },
  {
    slug: "mentor-matematika",
    name: "Bagus (Contoh Demo)",
    expertise: "Matematika SMP dan persiapan ujian",
    summary:
      "Membantu menyusun strategi belajar matematika dan membahas soal sulit langkah demi langkah. Ramah, sabar, dan terarah.",
    topics: ["Aljabar", "Geometri", "Persiapan ujian"],
    experienceYears: 3,
    service: {
      mode: "Sesi contoh (tanpa pemesanan)",
      durationMinutes: 45,
      priceLabel: "Gratis (contoh)",
    },
  },
  {
    slug: "mentor-bahasa-inggris",
    name: "Sinta (Contoh Demo)",
    expertise: "Bahasa Inggris percakapan",
    summary:
      "Melatih keberanian berbicara bahasa Inggris lewat percakapan terarah dan koreksi lembut. Cocok buat yang grogi mulai ngomong.",
    topics: ["Speaking", "Grammar dasar", "Kosakata"],
    experienceYears: 5,
    service: {
      mode: "Sesi contoh (tanpa pemesanan)",
      durationMinutes: 30,
      priceLabel: "Gratis (contoh)",
    },
  },
  {
    slug: "mentor-snbt",
    name: "Dafa (Contoh Demo)",
    expertise: "Persiapan SNBT, TPS, dan Penalaran Matematika",
    summary:
      "Mendampingi latihan soal SNBT dengan analisis kesalahan, manajemen waktu, dan strategi pengerjaan yang efektif.",
    topics: ["TPS", "Penalaran Matematika", "Literasi"],
    experienceYears: 3,
    service: {
      mode: "Sesi contoh (tanpa pemesanan)",
      durationMinutes: 60,
      priceLabel: "Gratis (contoh)",
    },
  },
  {
    slug: "mentor-uiux",
    name: "Mira (Contoh Demo)",
    expertise: "UI/UX, wireframing, dan portfolio desain",
    summary:
      "Bantu membangun portofolio UI/UX pemula dengan project nyata. Review desain bareng dan tips masuk dunia desain.",
    topics: ["UI/UX", "Figma", "Portfolio"],
    experienceYears: 4,
    service: {
      mode: "Sesi contoh (tanpa pemesanan)",
      durationMinutes: 45,
      priceLabel: "Gratis (contoh)",
    },
  },
];

/**
 * Demo mode is opt-in. It is intended for development, staging, and demos —
 * never enabled automatically, so real deployments keep showing real data only.
 */
export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export interface DemoPartner {
  slug: string;
  name: string;
  initials: string;
  educationLevel: string;
  bio: string;
  topics: string[];
  goal: string;
  matchReason: string;
  availability: string;
}

export interface DemoGoal {
  slug: string;
  title: string;
  topic: string;
  supportMode: string;
  targetDate: string;
  progressPercent: number;
  milestones: string[];
  nextStep: string;
}

export interface DemoSession {
  slug: string;
  title: string;
  scheduleLabel: string;
  agenda: string[];
  checklist: { label: string; done: boolean }[];
}

export const DEMO_PARTNERS: readonly DemoPartner[] = [
  {
    slug: "partner-lia",
    name: "Lia (Contoh Demo)",
    initials: "L",
    educationLevel: "SMA / SMK",
    bio: "Sedang belajar dasar Python dan senang belajar lewat latihan soal bareng. Sering share catatan ringkas!",
    topics: ["Python", "Matematika"],
    goal: "Memahami dasar Python",
    matchReason: "Topik sama: Python",
    availability: "Sore hari, akhir pekan",
  },
  {
    slug: "partner-dimas",
    name: "Dimas (Contoh Demo)",
    initials: "D",
    educationLevel: "Kuliah",
    bio: "Ingin memperkuat aljabar dan trigonometri untuk persiapan ujian. Suka diskusi konsep sampai paham.",
    topics: ["Aljabar", "Trigonometri"],
    goal: "Lulus ujian matematika",
    matchReason: "Jadwal belajar beririsan",
    availability: "Malam hari, Senin–Kamis",
  },
  {
    slug: "partner-ayu",
    name: "Ayu (Contoh Demo)",
    initials: "A",
    educationLevel: "SMA / SMK",
    bio: "Berlatih speaking bahasa Inggris dan mencari teman ngobrol rutin. Yang penting konsisten, bukan sempurna.",
    topics: ["Bahasa Inggris"],
    goal: "Percaya diri berbahasa Inggris",
    matchReason: "Tujuan belajar sejenis",
    availability: "Pagi hari, Sabtu",
  },
  {
    slug: "partner-reza",
    name: "Reza (Contoh Demo)",
    initials: "R",
    educationLevel: "SMA / SMK",
    bio: "Fokus persiapan SNBT, khususnya TPS dan Penalaran Matematika. Ajak sharing strategi dan evaluasi bareng.",
    topics: ["SNBT", "Matematika", "TPS"],
    goal: "Maksimalkan skor SNBT",
    matchReason: "Target ujian sama",
    availability: "Malam hari, Jumat–Minggu",
  },
  {
    slug: "partner-nisa",
    name: "Nisa (Contoh Demo)",
    initials: "N",
    educationLevel: "Kuliah",
    bio: "Belajar UI/UX dari nol dan sedang kumpulin portofolio. Mau belajar wireframing bareng dan dapat feedback.",
    topics: ["UI/UX", "Desain"],
    goal: "Bangun portofolio UI/UX",
    matchReason: "Minat desain sama",
    availability: "Sore–malam, Rabu–Minggu",
  },
  {
    slug: "partner-andi",
    name: "Andi (Contoh Demo)",
    initials: "A",
    educationLevel: "SMP",
    bio: "Sedang mempersiapkan ujian IPA SMP. Suka belajar dengan kuis cepat dan diskusi ringkas.",
    topics: ["IPA", "Biologi", "Fisika"],
    goal: "Naik nilai IPA",
    matchReason: "Materi ujian beririsan",
    availability: "Sore hari, Senin–Jumat",
  },
];

export const DEMO_GOALS: readonly DemoGoal[] = [
  {
    slug: "goal-python",
    title: "Memahami dasar Python",
    topic: "Pemrograman",
    supportMode: "Partner belajar",
    targetDate: "2026-12-31",
    progressPercent: 45,
    milestones: [
      "Variabel dan tipe data",
      "Percabangan dan perulangan",
      "Fungsi dan struktur data",
      "Mini project: kalkulator",
    ],
    nextStep: "Latihan 10 soal fungsi minggu ini",
  },
  {
    slug: "goal-speaking",
    title: "Percaya diri berbahasa Inggris",
    topic: "Bahasa",
    supportMode: "Kelompok belajar",
    targetDate: "2026-11-30",
    progressPercent: 30,
    milestones: [
      "Perkenalan diri",
      "Bercerita pengalaman harian",
      "Diskusi topik pilihan",
      "Roleplay situasi nyata",
    ],
    nextStep: "Ikut satu sesi speaking pekan ini",
  },
  {
    slug: "goal-snbt",
    title: "Maksimalkan skor SNBT",
    topic: "Persiapan Ujian",
    supportMode: "Kelompok belajar",
    targetDate: "2027-04-30",
    progressPercent: 25,
    milestones: [
      "Kuasai TPS dasar",
      "Latihan literasi tiap pekan",
      "Perkuat penalaran matematika",
      "Evaluasi try out berkala",
    ],
    nextStep: "Kerjakan 15 soal TPS hari ini",
  },
  {
    slug: "goal-uiux",
    title: "Bangun portofolio UI/UX pemula",
    topic: "Desain",
    supportMode: "Mentor",
    targetDate: "2026-12-15",
    progressPercent: 35,
    milestones: [
      "Pelajari prinsip UI/UX",
      "Buat 3 wireframe",
      "Desain 1 case study",
      "Publikasikan di portfolio",
    ],
    nextStep: "Review wireframe pertama bareng mentor",
  },
];

export const DEMO_SESSIONS: readonly DemoSession[] = [
  {
    slug: "session-python",
    title: "Latihan soal bab 3",
    scheduleLabel: "Sabtu, 14.00–15.00",
    agenda: [
      "Pembahasan soal perulangan",
      "Latihan berpasangan",
      "Tanya jawab bebas",
      "Rencana tugas minggu depan",
    ],
    checklist: [
      { label: "Siapkan catatan bab 3", done: true },
      { label: "Kerjakan soal latihan", done: false },
      { label: "Tulis pertanyaan", done: false },
      { label: "Review solusi bareng", done: false },
    ],
  },
  {
    slug: "session-snbt",
    title: "Latihan TPS + Diskusi",
    scheduleLabel: "Minggu, 19.00–20.15",
    agenda: [
      "Warm up kuis 10 menit",
      "Bahas soal sulit bersama",
      "Analisis kesalahan",
      "Strategi untuk minggu depan",
    ],
    checklist: [
      { label: "Kerjakan kuis pra-sesi", done: true },
      { label: "Catat 3 soal salah", done: false },
      { label: "Siapkan pertanyaan", done: false },
    ],
  },
];
