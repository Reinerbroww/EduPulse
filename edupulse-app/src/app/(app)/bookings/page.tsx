import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { CalendarIcon } from "@/components/brand/icons";
import { buttonClasses } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth/guards";
import { listMyBookings, type MyBookingItem } from "@/lib/data/bookings-list";
import { bookingStatusLabels, bookingStatusTones } from "@/lib/status";

export const metadata: Metadata = { title: "Booking Mentoring" };

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function BookingRow({ booking }: { booking: MyBookingItem }) {
  const counterpart =
    booking.counterpart_name ??
    (booking.role === "mentor" ? "Pembelajar" : "Mentor");

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border p-4 no-underline transition-colors hover:bg-neutral-soft"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-ink">
          {booking.service_title_snapshot}
        </span>
        <StatusBadge
          value={booking.status}
          labels={bookingStatusLabels}
          tones={bookingStatusTones}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        <span>{booking.role === "mentor" ? "Dari" : "Dengan"} {counterpart}</span>
        <span aria-hidden>·</span>
        <span>{formatDateTime(booking.starts_at)}</span>
      </div>
    </Link>
  );
}

export default async function BookingsPage() {
  const user = await requireUser("/bookings");
  const bookings = await listMyBookings(user.id);

  const asLearner = bookings.filter((b) => b.role === "learner");
  const asMentor = bookings.filter((b) => b.role === "mentor");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Booking Mentoring"
        description="Pantau status sesi mentoring yang kamu ajukan dan yang masuk ke kamu sebagai mentor."
      />

      <Card>
        <CardHeader>
          <CardTitle>Sesi saya sebagai pembelajar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {asLearner.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="size-5" />}
              title="Belum ada sesi"
              description="Jelajahi mentor dan ajukan sesi belajar pertamamu."
              action={
                <Link
                  href="/discover?tab=mentor"
                  className={buttonClasses("primary", "sm", "no-underline")}
                >
                  Cari mentor
                </Link>
              }
            />
          ) : (
            asLearner.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permintaan sebagai mentor</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {asMentor.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="size-5" />}
              title="Belum ada permintaan sesi"
              description="Permintaan dari pembelajar akan muncul di sini untuk kamu konfirmasi. Pastikan profil mentor dan layananmu sudah lengkap."
              action={
                <Link
                  href="/mentor"
                  className={buttonClasses("secondary", "sm", "no-underline")}
                >
                  Buka Ruang Mentor
                </Link>
              }
            />
          ) : (
            asMentor.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
