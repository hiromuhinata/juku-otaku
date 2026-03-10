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
  juku_url: string | null;
  juku_url: string | null;
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
  juku_url: string;
  tags: string;
  targets: string;
  reel_urls: string;
};

const emptyForm: FormState = {
  name: "", area: "", station: "", address: "", hours: "",
  type: "", merit: "", peach_comment: "", line_url: "",
  juku_url: "",
  tags: "", targets: "", reel_urls: "",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true); // 起動時チェック中
  const [password, setPassword] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [jukus, setJukus] = useState<Juku[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 起動時にlocalStorageからログイン状態を確認
  useEffect(() => {
    const saved = localStorage.getItem("admin_authed");
    if (saved === "true") {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  useEffect(() => { if (authed) fetchJukus(); }, [authed]);

  async function fetchJukus() {
    const res = await fetch("/api/admin/juku");
    if (!res.ok) { alert("一覧取得失敗: " + await res.text()); return; }
    const json = await res.json();
    setJukus(json.data || []);
  }

  async function handleLogin() {
    const res = await fetch("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      localStorage.setItem("admin_authed", "true");
      setAuthed(true);
    } else {
      alert("パスワードが違います");
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_authed");
    setAuthed(false);
    setPassword("");
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

  async function handleSave() {
    if (!form.name || !form.area) { alert("塾名とエリアは必須です"); return; }
    setSaving(true);
    const reelUrls = form.reel_urls.split("\n").map((u) => u.trim()).filter((u) => u.length > 0);
    const body = {
      id: editingId, ...form, images,
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
    setForm(emptyForm); setImages([]); setEditingId(null); setSaving(false);
    fetchJukus();
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    const res = await fetch("/api/admin/juku", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!res.ok) { alert("削除失敗"); return; }
    fetchJukus();
  }

  function handleEdit(juku: Juku) {
    setEditingId(juku.id);
    setForm({
      name: juku.name || "", area: juku.area || "", station: juku.station || "",
      address: juku.address || "", hours: juku.hours || "", type: juku.type || "",
      merit: juku.merit || "", peach_comment: juku.peach_comment || "",
      line_url: juku.line_url || "",
      juku_url: juku.juku_url || "",
      tags: (juku.juku_tags || []).map((t) => t.tag).join(","),
      targets: (juku.juku_targets || []).map((t) => t.target).join(","),
      reel_urls: (juku.reel_urls || []).join("\n"),
    });
    setImages(juku.images || []);
    window.scrollTo(0, 0);
  }

  // 起動チェック中はローディング表示
  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFE4EE 0%, #FFF0F5 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#FF6B9D", fontSize: 32 }}>🍑</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFE4EE 0%, #FFF0F5 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 24, padding: 40, width: 340, boxShadow: "0 8px 32px rgba(255,107,157,0.15)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🍑</div>
            <h1 style={{ color: "#FF6B9D", fontWeight: "bold", fontSize: 22, margin: 0 }}>管理画面</h1>
          </div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            style={{ width: "100%", background: "#FFF0F5", color: "#333", borderRadius: 12, padding: "12px 16px", border: "2px solid #FFD6E7", marginBottom: 16, fontSize: 14, boxSizing: "border-box", outline: "none" }}
          />
          <button onClick={handleLogin}
            style={{ width: "100%", background: "linear-gradient(to right, #FF6B9D, #FF9A3C)", color: "white", fontWeight: "bold", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15 }}>
            ログイン
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%", background: "#FFF0F5", color: "#333", borderRadius: 10,
    padding: "10px 14px", border: "1.5px solid #FFD6E7", fontSize: 14,
    boxSizing: "border-box" as const, outline: "none"
  };
  const labelStyle = { fontSize: 12, color: "#FF6B9D", fontWeight: "bold" as const, display: "block", marginBottom: 5 };
  const sectionStyle = { background: "white", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(255,107,157,0.08)", border: "1px solid #FFE4EE" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFE4EE 0%, #FFF8F5 100%)", padding: "16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingTop: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#FF6B9D", margin: 0 }}>🍑 塾管理画面</h1>
          <button onClick={handleLogout} style={{ fontSize: 12, color: "#aaa", background: "white", border: "1px solid #eee", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>ログアウト</button>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: "0 4px 20px rgba(255,107,157,0.12)", border: "1px solid #FFE4EE" }}>
          <h2 style={{ fontSize: 16, fontWeight: "bold", color: "#FF6B9D", marginBottom: 20, paddingBottom: 12, borderBottom: "2px dashed #FFD6E7" }}>
            {editingId ? "✏️ 編集中" : "＋ 新規登録"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={sectionStyle}>
              <p style={{ fontSize: 11, color: "#FF9A3C", fontWeight: "bold", marginBottom: 12, letterSpacing: 1 }}>📌 基本情報</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div><label style={labelStyle}>塾名*</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：武田塾 渋谷校" style={inputStyle} /></div>
                <div><label style={labelStyle}>エリア*</label><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="例：渋谷" style={inputStyle} /></div>
                <div><label style={labelStyle}>授業形式</label><input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="例：個別指導" style={inputStyle} /></div>
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, color: "#FF9A3C", fontWeight: "bold", marginBottom: 12, letterSpacing: 1 }}>📍 アクセス情報</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div><label style={labelStyle}>最寄り駅</label><input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} placeholder="例：渋谷駅 徒歩3分" style={inputStyle} /></div>
                <div><label style={labelStyle}>住所</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="例：東京都渋谷区道玄坂1-2-3 渋谷ビル4F" style={inputStyle} /></div>
                <div><label style={labelStyle}>営業時間</label><input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="例：月〜土 13:00〜22:00" style={inputStyle} /></div>
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, color: "#FF9A3C", fontWeight: "bold", marginBottom: 12, letterSpacing: 1 }}>🏷️ タグ・対象</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div><label style={labelStyle}>タグ（カンマ区切り）</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="例：逆転合格,管理型,自習室神" style={inputStyle} /></div>
                <div><label style={labelStyle}>こんな人向け（カンマ区切り）</label><input value={form.targets} onChange={(e) => setForm({ ...form, targets: e.target.value })} placeholder="例：家で集中できない,浪人生,難関大志望" style={inputStyle} /></div>
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, color: "#FF9A3C", fontWeight: "bold", marginBottom: 12, letterSpacing: 1 }}>💬 レビュー</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div><label style={labelStyle}>メリット・塾の特徴</label><textarea value={form.merit} onChange={(e) => setForm({ ...form, merit: e.target.value })} placeholder="例：自習室が24時間使えて管理が徹底されている。" rows={3} style={{ ...inputStyle, resize: "none" }} /></div>
                <div><label style={labelStyle}>ぴーちゃんの一言 🍑</label><textarea value={form.peach_comment} onChange={(e) => setForm({ ...form, peach_comment: e.target.value })} placeholder="例：気合いがある子には最高の環境！🔥" rows={3} style={{ ...inputStyle, resize: "none" }} /></div>
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, color: "#FF9A3C", fontWeight: "bold", marginBottom: 12, letterSpacing: 1 }}>🔗 リンク・SNS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div><label style={labelStyle}>塾の公式URL</label><input value={form.juku_url} onChange={(e) => setForm({ ...form, juku_url: e.target.value })} placeholder="例：https://www.takeda.tv/shibuya/" style={inputStyle} /></div>
                <div><label style={labelStyle}>LINE URL</label><input value={form.line_url} onChange={(e) => setForm({ ...form, line_url: e.target.value })} placeholder="例：https://lin.ee/xxxxx" style={inputStyle} /></div>
                <div><label style={labelStyle}>塾の公式URL</label><input value={form.juku_url} onChange={(e) => setForm({ ...form, juku_url: e.target.value })} placeholder="例：https://www.takeda.tv/shibuya/" style={inputStyle} /></div>
                <div>
                  <label style={labelStyle}>📸 Instagramリール（1行に1つ）</label>
                  <textarea value={form.reel_urls} onChange={(e) => setForm({ ...form, reel_urls: e.target.value })} placeholder={"例：\nhttps://www.instagram.com/reel/xxxxx/"} rows={4} style={{ ...inputStyle, resize: "none" }} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, color: "#FF9A3C", fontWeight: "bold", marginBottom: 12, letterSpacing: 1 }}>🖼️ 画像</p>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ background: "linear-gradient(to right, #FFE4EE, #FFF0E4)", color: "#FF6B9D", borderRadius: 10, padding: "10px 16px", border: "1.5px dashed #FFB3CC", cursor: "pointer", fontSize: 14, fontWeight: "bold", width: "100%" }}>
                {uploading ? "アップロード中..." : "📷 クリックして画像を選択（複数可）"}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
              {images.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {images.map((url) => (
                    <div key={url} style={{ position: "relative", width: 80, height: 80, borderRadius: 10, overflow: "hidden", border: "2px solid #FFD6E7" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                        style={{ position: "absolute", top: 2, right: 2, background: "#FF6B9D", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 10 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, background: saving ? "#ddd" : "linear-gradient(to right, #FF6B9D, #FF9A3C)", color: "white", fontWeight: "bold", padding: "14px 0", borderRadius: 14, border: "none", cursor: saving ? "not-allowed" : "pointer", fontSize: 15, boxShadow: saving ? "none" : "0 4px 12px rgba(255,107,157,0.3)" }}>
              {saving ? "保存中..." : editingId ? "✅ 更新する" : "✨ 登録する"}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm(emptyForm); setImages([]); }}
                style={{ padding: "14px 20px", background: "#f5f5f5", color: "#999", fontWeight: "bold", borderRadius: 14, border: "none", cursor: "pointer", fontSize: 14 }}>
                キャンセル
              </button>
            )}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(255,107,157,0.12)", border: "1px solid #FFE4EE" }}>
          <h2 style={{ fontSize: 16, fontWeight: "bold", color: "#FF6B9D", marginBottom: 14 }}>登録済みの塾（{jukus.length}件）</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jukus.length === 0 && <p style={{ color: "#ccc", textAlign: "center", padding: "24px 0" }}>まだ登録されていません</p>}
            {jukus.map((juku) => (
              <div key={juku.id} style={{ background: "#FFF8FB", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12, border: "1px solid #FFE4EE" }}>
                {juku.images && juku.images[0] && (
                  <div style={{ position: "relative", width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, border: "2px solid #FFD6E7" }}>
                    <Image src={juku.images[0]} alt={juku.name} fill unoptimized style={{ objectFit: "cover" }} sizes="56px" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: "bold", color: "#333", marginBottom: 2, fontSize: 14 }}>{juku.name}</p>
                  <p style={{ fontSize: 12, color: "#999" }}>{juku.area} / {juku.station}</p>
                  {(juku.reel_urls || []).length > 0 && <p style={{ fontSize: 11, color: "#FF6B9D", marginTop: 2 }}>📸 リール {(juku.reel_urls || []).length}本</p>}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(juku)} style={{ fontSize: 12, background: "#E8F4FD", color: "#2980b9", padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold" }}>編集</button>
                  <button onClick={() => handleDelete(juku.id)} style={{ fontSize: 12, background: "#FDECEA", color: "#e74c3c", padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold" }}>削除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
