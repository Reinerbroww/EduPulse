import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/guards";
import {
  getMentorWithServices,
  getAvailableSlotsForMentor,
} from "@/lib/data/mentors";
import { getLearningGoals } from "@/lib/data/goals";
import { createBookingAction } from "@/lib/bookings/actions";

interface BookingPageProps {
  params: Promise<{ mentorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = { title: "Ajukan Sesi Mentoring" };

export default async function BookingPage({
  params,
  searchParams,
}: BookingPageProps) {
  const { mentorId } = await params;
  await requireUser(`/discover/mentors/${mentorId}/book`);

  const sp = await searchParams;
  const serviceId = typeof sp.serviceId === "string" ? sp.serviceId : undefined;

  const [mentor, goals, slots] = await Promise.all([
    getMentorWithServices(mentorId),
    getLearningGoals(),
    getAvailableSlotsForMentor(mentorId),
  ]);

  if (!mentor || mentor.mentor.verification_status !== "verified") {
    return notFound();
  }

  const service = serviceId
    ? mentor.services.find((s) => s.id === serviceId)
    : mentor.services[0];

  if (!service || !service.is_active) {
    return (
      <div>
        <PageHeader title="Ajukan Sesi" />
        <EmptyState
          title="Layanan tidak tersedia"
          description="Layanan mentor tidak aktif atau tidak ditemukan."
        />
      </div>
    );
  }

  if (service.price_type === "paid") {
    return (
      <div>
        <PageHeader title="Ajukan Sesi" />
        <EmptyState
          title="Booking berbayar belum diaktifkan"
          description="MVP saat ini hanya mendukung sesi gratis. Booking berbayar akan diaktifkan setelah mekanisme pilot disetujui."
        />
      </div>
    );
  }

  const hasAvailableSlots = slots.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ajukan Sesi"
        description={`Mentor: ${mentor.profile.display_name ?? "-"}`}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Detail Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-[var(--radius-card)] border border-border p-4">
                <h3 className="text-base font-semibold">{service.title}</h3>
                <p className="mt-1 text-sm text-muted">{service.description}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                  <span>Durasi: {service.duration_minutes} menit</span>
                  <span>Harga: Gratis</span>
                </div>
              </div>

              {!hasAvailableSlots && (
                <div className="mb-4 rounded-[var(--radius-card)] border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
                  <p className="font-medium">
                    Belum ada slot jadwal yang tersedia untuk mentor ini.
                  </p>
                  <p className="mt-1 text-warning/90">
                    Mentor belum membuka jadwal mendatang. Coba lagi nanti, atau
                    lihat mentor lain yang sudah memiliki jadwal.
                  </p>
                </div>
              )}

              <form action={createBookingAction} className="flex flex-col gap-4">
                <input type="hidden" name="mentorId" value={mentorId} />
                <input type="hidden" name="serviceId" value={service.id} />

                <Field id="availabilitySlotId" label="Slot tersedia">
                  <select
                    id="availabilitySlotId"
                    name="availabilitySlotId"
                    className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm"
                    required
                    disabled={!hasAvailableSlots}
                  >
                    <option value="">Pilih slot</option>
                    {slots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {new Date(slot.starts_at).toLocaleString("id-ID")} —{" "}
                        {new Date(slot.ends_at).toLocaleString("id-ID")} (
                        {slot.status})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="learnerObjective" label="Tujuan sesi (wajib)">
                  <input
                    id="learnerObjective"
                    name="learnerObjective"
                    type="text"
                    required
                    className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm"
                    placeholder="Contoh: Membahas konsep OOP dasar"
                  />
                </Field>

                <Field
                  id="learningGoalId"
                  label="Terkait tujuan belajar (opsional)"
                >
                  <select
                    id="learningGoalId"
                    name="learningGoalId"
                    className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm"
                  >
                    <option value="">Tidak terkait</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id="notes" label="Catatan (opsional)">
                  <textarea
                    id="notes"
                    name="notes"
                    className="min-h-24 w-full rounded-[var(--radius-control)] border border-border bg-surface px-3 py-2 text-sm"
                    placeholder="Kebutuhan khusus atau link materi"
                  />
                </Field>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={buttonClasses("primary", "md")}
                    disabled={!hasAvailableSlots}
                  >
                    Kirim Pengajuan
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ketentuan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted">
              <span>Booking berbayar: Tidak diaktifkan (MVP)</span>
              <span>Hanya mentor terverifikasi yang dapat menerima booking</span>
              <span>Slot dialokasikan atomik via RPC saat pengajuan</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
