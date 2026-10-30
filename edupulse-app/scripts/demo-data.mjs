#!/usr/bin/env node
// Shared demo seeding helpers for EduPulse.
//
// This script writes real rows to a Supabase database so a reviewer can try the
// full flow (partner request, group join, mentoring booking, session notes).
// It is deliberately guarded:
//   - must be enabled with DEMO_SEED_ENABLED=true
//   - must have DEMO_SEED_CONFIRM=seed-edupulse-demo
//   - refuses to run when NODE_ENV or VERCEL_ENV is "production"
//   - only touches accounts with the @demo.edupulse.test domain and rows whose
//     names start with "Demo — "
//
// Run `npm run seed-demo` for a fresh, deterministic demo dataset. Running it
// again resets demo rows and recreates them; real data is never deleted.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { Client } from "pg";

export const DEMO_EMAIL_DOMAIN = "demo.edupulse.test";
export const DEMO_PASSWORD = "DemoEduPulse2026!";
export const DEMO_NAME_PREFIX = "Demo — ";

const DEMO_USER_IDS = [
  "11111111-1111-4111-8111-111111111101",
  "11111111-1111-4111-8111-111111111102",
  "11111111-1111-4111-8111-111111111103",
  "11111111-1111-4111-8111-111111111104",
  "11111111-1111-4111-8111-111111111105",
  "11111111-1111-4111-8111-111111111106",
  "11111111-1111-4111-8111-111111111107",
];

const DEMO_GOAL_IDS = [
  "22222222-2222-4222-8222-222222222201",
  "22222222-2222-4222-8222-222222222202",
  "22222222-2222-4222-8222-222222222203",
  "22222222-2222-4222-8222-222222222204",
  "22222222-2222-4222-8222-222222222205",
];

const DEMO_MENTOR_IDS = [
  "33333333-3333-4333-8333-333333333301",
  "33333333-3333-4333-8333-333333333302",
];

const DEMO_SERVICE_IDS = [
  "44444444-4444-4444-8444-444444444401",
  "44444444-4444-4444-8444-444444444402",
  "44444444-4444-4444-8444-444444444403",
];

const DEMO_SLOT_IDS = [
  "55555555-5555-4555-8555-555555555501",
  "55555555-5555-4555-8555-555555555502",
  "55555555-5555-4555-8555-555555555503",
  "55555555-5555-4555-8555-555555555504",
  "55555555-5555-4555-8555-555555555505",
  "55555555-5555-4555-8555-555555555506",
  "55555555-5555-4555-8555-555555555507",
];

const DEMO_GROUP_IDS = [
  "66666666-6666-4666-8666-666666666601",
  "66666666-6666-4666-8666-666666666602",
  "66666666-6666-4666-8666-666666666603",
];

const DEMO_SESSION_IDS = [
  "77777777-7777-4777-8777-777777777701",
  "77777777-7777-4777-8777-777777777702",
  "77777777-7777-4777-8777-777777777703",
];

const DEMO_BOOKING_IDS = [
  "88888888-8888-4888-8888-888888888801",
  "88888888-8888-4888-8888-888888888802",
  "88888888-8888-4888-8888-888888888803",
];

const DEMO_REQUEST_IDS = [
  "99999999-9999-4999-8999-999999999901",
  "99999999-9999-4999-8999-999999999902",
  "99999999-9999-4999-8999-999999999903",
];

const DEMO_UPDATE_IDS = [
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01",
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02",
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03",
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04",
];

const DEMO_CHECKLIST_IDS = [
  "dddddddd-dddd-4ddd-8ddd-dddddddddd01",
  "dddddddd-dddd-4ddd-8ddd-dddddddddd02",
  "dddddddd-dddd-4ddd-8ddd-dddddddddd03",
  "dddddddd-dddd-4ddd-8ddd-dddddddddd04",
  "dddddddd-dddd-4ddd-8ddd-dddddddddd05",
  "dddddddd-dddd-4ddd-8ddd-dddddddddd06",
  "dddddddd-dddd-4ddd-8ddd-dddddddddd07",
  "dddddddd-dddd-4ddd-8ddd-dddddddddd08",
  "dddddddd-dddd-4ddd-8ddd-dddddddddd09",
];

const DEMO_NOTE_IDS = [
  "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01",
  "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02",
  "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03",
];

const DEMO_FEEDBACK_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01";
const DEMO_SUMMARY_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc01";

