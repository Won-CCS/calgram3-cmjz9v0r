"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

export type FoodItem = {
  id: string;
  name: string;
  weight: number; // grams
  calories: number; // kcal
  confidence: number; // 0-1
};

type Props = {
  items: FoodItem[];
  onUpdate: (id: string, partial: Partial<FoodItem>) => void;
  onRemove: (id: string) => void;
};

export default function DetectedItemList({ items, onUpdate, onRemove }: Props) {
  return (
    <div className="divide-y divide-white/5">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-slate-100">{item.name}</p>
              <span className="rounded-full bg-white/5 px-2 py-[2px] text-[11px] text-amber-200 ring-1 ring-amber-400/30">
                信頼度 {(item.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <InformationCircleIcon className="h-4 w-4 text-sky-300" />
                重さとカロリーを調整可能
              </span>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2 md:flex md:flex-1 md:items-center md:gap-3">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wide text-slate-400">
                重さ (g)
              </label>
              <input
                type="number"
                min={0}
                value={item.weight}
                onChange={(e) =>
                  onUpdate(item.id, { weight: Math.max(0, Number(e.target.value)) })
                }
                className="w-full rounded-lg border border-white/5 bg-slate-800/70 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/0 transition focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wide text-slate-400">
                カロリー (kcal)
              </label>
              <input
                type="number"
                min={0}
                value={item.calories}
                onChange={(e) =>
                  onUpdate(item.id, { calories: Math.max(0, Number(e.target.value)) })
                }
                className="w-full rounded-lg border border-white/5 bg-slate-800/70 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/0 transition focus:ring-2"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 md:w-24 md:justify-end">
            <span className="text-sm font-semibold text-amber-200">
              {item.calories.toLocaleString()} kcal
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-red-300"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
