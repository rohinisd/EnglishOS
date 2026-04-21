import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMuxVideo, isMuxConfigured } from "@/lib/mux";

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return new Response("forbidden", { status: 403 });
  }

  if (!isMuxConfigured()) {
    return Response.json({ error: "Mux not configured" }, { status: 503 });
  }

  const { lessonId } = await req.json();
  const muxVideo = getMuxVideo();
  if (!muxVideo) return Response.json({ error: "Mux unavailable" }, { status: 503 });

  const upload = await muxVideo.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL!,
    new_asset_settings: {
      playback_policy: ["signed"],
      encoding_tier: "smart",
      passthrough: JSON.stringify({ lessonId }),
    },
  });

  await db.video.updateMany({
    where: { lessonId },
    data: { muxUploadId: upload.id, muxStatus: "uploading" },
  });

  return Response.json({ uploadUrl: upload.url, uploadId: upload.id });
}
