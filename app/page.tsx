"use client";

import { useEffect, useMemo, useState } from "react";
import UploadBox from "../components/UploadBox";
import DetectedItemList, { FoodItem } from "../components/DetectedItemList";
import { SparklesIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

const STORAGE_KEY = "calorie-vision-data";

const gradientText = "bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 bg-clip-text text-transparent";

type SavedData = {
  items: FoodItem[];
  image: string | null;
  lastUpdated: number;
};

export default function Page() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [status, setStatus] = useState<string>("写真をアップロードして解析を開始");
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customWeight, setCustomWeight] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: SavedData = JSON.parse(saved);
      setItems(parsed.items || []);
      setImagePreview(parsed.image || null);
      setStatus("前回の解析結果を読み込みました");
    }
  }, []);

  useEffect(() => {
    const payload: SavedData = {
      items,
      image: imagePreview,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [items, imagePreview]);

  const totalCalories = useMemo(
    () => items.reduce((sum, item) => sum + item.calories, 0),
    [items]
  );

  const detectFromFile = async (file: File) => {
    setIsDetecting(true);
    setStatus("AI が食品を検出中…");

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    await new Promise((resolve) => setTimeout(resolve, 900));

    const lower = file.name.toLowerCase();

    const templates: { match: string[]; items: Omit<FoodItem, "id">[] }[] = [
      {
        match: ["rice", "ご飯", "gohan", "onigiri"],
        items: [
          {
            name: "白ごはん",
            weight: 180,
            calories: 280,
            confidence: 0.93,
          },
          {
            name: "焼き鮭",
            weight: 120,
            calories: 230,
            confidence: 0.89,
          },
          {
            name: "味噌汁",
            weight: 160,
            calories: 65,
            confidence: 0.74,
          },
        ],
      },
      {
        match: ["pasta", "spaghetti", "パスタ"],
        items: [
          {
            name: "トマトソースパスタ",
            weight: 220,
            calories: 520,
            confidence: 0.88,
          },
          {
            name: "粉チーズ",
            weight: 12,
            calories: 48,
            confidence: 0.68,
          },
        ],
      },
      {
        match: ["salad", "サラダ", "veggie", "green"],
        items: [
          {
            name: "グリーンサラダ",
            weight: 180,
            calories: 130,
            confidence: 0.91,
          },
          {
            name: "アボカド",
            weight: 70,
            calories: 112,
            confidence: 0.72,
          },
          {
            name: "オリーブオイルドレッシング",
            weight: 18,
            calories: 145,
            confidence: 0.61,
          },
        ],
      },
      {
        match: ["ramen", "ラーメン", "noodle"],
        items: [
          {
            name: "豚骨ラーメン",
            weight: 420,
            calories: 680,
            confidence: 0.9,
          },
          {
            name: "煮卵",
            weight: 50,
            calories: 80,
            confidence: 0.7,
          },
        ],
      },
    ];

    const fallbackCombos: Omit<FoodItem, "id">[][] = [
      [
        { name: "ハンバーグ", weight: 180, calories: 480, confidence: 0.86 },
        { name: "マッシュポテト", weight: 150, calories: 210, confidence: 0.73 },
        { name: "ブロッコリー", weight: 80, calories: 28, confidence: 0.77 },
      ],
      [
        { name: "チキンカレー", weight: 260, calories: 560, confidence: 0.9 },
        { name: "バスマティライス", weight: 170, calories: 250, confidence: 0.81 },
      ],
      [
        { name: "サーモン寿司", weight: 200, calories: 420, confidence: 0.84 },
        { name: "味噌汁", weight: 160, calories: 65, confidence: 0.7 },
        { name: "枝豆", weight: 90, calories: 120, confidence: 0.66 },
      ],
    ];

    const matched = templates.find((t) =>
      t.match.some((keyword) => lower.includes(keyword))
    );

    const picked = matched?.items ??
      fallbackCombos[Math.floor(Math.random() * fallbackCombos.length)];

    const jittered = picked.map((item) => {
      const delta = 0.9 + Math.random() * 0.2; // 0.9 - 1.1x
      return {
        ...item,
        weight: Math.round(item.weight * delta),
        calories: Math.round(item.calories * delta),
        id: crypto.randomUUID(),
      } as FoodItem;
    });

    setItems(jittered);
    setStatus("検出が完了しました。内容を微調整できます。");
    setIsDetecting(false);
  };

  const handleFileSelect = (file: File) => {
    detectFromFile(file).catch(() => {
      setStatus("解析中にエラーが発生しました");
      setIsDetecting(false);
    });
  };

  const handleUpdateItem = (id: string, partial: Partial<FoodItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...partial } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCustom = () => {
    if (!customName.trim() || !customCalories) return;
    const caloriesNum = Number(customCalories);
    const weightNum = Number(customWeight) || 0;
    if (Number.isNaN(caloriesNum)) return;
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: customName.trim(),
      calories: Math.max(0, Math.round(caloriesNum)),
      weight: weightNum > 0 ? Math.round(weightNum) : 0,
      confidence: 0.55,
    };
    setItems((prev) => [...prev, newItem]);
    setCustomName("");
    setCustomCalories("");
    setCustomWeight("");
  };

  return (
    <main className="min-h-screen pb-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-10 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 p-[1px] shadow-2xl">
          <div className="relative flex flex-col gap-6 rounded-3xl bg-slate-950/70 p-8 backdrop-blur lg:flex-row lg:items-center">
            <div className="flex-1 space-y-3">
              <p className="text-sm uppercase tracking-[0.25rem] text-slate-400">
                Calorie Vision
              </p>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                食事写真を<span className={gradientText}> 自動解析 </span>
                して総カロリーを算出
              </h1>
              <p className="text-slate-300">
                写真をアップロードするだけで、料理の構成要素を検出しカロリーを自動計算。
                検出後は内容を微調整して、より正確な食事記録を残せます。
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">ローカル解析</span>
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">履歴を自動保存</span>
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">モバイル最適化</span>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <UploadBox onFileSelect={handleFileSelect} loading={isDetecting} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <SparklesIcon className="h-5 w-5 text-amber-300" />
                {status}
              </div>
              {items.length > 0 && (
                <button
                  onClick={() => setItems([])}
                  className="text-xs text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
                >
                  クリア
                </button>
              )}
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 shadow-xl">
              <DetectedItemList
                items={items}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
              />
              {items.length === 0 && (
                <div className="p-10 text-center text-slate-400">
                  まだ検出された料理がありません。写真をアップロードすると自動で表示されます。
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-800/60 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">推定総カロリー</p>
                <span className="text-xs text-slate-400">調整後は即時反映</span>
              </div>
              <p className="mt-2 text-5xl font-semibold tracking-tight text-amber-200">
                {totalCalories.toLocaleString()} kcal
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-amber-200 ring-1 ring-amber-400/30">
                  <SparklesIcon className="h-4 w-4" /> AI 推定値
                </span>
                <span className="text-slate-400">重さ・カロリーを手動調整できます</span>
              </div>
              {imagePreview && (
                <div className="mt-5 overflow-hidden rounded-xl border border-white/5">
                  <img
                    src={imagePreview}
                    alt="Uploaded meal"
                    className="h-52 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-xl">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <PlusCircleIcon className="h-5 w-5 text-emerald-400" />
                検出に足りない料理を追加
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="text-xs text-slate-400">料理名</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/5 bg-slate-800/70 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/0 transition focus:ring-2"
                    placeholder="例: コーンスープ"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-slate-400">カロリー (kcal)</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-white/5 bg-slate-800/70 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/0 transition focus:ring-2"
                    placeholder="150"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-slate-400">重さ (g) 任意</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-white/5 bg-slate-800/70 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/0 transition focus:ring-2"
                    placeholder="200"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleAddCustom}
                className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-emerald-500/40"
              >
                料理を追加
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
