import { createClient } from "@/lib/supabase/server";

export interface BookingListItem {
  id: string;
  mentor_id: string;
  service_title_snapshot: string;
  starts_at: string;
  ends_at: string;
  status: string;
  price_type_snapshot: string;
  currency_snapshot: string;
}

export interface MyBookingItem {
  id: string;
  service_title_snapshot: string;
  starts_at: string;
  ends_at: string;
  status: string;
  price_type_snapshot: string;
  role: "learner" | "mentor";
  counterpart_name: string | null;
}

export async function listMyBookings(
  userId: string,
): Promise<MyBookingItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_bookings")
    .select(
      "id, learner_id, mentor_id, service_title_snapshot, starts_at, ends_at, status, price_type_snapshot",
    )
    .or(`learner_id.eq.${userId},mentor_id.eq.${userId}`)
    .order("starts_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as {
    id: string;
    learner_id: string;
    mentor_id: string;
    service_title_snapshot: string;
    starts_at: string;
    ends_at: string;
    status: string;
    price_type_snapshot: string;
  }[];

  const counterpartIds = Array.from(
    new Set(rows.map((r) => (r.mentor_id === userId ? r.learner_id : r.mentor_id))),
  );
  const nameMap = new Map<string, string | null>();
  if (counterpartIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", counterpartIds);
    for (const p of (profiles ?? []) as {
      id: string;
      display_name: string | null;
    }[]) {
      nameMap.set(p.id, p.display_name);
    }
  }

  return rows.map((r) => {
    const isMentor = r.mentor_id === userId;
    const counterpartId = isMentor ? r.learner_id : r.mentor_id;
    return {
      id: r.id,
      service_title_snapshot: r.service_title_snapshot,
      starts_at: r.starts_at,
      ends_at: r.ends_at,
      status: r.status,
      price_type_snapshot: r.price_type_snapshot,
      role: isMentor ? "mentor" : "learner",
      counterpart_name: nameMap.get(counterpartId) ?? null,
    };
  });
}

export async function getMyUpcomingBookings(
  userId: string,
): Promise<BookingListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_bookings")
    .select(
      "id, mentor_id, service_title_snapshot, starts_at, ends_at, status, price_type_snapshot, currency_snapshot",
    )
    .eq("learner_id", userId)
    .gte("starts_at", new Date().toISOString())
    .in("status", ["pending", "confirmed"])
    .order("starts_at");

  if (error) {
    throw error;
  }
  return (data ?? []) as unknown as BookingListItem[];
}
