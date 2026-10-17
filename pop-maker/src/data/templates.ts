import type { Target, Tone } from "../types";

// キャッチコピーのひな形。置き換わる部分は次のとおり。
//   {商品}   … 商品名
//   {特徴}   … 特徴（「消せる」のような言葉は「消せること」にして、が・で・に が続いても自然にする）
//   {特徴の} … 商品名の前に付ける形（「ラメ入り」→「ラメ入りの」、「消せる」→「消せる」）
// targets を省略したものは、どの対象でも使える共通の文。
export interface Template {
  text: string;
  tones: Tone[];
  targets?: Target[];
}

export const TEMPLATES: Template[] = [
  // ---- 共通 ----
  { text: "話題の{商品}、入荷しました！", tones: ["genki"] },
  { text: "{特徴}がうれしい！{商品}", tones: ["genki"] },
  { text: "イチオシ！{特徴の}{商品}", tones: ["genki"] },
  { text: "売り場スタッフのおすすめ！{商品}", tones: ["genki", "yasashii"] },
  { text: "選ぶなら、{特徴の}{商品}。", tones: ["yasashii", "jouhin"] },
  { text: "毎日をちょっと楽しく。{商品}", tones: ["yasashii"] },
  { text: "{特徴}が、うれしいポイント。", tones: ["yasashii"] },
  { text: "{特徴の}{商品}で、ちいさな贅沢。", tones: ["jouhin"] },
  { text: "{特徴}が自慢の、{商品}。", tones: ["jouhin"] },
  // 特徴が空欄でも候補が少なくなりすぎないよう、特徴を使わない文も用意する
  { text: "注目！{商品}", tones: ["genki"] },
  { text: "ぜひ手に取ってみてね！", tones: ["genki", "yasashii"] },
  { text: "あなたの毎日に、{商品}", tones: ["yasashii"] },
  { text: "{商品}のある暮らし。", tones: ["jouhin"] },
  { text: "長く愛せる、{商品}。", tones: ["jouhin"] },
  { text: "ていねいに選んだ、{商品}。", tones: ["jouhin"] },

  // ---- 子ども ----
  { text: "{商品}で毎日ワクワク！", tones: ["genki"], targets: ["kids"] },
  { text: "みんな大好き！{商品}", tones: ["genki"], targets: ["kids"] },
  { text: "{特徴}でたのしさアップ！", tones: ["genki"], targets: ["kids"] },
  { text: "がっこうでも自慢しちゃおう！", tones: ["genki"], targets: ["kids"] },
  { text: "新学期のおともに！{商品}", tones: ["genki"], targets: ["kids"] },
  { text: "はじめての{商品}にぴったり", tones: ["yasashii"], targets: ["kids"] },
  { text: "{特徴の}{商品}、つかってみてね", tones: ["yasashii"], targets: ["kids"] },
  { text: "おべんきょうが楽しくなる{商品}", tones: ["yasashii"], targets: ["kids"] },
  { text: "長く使える、確かな{商品}。", tones: ["jouhin"], targets: ["kids"] },
  { text: "お子さまにも安心。{特徴の}{商品}", tones: ["jouhin", "yasashii"], targets: ["kids"] },

  // ---- 大人 ----
  { text: "仕事がはかどる！{商品}", tones: ["genki"], targets: ["adult"] },
  { text: "{特徴}で作業効率アップ！", tones: ["genki"], targets: ["adult"] },
  { text: "大人も夢中！{商品}", tones: ["genki"], targets: ["adult"] },
  { text: "がんばる毎日に、{商品}", tones: ["yasashii"], targets: ["adult"] },
  { text: "{特徴}で、ほっとひと息。", tones: ["yasashii"], targets: ["adult"] },
  { text: "{特徴}が心地よい、{商品}。", tones: ["jouhin"], targets: ["adult"] },
  { text: "手になじむ、大人の{商品}。", tones: ["jouhin"], targets: ["adult"] },
  { text: "使うたびに、良さがわかる。", tones: ["jouhin"], targets: ["adult"] },

  // ---- ファン向け ----
  { text: "ファン必見！{特徴の}{商品}", tones: ["genki"], targets: ["fan"] },
  { text: "見逃せない！{商品}登場！", tones: ["genki"], targets: ["fan"] },
  { text: "推し活に！{商品}", tones: ["genki"], targets: ["fan"] },
  { text: "集めたくなる！{特徴の}{商品}", tones: ["genki"], targets: ["fan"] },
  { text: "お早めに！{商品}", tones: ["genki"], targets: ["fan"] },
  { text: "推しといっしょの毎日を。", tones: ["yasashii"], targets: ["fan"] },
  { text: "{特徴}に、きゅん。{商品}", tones: ["yasashii"], targets: ["fan"] },
  { text: "大切に使いたい、{商品}。", tones: ["yasashii", "jouhin"], targets: ["fan"] },
  { text: "{特徴}にこだわった、特別な一品。", tones: ["jouhin"], targets: ["fan"] },
  { text: "コレクションに加えたい{商品}。", tones: ["jouhin"], targets: ["fan"] },

  // ---- プレゼント ----
  { text: "プレゼントにおすすめ！{商品}", tones: ["genki"], targets: ["gift"] },
  { text: "もらってうれしい！{特徴の}{商品}", tones: ["genki"], targets: ["gift"] },
  { text: "ギフトに迷ったら{商品}！", tones: ["genki"], targets: ["gift"] },
  { text: "ありがとうの気持ちに、{商品}", tones: ["yasashii"], targets: ["gift"] },
  { text: "{特徴}で、笑顔を届けよう", tones: ["yasashii"], targets: ["gift"] },
  { text: "大切な人へ、{商品}を。", tones: ["yasashii", "jouhin"], targets: ["gift"] },
  { text: "{特徴の}{商品}を、心に残る贈りものに。", tones: ["jouhin"], targets: ["gift"] },
  { text: "贈って喜ばれる、上質な{商品}。", tones: ["jouhin"], targets: ["gift"] },
];
