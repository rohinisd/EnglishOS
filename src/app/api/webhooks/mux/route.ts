import crypto from "crypto";
import { db } from "@/lib/db";

function verifyMuxSignature(rawBody: string, sig: string, secret: string): boolean {
  const [, timestamp] = sig.split(",v1=")[0].split("t=");
  const [, signature] = sig.split(",v1=");
  const toSign = `${timestamp}:${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(toSign).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("mux-signature") ?? "";
  const secret = process.env.MUX_WEBHOOK_SECRET ?? "";

  if (secret && secret !== "placeholder_fill_later") {
    try {
      if (!verifyMuxSignature(rawBody, sig, secret)) {
        return new Response("invalid sig", { status: 401 });
      }
    } catch {
      return new Response("sig error", { status: 401 });
    }
  }

  const event = JSON.parse(rawBody);

  if (event.type === "video.asset.ready") {
    const assetId = event.data.id;
    const playbackId = event.data.playback_ids?.[0]?.id;
    const durationSec = Math.round(event.data.duration ?? 0);
    const passthrough = JSON.parse(event.data.passthrough ?? "{}");

    if (passthrough.lessonId) {
      await db.video.upsert({
        where: { muxAssetId: assetId },
        update: { muxPlaybackId: playbackId, durationSeconds: durationSec, muxStatus: "ready" },
        create: {
          lessonId: passthrough.lessonId,
          muxAssetId: assetId,
          muxPlaybackId: playbackId,
          durationSeconds: durationSec,
          muxStatus: "ready",
        },
      });
    }
  }

  if (event.type === "video.asset.errored") {
    const assetId = event.data.id;
    await db.video.updateMany({ where: { muxAssetId: assetId }, data: { muxStatus: "errored" } });
  }

  return Response.json({ ok: true });
}