const ACCOUNTS = [
  {
    key: "rani",
    id: DEMO_USER_IDS[0],
    email: `demo.rani@${DEMO_EMAIL_DOMAIN}`,
    displayName: `${DEMO_NAME_PREFIX}Rani`,
    educationLevel: "university",
    bio: "Mentor demo Python. Senang membimbing pemula lewat latihan kecil dan mini project yang bisa langsung dicoba.",
    topics: [
      ["pemrograman", "teaching", "advanced"],
      ["pengembangan-web", "teaching", "advanced"],
      ["data-science", "teaching", "intermediate"],
    ],
    availability: [
      [2, "19:00", "21:00"],
      [4, "19:00", "21:00"],
      [6, "09:00", "11:00"],
    ],
  },
  {
    key: "bagus",
    id: DEMO_USER_IDS[1],
    email: `demo.bagus@${DEMO_EMAIL_DOMAIN}`,
    displayName: `${DEMO_NAME_PREFIX}Bagus`,
    educationLevel: "university",
    bio: "Mentor demo matematika. Fokus pada pemahaman konsep, latihan bertahap, dan strategi menghadapi ujian.",
    topics: [
      ["matematika", "teaching", "advanced"],
      ["fisika", "teaching", "intermediate"],
    ],
    availability: [
      [1, "16:00", "18:00"],
      [3, "16:00", "18:00"],
      [5, "16:00", "18:00"],
    ],
  },
  {
    key: "lia",
    id: DEMO_USER_IDS[2],
    email: `demo.lia@${DEMO_EMAIL_DOMAIN}`,
    displayName: `${DEMO_NAME_PREFIX}Lia`,
    educationLevel: "university",
    bio: "Sedang belajar dasar Python dan matematika. Suka belajar bareng lewat latihan soal dan catatan ringkas.",
    topics: [
      ["pemrograman", "learning", "beginner"],
      ["matematika", "learning", "beginner"],
      ["desain-ui-ux", "learning", "beginner"],
    ],
    availability: [
      [2, "16:00", "18:00"],
      [4, "16:00", "18:00"],
      [6, "13:00", "16:00"],
    ],
  },
  {
    key: "dimas",
    id: DEMO_USER_IDS[3],
    email: `demo.dimas@${DEMO_EMAIL_DOMAIN}`,
    displayName: `${DEMO_NAME_PREFIX}Dimas`,
    educationLevel: "university",
    bio: "Ingin memperkuat aljabar dan fisika untuk ujian. Suka diskusi konsep sampai benar-benar paham.",
    topics: [
      ["matematika", "learning", "intermediate"],
      ["fisika", "learning", "intermediate"],
    ],
    availability: [
      [1, "19:00", "21:00"],
      [3, "19:00", "21:00"],
      [5, "19:00", "21:00"],
    ],
  },
  {
    key: "ayu",
    id: DEMO_USER_IDS[4],
    email: `demo.ayu@${DEMO_EMAIL_DOMAIN}`,
    displayName: `${DEMO_NAME_PREFIX}Ayu`,
    educationLevel: "school",
    bio: "Berlatih speaking bahasa Inggris dan public speaking. Percaya bahwa konsistensi lebih penting daripada kesempurnaan.",
    topics: [
      ["bahasa-inggris", "learning", "intermediate"],
      ["public-speaking", "learning", "intermediate"],
    ],
    availability: [
      [0, "09:00", "11:00"],
      [3, "16:00", "18:00"],
      [6, "09:00", "11:00"],
    ],
  },
  {
    key: "nadia",
    id: DEMO_USER_IDS[5],
    email: `demo.nadia@${DEMO_EMAIL_DOMAIN}`,
    displayName: `${DEMO_NAME_PREFIX}Nadia`,
    educationLevel: "university",
    bio: "Belajar pengembangan web dan sedang membangun portofolio. Suka belajar kelompok yang punya agenda jelas.",
    topics: [
      ["pengembangan-web", "learning", "intermediate"],
      ["pemrograman", "learning", "intermediate"],
      ["desain-ui-ux", "learning", "beginner"],
    ],
    availability: [
      [2, "19:00", "21:00"],
      [4, "19:00", "21:00"],
      [6, "10:00", "12:00"],
    ],
  },
  {
    key: "reza",
    id: DEMO_USER_IDS[6],
    email: `demo.reza@${DEMO_EMAIL_DOMAIN}`,
    displayName: `${DEMO_NAME_PREFIX}Reza`,
    educationLevel: "school",
    bio: "Fokus persiapan SNBT, terutama TPS dan penalaran matematika. Ajak sharing strategi dan evaluasi bareng.",
    topics: [
      ["matematika", "learning", "advanced"],
      ["statistika", "learning", "intermediate"],
    ],
    availability: [
      [1, "19:00", "21:00"],
      [5, "19:00", "21:00"],
      [0, "15:00", "17:00"],
    ],
  },
];

const GOALS = [
  {
    id: DEMO_GOAL_IDS[0],
    user: "lia",
    topic: "pemrograman",
    title: `${DEMO_NAME_PREFIX}Memahami dasar Python`,
    description:
      "Menyelesaikan dasar Python: variabel, percabangan, perulangan, fungsi, dan satu mini project.",
    supportModes: ["partner", "group"],
    targetDays: 90,
  },
  {
    id: DEMO_GOAL_IDS[1],
    user: "dimas",
    topic: "matematika",
    title: `${DEMO_NAME_PREFIX}Lulus ujian matematika`,
    description:
      "Menguatkan aljabar dan trigonometri lewat latihan soal mingguan dan pembahasan langkah demi langkah.",
    supportModes: ["partner", "mentor"],
    targetDays: 60,
  },
  {
    id: DEMO_GOAL_IDS[2],
    user: "nadia",
    topic: "pengembangan-web",
    title: `${DEMO_NAME_PREFIX}Bangun portofolio web`,
    description:
      "Membuat tiga halaman portfolio sederhana dan satu case study responsive.",
    supportModes: ["group", "mentor"],
    targetDays: 75,
  },
  {
    id: DEMO_GOAL_IDS[3],
    user: "ayu",
    topic: "bahasa-inggris",
    title: `${DEMO_NAME_PREFIX}Percaya diri speaking`,
    description:
      "Berlatih speaking 30 menit setiap pekan dan berani memulai percakapan tanpa takut salah.",
    supportModes: ["partner", "group"],
    targetDays: 45,
  },
  {
    id: DEMO_GOAL_IDS[4],
    user: "reza",
    topic: "matematika",
    title: `${DEMO_NAME_PREFIX}Persiapan SNBT`,
    description:
      "Latihan TPS dan penalaran matematika dengan evaluasi try out berkala.",
    supportModes: ["group", "mentor"],
    targetDays: 120,
  },
];

