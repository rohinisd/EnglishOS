import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageClient } from "@/lib/storage";

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const bucket = formData.get("bucket") as string;
  const assignmentId = formData.get("assignmentId") as string;

  if (!file || !bucket) return new Response("missing file or bucket", { status: 400 });

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${user.id}/${assignmentId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = getStorageClient();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return Response.json({ url: data.publicUrl });
}
