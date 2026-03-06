import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthorized(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
}

// 一覧取得
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("jukus")
    .select("*, juku_tags(tag), juku_targets(target)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API jukus get]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// 登録
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jukuData, tags, targets } = await request.json();
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("jukus")
    .insert(jukuData)
    .select()
    .single();

  if (error) {
    console.error("[API jukus insert]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const newId = data.id;

  if (tags.length > 0) {
    const { error: tagErr } = await supabase
      .from("juku_tags")
      .insert(tags.map((tag: string) => ({ juku_id: newId, tag })));
    if (tagErr) console.error("[API juku_tags insert]", tagErr);
  }

  if (targets.length > 0) {
    const { error: targetErr } = await supabase
      .from("juku_targets")
      .insert(targets.map((target: string) => ({ juku_id: newId, target })));
    if (targetErr) console.error("[API juku_targets insert]", targetErr);
  }

  return NextResponse.json({ id: newId });
}

// 更新
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, jukuData, tags, targets } = await request.json();
  const supabase = getAdminClient();

  const { error } = await supabase.from("jukus").update(jukuData).eq("id", id);
  if (error) {
    console.error("[API jukus update]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("juku_tags").delete().eq("juku_id", id);
  if (tags.length > 0) {
    await supabase
      .from("juku_tags")
      .insert(tags.map((tag: string) => ({ juku_id: id, tag })));
  }

  await supabase.from("juku_targets").delete().eq("juku_id", id);
  if (targets.length > 0) {
    await supabase
      .from("juku_targets")
      .insert(targets.map((target: string) => ({ juku_id: id, target })));
  }

  return NextResponse.json({ success: true });
}

// 削除
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  const supabase = getAdminClient();

  await supabase.from("juku_tags").delete().eq("juku_id", id);
  await supabase.from("juku_targets").delete().eq("juku_id", id);

  const { error } = await supabase.from("jukus").delete().eq("id", id);
  if (error) {
    console.error("[API jukus delete]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