const GROUPS = [
  {
    id: DEMO_GROUP_IDS[0],
    owner: "nadia",
    goal: "nadia",
    topic: "pemrograman",
    name: `${DEMO_NAME_PREFIX}Belajar Python dari Nol`,
    description:
      "Latihan Python mingguan untuk pemula: variabel, perulangan, fungsi, lalu mini project kalkulator.",
    maxMembers: 8,
    cover: "programming",
    members: [
      ["nadia", "owner", "active", 20],
      ["lia", "member", "active", 12],
      ["rani", "member", "active", 8],
      ["reza", "member", "pending", 1],
      ["dimas", "member", "pending", 0],
    ],
  },
  {
    id: DEMO_GROUP_IDS[1],
    owner: "ayu",
    goal: "ayu",
    topic: "bahasa-inggris",
    name: `${DEMO_NAME_PREFIX}Latihan Speaking Santai`,
    description:
      "Ruang aman untuk latihan percakapan bahasa Inggris 45 menit setiap pekan. Fokus pada keberanian, bukan kesempurnaan.",
    maxMembers: 8,
    cover: "language",
    members: [
      ["ayu", "owner", "active", 18],
      ["lia", "member", "active", 10],
      ["dimas", "member", "active", 7],
      ["reza", "member", "pending", 0],
    ],
  },
  {
    id: DEMO_GROUP_IDS[2],
    owner: "reza",
    goal: "reza",
    topic: "matematika",
    name: `${DEMO_NAME_PREFIX}Persiapan SNBT Bareng`,
    description:
      "Diskusi soal TPS dan penalaran matematika, plus simulasi try out dan evaluasi strategi.",
    maxMembers: 10,
    cover: "mathematics",
    members: [
      ["reza", "owner", "active", 15],
      ["ayu", "member", "active", 6],
      ["lia", "member", "pending", 1],
    ],
  },
];

