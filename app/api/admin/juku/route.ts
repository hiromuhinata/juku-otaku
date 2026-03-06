import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("jukus")
    .select("*, juku_tags(tag), juku_targets(target)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const id = fd.get("id") as string | null;

  const reelUrlsRaw = (fd.get("reel_urls") as string) || "";
  const reelUrls = reelUrlsRaw
    .split("\n")
    .map((u) => u.trim())
    .filter((u) => u.length > 0);

  const jukuData = {
    name: fd.get("name") as string,
    area: fd.get("area") as string,
    station: fd.get("station") as string,
    type: fd.get("type") as string,
    price_range: fd.get("price_range") as string,
    merit: fd.get("merit") as string,
    demerit: fd.get("demerit") as string,
    peach_comment: fd.get("peach_comment") as string,
    rating: parseFloat(fd.get("rating") as string) || 0,
    line_url: fd.get("line_url") as string,
    tiktok_views: fd.get("tiktok_views") as string,
    reel_urls: reelUrls,
  };

  // 画像アップロード
  const imageFiles = fd.getAll("images") as File[];
  const imageUrls: string[] = [];
  for (const file of imageFiles) {
    if (file.size === 0) continue;
    const ext = file.name.split(".").pop();
    const path = `juku-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("juku-images")
      .upload(path, buffer, { contentType: file.type });
    if (uploadError) continue;
    const { data: urlData } = supabase.storage.from("juku-images").getPublicUrl(path);
    imageUrls.push(urlData.publicUrl);
  }

  let jukuId = id;
  if (id) {
    const { error } = await supabase.from("jukus").update({ ...jukuData, ...(imageUrls.length > 0 ? { images: imageUrls } : {}) }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { data, error } = await supabase.from("jukus").insert({ ...jukuData, images: imageUrls }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    jukuId = data.id;
  }

  // タグ更新
  const tags = ((fd.get("tags") as string) || "").split(",").map((t) => t.trim()).filter(Boolean);
  if (tags.length > 0 && jukuId) {
    await supabase.from("juku_tags").delete().eq("juku_id", jukuId);
    await supabase.from("juku_tags").insert(tags.map((tag) => ({ juku_id: jukuId, tag })));
  }

  // ターゲット更新
  const targets = ((fd.get("targets") as string) || "").split(",").map((t) => t.trim()).filter(Boolean);
  if (targets.length > 0 && jukuId) {
    await supabase.from("juku_targets").delete().eq("juku_id", jukuId);
    await supabase.from("juku_targets").insert(targets.map((target) => ({ juku_id: jukuId, target })));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabase.from("jukus").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
