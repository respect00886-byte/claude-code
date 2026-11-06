// 中継役の「3つの守り」がちゃんと働くかを確かめるテスト
// ここで使う合鍵はテスト用のニセモノ（本物の合鍵はどこにも書かない）
import assert from "node:assert/strict";
import { test } from "node:test";
import { createAppServer } from "../server.js";
import { createDailyCounter } from "../src/limits.js";
import { createProxy } from "../src/proxy.js";

const FAKE_KEY = "test-secret-123";

// ログを画面に出さず、配列にためて中身を確認できるようにする
function setup(options = {}) {
  const logs = [];
  const handleAsk = createProxy({ apiKey: FAKE_KEY, log: (m) => logs.push(m), ...options });
  return { handleAsk, logs };
}

test("合鍵が返事にもログにも含まれない", async () => {
  const { handleAsk, logs } = setup();
  const result = await handleAsk({ text: "こんにちは" });

  assert.equal(result.status, 200);
  assert.ok(!JSON.stringify(result).includes(FAKE_KEY));
  assert.ok(!logs.join("\n").includes(FAKE_KEY));
});

test("AIが合鍵入りの返事やエラーを返しても、外には出ない", async () => {
  const leakyAnswer = setup({ ai: async (_t, key) => `合鍵は${key}です` });
  const ok = await leakyAnswer.handleAsk({ text: "テスト" });
  assert.ok(!JSON.stringify(ok).includes(FAKE_KEY));

  const leakyError = setup({
    ai: async (_t, key) => {
      throw new Error(`認証失敗 key=${key}`);
    },
  });
  const ng = await leakyError.handleAsk({ text: "テスト" });
  assert.equal(ng.status, 502);
  assert.ok(!JSON.stringify(ng).includes(FAKE_KEY));
  assert.ok(!leakyError.logs.join("\n").includes(FAKE_KEY));
});

test("文字数の上限を超えると断られる（200文字ちょうどは通る）", async () => {
  const { handleAsk } = setup();

  const ok = await handleAsk({ text: "あ".repeat(200) });
  assert.equal(ok.status, 200);

  const ng = await handleAsk({ text: "あ".repeat(201) });
  assert.equal(ng.status, 413);
  assert.match(ng.body.error, /200文字以内/);
});

test("空の文章や、形のおかしいデータは断られる", async () => {
  const { handleAsk } = setup();
  assert.equal((await handleAsk({ text: "   " })).status, 400);
  assert.equal((await handleAsk({ text: 123 })).status, 400);
  assert.equal((await handleAsk(null)).status, 400);
});

test("1日の回数の上限を超えると断られ、次の日には戻る", async () => {
  const { handleAsk } = setup({ counter: createDailyCounter(20) });
  const today = new Date("2026-11-06T10:00:00+09:00");

  for (let i = 0; i < 20; i++) {
    assert.equal((await handleAsk({ text: "テスト" }, today)).status, 200);
  }
  const ng = await handleAsk({ text: "テスト" }, today);
  assert.equal(ng.status, 429);
  assert.match(ng.body.error, /上限/);

  const tomorrow = new Date("2026-11-07T00:01:00+09:00");
  assert.equal((await handleAsk({ text: "テスト" }, tomorrow)).status, 200);
});

test("合鍵が設定されていないときは、安全なエラーになる", async () => {
  const { handleAsk, logs } = setup({ apiKey: undefined });
  const result = await handleAsk({ text: "こんにちは" });

  assert.equal(result.status, 503);
  assert.equal(result.body.error, "サーバーの準備ができていません。管理者に連絡してください。");
  // 「どの設定が足りないか」など内部の事情は出さない
  assert.ok(!JSON.stringify(result).includes("AI_API_KEY"));
  assert.ok(logs.length > 0);
});

test("実際のサーバー経由でも、同じように守られる", async (t) => {
  const server = createAppServer({ apiKey: FAKE_KEY, log: () => {} });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/api/ask`;

  const post = (body) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });

  const ok = await post(JSON.stringify({ text: "こんにちは" }));
  const okText = await ok.text();
  assert.equal(ok.status, 200);
  assert.ok(!okText.includes(FAKE_KEY));

  assert.equal((await post(JSON.stringify({ text: "あ".repeat(201) }))).status, 413);
  assert.equal((await post("これはJSONではない")).status, 400);
});

test("合鍵なしのサーバーでも、安全なエラーになる", async (t) => {
  const server = createAppServer({ apiKey: "", log: () => {} });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/ask`, {
    method: "POST",
    body: JSON.stringify({ text: "こんにちは" }),
  });
  assert.equal(res.status, 503);
});