const MENTORS = [
  {
    key: "rani",
    headline: "Mentor demo Python dan pengembangan web untuk pemula",
    summary:
      "Mendampingi pemula memahami dasar pemrograman secara bertahap dengan latihan praktis dan mini project.",
    years: 4,
    services: [
      {
        key: "rani-python",
        id: DEMO_SERVICE_IDS[0],
        topic: "pemrograman",
        title: `${DEMO_NAME_PREFIX}Konsultasi Python 45 menit`,
        description:
          "Sesi tanya jawab dan latihan terarah untuk topik Python yang sedang kamu pelajari.",
        durationMinutes: 45,
      },
      {
        key: "rani-review",
        id: DEMO_SERVICE_IDS[1],
        topic: "pengembangan-web",
        title: `${DEMO_NAME_PREFIX}Review mini project web`,
        description:
          "Review struktur HTML/CSS/JS dan masukan praktis untuk project portofoliomu.",
        durationMinutes: 60,
      },
    ],
  },
  {
    key: "bagus",
    headline: "Mentor demo matematika dan fisika",
    summary:
      "Membantu menyusun strategi belajar matematika, membahas soal sulit, dan menyiapkan ujian dengan latihan bertahap.",
    years: 3,
    services: [
      {
        key: "bagus-matematika",
        id: DEMO_SERVICE_IDS[2],
        topic: "matematika",
        title: `${DEMO_NAME_PREFIX}Latihan soal matematika 45 menit`,
        description:
          "Pembahasan soal aljabar/trigonometri dan strategi mengerjakan ujian dengan waktu terbatas.",
        durationMinutes: 45,
      },
    ],
  },
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function jakartaDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function jakartaDate(daysFromNow) {
  const today = jakartaDateParts(new Date());
  const shifted = new Date(
    Date.UTC(today.year, today.month - 1, today.day + daysFromNow),
  );
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(
    shifted.getUTCDate(),
  )}`;
}

function jakartaDateTime(daysFromNow, hour, minute = 0) {
  return new Date(
    `${jakartaDate(daysFromNow)}T${pad(hour)}:${pad(minute)}:00+07:00`,
  );
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000);
}

function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadEnv() {
  const fromFiles = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ].reduce((acc, file) => ({ ...acc, ...parseEnvFile(file) }), {});
  return { ...fromFiles, ...process.env };
}

function assertSeedAllowed(env) {
  if (env.DEMO_SEED_ENABLED !== "true") {
    throw new Error(
      "Seed demo diblokir. Set DEMO_SEED_ENABLED=true di .env.local (hanya untuk environment demo).",
    );
  }
  if (env.DEMO_SEED_CONFIRM !== "seed-edupulse-demo") {
    throw new Error(
      "Seed demo diblokir. Set DEMO_SEED_CONFIRM=seed-edupulse-demo untuk konfirmasi.",
    );
  }
  if (env.VERCEL_ENV === "production" || env.NODE_ENV === "production") {
    throw new Error(
      "Seed demo tidak boleh dijalankan di production (NODE_ENV/VERCEL_ENV=production).",
    );
  }
  if (env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    throw new Error(
      "Seed demo membutuhkan NEXT_PUBLIC_DEMO_MODE=true agar UI menampilkan penanda demo.",
    );
  }
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL tidak ditemukan di .env.local / environment.");
  }
}

function databaseConfig(connectionString) {
  // DATABASE_URL may contain an unescaped "#" or "%" in the password. Parsing
  // it with `new URL()` truncates at "#", so split the credentials manually.
  const withoutScheme = connectionString.replace(/^postgres(?:ql)?:\/\//, "");
  const at = withoutScheme.lastIndexOf("@");
  if (at === -1) throw new Error("DATABASE_URL tidak valid.");
  const credentials = withoutScheme.slice(0, at);
  const rest = withoutScheme.slice(at + 1);
  const separator = credentials.indexOf(":");
  if (separator === -1) throw new Error("DATABASE_URL tidak memiliki password.");

  const user = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);
  const slash = rest.indexOf("/");
  const hostPort = slash === -1 ? rest : rest.slice(0, slash);
  const database =
    slash === -1 ? "postgres" : rest.slice(slash + 1).split("?")[0];
  const colon = hostPort.lastIndexOf(":");
  const host = colon === -1 ? hostPort : hostPort.slice(0, colon);
  const port = colon === -1 ? 5432 : Number(hostPort.slice(colon + 1));

  return { host, port, user, password, database };
}

async function connect(env) {
  const client = new Client({
    ...databaseConfig(env.DATABASE_URL),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15_000,
  });
  await client.connect();
  return client;
}

async function deleteDemoRows(client) {
  const users = await client.query(
    `select id from auth.users
     where lower(email) like $1 or id = any($2::uuid[])`,
    [`%@${DEMO_EMAIL_DOMAIN}`, DEMO_USER_IDS],
  );
  const userIds = users.rows.map((row) => row.id);

  const goals = await client.query(
    `select id from public.learning_goals
     where user_id = any($1::uuid[]) or id = any($2::uuid[])
        or title like $3`,
    [userIds, DEMO_GOAL_IDS, `${DEMO_NAME_PREFIX}%`],
  );
  const goalIds = goals.rows.map((row) => row.id);

  const groups = await client.query(
    `select id from public.study_groups
     where owner_id = any($1::uuid[]) or id = any($2::uuid[])
        or name like $3`,
    [userIds, DEMO_GROUP_IDS, `${DEMO_NAME_PREFIX}%`],
  );
  const groupIds = groups.rows.map((row) => row.id);

  const sessions = await client.query(
    `select id from public.study_sessions
     where created_by = any($1::uuid[]) or id = any($2::uuid[])
        or group_id = any($3::uuid[]) or title like $4`,
    [userIds, DEMO_SESSION_IDS, groupIds, `${DEMO_NAME_PREFIX}%`],
  );
  const sessionIds = sessions.rows.map((row) => row.id);

  const bookings = await client.query(
    `select id from public.mentor_bookings
     where learner_id = any($1::uuid[]) or mentor_id = any($1::uuid[])
        or id = any($2::uuid[])`,
    [userIds, DEMO_BOOKING_IDS],
  );
  const bookingIds = bookings.rows.map((row) => row.id);

  await client.query(
    `delete from public.mentor_feedback
     where booking_id = any($1::uuid[]) or learner_id = any($2::uuid[])
        or mentor_id = any($2::uuid[])`,
    [bookingIds, userIds],
  );
  await client.query(
    `delete from public.mentoring_session_summaries
     where booking_id = any($1::uuid[]) or author_id = any($2::uuid[])`,
    [bookingIds, userIds],
  );
  await client.query(
    `delete from public.booking_payments where booking_id = any($1::uuid[])`,
    [bookingIds],
  );
  await client.query(
    `delete from public.user_reports
     where reporter_id = any($1::uuid[]) or reported_user_id = any($1::uuid[])
        or reviewed_by = any($1::uuid[]) or study_group_id = any($2::uuid[])
        or study_session_id = any($3::uuid[]) or mentor_booking_id = any($4::uuid[])`,
    [userIds, groupIds, sessionIds, bookingIds],
  );
  await client.query(
    `delete from public.user_blocks
     where blocker_id = any($1::uuid[]) or blocked_user_id = any($1::uuid[])`,
    [userIds],
  );
  await client.query(
    `delete from public.learning_goal_updates
     where author_id = any($1::uuid[]) or learning_goal_id = any($2::uuid[])
        or source_study_session_id = any($3::uuid[])
        or source_mentor_booking_id = any($4::uuid[])
        or id = any($5::uuid[])`,
    [userIds, goalIds, sessionIds, bookingIds, DEMO_UPDATE_IDS],
  );
  await client.query(
    `delete from public.study_session_notes
     where author_id = any($1::uuid[]) or session_id = any($2::uuid[])
        or id = any($3::uuid[])`,
    [userIds, sessionIds, DEMO_NOTE_IDS],
  );
  await client.query(
    `delete from public.study_session_checklist_items
     where created_by = any($1::uuid[]) or completed_by = any($1::uuid[])
        or session_id = any($2::uuid[]) or id = any($3::uuid[])`,
    [userIds, sessionIds, DEMO_CHECKLIST_IDS],
  );
  await client.query(
    `delete from public.study_session_members
     where user_id = any($1::uuid[]) or session_id = any($2::uuid[])`,
    [userIds, sessionIds],
  );
  await client.query(
    `delete from public.study_sessions
     where id = any($1::uuid[]) or created_by = any($2::uuid[])
        or group_id = any($3::uuid[])`,
    [sessionIds, userIds, groupIds],
  );
  await client.query(
    `delete from public.study_group_members
     where group_id = any($1::uuid[]) or user_id = any($2::uuid[])`,
    [groupIds, userIds],
  );
  await client.query(
    `delete from public.study_groups
     where id = any($1::uuid[]) or owner_id = any($2::uuid[])
        or name like $3`,
    [groupIds, userIds, `${DEMO_NAME_PREFIX}%`],
  );
  await client.query(
    `delete from public.study_partner_requests
     where requester_id = any($1::uuid[]) or recipient_id = any($1::uuid[])
        or learning_goal_id = any($2::uuid[]) or id = any($3::uuid[])`,
    [userIds, goalIds, DEMO_REQUEST_IDS],
  );
  await client.query(
    `delete from public.learning_goals
     where id = any($1::uuid[]) or user_id = any($2::uuid[])
        or title like $3`,
    [goalIds, userIds, `${DEMO_NAME_PREFIX}%`],
  );
  await client.query(
    `delete from public.mentor_bookings
     where id = any($1::uuid[]) or learner_id = any($2::uuid[])
        or mentor_id = any($2::uuid[])`,
    [bookingIds, userIds],
  );
  await client.query(
    `delete from public.mentor_availability_slots
     where mentor_id = any($1::uuid[]) or id = any($2::uuid[])`,
    [userIds, DEMO_SLOT_IDS],
  );
  await client.query(
    `delete from public.mentor_services
     where mentor_id = any($1::uuid[]) or id = any($2::uuid[])`,
    [userIds, DEMO_SERVICE_IDS],
  );
  await client.query(
    `delete from public.mentor_profiles
     where user_id = any($1::uuid[]) or user_id = any($2::uuid[])`,
    [userIds, DEMO_MENTOR_IDS],
  );
  await client.query(
    `delete from public.user_availability where user_id = any($1::uuid[])`,
    [userIds],
  );
  await client.query(
    `delete from public.profile_topics where profile_id = any($1::uuid[])`,
    [userIds],
  );
  await client.query(
    `delete from public.user_safety_settings where user_id = any($1::uuid[])`,
    [userIds],
  );
  await client.query(`delete from public.profiles where id = any($1::uuid[])`, [
    userIds,
  ]);
  await client.query(
    `delete from auth.identities where user_id = any($1::uuid[]) or provider_id = any($1::text[])`,
    [userIds],
  );
  await client.query(`delete from auth.users where id = any($1::uuid[])`, [
    userIds,
  ]);

  return {
    users: userIds.length,
    goals: goalIds.length,
    groups: groupIds.length,
    sessions: sessionIds.length,
    bookings: bookingIds.length,
  };
}

async function ensureAccounts(client) {
  const ids = new Map();
  for (const account of ACCOUNTS) {
    const found = await client.query(
      `select id from auth.users where lower(email) = lower($1) limit 1`,
      [account.email],
    );
    const id = found.rows[0]?.id ?? account.id;
    ids.set(account.key, id);

    const appMeta = { provider: "email", providers: ["email"] };
    const userMeta = {
      display_name: account.displayName,
      email_verified: true,
      timezone: "Asia/Jakarta",
    };

    if (found.rows.length === 0) {
      await client.query(
        `insert into auth.users (
           instance_id, id, aud, role, email, encrypted_password,
           email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
           created_at, updated_at, confirmation_token, recovery_token,
           email_change_token_new, email_change, email_change_token_current,
           phone_change, phone_change_token, reauthentication_token
         ) values (
           '00000000-0000-0000-0000-000000000000', $1, 'authenticated',
           'authenticated', $2, crypt($3, gen_salt('bf')), now(), $4, $5,
           now(), now(), '', '', '', '', '', '', '', ''
         )`,
        [id, account.email, DEMO_PASSWORD, appMeta, userMeta],
      );
    } else {
      await client.query(
        `update auth.users
         set encrypted_password = crypt($2, gen_salt('bf')),
             email_confirmed_at = coalesce(email_confirmed_at, now()),
             raw_app_meta_data = $3, raw_user_meta_data = $4, updated_at = now()
         where id = $1`,
        [id, DEMO_PASSWORD, appMeta, userMeta],
      );
    }

    await client.query(
      `insert into auth.identities (
         provider_id, user_id, identity_data, provider, last_sign_in_at,
         created_at, updated_at, id
       ) values ($1, $2, $3, 'email', now(), now(), now(), gen_random_uuid())
       on conflict (provider_id, provider) do update
         set identity_data = excluded.identity_data,
             updated_at = now()`,
      [
        id,
        id,
        {
          sub: id,
          email: account.email,
          email_verified: true,
          phone_verified: false,
        },
      ],
    );
  }
  return ids;
}

async function topicMap(client) {
  const result = await client.query(`select id, slug from public.topics`);
  const map = new Map(result.rows.map((row) => [row.slug, row.id]));
  for (const goal of GOALS) {
    if (!map.has(goal.topic)) {
      throw new Error(`Topik "${goal.topic}" tidak ditemukan. Jalankan seed topik dulu.`);
    }
  }
  for (const group of GROUPS) {
    if (!map.has(group.topic)) {
      throw new Error(`Topik "${group.topic}" tidak ditemukan.`);
    }
  }
  for (const mentor of MENTORS) {
    for (const service of mentor.services) {
      if (!map.has(service.topic)) {
        throw new Error(`Topik "${service.topic}" tidak ditemukan.`);
      }
    }
  }
  return map;
}

async function seedProfiles(client, userIds) {
  for (const account of ACCOUNTS) {
    const id = userIds.get(account.key);
    await client.query(
      `insert into public.profiles (
         id, display_name, bio, education_level, timezone,
         onboarding_completed, created_at, updated_at
       ) values ($1, $2, $3, $4, 'Asia/Jakarta', true, now(), now())
       on conflict (id) do update
         set display_name = excluded.display_name,
             bio = excluded.bio,
             education_level = excluded.education_level,
             timezone = excluded.timezone,
             onboarding_completed = true,
             updated_at = now()`,
      [id, account.displayName, account.bio, account.educationLevel],
    );

    await client.query(
      `insert into public.user_safety_settings (user_id, age_band, profile_visibility, updated_at)
       values ($1, '18_or_over', 'discoverable', now())
       on conflict (user_id) do update
         set age_band = '18_or_over',
             profile_visibility = 'discoverable',
             updated_at = now()`,
      [id],
    );
  }
}

async function seedInterests(client, userIds, topics) {
  for (const account of ACCOUNTS) {
    for (const [slug, interestType, skillLevel] of account.topics) {
      await client.query(
        `insert into public.profile_topics (profile_id, topic_id, interest_type, skill_level)
         values ($1, $2, $3, $4)`,
        [userIds.get(account.key), topics.get(slug), interestType, skillLevel],
      );
    }
    for (const [day, start, end] of account.availability) {
      await client.query(
        `insert into public.user_availability (user_id, day_of_week, start_time, end_time, is_active)
         values ($1, $2, $3, $4, true)`,
        [userIds.get(account.key), day, start, end],
      );
    }
  }
}

async function seedGoals(client, userIds, topics) {
  for (const goal of GOALS) {
    await client.query(
      `insert into public.learning_goals (
         id, user_id, topic_id, title, description, target_date,
         support_modes, visibility, status
       ) values ($1, $2, $3, $4, $5, $6, $7, 'matchable', 'active')`,
      [
        goal.id,
        userIds.get(goal.user),
        topics.get(goal.topic),
        goal.title,
        goal.description,
        jakartaDate(goal.targetDays),
        goal.supportModes,
      ],
    );
  }
}

async function seedMentors(client, userIds, topics) {
  for (const mentor of MENTORS) {
    const id = userIds.get(mentor.key);
    await client.query(
      `insert into public.mentor_profiles (
         user_id, headline, expertise_summary, experience_years,
         verification_status, verification_submitted_at, verification_reviewed_at,
         is_accepting_bookings
       ) values ($1, $2, $3, $4, 'verified', now() - interval '30 days',
                 now() - interval '20 days', true)`,
      [id, mentor.headline, mentor.summary, mentor.years],
    );

    for (const service of mentor.services) {
      await client.query(
        `insert into public.mentor_services (
           id, mentor_id, topic_id, title, description, duration_minutes,
           delivery_mode, price_type, price_amount, currency,
           cancellation_policy, is_active
         ) values ($1, $2, $3, $4, $5, $6, 'online_external',
                   'free', 0, 'IDR', $7, true)`,
        [
          service.id,
          id,
          topics.get(service.topic),
          service.title,
          service.description,
          service.durationMinutes,
          "Bisa dibatalkan maksimal 12 jam sebelum sesi (data demo).",
        ],
      );
    }
  }

  const slots = [
    [DEMO_SLOT_IDS[0], "rani", 2, 19, 0, 45, "reserved"],
    [DEMO_SLOT_IDS[1], "rani", 4, 19, 0, 45, "available"],
    [DEMO_SLOT_IDS[2], "rani", 6, 10, 0, 45, "available"],
    [DEMO_SLOT_IDS[3], "rani", -6, 19, 0, 45, "reserved"],
    [DEMO_SLOT_IDS[4], "bagus", 3, 16, 0, 45, "reserved"],
    [DEMO_SLOT_IDS[5], "bagus", 5, 16, 0, 45, "available"],
    [DEMO_SLOT_IDS[6], "bagus", 7, 16, 0, 45, "available"],
  ];

  for (const [slotId, mentorKey, days, hour, minute, duration, status] of slots) {
    const startsAt = jakartaDateTime(days, hour, minute);
    await client.query(
      `insert into public.mentor_availability_slots (
         id, mentor_id, starts_at, ends_at, status
       ) values ($1, $2, $3, $4, $5)`,
      [
        slotId,
        userIds.get(mentorKey),
        startsAt,
        addMinutes(startsAt, duration),
        status,
      ],
    );
  }
}

async function seedGroups(client, userIds, topics) {
  for (const group of GROUPS) {
    const goal = GOALS.find((item) => item.user === group.goal);
    await client.query(
      `insert into public.study_groups (
         id, owner_id, learning_goal_id, topic_id, name, description,
         max_members, visibility, status, cover_image_key
       ) values ($1, $2, $3, $4, $5, $6, $7, 'public', 'active', $8)`,
      [
        group.id,
        userIds.get(group.owner),
        goal?.id ?? null,
        topics.get(group.topic),
        group.name,
        group.description,
        group.maxMembers,
        group.cover,
      ],
    );

    for (const [memberKey, role, status, daysAgo] of group.members) {
      const requestedAt = new Date(Date.now() - daysAgo * 86_400_000);
      const isActive = status === "active";
      await client.query(
        `insert into public.study_group_members (
           group_id, user_id, role, status, requested_at, responded_at, joined_at
         ) values ($1, $2, $3, $4, $5, $6, $7)`,
        [
          group.id,
          userIds.get(memberKey),
          role,
          status,
          requestedAt,
          status === "pending" ? null : requestedAt,
          isActive ? requestedAt : null,
        ],
      );
    }
  }
}

async function seedSessions(client, userIds) {
  const sessions = [
    {
      id: DEMO_SESSION_IDS[0],
      createdBy: "nadia",
      groupId: DEMO_GROUP_IDS[0],
      goal: "nadia",
      title: `${DEMO_NAME_PREFIX}Latihan fungsi Python`,
      objectives:
        "Memahami parameter, return value, dan menyusun fungsi kecil untuk mini project kalkulator.",
      days: 3,
      hour: 19,
      minute: 30,
      duration: 90,
      meetingUrl: "https://meet.google.com/demo-python",
      members: [
        ["nadia", "organizer", "confirmed"],
        ["lia", "participant", "confirmed"],
        ["rani", "participant", "confirmed"],
      ],
      checklist: [
        ["Siapkan catatan variabel dan perulangan", true],
        ["Tulis 3 fungsi latihan", false],
        ["Siapkan satu pertanyaan", false],
      ],
      note: "Agenda demo: review fungsi, latihan berpasangan, lalu rencana mini project.",
    },
    {
      id: DEMO_SESSION_IDS[1],
      createdBy: "ayu",
      groupId: DEMO_GROUP_IDS[1],
      goal: "ayu",
      title: `${DEMO_NAME_PREFIX}Speaking: cerita pengalaman`,
      objectives:
        "Berlatih bercerita pengalaman harian dalam bahasa Inggris selama 2 menit per orang.",
      days: 4,
      hour: 19,
      minute: 0,
      duration: 60,
      meetingUrl: "https://meet.google.com/demo-speaking",
      members: [
        ["ayu", "organizer", "confirmed"],
        ["dimas", "participant", "confirmed"],
        ["lia", "participant", "invited"],
      ],
      checklist: [
        ["Pilih satu pengalaman menarik", true],
        ["Latih pembukaan 30 detik", false],
        ["Siapkan satu pertanyaan untuk teman", false],
      ],
      note: "Sesi santai: tidak ada penilaian grammar, fokus pada keberanian berbicara.",
    },
    {
      id: DEMO_SESSION_IDS[2],
      createdBy: "lia",
      groupId: null,
      goal: "lia",
      title: `${DEMO_NAME_PREFIX}Latihan soal Python bareng`,
      objectives:
        "Membahas 5 soal perulangan dan fungsi, lalu menyusun rencana latihan minggu depan.",
      days: 1,
      hour: 20,
      minute: 0,
      duration: 60,
      meetingUrl: "https://meet.google.com/demo-partner",
      members: [
        ["lia", "organizer", "confirmed"],
        ["nadia", "participant", "confirmed"],
        ["dimas", "participant", "invited"],
      ],
      checklist: [
        ["Kerjakan 5 soal latihan", false],
        ["Catat soal yang paling sulit", false],
        ["Siapkan solusi sementara", false],
      ],
      note: "Ini sesi partner demo (tanpa kelompok) agar dashboard menampilkan jenis sesi partner.",
    },
  ];

  let checklistIndex = 0;
  let noteIndex = 0;

  for (const session of sessions) {
    const startsAt = jakartaDateTime(session.days, session.hour, session.minute);
    const goal = GOALS.find((item) => item.user === session.goal);

    await client.query(
      `insert into public.study_sessions (
         id, created_by, group_id, learning_goal_id, title, objectives,
         starts_at, ends_at, external_meeting_url, status
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'planned')`,
      [
        session.id,
        userIds.get(session.createdBy),
        session.groupId,
        goal?.id ?? null,
        session.title,
        session.objectives,
        startsAt,
        addMinutes(startsAt, session.duration),
        session.meetingUrl,
      ],
    );

    for (const [memberKey, role, status] of session.members) {
      await client.query(
        `insert into public.study_session_members (
           session_id, user_id, role, status, responded_at
         ) values ($1, $2, $3, $4, $5)`,
        [
          session.id,
          userIds.get(memberKey),
          role,
          status,
          status === "invited" ? null : new Date(),
        ],
      );
    }

    for (const [title, done] of session.checklist) {
      await client.query(
        `insert into public.study_session_checklist_items (
           id, session_id, created_by, title, position, is_completed,
           completed_by, completed_at
         ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          DEMO_CHECKLIST_IDS[checklistIndex],
          session.id,
          userIds.get(session.createdBy),
          title,
          checklistIndex % 3,
          done,
          done ? userIds.get(session.createdBy) : null,
          done ? new Date() : null,
        ],
      );
      checklistIndex += 1;
    }

    await client.query(
      `insert into public.study_session_notes (
         id, session_id, author_id, content, is_shared
       ) values ($1, $2, $3, $4, true)`,
      [
        DEMO_NOTE_IDS[noteIndex],
        session.id,
        userIds.get(session.createdBy),
        session.note,
      ],
    );
    noteIndex += 1;
  }
}

