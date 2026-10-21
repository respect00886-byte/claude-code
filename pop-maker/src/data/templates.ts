import type { Target, Tone } from "../types";

// キャッチコピーのひな形。置き換わる部分は次のとおり。
//   {商品}   … 商品名
//   {特徴}   … 特徴（「消せる」のような言葉は「消せること」にして、が・で・に が続いても自然にする）
//   {特徴の} … 商品名の前に付ける形（「ラメ入り」→「ラメ入りの」、「消せる」→「消せる」）
//   /        … POPで行を変えてよい位置（言葉の途中で改行されないよう、文節の区切りに入れる）。画面には出ない
// targets を省略したものは、どの対象でも使える共通の文。
export interface Template {
  text: string;
  tones: Tone[];
  targets?: Target[];
}

export const TEMPLATES: Template[] = [
  // ---- 共通 ----
  { text: "話題の/{商品}、入荷しました！", tones: ["genki"] },
  { text: "{特徴}が/うれしい！{商品}", tones: ["genki"] },
  { text: "イチオシ！{特徴の}/{商品}", tones: ["genki"] },
  { text: "売り場スタッフの/おすすめ！{商品}", tones: ["genki", "yasashii"] },
  { text: "選ぶなら、{特徴の}/{商品}。", tones: ["yasashii", "jouhin"] },
  { text: "毎日を/ちょっと/楽しく。{商品}", tones: ["yasashii"] },
  { text: "{特徴}が、うれしい/ポイント。", tones: ["yasashii"] },
  { text: "{特徴の}/{商品}で、ちいさな/贅沢。", tones: ["jouhin"] },
  { text: "{特徴}が/自慢の、{商品}。", tones: ["jouhin"] },
  // 特徴が空欄でも候補が少なくなりすぎないよう、特徴を使わない文も用意する
  { text: "注目！{商品}", tones: ["genki"] },
  { text: "ぜひ/手に取って/みてね！", tones: ["genki", "yasashii"] },
  { text: "あなたの/毎日に、{商品}", tones: ["yasashii"] },
  { text: "{商品}の/ある/暮らし。", tones: ["jouhin"] },
  { text: "長く/愛せる、{商品}。", tones: ["jouhin"] },
  { text: "ていねいに/選んだ、{商品}。", tones: ["jouhin"] },

  // ---- 子ども ----
  { text: "{商品}で/毎日/ワクワク！", tones: ["genki"], targets: ["kids"] },
  { text: "みんな/大好き！{商品}", tones: ["genki"], targets: ["kids"] },
  { text: "{特徴}で/たのしさ/アップ！", tones: ["genki"], targets: ["kids"] },
  { text: "がっこうでも/自慢しちゃおう！", tones: ["genki"], targets: ["kids"] },
  { text: "新学期の/おともに！{商品}", tones: ["genki"], targets: ["kids"] },
  { text: "はじめての/{商品}に/ぴったり", tones: ["yasashii"], targets: ["kids"] },
  { text: "{特徴の}/{商品}、つかって/みてね", tones: ["yasashii"], targets: ["kids"] },
  { text: "おべんきょうが/楽しくなる/{商品}", tones: ["yasashii"], targets: ["kids"] },
  { text: "長く/使える、確かな/{商品}。", tones: ["jouhin"], targets: ["kids"] },
  { text: "お子さまにも/安心。{特徴の}/{商品}", tones: ["jouhin", "yasashii"], targets: ["kids"] },

  // ---- 大人 ----
  { text: "仕事が/はかどる！{商品}", tones: ["genki"], targets: ["adult"] },
  { text: "{特徴}で/作業効率/アップ！", tones: ["genki"], targets: ["adult"] },
  { text: "大人も/夢中！{商品}", tones: ["genki"], targets: ["adult"] },
  { text: "がんばる/毎日に、{商品}", tones: ["yasashii"], targets: ["adult"] },
  { text: "{特徴}で、ほっと/ひと息。", tones: ["yasashii"], targets: ["adult"] },
  { text: "{特徴}が/心地よい、{商品}。", tones: ["jouhin"], targets: ["adult"] },
  { text: "手になじむ、大人の/{商品}。", tones: ["jouhin"], targets: ["adult"] },
  { text: "使うたびに、良さが/わかる。", tones: ["jouhin"], targets: ["adult"] },

  // ---- ファン向け ----
  { text: "ファン必見！{特徴の}/{商品}", tones: ["genki"], targets: ["fan"] },
  { text: "見逃せない！{商品}/登場！", tones: ["genki"], targets: ["fan"] },
  { text: "推し活に！{商品}", tones: ["genki"], targets: ["fan"] },
  { text: "集めたくなる！{特徴の}/{商品}", tones: ["genki"], targets: ["fan"] },
  { text: "お早めに！{商品}", tones: ["genki"], targets: ["fan"] },
  { text: "推しと/いっしょの/毎日を。", tones: ["yasashii"], targets: ["fan"] },
  { text: "{特徴}に、きゅん。{商品}", tones: ["yasashii"], targets: ["fan"] },
  { text: "大切に/使いたい、{商品}。", tones: ["yasashii", "jouhin"], targets: ["fan"] },
  { text: "{特徴}に/こだわった、特別な/一品。", tones: ["jouhin"], targets: ["fan"] },
  { text: "コレクションに/加えたい/{商品}。", tones: ["jouhin"], targets: ["fan"] },

  // ---- プレゼント ----
  { text: "プレゼントに/おすすめ！{商品}", tones: ["genki"], targets: ["gift"] },
  { text: "もらって/うれしい！{特徴の}/{商品}", tones: ["genki"], targets: ["gift"] },
  { text: "ギフトに/迷ったら/{商品}！", tones: ["genki"], targets: ["gift"] },
  { text: "ありがとうの/気持ちに、{商品}", tones: ["yasashii"], targets: ["gift"] },
  { text: "{特徴}で、笑顔を/届けよう", tones: ["yasashii"], targets: ["gift"] },
  { text: "大切な/人へ、{商品}を。", tones: ["yasashii", "jouhin"], targets: ["gift"] },
  { text: "{特徴の}/{商品}を、心に残る/贈りものに。", tones: ["jouhin"], targets: ["gift"] },
  { text: "贈って/喜ばれる、上質な/{商品}。", tones: ["jouhin"], targets: ["gift"] },
];
