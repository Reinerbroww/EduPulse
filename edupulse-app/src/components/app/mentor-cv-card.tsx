"use client";

import { useActionState, useState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { deleteMentorCv, uploadMentorCv } from "@/lib/mentor/actions";
import { CV_UNAVAILABLE_MESSAGE, formatFileSize } from "@/lib/mentor/cv";
import { initialFormState } from "@/lib/forms/state";
import {
  CV_ALLOWED_MIME_TYPE,
  CV_MAX_BYTES,
} from "@/lib/validation/mentor";
import type { MentorCvDocument } from "@/lib/data/mentor-self";

function formatDate(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function MentorCvCard({
  cv,
  unavailable,
  canDelete,
}: {
  cv: MentorCvDocument | null;
  unavailable: boolean;
  canDelete: boolean;
}) {
  const [uploadState, uploadAction] = useActionState(
    uploadMentorCv,
    initialFormState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteMentorCv,
    initialFormState,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  if (unavailable) {
    return <Alert tone="danger">{CV_UNAVAILABLE_MESSAGE}</Alert>;
  }

  function validateFile(file: File | null) {
    if (!file) {
      setClientError(null);
      return;
    }
    if (
      file.type !== CV_ALLOWED_MIME_TYPE ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setClientError("File CV harus berformat PDF.");
    } else if (file.size > CV_MAX_BYTES) {
      setClientError("File CV maksimal 5 MB.");
    } else if (file.size === 0) {
      setClientError("File CV tidak boleh kosong.");
    } else {
      setClientError(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AuthFormMessage state={uploadState} />
      {deleteState.message ? <AuthFormMessage state={deleteState} /> : null}

      {cv ? (
        <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-ink">
              {cv.file_name}
            </span>
            <Badge tone="success">CV tersimpan</Badge>
          </div>
          <p className="text-xs text-muted">
            {formatFileSize(cv.file_size_bytes)} · PDF · Diunggah{" "}
            {formatDate(cv.uploaded_at)}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/cv/${cv.mentor_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("secondary", "sm", "no-underline")}
            >
              Lihat CV
            </a>
            {canDelete ? (
              <form action={deleteAction}>
                <input
                  type="hidden"
                  name="mentorId"
                  value={cv.mentor_id}
                />
                <SubmitButton
                  size="sm"
                  variant="danger"
                  pendingLabel="Menghapus…"
                >
                  Hapus CV
                </SubmitButton>
              </form>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Belum ada CV. Unggah CV PDF (maksimal 5 MB) untuk bisa mengajukan
          verifikasi.
        </p>
      )}

      <form
        action={uploadAction}
        className="flex flex-col gap-3"
        noValidate
        key={cv?.uploaded_at ?? "empty"}
      >
        <Field
          id="cv"
          label={cv ? "Ganti file CV" : "Unggah CV (PDF)"}
          hint="Format PDF, maksimal 5 MB."
          error={clientError ?? uploadState.fieldErrors?.cv}
        >
          <Input
            id="cv"
            name="cv"
            type="file"
            accept={`${CV_ALLOWED_MIME_TYPE},.pdf`}
            onChange={(event) => validateFile(event.target.files?.[0] ?? null)}
          />
        </Field>
        <div>
          <SubmitButton
            size="sm"
            variant="secondary"
            pendingLabel="Mengunggah…"
          >
            {cv ? "Ganti CV" : "Unggah CV"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