async function seedPartnerRequests(client, userIds) {
  const requests = [
    {
      id: DEMO_REQUEST_IDS[0],
      requester: "reza",
      recipient: "lia",
      goal: "reza",
      status: "pending",
      message:
        "Halo Lia! Aku lihat kamu juga belajar matematika. Mau coba belajar bareng minggu ini?",
      respondedDaysAgo: null,
    },
    {
      id: DEMO_REQUEST_IDS[1],
      requester: "lia",
      recipient: "dimas",
      goal: "lia",
      status: "accepted",
      message:
        "Halo Dimas, ayo latihan matematika bareng. Aku butuh teman buat jaga konsistensi.",
      respondedDaysAgo: 1,
    },
    {
      id: DEMO_REQUEST_IDS[2],
      requester: "ayu",
      recipient: "reza",
      goal: "ayu",
      status: "pending",
      message:
        "Reza, mau sharing strategi TPS dan speaking bareng? Aku juga sedang latihan public speaking.",
      respondedDaysAgo: null,
    },
  ];

  for (const request of requests) {
    const goal = GOALS.find((item) => item.user === request.goal);
    await client.query(
      `insert into public.study_partner_requests (
         id, requester_id, recipient_id, learning_goal_id, message, status,
         responded_at, created_at, updated_at
       ) values ($1, $2, $3, $4, $5, $6, $7,
                 now() - interval '2 days', now())`,
      [
        request.id,
        userIds.get(request.requester),
        userIds.get(request.recipient),
        goal?.id ?? null,
        request.message,
        request.status,
        request.respondedDaysAgo == null
          ? null
          : new Date(Date.now() - request.respondedDaysAgo * 86_400_000),
      ],
    );
  }
}

