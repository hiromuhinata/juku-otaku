"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80";

type JukuData = {
  id: string;
  name: string;
  area: string;
  station: string;
  type: string;
  price: string;
  rating: number;
  tags: string[];
  targets: string[];
  tiktokViews: string;
  thumbnail: string;
  review: { merit: string; demerit: string; peachComment: string };
  lineUrl: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={`text-sm ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
      ))}
      <span className="text-sm font-semibold text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function JukuCard({ juku }: { juku: JukuData }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-pink-100">
      <div className="relative h-[200px] w-full">
        <Image src={juku.thumbnail} alt={juku.name} fill className="object-cover" sizes="(max-width: 672px) 100vw, 672px" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {juku.tiktokViews && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.2 8.2 0 004.79 1.53V6.82a4.85 4.85 0 01-1.02-.13z"/></svg>
            {juku.tiktokViews}回再生
          </div>
        )}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-[#FF6B9D] to-[#FF9A3C] text-white text-xs font-bold px-3 py-1 rounded-full">{juku.area}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
          <div className="flex items-end justify-between">
            <h2 className="text-white font-bold text-lg leading-tight drop-shadow">{juku.name}</h2>
            {juku.type && <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white ml-2">{juku.type}</span>}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">📍 {juku.station}</p>
          <StarRating rating={juku.rating} />
        </div>
        {juku.price && <p className="text-sm font-bold text-[#FF9A3C] mb-3">💰 {juku.price}</p>}
        {juku.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {juku.tags.map((tag) => <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-500 border border-pink-200">{tag}</span>)}
          </div>
        )}
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-sm font-semibold text-pink-500 border border-pink-200 rounded-xl px-4 py-2 hover:bg-pink-50 transition-colors">
          <span>🔍 ぶっちゃけレビューを見る</span>
          <span className={`transition-transform duration-200 inline-block ${open ? "rotate-180" : ""}`}>▼</span>
        </button>
        {open && (
          <div className="mt-3 space-y-3 text-sm">
            {juku.review.merit && <div className="bg-green-50 rounded-xl p-3"><p className="font-semibold text-green-600 mb-1">✅ メリット</p><p className="text-gray-700">{juku.review.merit}</p></div>}
            {juku.review.demerit && <div className="bg-red-50 rounded-xl p-3"><p className="font-semibold text-red-400 mb-1">⚠️ デメリット</p><p className="text-gray-700">{juku.review.demerit}</p></div>}
            {juku.review.peachComment && <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-3 border border-pink-100"><p className="font-semibold text-[#FF6B9D] mb-1">🍑 ぴーちゃんの一言</p><p className="text-gray-700">{juku.review.peachComment}</p></div>}
          </div>
        )}
        {juku.lineUrl && (
          <a href={juku.lineUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#06C755] text-white font-semibold text-sm hover:bg-[#05b34d] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.86 1.4 5.41 3.59 7.12L4.5 22l3.27-1.72C9.02 20.73 10.48 21 12 21c5.52 0 10-4.03 10-9S17.52 2 12 2z"/></svg>
            LINEで相談する
          </a>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [jukuList, setJukuList] = useState<JukuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [searchText, setSearchText] = useState("");
  const [missionOpen, setMissionOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchJukus() {
      const res = await fetch("/api/jukus");
      const text = await res.text();
      if (!res.ok) { setLoading(false); return; }
      let json: { data: Record<string, unknown>[] };
      try { json = JSON.parse(text); } catch { setLoading(false); return; }
      const rows = json.data || [];
      const mapped: JukuData[] = rows.map((row) => ({
        id: row.id as string,
        name: (row.name as string) || "",
        area: (row.area as string) || "",
        station: (row.station as string) || "",
        type: (row.type as string) || "",
        price: (row.price_range as string) || "",
        rating: (row.rating as number) ?? 0,
        tags: ((row.juku_tags as { tag: string }[]) || []).map((t) => t.tag),
        targets: ((row.juku_targets as { target: string }[]) || []).map((t) => t.target),
        tiktokViews: (row.tiktok_views as string) || "",
        thumbnail: ((row.images as string[]) || [])[0] || DEFAULT_THUMBNAIL,
        review: { merit: (row.merit as string) || "", demerit: (row.demerit as string) || "", peachComment: (row.peach_comment as string) || "" },
        lineUrl: (row.line_url as string) || "",
      }));
      setJukuList(mapped);
      setLoading(false);
    }
    fetchJukus();
  }, []);

  const allTags = Array.from(new Set(jukuList.flatMap((j) => j.tags)));
  const allTargets = Array.from(new Set(jukuList.flatMap((j) => j.targets)));
  const allAreas = Array.from(new Set(jukuList.map((j) => j.area).filter(Boolean)));

  const activeFilterCount = selectedTags.length + selectedTargets.length + (selectedArea ? 1 : 0);

  const filtered = jukuList.filter((juku) => {
    const tagMatch = selectedTags.length === 0 || selectedTags.every((t) => juku.tags.includes(t));
    const targetMatch = selectedTargets.length === 0 || selectedTargets.every((t) => juku.targets.includes(t));
    const areaMatch = selectedArea === "" || juku.area === selectedArea;
    const q = searchText.toLowerCase();
    const textMatch = q === "" || juku.name.toLowerCase().includes(q) || juku.station.toLowerCase().includes(q) || juku.area.toLowerCase().includes(q);
    return tagMatch && targetMatch && areaMatch && textMatch;
  });

  const clearAll = () => {
    setSelectedTags([]);
    setSelectedTargets([]);
    setSelectedArea("");
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* フィルターモーダル */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">🔧 絞り込み</h2>
              <div className="flex gap-2">
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-gray-400 underline">すべてクリア</button>
                )}
                <button onClick={() => setFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>
              </div>
            </div>

            {allAreas.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">📍 エリア</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedArea("")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selectedArea === "" ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF9A3C] text-white" : "bg-[#F5EDE8] text-gray-600"}`}>すべて</button>
                  {allAreas.map((area) => (
                    <button key={area} onClick={() => setSelectedArea(selectedArea === area ? "" : area)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selectedArea === area ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF9A3C] text-white" : "bg-[#F5EDE8] text-gray-600"}`}>{area}</button>
                  ))}
                </div>
              </div>
            )}

            {allTags.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">🏷️ タグ</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button key={tag} onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selectedTags.includes(tag) ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF9A3C] text-white" : "bg-[#F5EDE8] text-gray-600"}`}>{tag}</button>
                  ))}
                </div>
              </div>
            )}

            {allTargets.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">🎯 こんな人向け</p>
                <div className="flex flex-wrap gap-2">
                  {allTargets.map((target) => (
                    <button key={target} onClick={() => setSelectedTargets((prev) => prev.includes(target) ? prev.filter((t) => t !== target) : [...prev, target])} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selectedTargets.includes(target) ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF9A3C] text-white" : "bg-[#F5EDE8] text-gray-600"}`}>{target}</button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setFilterOpen(false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FF9A3C] text-white font-bold text-sm">
              {filtered.length}件を表示する
            </button>
          </div>
        </div>
      )}

      <header className="bg-gradient-to-r from-[#FF6B9D] to-[#FF9A3C] px-4 pt-6 pb-4 text-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">🍑 塾オタク</h1>
          <p className="text-sm opacity-90 mt-0.5 mb-4">ぴーちゃんが本音でレビューする塾まとめ</p>
          <div className="flex gap-2 mb-3">
            <a href="https://www.instagram.com/pichan_jukushokai?igsh=dDQ5NTcxbGY3NmRp&utm_source=qr" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl py-2 text-white text-xs font-semibold hover:bg-white/30 transition-colors">
              <span>📸</span> Instagram
            </a>
            <a href="https://www.tiktok.com/@pichan_jukusyokai" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl py-2 text-white text-xs font-semibold hover:bg-white/30 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.2 8.2 0 004.79 1.53V6.82a4.85 4.85 0 01-1.02-.13z"/></svg>
              TikTok
            </a>
            <a href="#" className="flex-1 flex items-center justify-center gap-1.5 bg-[#06C755]/90 border border-white/20 rounded-xl py-2 text-white text-xs font-semibold hover:bg-[#06C755] transition-colors">
              <span>💬</span> LINE相談
            </a>
          </div>

          {/* 検索バー + 絞り込みボタン */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-sm">🔍</span>
              <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="塾名・駅名で検索" className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 text-sm outline-none focus:bg-white/30 transition-colors" />
              {searchText && <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-sm">✕</button>}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${activeFilterCount > 0 ? "bg-white text-[#FF6B9D] border-white" : "bg-white/20 border-white/30 text-white hover:bg-white/30"}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
              絞り込む
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF6B9D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>

          <button onClick={() => setMissionOpen(!missionOpen)} className="w-full flex items-center justify-between bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-2.5 text-white text-sm font-semibold hover:bg-white/25 transition-colors">
            <span>💡 なぜこのサイトを作ったか</span>
            <span className={`transition-transform duration-200 inline-block text-xs ${missionOpen ? "rotate-180" : ""}`}>▼</span>
          </button>
          {missionOpen && (
            <div className="mt-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-sm text-white/95 leading-relaxed">
              塾選びって情報が多すぎて正直どこがいいかわからないよね。公式サイトはいいことしか書いてないし、口コミサイトも信用できるか不安…。<br /><br />
              ぴーちゃんは100校以上の塾を実際に取材・体験してきた「塾オタク」。<strong className="font-bold">メリットもデメリットも本音で</strong>伝えることで、あなたにぴったりの塾が見つかるお手伝いをするよ🌸
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{filtered.length}件の塾が見つかりました</p>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="text-xs text-pink-400 underline">フィルターをクリア</button>
            )}
          </div>
        )}
        <div className="space-y-5">
          {loading ? (
            <div className="text-center py-16 text-gray-300"><p className="text-5xl mb-3 animate-pulse">🍑</p><p className="text-sm">読み込み中...</p></div>
          ) : filtered.length > 0 ? (
            filtered.map((juku) => <JukuCard key={juku.id} juku={juku} />)
          ) : (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-3">🍑</p><p>条件に合う塾が見つかりませんでした</p></div>
          )}
        </div>
        <div className="mx-4 rounded-[22px] bg-gradient-to-r from-[#FF6B9D] to-[#FF9A3C] p-6 text-center">
          <p className="text-3xl mb-2">💌</p>
          <h3 className="text-white font-bold text-xl mb-2">迷ったらぴーちゃんに相談！</h3>
          <p className="text-white/90 text-sm leading-relaxed mb-5">LINEで塾の悩みをなんでも聞きます。<br />無料カウンセリング、気軽に送ってね🌸</p>
          <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-[#FF6B9D] font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
            📩 LINEで無料相談する
          </a>
        </div>
      </main>
    </div>
  );
}
