#!/usr/bin/env node
// EduPulse — promote (or demote) a test account to `moderator` / `admin`.
//
// This is a SERVER-SIDE operations script. It must be run from a trusted
// terminal by the project owner; it can never be triggered from the browser and
// it never promotes anybody on its own — an explicit account id (or email) and
// an explicit --role flag are required.
//
// The privileged transition itself is `auth.users.raw_app_meta_data.role`, which
// only the Supabase Admin API (service-role key) can write. The app's own
// helper `public.is_moderator()` reads
// `auth.jwt() -> 'app_metadata' ->> 'role'`, so the promoted user must sign in
// again (or refresh their session) before the new role appears in their JWT.
//
// Usage:
//   node scripts/set-moderator.mjs <user-id|email> --role moderator
//   node scripts/set-moderator.mjs <user-id|email> --role admin
//   node scripts/set-moderator.mjs <user-id|email> --remove
//   node scripts/set-moderator.mjs <user-id|email> --role moderator --dry-run
//
// Required environment (read from the process env, or from .env.local/.env):
//   NEXT_PUBLIC_SUPABASE_URL        (or SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY       (server-only secret — never printed)
//
// The service-role key bypasses RLS. Never expose it to the browser, never
// commit it, and never paste it into a shared transcript.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ALLOWED_ROLES = ["moderator", "admin"];
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ScriptError extends Error {}

function fail(message) {
  throw new ScriptError(message);
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
  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ];
  const fromFiles = candidates.reduce((acc, file) => ({ ...acc, ...parseEnvFile(file) }), {});
  return { ...fromFiles, ...process.env };
}

function parseArgs(argv) {
  const args = { target: null, role: null, remove: false, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--role") {
      args.role = argv[i + 1] ?? null;
      i += 1;
    } else if (arg.startsWith("--role=")) {
      args.role = arg.slice("--role=".length);
    } else if (arg === "--remove") {
      args.remove = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (!arg.startsWith("--") && !args.target) {
      args.target = arg;
    } else {
      fail(`Argumen tidak dikenali: ${arg}`);
    }
  }
  return args;
}

const USAGE = `Penggunaan:
  node scripts/set-moderator.mjs <user-id|email> --role <moderator|admin> [--dry-run]
  node scripts/set-moderator.mjs <user-id|email> --remove [--dry-run]

Contoh:
  node scripts/set-moderator.mjs 0f1e... --role moderator
  node scripts/set-moderator.mjs moderator.uji@example.com --role moderator

Variabel lingkungan yang dibutuhkan:
  NEXT_PUBLIC_SUPABASE_URL       (atau SUPABASE_URL)
  SUPABASE_SERVICE_ROLE_KEY      (rahasia server; tidak pernah dicetak)`;

