import type { PopInput } from "../types";
import type { BatchItem } from "./batch";

const INPUT_KEY = "pop-maker:input";

// 前回の入力だけを残しておき、次に開いたときに続きから使えるようにする
export function loadInput(): PopInput | null {
  try {
    const raw = localStorage.getItem(INPUT_KEY);
    if (raw == null) return null;
    return JSON.parse(raw) as PopInput;
  } catch {
    return null;
  }
}

export function saveInput(input: PopInput): void {
  try {
    localStorage.setItem(INPUT_KEY, JSON.stringify(input));
  } catch {
    // 保存できない環境（プライベートモード等）でも画面はそのまま使えるようにする
  }
}

const PHRASES_KEY = "pop-maker:phrases";

// 自分で登録したフレーズ。見出し用と補足文用で分けて持つ
export interface MyPhrases {
  headings: string[];
  subs: string[];
}

export function loadPhrases(): MyPhrases {
  try {
    const raw = localStorage.getItem(PHRASES_KEY);
    if (raw == null) return { headings: [], subs: [] };
    const saved = JSON.parse(raw) as Partial<MyPhrases>;
    return { headings: saved.headings ?? [], subs: saved.subs ?? [] };
  } catch {
    return { headings: [], subs: [] };
  }
}

export function savePhrases(phrases: MyPhrases): void {
  try {
    localStorage.setItem(PHRASES_KEY, JSON.stringify(phrases));
  } catch {
    // 保存できない環境でも、開いている間は使えるようにする
  }
}

const BATCH_KEY = "pop-maker:batch";

// まとめて印刷の一覧。途中で閉じても続きから印刷できるよう残しておく
export function loadBatch(): BatchItem[] {
  try {
    const raw = localStorage.getItem(BATCH_KEY);
    return raw == null ? [] : (JSON.parse(raw) as BatchItem[]);
  } catch {
    return [];
  }
}

export function saveBatch(items: BatchItem[]): void {
  try {
    localStorage.setItem(BATCH_KEY, JSON.stringify(items));
  } catch {
    // 保存できない環境でも、開いている間は使えるようにする
  }
}
