// ダミーのAI。本物のAI（API）の代わりに、決まった返事を返すだけ。
// 本物と同じく「文章」と「合鍵」を受け取る形にしておくと、あとで差し替えやすい。
export async function dummyAi(text, apiKey) {
  // 本物のAIも、合鍵がないと断ってくるので同じ動きにしておく
  if (!apiKey) {
    throw new Error("合鍵がありません");
  }
  const length = [...text].length;
  return `（ダミーAI）${length}文字の文章を受け取りました。本物のAIなら、ここに返事が入ります。`;
}