async function callAdminApi(baseUrl, key, route, init = {}) {
  const response = await fetch(`${baseUrl}/auth/v1/admin/${route}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: response.ok, status: response.status, json, text };
}

async function resolveUserId(baseUrl, key, target) {
  if (UUID_RE.test(target)) return target;

  if (!target.includes("@")) {
    fail(`"${target}" bukan UUID maupun alamat email yang valid.`);
  }

  // The Admin API has no direct email lookup, so page through users.
  for (let page = 1; page <= 20; page += 1) {
    const result = await callAdminApi(
      baseUrl,
      key,
      `users?page=${page}&per_page=100`,
    );
    if (!result.ok) {
      fail(`Gagal membaca daftar pengguna (HTTP ${result.status}).`);
    }
    const users = Array.isArray(result.json?.users) ? result.json.users : [];
    const match = users.find(
      (user) => (user.email ?? "").toLowerCase() === target.toLowerCase(),
    );
    if (match) return match.id;
    if (users.length < 100) break;
  }

  fail(`Tidak menemukan akun dengan email "${target}".`);
}

function summarize(user) {
  return {
    id: user?.id,
    email: user?.email,
    app_metadata: user?.app_metadata ?? {},
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(USAGE);
    return;
  }
  if (!args.target) fail(`Butuh id akun atau email.\n\n${USAGE}`);
  if (!args.remove && !args.role) {
    fail(`Pilih peran dengan --role <moderator|admin>, atau pakai --remove.\n\n${USAGE}`);
  }
  if (args.remove && args.role) {
    fail("Gunakan salah satu saja: --role atau --remove.");
  }
  if (args.role && !ALLOWED_ROLES.includes(args.role)) {
    fail(
      `Peran "${args.role}" tidak diizinkan. Pilihan valid: ${ALLOWED_ROLES.join(", ")}.`,
    );
  }
  if (!UUID_RE.test(args.target) && !args.target.includes("@")) {
    fail(`"${args.target}" bukan UUID maupun alamat email yang valid.`);
  }

  const env = loadEnv();
  const baseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "").trim();
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!baseUrl) {
    fail(
      "NEXT_PUBLIC_SUPABASE_URL (atau SUPABASE_URL) belum diisi. Salin .env.example ke .env.local lalu lengkapi.",
    );
  }
  if (!serviceKey) {
    fail(
      "SUPABASE_SERVICE_ROLE_KEY belum diisi.\n" +
        "Ambil dari Supabase Dashboard → Project Settings → API → service_role,\n" +
        "lalu set sebagai variabel lingkungan untuk perintah ini, mis.:\n" +
        "  PowerShell: $env:SUPABASE_SERVICE_ROLE_KEY='<secret>'; node scripts/set-moderator.mjs <id> --role moderator\n" +
        "Jangan pernah menaruh kunci ini di kode klien atau mencetaknya ke layar.",
    );
  }

  console.log(`→ Proyek: ${new URL(baseUrl).hostname}`);
  const userId = await resolveUserId(baseUrl, serviceKey, args.target);

  const current = await callAdminApi(baseUrl, serviceKey, `users/${userId}`);
  if (!current.ok) {
    if (current.status === 401 || current.status === 403) {
      fail("Kunci service role ditolak (401/403). Periksa SUPABASE_SERVICE_ROLE_KEY.");
    }
    fail(`Gagal membaca akun (HTTP ${current.status}).`);
  }

  const before = summarize(current.json);
  const nextMetadata = { ...(before.app_metadata ?? {}) };

  if (args.remove) {
    delete nextMetadata.role;
  } else {
    nextMetadata.role = args.role; // preserve every other app_metadata key
  }

  console.log("  Akun  :", before.email ?? "(tanpa email)", `(${before.id})`);
  console.log(
    "  app_metadata sebelum:",
    JSON.stringify(before.app_metadata ?? {}),
  );
  console.log("  app_metadata sesudah:", JSON.stringify(nextMetadata));

  if (args.dryRun) {
    console.log("\n✓ --dry-run: tidak ada perubahan yang dikirim. Hapus --dry-run untuk menerapkan.");
    return;
  }

  const updated = await callAdminApi(baseUrl, serviceKey, `users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ app_metadata: nextMetadata }),
  });

  if (!updated.ok) {
    fail(`Gagal memperbarui akun (HTTP ${updated.status}).`);
  }

  const after = summarize(updated.json);
  console.log("  Terkonfirmasi        :", JSON.stringify(after.app_metadata ?? {}));
  console.log(
    "\n✓ Selesai. Akun ini harus login ulang (atau refresh sesi) supaya klaim peran terbaru muncul di JWT.",
  );
  console.log(
    "  Verifikasi: buka /moderator dengan akun tersebut; RLS tetap menolak akun non-moderator.",
  );
}

main().catch((error) => {
  const message = error instanceof ScriptError ? error.message : (error?.message ?? String(error));
  console.error(`\n✖ ${message}\n`);
  process.exitCode = 1;
});
