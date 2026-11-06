// 使いすぎを防ぐための上限。数字を変えるときはここだけ直せばよい。
export const MAX_CHARS = 200; // 1回に送れる文字数
export const DAILY_LIMIT = 20; // 1日に使える回数

// 日本時間の「今日の日付」（例：2026-11-06）。日付が変わったら回数を0に戻すために使う
function todayInJapan(now) {
  return now.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

// 1日の回数を数える係。サーバーを止めると数はリセットされる（練習用のため）
export function createDailyCounter(limit = DAILY_LIMIT) {
  let day = "";
  let count = 0;

  function refresh(now) {
    const today = todayInJapan(now);
    if (today !== day) {
      day = today;
      count = 0;
    }
  }

  return {
    // 1回分使えたら true、上限に達していたら false
    tryUse(now = new Date()) {
      refresh(now);
      if (count >= limit) {
        return false;
      }
      count += 1;
      return true;
    },
    remaining(now = new Date()) {
      refresh(now);
      return limit - count;
    },
  };
}
