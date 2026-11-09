// ブラウザとの窓口（サーバー）。画面を表示し、/api/ask で文章を受け取る。
// 起動：AI_API_KEY=てきとうな文字 npm start
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { createProxy } from "./src/proxy.js";

// 文字数チェックより前に、とても大きなデータを丸ごと読み込まないための上限
const MAX_BODY_BYTES = 10 * 1024;
const indexHtml = new URL("./public/index.html", import.meta.url);

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function createAppServer(options) {
  const handleAsk = createProxy(options);

  return createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(await readFile(indexHtml));
      return;
    }

    if (req.method === "POST" && req.url === "/api/ask") {
      let body;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        sendJson(res, 400, { error: "送られてきたデータの形が正しくありません。" });
        return;
      }
      const result = await handleAsk(body);
      sendJson(res, result.status, result.body);
      return;
    }

    sendJson(res, 404, { error: "見つかりません。" });
  });
}

// `npm start` で直接動かしたときだけ起動する（テストから読み込んだときは起動しない）
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // 合鍵は環境変数から読むだけ。ファイルには書かない
  const apiKey = process.env.AI_API_KEY;
  const port = Number(process.env.PORT) || 3000;

  // 合鍵の値は表示せず、「あるかないか」だけ知らせる
  console.log(`[ai-proxy] 合鍵：${apiKey ? "設定あり" : "未設定（AIは使えません）"}`);

  // 127.0.0.1 = このパソコンの中からだけ接続できる（外の人からは使えない）
  createAppServer({ apiKey }).listen(port, "127.0.0.1", () => {
    console.log(`[ai-proxy] http://localhost:${port} で待っています（止めるときは Ctrl+C）`);
  });
}
