"use client";

import { useActionState, useState } from "react";

import { AuthFormMessage } from "@/components/auth/auth-form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Avatar } from "@/components/ui/avatar";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/forms/state";
import { removeAvatar, uploadAvatar } from "@/lib/profile/actions";
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_BYTES,
} from "@/lib/profile/avatar";

export function AvatarCard({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string | null;
}) {
  const [uploadState, uploadAction] = useActionState(
    uploadAvatar,
    initialFormState,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  function validateFile(file: File | null) {
    if (!file) {
      setClientError(null);
      return;
    }
    if (
      !(AVATAR_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)
    ) {
      setClientError("Foto harus berformat JPG, PNG, atau WebP.");
    } else if (file.size > AVATAR_MAX_BYTES) {
      setClientError("Foto maksimal 2 MB.");
    } else if (file.size === 0) {
      setClientError("File foto tidak boleh kosong.");
    } else {
      setClientError(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AuthFormMessage state={uploadState} />

      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={name} src={avatarUrl} size="lg" />
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">
            {avatarUrl ? "Foto profil aktif" : "Belum ada foto profil"}
          </span>
          <span className="text-muted">
            Foto membantu murid mengenali kamu. JPG, PNG, atau WebP, maksimal 2
            MB.
          </span>
        </div>
      </div>

      <form
        action={uploadAction}
        className="flex flex-col gap-3"
        noValidate
        key={avatarUrl ?? "empty"}
      >
        <Field
          id="avatar"
          label={avatarUrl ? "Ganti foto profil" : "Unggah foto profil"}
          error={clientError ?? uploadState.fieldErrors?.avatar}
        >
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept={AVATAR_ALLOWED_MIME_TYPES.join(",")}
            onChange={(event) => validateFile(event.target.files?.[0] ?? null)}
          />
        </Field>
        <div>
          <SubmitButton
            size="sm"
            variant="secondary"
            pendingLabel="Mengunggah…"
          >
            {avatarUrl ? "Ganti foto" : "Unggah foto"}
          </SubmitButton>
        </div>
      </form>

      {avatarUrl ? (
        <form action={removeAvatar}>
          <SubmitButton size="sm" variant="danger" pendingLabel="Menghapus…">
            Hapus foto
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
