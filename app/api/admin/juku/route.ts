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
  const body = await req.json();
  const { id, name, area, station, address, hours, type, merit, peach_comment, line_url, juku_url, images, reel_urls, tags, targets } = body;

  const jukuData = {
    name, area, station, address, hours, type, merit, peach_comment, line_url, juku_url,
    images: images || [],
    reel_urls: reel_urls || [],
  };

  let jukuId = id;
  if (id) {
    const { error } = await supabase.from("jukus").update(jukuData).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { data, error } = await supabase.from("jukus").insert(jukuData).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    jukuId = data.id;
  }

  if (tags && jukuId) {
    await supabase.from("juku_tags").delete().eq("juku_id", jukuId);
    if (tags.length > 0) await supabase.from("juku_tags").insert(tags.map((tag: string) => ({ juku_id: jukuId, tag })));
  }

  if (targets && jukuId) {
    await supabase.from("juku_targets").delete().eq("juku_id", jukuId);
    if (targets.length > 0) await supabase.from("juku_targets").insert(targets.map((target: string) => ({ juku_id: jukuId, target })));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabase.from("jukus").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
