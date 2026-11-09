// 中継役の本体。ブラウザから来た文章をチェックしてから、AIに渡す。
// サーバーの部分（server.js）と分けてあるので、テストで直接呼び出せる。
import { dummyAi } from "./dummyAi.js";
import { MAX_CHARS, createDailyCounter } from "./limits.js";

// 万が一、返事やログに合鍵がまぎれ込んでも「****」に置きかえる（二重の守り）
export function hideKey(message, apiKey) {
  if (!apiKey) {
    return message;
  }
  return String(message).replaceAll(apiKey, "****");
}

function refuse(status, error) {
  return { status, body: { error } };
}

export function createProxy({
  apiKey,
  ai = dummyAi,
  counter = createDailyCounter(),
  log = console.log,
  maxChars = MAX_CHARS,
}) {
  return async function handleAsk(body, now = new Date()) {
    // 守り①：合鍵がないときは、理由の細かい中身は見せずに断る
    if (!apiKey) {
      log("[ai-proxy] 合鍵が未設定のため断りました");
      return refuse(503, "サーバーの準備ができていません。管理者に連絡してください。");
    }

    const text = body && typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return refuse(400, "文章を入力してください。");
    }

    // 守り②：長すぎる文章は断る（絵文字も1文字と数える）
    const length = [...text].length;
    if (length > maxChars) {
      return refuse(413, `${maxChars}文字以内で入力してください（今は${length}文字です）。`);
    }

    // 守り③：1日の回数を超えたら断る（正しい文章のときだけ1回と数える）
    if (!counter.tryUse(now)) {
      return refuse(429, "今日の利用回数の上限に達しました。明日また使えます。");
    }

    try {
      const answer = await ai(text, apiKey);
      // ログには本文も合鍵も書かず、文字数だけ残す
      log(`[ai-proxy] 返事しました（${length}文字）`);
      return {
        status: 200,
        body: { answer: hideKey(answer, apiKey), remaining: counter.remaining(now) },
      };
    } catch (err) {
      log(`[ai-proxy] AIでエラーが起きました: ${hideKey(err?.message ?? err, apiKey)}`);
      // ブラウザには中身を見せない（内部の事情から弱点を探されないように）
      return refuse(502, "AIが返事できませんでした。時間をおいて試してください。");
    }
  };
}
