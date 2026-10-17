import type { PopInput } from "../types";

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
