import type { MenuItem } from "../types";

/**
 * Generic (non-branded) reference nutrition values for common Japanese dishes
 * and foods, for when the user wants "a typical serving of X" rather than a
 * specific product. Values are rough estimates for a standard single serving,
 * in the spirit of typical figures cited in Japanese food composition
 * references (食品成分表) — not measurements of any specific verified product.
 * Every item shares brand: "目安" ("approximate reference") so the existing
 * brand-chip filter surfaces them all under one "目安" chip.
 */
export const genericFoods: MenuItem[] = [
  // ご飯・主食
  { id: "g1", name: "白ご飯(茶碗1杯 150g)", brand: "目安", calories: 252, protein: 4, fat: 0, carbs: 55 },
  { id: "g2", name: "玄米ご飯(茶碗1杯 150g)", brand: "目安", calories: 248, protein: 5, fat: 1, carbs: 53 },
  { id: "g3", name: "食パン(6枚切り1枚)", brand: "目安", calories: 158, protein: 6, fat: 3, carbs: 28 },
  { id: "g4", name: "おにぎり(具なし)", brand: "目安", calories: 170, protein: 3, fat: 0, carbs: 39 },
  { id: "g5", name: "パスタ(茹で100g)", brand: "目安", calories: 165, protein: 6, fat: 1, carbs: 32 },
  { id: "g6", name: "お粥(茶碗1杯)", brand: "目安", calories: 100, protein: 2, fat: 0, carbs: 22 },
  { id: "g7", name: "もち(1個)", brand: "目安", calories: 118, protein: 2, fat: 0, carbs: 26 },

  // 卵・大豆製品
  { id: "g8", name: "卵焼き", brand: "目安", calories: 150, protein: 10, fat: 11, carbs: 3 },
  { id: "g9", name: "目玉焼き", brand: "目安", calories: 90, protein: 6, fat: 7, carbs: 0 },
  { id: "g10", name: "ゆで卵(1個)", brand: "目安", calories: 76, protein: 6, fat: 5, carbs: 0 },
  { id: "g11", name: "納豆(1パック)", brand: "目安", calories: 100, protein: 8, fat: 5, carbs: 6 },
  { id: "g12", name: "冷奴(豆腐1/2丁)", brand: "目安", calories: 100, protein: 8, fat: 6, carbs: 2 },
  { id: "g13", name: "厚揚げ", brand: "目安", calories: 150, protein: 11, fat: 11, carbs: 1 },
  { id: "g14", name: "茶碗蒸し", brand: "目安", calories: 90, protein: 7, fat: 4, carbs: 5 },
  { id: "g15", name: "だし巻き卵", brand: "目安", calories: 140, protein: 9, fat: 10, carbs: 3 },

  // 肉料理
  { id: "g16", name: "唐揚げ(3個)", brand: "目安", calories: 270, protein: 16, fat: 18, carbs: 10 },
  { id: "g17", name: "とんかつ", brand: "目安", calories: 450, protein: 22, fat: 30, carbs: 20 },
  { id: "g18", name: "生姜焼き", brand: "目安", calories: 350, protein: 20, fat: 24, carbs: 10 },
  { id: "g19", name: "ハンバーグ", brand: "目安", calories: 350, protein: 18, fat: 24, carbs: 12 },
  { id: "g20", name: "焼き鳥(たれ・1本)", brand: "目安", calories: 90, protein: 8, fat: 5, carbs: 4 },
  { id: "g21", name: "焼き鳥(塩・1本)", brand: "目安", calories: 80, protein: 9, fat: 5, carbs: 0 },
  { id: "g22", name: "肉じゃが", brand: "目安", calories: 280, protein: 13, fat: 9, carbs: 35 },
  { id: "g23", name: "餃子(5個)", brand: "目安", calories: 220, protein: 8, fat: 11, carbs: 22 },
  { id: "g24", name: "麻婆豆腐", brand: "目安", calories: 320, protein: 16, fat: 22, carbs: 12 },
  { id: "g25", name: "回鍋肉", brand: "目安", calories: 380, protein: 18, fat: 26, carbs: 14 },
  { id: "g26", name: "鶏の照り焼き", brand: "目安", calories: 300, protein: 25, fat: 16, carbs: 12 },
  { id: "g27", name: "すき焼き(1人前)", brand: "目安", calories: 450, protein: 25, fat: 28, carbs: 20 },
  { id: "g28", name: "牛丼の具", brand: "目安", calories: 400, protein: 15, fat: 20, carbs: 38 },

  // 魚料理
  { id: "g29", name: "焼き鮭(1切れ)", brand: "目安", calories: 140, protein: 20, fat: 6, carbs: 0 },
  { id: "g30", name: "鯖の味噌煮", brand: "目安", calories: 280, protein: 18, fat: 18, carbs: 10 },
  { id: "g31", name: "刺身盛り合わせ(5〜6切れ)", brand: "目安", calories: 120, protein: 20, fat: 3, carbs: 2 },
  { id: "g32", name: "ぶりの照り焼き", brand: "目安", calories: 270, protein: 20, fat: 18, carbs: 8 },
  { id: "g33", name: "アジフライ", brand: "目安", calories: 220, protein: 15, fat: 13, carbs: 12 },
  { id: "g34", name: "さんまの塩焼き(1尾)", brand: "目安", calories: 310, protein: 19, fat: 25, carbs: 0 },
  { id: "g35", name: "えびフライ(3尾)", brand: "目安", calories: 240, protein: 14, fat: 12, carbs: 20 },

  // 野菜・サラダ・汁物
  { id: "g36", name: "味噌汁", brand: "目安", calories: 40, protein: 3, fat: 1, carbs: 5 },
  { id: "g37", name: "きんぴらごぼう", brand: "目安", calories: 90, protein: 2, fat: 4, carbs: 12 },
  { id: "g38", name: "ほうれん草のおひたし", brand: "目安", calories: 30, protein: 3, fat: 0, carbs: 4 },
  { id: "g39", name: "野菜炒め", brand: "目安", calories: 150, protein: 5, fat: 10, carbs: 11 },
  { id: "g40", name: "ポテトサラダ", brand: "目安", calories: 200, protein: 3, fat: 13, carbs: 18 },
  { id: "g41", name: "豚汁", brand: "目安", calories: 140, protein: 8, fat: 8, carbs: 10 },
  { id: "g42", name: "切り干し大根の煮物", brand: "目安", calories: 80, protein: 3, fat: 2, carbs: 13 },
  { id: "g43", name: "もやしのナムル", brand: "目安", calories: 50, protein: 2, fat: 3, carbs: 4 },
  { id: "g44", name: "グリーンサラダ(ドレッシング込み)", brand: "目安", calories: 100, protein: 2, fat: 8, carbs: 6 },
  { id: "g45", name: "けんちん汁", brand: "目安", calories: 110, protein: 6, fat: 5, carbs: 10 },
  { id: "g46", name: "ひじきの煮物", brand: "目安", calories: 90, protein: 3, fat: 4, carbs: 10 },
  { id: "g47", name: "筑前煮", brand: "目安", calories: 220, protein: 10, fat: 9, carbs: 25 },

  // 麺類(自炊・一般)
  { id: "g48", name: "かけうどん", brand: "目安", calories: 350, protein: 10, fat: 3, carbs: 70 },
  { id: "g49", name: "焼きそば", brand: "目安", calories: 550, protein: 15, fat: 20, carbs: 78 },
  { id: "g50", name: "冷やし中華", brand: "目安", calories: 450, protein: 16, fat: 14, carbs: 65 },
  { id: "g51", name: "ざるそば", brand: "目安", calories: 300, protein: 10, fat: 2, carbs: 60 },
  { id: "g52", name: "醤油ラーメン", brand: "目安", calories: 470, protein: 20, fat: 12, carbs: 68 },
  { id: "g53", name: "チャーハン", brand: "目安", calories: 600, protein: 14, fat: 20, carbs: 90 },
  { id: "g54", name: "カレーライス", brand: "目安", calories: 700, protein: 15, fat: 22, carbs: 105 },
  { id: "g55", name: "親子丼", brand: "目安", calories: 600, protein: 25, fat: 16, carbs: 90 },

  // 果物・乳製品
  { id: "g56", name: "バナナ1本", brand: "目安", calories: 90, protein: 1, fat: 0, carbs: 23 },
  { id: "g57", name: "りんご1個", brand: "目安", calories: 130, protein: 0, fat: 0, carbs: 35 },
  { id: "g58", name: "ヨーグルト(1カップ)", brand: "目安", calories: 100, protein: 5, fat: 3, carbs: 12 },
  { id: "g59", name: "牛乳(コップ1杯 200ml)", brand: "目安", calories: 134, protein: 7, fat: 8, carbs: 10 },
  { id: "g60", name: "チーズ(1切れ)", brand: "目安", calories: 70, protein: 4, fat: 6, carbs: 0 },
  { id: "g61", name: "みかん1個", brand: "目安", calories: 45, protein: 1, fat: 0, carbs: 12 },
  { id: "g62", name: "ぶどう(1房の目安量)", brand: "目安", calories: 90, protein: 1, fat: 0, carbs: 23 },

  // 間食・その他
  { id: "g63", name: "みたらし団子(1本)", brand: "目安", calories: 130, protein: 2, fat: 0, carbs: 29 },
  { id: "g64", name: "大福(1個)", brand: "目安", calories: 180, protein: 3, fat: 1, carbs: 40 },
  { id: "g65", name: "ポテトチップス(1袋の目安量)", brand: "目安", calories: 340, protein: 3, fat: 22, carbs: 32 },
  { id: "g66", name: "アーモンド(一掴み 約20g)", brand: "目安", calories: 120, protein: 4, fat: 10, carbs: 4 },
  { id: "g67", name: "プロテインバー(1本)", brand: "目安", calories: 200, protein: 15, fat: 7, carbs: 20 },
  { id: "g68", name: "ショートケーキ(1切れ)", brand: "目安", calories: 350, protein: 5, fat: 18, carbs: 42 },
  { id: "g69", name: "どら焼き(1個)", brand: "目安", calories: 280, protein: 6, fat: 4, carbs: 55 },
  { id: "g70", name: "プリン(1個)", brand: "目安", calories: 150, protein: 5, fat: 5, carbs: 22 },
];
