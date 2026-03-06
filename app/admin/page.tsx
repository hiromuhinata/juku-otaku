"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
  tiktok_views: string;
  reel_urls: string;
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
  tiktok_views: "",
  reel_urls: "",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [jukus, setJukus] = useState<Record<string, unknown>[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (authed) fetchJukus();
  }, [authed]);

  async function fetchJukus() {
    const res = await fetch("/api/admin/juku");
    if (!res.ok) { alert("一覧取得失敗: " + await res.text()); return; }
    const json = await res.json();
    setJukus(json.data || []);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach((f) => fd.append("images", f));
    if (editingId) fd.append("id", editingId);
    const res = await fetch("/api/admin/juku", { method: "POST", body: fd });
    if (!res.ok) { alert("保存失敗: " + await res.text()); setSaving(false); return; }
    setForm(emptyForm);
    setImages([]);
    setPreviews([]);
    setEditingId(null);
    setSaving(false);
    fetchJukus();
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    const res = await fetch("/api/admin/juku", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!res.ok) { alert("削除失敗"); return; }
    fetchJukus();
  }

  function handleEdit(juku: Record<string, unknown>) {
    setEditingId(juku.id as string);
    setForm({
      name: (juku.name as string) || "",
      area: (juku.area as string) || "",
      station: (juku.station as string) || "",
      type: (juku.type as string) || "",
      price_range: (juku.price_range as string) || "",
      merit: (juku.merit as string) || "",
      demerit: (juku.demerit as string) || "",
      peach_comment: (juku.peach_comment as string) || "",
      rating: String(juku.rating || ""),
      line_url: (juku.line_url as string) || "",
      tags: ((juku.juku_tags as { tag: string }[]) || []).map((t) => t.tag).join(","),
      targets: ((juku.juku_targets as { target: string }[]) || []).map((t) => t.target).join(","),
      tiktok_views: (juku.tiktok_views as string) || "",
      reel_urls: ((juku.reel_urls as string[]) || []).join("\n"),
    });
    setPreviews(((juku.images as string[]) || []));
    window.scrollTo(0, 0);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-8 w-80">
          <h1 className="text-white font-bold text-xl mb-6 text-center">🍑 管理画面</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 mb-4 outline-none" onKeyDown={(e) => e.key === "Enter" && fetch("/api/auth/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).then((r) => r.ok && setAuthed(true)).catch(() => {})} />
          <button onClick={() => fetch("/api/auth/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }).then((r) => r.ok ? setAuthed(true) : alert("パスワードが違います")).catch(() => alert("エラー"))} className="w-full bg-pink-500 text-white font-bold py-3 rounded-xl hover:bg-pink-600">ログイン</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🍑 塾管理画面</h1>

        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">{editingId ? "✏️ 編集中" : "＋ 新規登録"}</h2>
          <div className="space-y-3">
            {[
              { key: "name", label: "塾名*" },
              { key: "area", label: "エリア*" },
              { key: "station", label: "最寄り駅*" },
              { key: "type", label: "授業形式（例：個別指導）" },
              { key: "price_range", label: "料金（例：月2〜5万円）" },
              { key: "tiktok_views", label: "TikTok再生数（例：12万）" },
              { key: "line_url", label: "LINE URL" },
              { key: "rating", label: "評価（1〜5）" },
              { key: "tags", label: "タグ（カンマ区切り）" },
              { key: "targets", label: "こんな人向け（カンマ区切り）" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <input value={form[key as keyof FormState]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full bg-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
            ))}
            {[
              { key: "merit", label: "メリット" },
              { key: "demerit", label: "デメリット" },
              { key: "peach_comment", label: "ぴーちゃんの一言" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <textarea value={form[key as keyof FormState]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} rows={3} className="w-full bg-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
              </div>
            ))}

            {/* InstagramリールURL */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">📸 InstagramリールURL（1行に1つ）</label>
              <textarea
                value={form.reel_urls}
                onChange={(e) => setForm({ ...form, reel_urls: e.target.value })}
                rows={4}
                placeholder={"https://www.instagram.com/reel/xxxxx/\nhttps://www.instagram.com/reel/yyyyy/"}
                className="w-full bg-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">※ InstagramのリールURLを1行ずつ入力してください</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">画像（複数可）</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full bg-gray-700 rounded-xl px-4 py-2.5 text-sm" />
              {previews.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {previews.map((p, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <Image src={p} alt="" fill className="object-cover rounded-lg" unoptimized />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
              {saving ? "保存中..." : editingId ? "更新する" : "登録する"}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm(emptyForm); setPreviews([]); }} className="px-6 bg-gray-600 text-white font-bold py-3 rounded-xl">キャンセル</button>
            )}
          </div>
        </div>

        <h2 className="text-lg font-bold mb-3">登録済みの塾（{jukus.length}件）</h2>
        <div className="space-y-3">
          {jukus.length === 0 && <p className="text-gray-400 text-center py-8">まだ登録されていません</p>}
          {jukus.map((juku) => (
            <div key={juku.id as string} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{juku.name as string}</p>
                <p className="text-sm text-gray-400">{juku.area as string} / {juku.station as string}</p>
                {((juku.reel_urls as string[]) || []).length > 0 && (
                  <p className="text-xs text-pink-400 mt-1">📸 リール {((juku.reel_urls as string[]) || []).length}本</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(juku)} className="text-xs bg-blue-600 px-3 py-1.5 rounded-lg">編集</button>
                <button onClick={() => handleDelete(juku.id as string)} className="text-xs bg-red-600 px-3 py-1.5 rounded-lg">削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
