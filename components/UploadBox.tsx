"use client";

import { PhotoIcon, ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";

type Props = {
  onFileSelect: (file: File) => void;
  loading?: boolean;
};

export default function UploadBox({ onFileSelect, loading }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = "";
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/80 p-4 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-pink-400/5 to-sky-400/5 opacity-0 blur-3xl transition group-hover:opacity-100" />
      <div className="relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-slate-900/60 px-5 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15 text-amber-200">
          <PhotoIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-50">食事の写真を選択</p>
          <p className="mt-1 text-xs text-slate-400">
            JPG / PNG 対応。ローカルでのみ処理されます。
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-slate-50 ring-1 ring-white/15 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          {loading ? "解析中..." : "画像をアップロード"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
