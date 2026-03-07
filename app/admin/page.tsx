"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Juku = {
  id: string;
  name: string;
  area: string;
  station: string | null;
  address: string | null;
  hours: string | null;
  type: string | null;
  merit: string | null;
  peach_comment: string | null;
  line_url: string | null;
  images: string[] | null;
  reel_urls: string[] | null;
  juku_tags: { tag: string }[];
  juku_targets: { target: string }[];
};

type FormState = {
  name: string;
  area: string;
  station: string;
  address: string;
  hours: string;
  type: string;
  merit: string;
  peach_comment: string;
  line_url: string;
  tags: string;
  targets: string;
  reel_urls: string;
};

const emptyForm: FormState = {
  name: "",
  area: "",
  station: "",
  address: "",
  hours: "",
  type: "",
  merit: "",
  peach_comment: "",
  line_url: "",
  tags: "",
  targets: "",
  reel_urls: "",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [jukus, setJukus] = useState<Juku[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authed) fetchJukus();
  }, [authed]);

  async function fetchJukus() {
    const res = await fetch("/api/admin/juku");
    if (!res.ok) { alert("一覧取得失敗: " + await res.text()); return; }
    const json = await res.json();
    setJukus(json.data || []);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) { alert("画像アップロード失敗"); setUploading(false); return; }
    const json = await res.json();
    setImages((prev) => [...prev, ...(json.urls as string[])]);
    setUploading(false);
  }

  const handleRemoveImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  async function handleSave() {
    if (!form.name || !form.area) { alert("塾名とエリアは必須です"); return; }
    setSaving(true);
    const reelUrls = form.reel_urls.split("\n").map((u) => u.trim()).filter((u) => u.length > 0);
    const body = {
      id: editingId,
      ...form,
      images,
      reel_urls: reelUrls,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      targets: form.targets.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const res = await fetch("/api/admin/juku", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { alert("保存失敗: " + await res.text()); setSaving(false); return; }
    setForm(emptyForm);
    setImages([]);
    setEditingId(null);
    setSaving(false);
    fetchJukus();
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    const res = await fetch("/api/admin/juku", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { alert("削除失敗"); return; }
    fetchJukus();
  }

  function handleEdit(juku: Juku) {
    setEditingId(juku.id);
    setForm({
      name: juku.name || "",
      area: juku.area || "",
      station: juku.station || "",
      address: juku.address || "",
      hours: juku.hours || "",
      type: juku.type || "",
      merit: juku.merit || "",
      peach_comment: juku.peach_comment || "",
      line_url: juku.line_url || "",
      tags: (juku.juku_tags || []).map((t) => t.tag).join(","),
      targets: (juku.juku_targets || []).map((t) => t.target).join(","),
      reel_urls: (juku.reel_urls || []).join("\n"),
    });
    setImages(juku.images || []);
    window.scrollTo(0, 0);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#16213e", borderRadius: 16, padding: 32, width: 320 }}>
          <h1 style={{ color: "white", fontWeight: "bold", fontSize: 20, marginBottom: 24, textAlign: "center" }}>🍑 管理画面</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetch("/api/auth/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
                  .then((r) => r.ok ? setAuthed(true) : alert("パスワードが違います"))
                  .catch(() => alert("エラー"));
              }
            }}
            style={{ width: "100%", background: "#0f3460", color: "white", borderRadius: 8, padding: "12px 16px", border: "none", marginBottom: 16, fontSize: 14, boxSizing: "border-box" }}
          />
          <button
            onClick={() => fetch("/api/auth/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).then((r) => r.ok ? setAuthed(true) : alert("パスワードが違います")).catch(() => alert("エラー"))}
            style={{ width: "100%", background: "linear-gradient(to right, #FF6B9D, #FF9A3C)", color: "white", fontWeight: "bold", padding: "12px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14 }}
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = { width: "100%", background: "#0f3460", color: "white", borderRadius: 8, padding: "10px 14px", border: "none", fontSize: 14, boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 12, color: "#aaa", display: "block", marginBottom: 4 };

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "white", padding: 16 }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 24 }}>🍑 塾管理画面</h1>

        <div style={{ background: "#16213e", borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>{editingId ? "✏️ 編集中" : "＋ 新規登録"}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div>
              <label style={labelStyle}>塾名*</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：武田塾 渋谷校" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>エリア*</label>
              <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="例：渋谷" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>最寄り駅</label>
              <input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} placeholder="例：渋谷駅 徒歩3分" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>住所</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="例：東京都渋谷区道玄坂1-2-3 渋谷ビル4F" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>営業時間</label>
              <input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="例：月〜土 13:00〜22:00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>授業形式</label>
              <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="例：個別指導" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>LINE URL</label>
              <input value={form.line_url} onChange={(e) => setForm({ ...form, line_url: e.target.value })} placeholder="例：https://lin.ee/xxxxx" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>タグ（カンマ区切り）</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="例：逆転合格,管理型,自習室神" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>こんな人向け（カンマ区切り）</label>
              <input value={form.targets} onChange={(e) => setForm({ ...form, targets: e.target.value })} placeholder="例：家で集中できない,浪人生,難関大志望" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>メリット・塾の特徴</label>
              <textarea value={form.merit} onChange={(e) => setForm({ ...form, merit: e.target.value })} placeholder="例：自習室が24時間使えて管理が徹底されている。毎日の勉強計画を一緒に立ててくれる。" rows={3} style={{ ...inputStyle, resize: "none" }} />
            </div>
            <div>
              <label style={labelStyle}>ぴーちゃんの一言</label>
              <textarea value={form.peach_comment} onChange={(e) => setForm({ ...form, peach_comment: e.target.value })} placeholder="例：気合いがある子には最高の環境！自分を追い込みたい人におすすめ🔥" rows={3} style={{ ...inputStyle, resize: "none" }} />
            </div>
            <div>
              <label style={labelStyle}>📸 Instagramリール（1行に1つ）</label>
              <textarea value={form.reel_urls} onChange={(e) => setForm({ ...form, reel_urls: e.target.value })} placeholder={"例：\nhttps://www.instagram.com/reel/xxxxx/\nhttps://www.instagram.com/reel/yyyyy/"} rows={4} style={{ ...inputStyle, resize: "none" }} />
              <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>※ タップするとInstagramに移動します</p>
            </div>
            <div>
              <label style={labelStyle}>画像（複数可）</label>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ background: "#0f3460", color: "white", borderRadius: 8, padding: "10px 16px", border: "none", cursor: "pointer", fontSize: 14 }}>
                {uploading ? "アップロード中..." : "クリックして画像を選択（複数可）"}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
              {images.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {images.map((url) => (
                    <div key={url} style={{ position: "relative", width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: "1px solid #333" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => handleRemoveImage(url)} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 10 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: saving ? "#555" : "linear-gradient(to right, #FF6B9D, #FF9A3C)", color: "white", fontWeight: "bold", padding: "12px 0", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer", fontSize: 14 }}>
              {saving ? "保存中..." : editingId ? "更新する" : "登録する"}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm(emptyForm); setImages([]); }} style={{ padding: "12px 20px", background: "#444", color: "white", fontWeight: "bold", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14 }}>
                キャンセル
              </button>
            )}
          </div>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>登録済みの塾（{jukus.length}件）</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {jukus.length === 0 && <p style={{ color: "#888", textAlign: "center", padding: "32px 0" }}>まだ登録されていません</p>}
          {jukus.map((juku) => (
            <div key={juku.id} style={{ background: "#16213e", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
              {juku.images && juku.images[0] && (
                <div style={{ position: "relative", width: 60, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                  <Image src={juku.images[0]} alt={juku.name} fill unoptimized style={{ objectFit: "cover" }} sizes="60px" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: "bold", marginBottom: 2 }}>{juku.name}</p>
                <p style={{ fontSize: 12, color: "#aaa" }}>{juku.area} / {juku.station}</p>
                {(juku.reel_urls || []).length > 0 && (
                  <p style={{ fontSize: 11, color: "#FF6B9D", marginTop: 2 }}>📸 リール {(juku.reel_urls || []).length}本</p>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleEdit(juku)} style={{ fontSize: 12, background: "#1a5276", color: "white", padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}>編集</button>
                <button onClick={() => handleDelete(juku.id)} style={{ fontSize: 12, background: "#922b21", color: "white", padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
