// Human-readable labels for database enum-like values.
//
// The database stores machine values (e.g. `in_review`); the UI must always show
// a text label so status never depends on color alone (STEP 5, principle C).

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export const learningGoalStatusLabels: Record<string, string> = {
  active: "Aktif",
  completed: "Selesai",
  paused: "Dijeda",
  archived: "Diarsipkan",
};

export const learningGoalStatusTones: Record<string, StatusTone> = {
  active: "info",
  completed: "success",
  paused: "warning",
  archived: "neutral",
};

export const supportModeLabels: Record<string, string> = {
  partner: "Partner belajar",
  group: "Kelompok belajar",
  mentor: "Mentor",
  any: "Semua pilihan",
};

export const supportModeOptions = ["partner", "group", "mentor"] as const;

export function formatSupportModes(
  modes: string[] | null | undefined,
): string {
  if (!modes || modes.length === 0) return "Belum dipilih";
  if (modes.includes("any")) return supportModeLabels.any;

  const unique = Array.from(new Set(modes));
  if (unique.length >= supportModeOptions.length) {
    return supportModeLabels.any;
  }

  return unique
    .map((mode) => supportModeLabels[mode] ?? mode)
    .join(", ");
}

export const educationLevelLabels: Record<string, string> = {
  school: "Sekolah",
  university: "Kuliah",
  independent: "Belajar mandiri",
  other: "Lainnya",
};

export const skillLevelLabels: Record<string, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Mahir",
  not_sure: "Belum yakin",
};

export const interestTypeLabels: Record<string, string> = {
  learning: "Ingin belajar",
  teaching: "Bisa mengajar",
  both: "Belajar & mengajar",
};

export const mentorVerificationLabels: Record<string, string> = {
  not_submitted: "Belum diajukan",
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
  suspended: "Ditangguhkan",
};

export const mentorVerificationTones: Record<string, StatusTone> = {
  not_submitted: "neutral",
  pending: "warning",
  verified: "success",
  rejected: "danger",
  suspended: "danger",
};

export const deliveryModeLabels: Record<string, string> = {
  online_external: "Online (tautan eksternal)",
  in_person: "Tatap muka",
};

export const priceTypeLabels: Record<string, string> = {
  free: "Gratis",
  paid: "Berbayar",
};

export const bookingStatusLabels: Record<string, string> = {
  pending: "Menunggu konfirmasi",
  confirmed: "Terkonfirmasi",
  declined: "Ditolak",
  cancelled_by_learner: "Dibatalkan pembelajar",
  cancelled_by_mentor: "Dibatalkan mentor",
  completed: "Selesai",
  no_show: "Tidak hadir",
};

export const bookingStatusTones: Record<string, StatusTone> = {
  pending: "warning",
  confirmed: "info",
  declined: "danger",
  cancelled_by_learner: "neutral",
  cancelled_by_mentor: "neutral",
  completed: "success",
  no_show: "danger",
};

export const paymentStatusLabels: Record<string, string> = {
  awaiting_instructions: "Menunggu instruksi",
  awaiting_payment: "Menunggu pembayaran",
  submitted_for_review: "Menunggu verifikasi",
  verified: "Pembayaran terverifikasi",
  rejected: "Pembayaran ditolak",
  cancelled: "Dibatalkan",
};

export const paymentStatusTones: Record<string, StatusTone> = {
  awaiting_instructions: "neutral",
  awaiting_payment: "warning",
  submitted_for_review: "warning",
  verified: "success",
  rejected: "danger",
  cancelled: "neutral",
};

export const partnerRequestStatusLabels: Record<string, string> = {
  pending: "Menunggu jawaban",
  accepted: "Diterima",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
};

export const partnerRequestStatusTones: Record<string, StatusTone> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  cancelled: "neutral",
};

export const reportReasonLabels: Record<string, string> = {
  harassment: "Pelecehan atau intimidasi",
  misleading_profile: "Profil menyesatkan",
  unsafe_behavior: "Perilaku tidak aman",
  spam: "Spam atau promosi",
  payment_issue: "Masalah pembayaran",
  other: "Lainnya",
};

export const dayOfWeekLabels: Record<string, string> = {
  "0": "Minggu",
  "1": "Senin",
  "2": "Selasa",
  "3": "Rabu",
  "4": "Kamis",
  "5": "Jumat",
  "6": "Sabtu",
};

export const reportStatusLabels: Record<string, string> = {
  open: "Terbuka",
  in_review: "Sedang ditinjau",
  resolved: "Selesai",
  dismissed: "Diabaikan",
};

export const reportStatusTones: Record<string, StatusTone> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  dismissed: "neutral",
};

export const groupStatusLabels: Record<string, string> = {
  active: "Aktif",
  closed: "Ditutup",
  archived: "Diarsipkan",
};

export const groupStatusTones: Record<string, StatusTone> = {
  active: "success",
  closed: "neutral",
  archived: "neutral",
};

export const groupVisibilityLabels: Record<string, string> = {
  public: "Publik",
  invite_only: "Hanya undangan",
};

export const groupMemberRoleLabels: Record<string, string> = {
  owner: "Pemilik",
  moderator: "Moderator",
  member: "Anggota",
};

export const groupMemberStatusLabels: Record<string, string> = {
  pending: "Menunggu",
  active: "Bergabung",
  rejected: "Ditolak",
  left: "Keluar",
};

export const groupMemberStatusTones: Record<string, StatusTone> = {
  pending: "warning",
  active: "success",
  rejected: "danger",
  left: "neutral",
};

export const sessionStatusLabels: Record<string, string> = {
  planned: "Direncanakan",
  in_progress: "Berlangsung",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const sessionStatusTones: Record<string, StatusTone> = {
  planned: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "neutral",
};

export const sessionMemberRoleLabels: Record<string, string> = {
  organizer: "Penyelenggara",
  participant: "Peserta",
};

export const sessionMemberStatusLabels: Record<string, string> = {
  invited: "Diundang",
  confirmed: "Terkonfirmasi",
  declined: "Menolak",
  attended: "Hadir",
  absent: "Tidak hadir",
};

export const sessionMemberStatusTones: Record<string, StatusTone> = {
  invited: "neutral",
  confirmed: "info",
  declined: "danger",
  attended: "success",
  absent: "danger",
};

export function labelFor(
  map: Record<string, string>,
  value: string | null | undefined,
  fallback = "Tidak diketahui",
): string {
  if (!value) return fallback;
  return map[value] ?? value;
}

export function toneFor(
  map: Record<string, StatusTone>,
  value: string | null | undefined,
  fallback: StatusTone = "neutral",
): StatusTone {
  if (!value) return fallback;
  return map[value] ?? fallback;
}
