export const GROUP_COVER_KEYS = [
  "programming",
  "mathematics",
  "language",
  "science",
  "design",
] as const;

export type GroupCoverKey = (typeof GROUP_COVER_KEYS)[number];

export interface GroupCover {
  /** Stored identifier — a value from the database allow-list, or `null` for the fallback. */
  key: GroupCoverKey | null;
  label: string;
  src: string;
  alt: string;
}

export const GROUP_COVERS: readonly GroupCover[] = [
  {
    key: "programming",
    label: "Pemrograman",
    src: "/images/group-covers/programming.svg",
    alt: "Ilustrasi topik pemrograman",
  },
  {
    key: "mathematics",
    label: "Matematika",
    src: "/images/group-covers/mathematics.svg",
    alt: "Ilustrasi topik matematika",
  },
  {
    key: "language",
    label: "Bahasa",
    src: "/images/group-covers/language.svg",
    alt: "Ilustrasi topik bahasa",
  },
  {
    key: "science",
    label: "Sains",
    src: "/images/group-covers/science.svg",
    alt: "Ilustrasi topik sains",
  },
  {
    key: "design",
    label: "Desain",
    src: "/images/group-covers/design.svg",
    alt: "Ilustrasi topik desain",
  },
];

export const FALLBACK_GROUP_COVER: GroupCover = {
  key: null,
  label: "Sampul bawaan",
  src: "/images/group-covers/default.svg",
  alt: "Ilustrasi kelompok belajar umum",
};

const COVER_BY_KEY = new Map<string, GroupCover>(
  GROUP_COVERS.map((cover) => [cover.key as string, cover]),
);

export function isGroupCoverKey(value: unknown): value is GroupCoverKey {
  return typeof value === "string" && COVER_BY_KEY.has(value);
}

/**
 * Resolves a stored `cover_image_key` to a renderable cover. Unknown or missing
 * values fall back to the shared illustration so old groups (and any value that
 * predates the allow-list) still render consistently.
 */
export function getGroupCover(key: string | null | undefined): GroupCover {
  if (isGroupCoverKey(key)) return COVER_BY_KEY.get(key) as GroupCover;
  return FALLBACK_GROUP_COVER;
}

/**
 * True when a read failed only because `study_groups.cover_image_key` does not
 * exist yet (migration 012 not applied). Callers retry without the column so the
 * app keeps working before the migration ships.
 */
export function isMissingCoverColumn(
  error: { code?: string; message?: string } | null,
): boolean {
  if (!error) return false;
  if (error.code === "42703" || error.code === "PGRST204") return true;
  return /cover_image_key/i.test(error.message ?? "");
}