async function seedBookings(client, userIds) {
  const raniService = MENTORS[0].services[0];
  const bagusService = MENTORS[1].services[0];

  const bookings = [
    {
      id: DEMO_BOOKING_IDS[0],
      learner: "lia",
      mentor: "rani",
      service: raniService,
      slotId: DEMO_SLOT_IDS[0],
      goal: "lia",
      status: "pending",
      objective:
        "Aku ingin memahami fungsi Python dan minta masukan untuk latihan mini project.",
      daysAgo: 1,
    },
    {
      id: DEMO_BOOKING_IDS[1],
      learner: "dimas",
      mentor: "bagus",
      service: bagusService,
      slotId: DEMO_SLOT_IDS[4],
      goal: "dimas",
      status: "confirmed",
      objective:
        "Mau bahas strategi mengerjakan soal aljabar dengan waktu terbatas.",
      daysAgo: 2,
    },
    {
      id: DEMO_BOOKING_IDS[2],
      learner: "nadia",
      mentor: "rani",
      service: raniService,
      slotId: DEMO_SLOT_IDS[3],
      goal: "nadia",
      status: "completed",
      objective:
        "Review struktur project web pertama dan rencana langkah berikutnya.",
      daysAgo: 7,
    },
  ];

  for (const booking of bookings) {
    const slot = await client.query(
      `select starts_at, ends_at from public.mentor_availability_slots where id = $1`,
      [booking.slotId],
    );
    const slotRow = slot.rows[0];
    const goal = GOALS.find((item) => item.user === booking.goal);
    await client.query(
      `insert into public.mentor_bookings (
         id, learner_id, mentor_id, service_id, availability_slot_id,
         learning_goal_id, service_title_snapshot, starts_at, ends_at,
         price_type_snapshot, price_amount_snapshot, currency_snapshot,
         learner_objective, status, created_at, updated_at
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9,
                 'free', 0, 'IDR', $10, $11, $12, now())`,
      [
        booking.id,
        userIds.get(booking.learner),
        userIds.get(booking.mentor),
        booking.service.id,
        booking.slotId,
        goal?.id ?? null,
        booking.service.title,
        slotRow.starts_at,
        slotRow.ends_at,
        booking.objective,
        booking.status,
        new Date(Date.now() - booking.daysAgo * 86_400_000),
      ],
    );
  }

  await client.query(
    `insert into public.mentoring_session_summaries (
       id, booking_id, author_id, summary, next_steps
     ) values ($1, $2, $3, $4, $5)`,
    [
      DEMO_SUMMARY_ID,
      DEMO_BOOKING_IDS[2],
      userIds.get("rani"),
      "Demo — review struktur project web: HTML semantik sudah rapi, CSS perlu dipecah per komponen.",
      "Buat satu halaman responsive dan kirim sebelum sesi berikutnya.",
    ],
  );

  await client.query(
    `insert into public.mentor_feedback (
       id, booking_id, learner_id, mentor_id, rating, comment
     ) values ($1, $2, $3, $4, 5, $5)`,
    [
      DEMO_FEEDBACK_ID,
      DEMO_BOOKING_IDS[2],
      userIds.get("nadia"),
      userIds.get("rani"),
      "Demo — sesi jelas, sabar, dan next step-nya konkret.",
    ],
  );
}

