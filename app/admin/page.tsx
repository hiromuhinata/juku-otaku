"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Juku = {
  id: string;
  name: string;
  area: string;
  station: string | null;
  type: string | null;
  price_range: string | null;
  merit: string | null;
  demerit: string | null;
  peach_comment: string | null;
  rating: number | null;
  line_url: string | null;
  images: string[] | null;
  juku_tags: { tag: string }[];
  juku_targets: { target: string }[];
};

type FormState = {
  name: string;
  area: string;
  station: string;
  type: string;
  price_range: string;
  merit: string;
  demerit: string;
  peach_comment: string;
  rating: string;
  line_url: string;
  tags: string;
  targets: string;
};

const emptyForm: FormState = {
  name: "",
  area: "",
  station: "",
  type: "",
  price_range: "",
  merit: "",
  demerit: "",
  peach_comment: "",
  rating: "",
  line_url: "",
  tags: "",
  targets: "",
};

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState("");

  const [jukus, setJukus] = useState<Juku[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // 画像関連
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiHeaders = (password: string) => ({
    "Content-Type": "application/json",
    "x-admin-password": password,
  });

  const fetchJukus = async (password: string) => {
    const res = await fetch("/api/admin/juku", {
      headers: { "x-admin-password": password },
    });
    const text = await res.text();
    if (!res.ok) {
      alert(`一覧取得失敗: ${text}`);
      return;
    }
    const json = JSON.parse(text);
    setJukus(json.data ?? []);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setAdminPw(saved);
      setAuthed(true);
      fetchJukus(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    setAuthErr("");
    const res = await fetch("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      sessionStorage.setItem("admin_pw", pw);
      setAdminPw(pw);
      setAuthed(true);
      fetchJukus(pw);
    } else {
      setAuthErr("パスワードが違います");
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-password": adminPw },
      body: formData,
    });

    const text = await res.text();
    if (!res.ok) {
      let msg = text;
      try { msg = JSON.parse(text).error ?? text; } catch { /* ignore */ }
      alert(`アップロード失敗: ${msg}`);
      setUploading(false);
      return;
    }

    const json = JSON.parse(text);
    setImages((prev) => [...prev, ...(json.urls as string[])]);
    setUploading(false);

    // ファイル入力をリセット
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert("塾名は必須です"); return; }
    if (!form.area.trim()) { alert("エリアは必須です"); return; }

    setSaving(true);

    const jukuData = {
      name: form.name.trim(),
      area: form.area.trim(),
      station: form.station.trim() || null,
      type: form.type.trim() || "未設定",
      price_range: form.price_range.trim() || null,
      merit: form.merit.trim() || null,
      demerit: form.demerit.trim() || null,
      peach_comment: form.peach_comment.trim() || null,
      rating: parseFloat(form.rating) || null,
      line_url: form.line_url.trim() || null,
      images: images.length > 0 ? images : null,
    };

    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const targets = form.targets.split(",").map((t) => t.trim()).filter(Boolean);

    const method = editingId ? "PATCH" : "POST";
    const body = editingId
      ? { id: editingId, jukuData, tags, targets }
      : { jukuData, tags, targets };

    const res = await fetch("/api/admin/juku", {
      method,
      headers: apiHeaders(adminPw),
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log("save response:", res.status, text);

    if (!res.ok) {
      let msg = text;
      try { msg = JSON.parse(text).error ?? text; } catch { /* ignore */ }
      alert(`保存失敗: ${msg}`);
      setSaving(false);
      return;
    }

    await fetchJukus(adminPw);
    setForm(emptyForm);
    setImages([]);
    setEditingId(null);
    setShowForm(false);
    setSaving(false);
  };

  const handleEdit = (juku: Juku) => {
    setForm({
      name: juku.name ?? "",
      area: juku.area ?? "",
      station: juku.station ?? "",
      type: juku.type ?? "",
      price_range: juku.price_range ?? "",
      merit: juku.merit ?? "",
      demerit: juku.demerit ?? "",
      peach_comment: juku.peach_comment ?? "",
      rating: String(juku.rating ?? ""),
      line_url: juku.line_url ?? "",
      tags: juku.juku_tags.map((t) => t.tag).join(","),
      targets: juku.juku_targets.map((t) => t.target).join(","),
    });
    setImages(juku.images ?? []);
    setEditingId(juku.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm("削除しますか？")) return;
    const res = await fetch("/api/admin/juku", {
      method: "DELETE",
      headers: apiHeaders(adminPw),
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const text = await res.text();
      alert(`削除失敗: ${text}`);
      return;
    }
    await fetchJukus(adminPw);
  };

  // ── パスワード画面 ──────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ maxWidth: 360, margin: "80px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 24 }}>管理画面ログイン</h1>
        <input
          type="password"
          placeholder="パスワード"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14, marginBottom: 8, boxSizing: "border-box" }}
        />
        {authErr && <p style={{ color: "red", fontSize: 13, marginBottom: 8 }}>{authErr}</p>}
        <button
          onClick={handleLogin}
          style={{ width: "100%", padding: "10px 0", background: "#FF6B9D", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer" }}
        >
          ログイン
        </button>
      </div>
    );
  }

  // ── 管理画面 ───────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    color: "#111",
    boxSizing: "border-box",
    marginBottom: 4,
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: "#555", display: "block", marginBottom: 2 };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px" }}>
      {/* ヘッダー */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: "bold", margin: 0 }}>🍑 塾オタク 管理画面</h1>
        <button
          onClick={() => { sessionStorage.removeItem("admin_pw"); setAuthed(false); setAdminPw(""); }}
          style={{ padding: "6px 14px", border: "1px solid #ccc", borderRadius: 20, fontSize: 13, cursor: "pointer", background: "white" }}
        >
          ログアウト
        </button>
      </div>

      {/* 新規登録ボタン */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => { setForm(emptyForm); setImages([]); setEditingId(null); setShowForm(!showForm); }}
          style={{ padding: "10px 20px", background: "#FF6B9D", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "bold", cursor: "pointer" }}
        >
          {showForm && !editingId ? "キャンセル" : "+ 新規登録"}
        </button>
      </div>

      {/* フォーム */}
      {showForm && (
        <div style={{ background: "#fff8f5", border: "1px solid #ffd6e7", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16, marginTop: 0 }}>
            {editingId ? "塾を編集" : "新規塾を登録"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>塾名 *</label>
              <input autoComplete="off" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：武田塾 渋谷校" />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>エリア *</label>
                <input autoComplete="off" style={inputStyle} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="例：千葉" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>駅・アクセス</label>
                <input autoComplete="off" style={inputStyle} value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} placeholder="例：渋谷駅徒歩3分" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>タイプ</label>
                <input autoComplete="off" style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="例：管理型・個別指導・映像授業" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>価格帯</label>
                <input autoComplete="off" style={inputStyle} value={form.price_range} onChange={(e) => setForm({ ...form, price_range: e.target.value })} placeholder="例：月3〜6万円" />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>評価（0〜5）</label>
                <input autoComplete="off" style={inputStyle} type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>LINE URL</label>
                <input autoComplete="off" style={inputStyle} value={form.line_url} onChange={(e) => setForm({ ...form, line_url: e.target.value })} placeholder="例：https://line.me/ti/p/..." />
              </div>
            </div>
            <div>
              <label style={labelStyle}>メリット</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.merit} onChange={(e) => setForm({ ...form, merit: e.target.value })} placeholder="例：自習室が神、先生が熱血" />
            </div>
            <div>
              <label style={labelStyle}>デメリット</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.demerit} onChange={(e) => setForm({ ...form, demerit: e.target.value })} placeholder="例：費用が高め" />
            </div>
            <div>
              <label style={labelStyle}>ぴーちゃんの一言</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={form.peach_comment} onChange={(e) => setForm({ ...form, peach_comment: e.target.value })} placeholder="例：逆転合格を本気で目指すならここ！" />
            </div>
            <div>
              <label style={labelStyle}>タグ（カンマ区切り）</label>
              <input autoComplete="off" style={inputStyle} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="例：逆転合格,管理型,自習室神" />
            </div>
            <div>
              <label style={labelStyle}>こんな人向け（カンマ区切り）</label>
              <input autoComplete="off" style={inputStyle} value={form.targets} onChange={(e) => setForm({ ...form, targets: e.target.value })} placeholder="例：家で集中できない,浪人生" />
            </div>

            {/* 画像アップロード */}
            <div>
              <label style={labelStyle}>画像（複数可）</label>
              <div
                style={{ border: "2px dashed #ffd6e7", borderRadius: 8, padding: "16px", textAlign: "center", cursor: "pointer", background: "white" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                />
                {uploading ? (
                  <p style={{ color: "#FF6B9D", fontSize: 14, margin: 0 }}>アップロード中...</p>
                ) : (
                  <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>クリックして画像を選択（複数可）</p>
                )}
              </div>

              {/* プレビュー */}
              {images.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {images.map((url) => (
                    <div key={url} style={{ position: "relative", width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: "1px solid #eee" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        onClick={() => handleRemoveImage(url)}
                        style={{
                          position: "absolute", top: 2, right: 2,
                          width: 22, height: 22,
                          background: "rgba(0,0,0,0.6)", color: "white",
                          border: "none", borderRadius: "50%",
                          fontSize: 13, lineHeight: "22px", textAlign: "center",
                          cursor: "pointer", padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              style={{ flex: 1, padding: "12px 0", background: "#FF6B9D", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: "bold", cursor: (saving || uploading) ? "not-allowed" : "pointer", opacity: (saving || uploading) ? 0.6 : 1 }}
            >
              {saving ? "保存中..." : "💾 保存する"}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm); setImages([]); setEditingId(null); }}
              style={{ padding: "12px 20px", background: "white", border: "1px solid #ccc", borderRadius: 8, fontSize: 14, cursor: "pointer" }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 一覧 */}
      <h2 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 12 }}>登録済みの塾（{jukus.length}件）</h2>
      {jukus.length === 0 ? (
        <p style={{ color: "#aaa", textAlign: "center", padding: "40px 0" }}>まだ登録されていません</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {jukus.map((juku) => (
            <div
              key={juku.id}
              onClick={() => handleEdit(juku)}
              style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: 16, cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, minWidth: 0, flex: 1 }}>
                  {/* サムネイル */}
                  {juku.images && juku.images.length > 0 && (
                    <div style={{ position: "relative", width: 60, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                      <Image src={juku.images[0]} alt={juku.name} unoptimized fill style={{ objectFit: "cover" }} sizes="60px" />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: "bold", fontSize: 15, margin: "0 0 4px" }}>{juku.name}</p>
                    <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>
                      {juku.area}{juku.station ? ` · ${juku.station}` : ""}{juku.type ? ` · ${juku.type}` : ""}
                    </p>
                    {juku.price_range && <p style={{ fontSize: 13, color: "#FF9A3C", margin: 0 }}>{juku.price_range}</p>}
                    {juku.images && juku.images.length > 0 && (
                      <p style={{ fontSize: 12, color: "#aaa", margin: "4px 0 0" }}>画像 {juku.images.length}枚</p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(juku); }}
                    style={{ padding: "6px 14px", background: "#fff0f5", color: "#FF6B9D", border: "1px solid #ffd6e7", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: "bold" }}
                  >
                    編集
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, juku.id)}
                    style={{ padding: "6px 14px", background: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: "bold" }}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
