import { notFound, redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth/guards";
import { getMentorCv } from "@/lib/data/mentor-self";
import { isCurrentUserModerator } from "@/lib/data/moderation";
import { createClient } from "@/lib/supabase/server";

// Private, short-lived access to a mentor's CV.
//
// The object itself lives in the private `mentor-cvs` bucket. Nobody gets a
// permanent/public URL: this handler authorises the caller (the CV's owner or a
// moderator) and then hands back a Supabase signed URL that expires in 60
// seconds. RLS on storage.objects runs again while the signature is minted, so
// a forged mentorId can never produce a usable link.

const CV_LINK_TTL_SECONDS = 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mentorId: string }> },
) {
  const user = await requireUser("/mentor");
  const { mentorId } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mentorId)) {
    notFound();
  }

  if (mentorId !== user.id) {
    const moderator = await isCurrentUserModerator();
    if (!moderator) notFound();
  }

  const { cv, unavailable } = await getMentorCv(mentorId);
  if (unavailable || !cv) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(cv.bucket_id)
    .createSignedUrl(cv.storage_path, CV_LINK_TTL_SECONDS);

  if (error || !data?.signedUrl) notFound();

  redirect(data.signedUrl);
}