async function seedGoalUpdates(client, userIds) {
  const updates = [
    {
      id: DEMO_UPDATE_IDS[0],
      goal: "lia",
      author: "lia",
      progress: 35,
      text: "Sudah menyelesaikan latihan variabel dan perulangan.",
      nextStep: "Latihan 5 soal fungsi minggu ini.",
      sourceSession: null,
      sourceBooking: null,
    },
    {
      id: DEMO_UPDATE_IDS[1],
      goal: "dimas",
      author: "dimas",
      progress: 25,
      text: "Sudah membahas strategi aljabar bersama mentor demo.",
      nextStep: "Kerjakan 10 soal trigonometri.",
      sourceSession: null,
      sourceBooking: null,
    },
    {
      id: DEMO_UPDATE_IDS[2],
      goal: "nadia",
      author: "nadia",
      progress: 65,
      text: "Project pertama selesai direview dan sudah diperbaiki.",
      nextStep: "Buat halaman portfolio kedua yang responsive.",
      sourceSession: null,
      sourceBooking: DEMO_BOOKING_IDS[2],
    },
    {
      id: DEMO_UPDATE_IDS[3],
      goal: "ayu",
      author: "ayu",
      progress: 20,
      text: "Sudah berani memulai percakapan 2 menit tanpa teks.",
      nextStep: "Ikut satu sesi speaking kelompok minggu ini.",
      sourceSession: null,
      sourceBooking: null,
    },
  ];

  for (const update of updates) {
    const goal = GOALS.find((item) => item.user === update.goal);
    await client.query(
      `insert into public.learning_goal_updates (
         id, learning_goal_id, author_id, source_study_session_id,
         source_mentor_booking_id, progress_percent, update_text, next_step
       ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        update.id,
        goal.id,
        userIds.get(update.author),
        update.sourceSession,
        update.sourceBooking,
        update.progress,
        update.text,
        update.nextStep,
      ],
    );
  }
}

export async function seedDemo() {
  const env = loadEnv();
  assertSeedAllowed(env);
  const client = await connect(env);
  try {
    await client.query("begin");
    const removed = await deleteDemoRows(client);
    const userIds = await ensureAccounts(client);
    const topics = await topicMap(client);
    await seedProfiles(client, userIds);
    await seedInterests(client, userIds, topics);
    await seedGoals(client, userIds, topics);
    await seedMentors(client, userIds, topics);
    await seedGroups(client, userIds, topics);
    await seedSessions(client, userIds);
    await seedPartnerRequests(client, userIds);
    await seedBookings(client, userIds);
    await seedGoalUpdates(client, userIds);
    await client.query("commit");

    console.log("Seed demo selesai.");
    console.log(
      `Data demo lama dibersihkan: ${removed.users} akun, ${removed.goals} tujuan, ${removed.groups} kelompok, ${removed.sessions} sesi, ${removed.bookings} booking.`,
    );
    console.log("");
    console.log("Akun demo (semua memakai password yang sama):");
    for (const account of ACCOUNTS) {
      console.log(
        `- ${account.displayName.padEnd(16)} ${account.email.padEnd(30)} ${account.key === "rani" || account.key === "bagus" ? "mentor" : "pelajar/partner"}`,
      );
    }
    console.log("");
    console.log(`Password: ${DEMO_PASSWORD}`);
    console.log("");
    console.log(
      "Disarankan login sebagai Demo — Lia untuk melihat dashboard, sesi, dan permintaan belajar.",
    );
    console.log(
      "Login sebagai Demo — Rani atau Demo — Bagus untuk mencoba alur sisi mentor.",
    );
    console.log(
      "Login sebagai Demo — Nadia atau Demo — Ayu untuk mencoba alur owner kelompok.",
    );
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

export async function resetDemo() {
  const env = loadEnv();
  assertSeedAllowed(env);
  const client = await connect(env);
  try {
    await client.query("begin");
    const removed = await deleteDemoRows(client);
    await client.query("commit");
    console.log("Data demo dihapus.");
    console.log(
      `Terhapus: ${removed.users} akun, ${removed.goals} tujuan, ${removed.groups} kelompok, ${removed.sessions} sesi, ${removed.bookings} booking.`,
    );
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}
