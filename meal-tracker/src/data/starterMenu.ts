import type { MenuItem } from "../types";

/**
 * A broad starter set of common convenience-store and chain-restaurant items,
 * so menu search is useful from day one. Values are approximate/illustrative —
 * verify against the current official nutrition info if precision matters, and
 * use the favorites feature to add or correct items as needed.
 */
export const starterMenu: MenuItem[] = [
  // セブンイレブン
  { id: "s1", name: "おにぎり(鮭)", brand: "セブンイレブン", calories: 180, protein: 4, fat: 3, carbs: 34 },
  { id: "s2", name: "おにぎり(ツナマヨ)", brand: "セブンイレブン", calories: 210, protein: 5, fat: 8, carbs: 30 },
  { id: "s3", name: "おにぎり(明太子)", brand: "セブンイレブン", calories: 175, protein: 4, fat: 2, carbs: 35 },
  { id: "s4", name: "サラダチキン(プレーン)", brand: "セブンイレブン", calories: 110, protein: 24, fat: 1, carbs: 0 },
  { id: "s5", name: "サラダチキン(ハーブ)", brand: "セブンイレブン", calories: 115, protein: 23, fat: 2, carbs: 1 },
  { id: "s6", name: "からあげ棒", brand: "セブンイレブン", calories: 180, protein: 12, fat: 11, carbs: 8 },
  { id: "s7", name: "からあげ弁当", brand: "セブンイレブン", calories: 820, protein: 27, fat: 34, carbs: 95 },
  { id: "s8", name: "幕の内弁当", brand: "セブンイレブン", calories: 650, protein: 22, fat: 20, carbs: 90 },
  { id: "s9", name: "サンドイッチ(ミックス)", brand: "セブンイレブン", calories: 350, protein: 12, fat: 16, carbs: 38 },
  { id: "s10", name: "カップ麺(醤油)", brand: "セブンイレブン", calories: 400, protein: 10, fat: 16, carbs: 55 },

  // ローソン
  { id: "s11", name: "おにぎり(鮭)", brand: "ローソン", calories: 178, protein: 4, fat: 3, carbs: 34 },
  { id: "s12", name: "からあげクン(レギュラー)", brand: "ローソン", calories: 240, protein: 13, fat: 14, carbs: 15 },
  { id: "s13", name: "からあげクン(レッド)", brand: "ローソン", calories: 250, protein: 13, fat: 15, carbs: 16 },
  { id: "s14", name: "サラダチキン(プレーン)", brand: "ローソン", calories: 105, protein: 23, fat: 1, carbs: 1 },
  { id: "s15", name: "糖質オフブラン食パン", brand: "ローソン", calories: 180, protein: 9, fat: 5, carbs: 25 },
  { id: "s16", name: "からあげ弁当", brand: "ローソン", calories: 800, protein: 26, fat: 33, carbs: 92 },
  { id: "s17", name: "パスタサラダ", brand: "ローソン", calories: 320, protein: 6, fat: 18, carbs: 33 },
  { id: "s18", name: "肉まん", brand: "ローソン", calories: 240, protein: 8, fat: 6, carbs: 38 },

  // ファミリーマート
  { id: "s19", name: "ファミチキ", brand: "ファミリーマート", calories: 240, protein: 13, fat: 16, carbs: 11 },
  { id: "s20", name: "ハーフチキン", brand: "ファミリーマート", calories: 130, protein: 10, fat: 8, carbs: 6 },
  { id: "s21", name: "お母さん食堂 幕の内弁当", brand: "ファミリーマート", calories: 640, protein: 21, fat: 19, carbs: 88 },
  { id: "s22", name: "おにぎり(ツナマヨ)", brand: "ファミリーマート", calories: 212, protein: 5, fat: 8, carbs: 30 },
  { id: "s23", name: "サラダチキンバー(プレーン)", brand: "ファミリーマート", calories: 90, protein: 20, fat: 1, carbs: 1 },
  { id: "s24", name: "famima!!プレミアムサンド(たまご)", brand: "ファミリーマート", calories: 330, protein: 11, fat: 18, carbs: 32 },
  { id: "s25", name: "大きな大きな肉まん", brand: "ファミリーマート", calories: 290, protein: 10, fat: 7, carbs: 46 },
  { id: "s26", name: "カップ麺(味噌)", brand: "ファミリーマート", calories: 420, protein: 11, fat: 17, carbs: 56 },

  // ミニストップ
  { id: "s27", name: "おにぎり(鮭)", brand: "ミニストップ", calories: 176, protein: 4, fat: 3, carbs: 33 },
  { id: "s28", name: "からあげ", brand: "ミニストップ", calories: 300, protein: 18, fat: 20, carbs: 12 },
  { id: "s29", name: "ソフトクリーム", brand: "ミニストップ", calories: 210, protein: 4, fat: 10, carbs: 27 },

  // マクドナルド
  { id: "s30", name: "ビッグマック", brand: "マクドナルド", calories: 525, protein: 26, fat: 28, carbs: 42 },
  { id: "s31", name: "チーズバーガー", brand: "マクドナルド", calories: 315, protein: 16, fat: 14, carbs: 30 },
  { id: "s32", name: "てりやきマックバーガー", brand: "マクドナルド", calories: 495, protein: 18, fat: 24, carbs: 51 },
  { id: "s33", name: "ダブルチーズバーガー", brand: "マクドナルド", calories: 455, protein: 25, fat: 24, carbs: 32 },
  { id: "s34", name: "マックフライポテト(M)", brand: "マクドナルド", calories: 410, protein: 4, fat: 20, carbs: 51 },
  { id: "s35", name: "チキンマックナゲット(5piece)", brand: "マクドナルド", calories: 270, protein: 14, fat: 17, carbs: 14 },
  { id: "s36", name: "エグチ(エッグマックマフィン)", brand: "マクドナルド", calories: 300, protein: 17, fat: 12, carbs: 30 },
  { id: "s37", name: "シャカシャカチキン", brand: "マクドナルド", calories: 250, protein: 15, fat: 16, carbs: 12 },

  // モスバーガー
  { id: "s38", name: "モスバーガー", brand: "モスバーガー", calories: 370, protein: 15, fat: 18, carbs: 36 },
  { id: "s39", name: "テリヤキバーガー", brand: "モスバーガー", calories: 420, protein: 15, fat: 19, carbs: 48 },
  { id: "s40", name: "モスチキン", brand: "モスバーガー", calories: 280, protein: 16, fat: 17, carbs: 14 },
  { id: "s41", name: "フレンチフライポテト(S)", brand: "モスバーガー", calories: 230, protein: 3, fat: 11, carbs: 29 },
  { id: "s42", name: "野菜生活(紙パック)", brand: "モスバーガー", calories: 80, protein: 1, fat: 0, carbs: 19 },

  // ケンタッキーフライドチキン
  { id: "s43", name: "オリジナルチキン", brand: "ケンタッキー", calories: 237, protein: 17, fat: 15, carbs: 7 },
  { id: "s44", name: "レッドホットチキン", brand: "ケンタッキー", calories: 248, protein: 17, fat: 16, carbs: 8 },
  { id: "s45", name: "ビスケット", brand: "ケンタッキー", calories: 231, protein: 4, fat: 11, carbs: 29 },
  { id: "s46", name: "チキンフィレサンド", brand: "ケンタッキー", calories: 450, protein: 21, fat: 20, carbs: 45 },

  // バーガーキング
  { id: "s47", name: "ワッパー", brand: "バーガーキング", calories: 630, protein: 28, fat: 36, carbs: 50 },
  { id: "s48", name: "チーズワッパー", brand: "バーガーキング", calories: 700, protein: 31, fat: 42, carbs: 51 },
  { id: "s49", name: "オニオンリング(M)", brand: "バーガーキング", calories: 300, protein: 4, fat: 16, carbs: 36 },

  // 吉野家
  { id: "s50", name: "牛丼(並盛)", brand: "吉野家", calories: 635, protein: 22, fat: 21, carbs: 92 },
  { id: "s51", name: "牛丼(大盛)", brand: "吉野家", calories: 850, protein: 28, fat: 28, carbs: 123 },
  { id: "s52", name: "豚丼(並盛)", brand: "吉野家", calories: 598, protein: 20, fat: 18, carbs: 88 },
  { id: "s53", name: "牛鍋丼(並盛)", brand: "吉野家", calories: 647, protein: 21, fat: 23, carbs: 88 },
  { id: "s54", name: "牛焼肉定食", brand: "吉野家", calories: 760, protein: 29, fat: 33, carbs: 88 },

  // すき家
  { id: "s55", name: "牛丼(並盛)", brand: "すき家", calories: 733, protein: 20, fat: 25, carbs: 104 },
  { id: "s56", name: "牛丼(ミニ)", brand: "すき家", calories: 489, protein: 13, fat: 17, carbs: 69 },
  { id: "s57", name: "キムチ牛丼(並盛)", brand: "すき家", calories: 763, protein: 21, fat: 26, carbs: 108 },
  { id: "s58", name: "とん汁牛丼(並盛)", brand: "すき家", calories: 820, protein: 24, fat: 30, carbs: 108 },
  { id: "s59", name: "うな丼(並盛)", brand: "すき家", calories: 635, protein: 22, fat: 17, carbs: 99 },

  // 松屋
  { id: "s60", name: "牛めし(並盛)", brand: "松屋", calories: 650, protein: 20, fat: 22, carbs: 94 },
  { id: "s61", name: "カレーライス(並盛)", brand: "松屋", calories: 640, protein: 13, fat: 20, carbs: 100 },
  { id: "s62", name: "豚めし(並盛)", brand: "松屋", calories: 600, protein: 19, fat: 17, carbs: 92 },
  { id: "s63", name: "牛焼肉定食", brand: "松屋", calories: 820, protein: 30, fat: 36, carbs: 90 },

  // なか卯
  { id: "s64", name: "親子丼(並)", brand: "なか卯", calories: 650, protein: 24, fat: 16, carbs: 98 },
  { id: "s65", name: "牛丼(並)", brand: "なか卯", calories: 640, protein: 20, fat: 19, carbs: 95 },
  { id: "s66", name: "きつねうどん", brand: "なか卯", calories: 480, protein: 15, fat: 11, carbs: 78 },

  // CoCo壱番屋
  { id: "s67", name: "ポークカレー(普通盛)", brand: "CoCo壱番屋", calories: 660, protein: 17, fat: 22, carbs: 95 },
  { id: "s68", name: "チキンカツカレー(普通盛)", brand: "CoCo壱番屋", calories: 1020, protein: 33, fat: 42, carbs: 125 },
  { id: "s69", name: "ほうれん草カレー(普通盛)", brand: "CoCo壱番屋", calories: 700, protein: 15, fat: 24, carbs: 102 },

  // サイゼリヤ
  { id: "s70", name: "ミラノ風ドリア", brand: "サイゼリヤ", calories: 470, protein: 13, fat: 18, carbs: 62 },
  { id: "s71", name: "半熟卵のミラノ風ドリア", brand: "サイゼリヤ", calories: 510, protein: 15, fat: 21, carbs: 63 },
  { id: "s72", name: "ペペロンチーノ", brand: "サイゼリヤ", calories: 460, protein: 11, fat: 15, carbs: 70 },
  { id: "s73", name: "小エビのサラダ", brand: "サイゼリヤ", calories: 110, protein: 7, fat: 5, carbs: 10 },

  // ガスト
  { id: "s74", name: "ハンバーグ(チーズ in)", brand: "ガスト", calories: 650, protein: 28, fat: 42, carbs: 38 },
  { id: "s75", name: "チキン南蛮定食", brand: "ガスト", calories: 820, protein: 32, fat: 38, carbs: 85 },
  { id: "s76", name: "ミートドリア", brand: "ガスト", calories: 600, protein: 18, fat: 25, carbs: 73 },

  // びっくりドンキー
  { id: "s77", name: "チーズバーグディッシュ", brand: "びっくりドンキー", calories: 700, protein: 30, fat: 40, carbs: 55 },
  { id: "s78", name: "やさいベジバーグディッシュ", brand: "びっくりドンキー", calories: 550, protein: 22, fat: 28, carbs: 52 },

  // スターバックス
  { id: "s79", name: "ドリップコーヒー(Tall)", brand: "スターバックス", calories: 5, protein: 0, fat: 0, carbs: 1 },
  { id: "s80", name: "キャラメルマキアート(Tall)", brand: "スターバックス", calories: 210, protein: 8, fat: 7, carbs: 29 },
  { id: "s81", name: "抹茶ティーラテ(Tall)", brand: "スターバックス", calories: 230, protein: 9, fat: 7, carbs: 32 },
  { id: "s82", name: "ベーコンエピ", brand: "スターバックス", calories: 350, protein: 12, fat: 16, carbs: 38 },
  { id: "s83", name: "バナナ", brand: "スターバックス", calories: 90, protein: 1, fat: 0, carbs: 23 },

  // ドトール
  { id: "s84", name: "ブレンドコーヒー(M)", brand: "ドトール", calories: 10, protein: 0, fat: 0, carbs: 2 },
  { id: "s85", name: "ミラノサンド(A)", brand: "ドトール", calories: 390, protein: 15, fat: 16, carbs: 44 },
  { id: "s86", name: "ジャーマンドッグ", brand: "ドトール", calories: 330, protein: 11, fat: 20, carbs: 26 },
  { id: "s87", name: "ミラノサンドA(たまご)", brand: "ドトール", calories: 410, protein: 16, fat: 20, carbs: 40 },

  // タリーズコーヒー
  { id: "s88", name: "カフェラテ(Tall)", brand: "タリーズ", calories: 140, protein: 7, fat: 7, carbs: 11 },
  { id: "s89", name: "ハニーミルクフランス", brand: "タリーズ", calories: 310, protein: 8, fat: 7, carbs: 53 },
  { id: "s90", name: "ベイクドチーズケーキ", brand: "タリーズ", calories: 300, protein: 6, fat: 20, carbs: 24 },

  // 丸亀製麺
  { id: "s91", name: "かけうどん(並)", brand: "丸亀製麺", calories: 290, protein: 8, fat: 2, carbs: 58 },
  { id: "s92", name: "肉うどん(並)", brand: "丸亀製麺", calories: 540, protein: 20, fat: 16, carbs: 75 },
  { id: "s93", name: "ぶっかけうどん(並)", brand: "丸亀製麺", calories: 410, protein: 11, fat: 4, carbs: 80 },
  { id: "s94", name: "野菜かき揚げ", brand: "丸亀製麺", calories: 180, protein: 3, fat: 12, carbs: 16 },

  // はなまるうどん
  { id: "s95", name: "かけうどん(並)", brand: "はなまるうどん", calories: 280, protein: 7, fat: 2, carbs: 56 },
  { id: "s96", name: "ちくわ天", brand: "はなまるうどん", calories: 120, protein: 6, fat: 6, carbs: 11 },

  // リンガーハット
  { id: "s97", name: "長崎ちゃんぽん", brand: "リンガーハット", calories: 711, protein: 28, fat: 27, carbs: 90 },
  { id: "s98", name: "長崎皿うどん", brand: "リンガーハット", calories: 870, protein: 26, fat: 40, carbs: 100 },
  { id: "s99", name: "野菜たっぷり餃子(5個)", brand: "リンガーハット", calories: 180, protein: 7, fat: 9, carbs: 18 },

  // 餃子の王将
  { id: "s100", name: "餃子(6個)", brand: "餃子の王将", calories: 300, protein: 10, fat: 18, carbs: 26 },
  { id: "s101", name: "天津飯", brand: "餃子の王将", calories: 750, protein: 18, fat: 28, carbs: 102 },
  { id: "s102", name: "炒飯", brand: "餃子の王将", calories: 670, protein: 14, fat: 22, carbs: 100 },
  { id: "s103", name: "酢豚", brand: "餃子の王将", calories: 480, protein: 16, fat: 26, carbs: 42 },

  // 日高屋
  { id: "s104", name: "中華そば", brand: "日高屋", calories: 440, protein: 18, fat: 10, carbs: 65 },
  { id: "s105", name: "タンメン", brand: "日高屋", calories: 480, protein: 17, fat: 14, carbs: 68 },
  { id: "s106", name: "野菜たっぷりみそラーメン", brand: "日高屋", calories: 620, protein: 20, fat: 20, carbs: 82 },

  // 幸楽苑
  { id: "s107", name: "中華そば", brand: "幸楽苑", calories: 430, protein: 16, fat: 9, carbs: 68 },
  { id: "s108", name: "味噌ラーメン", brand: "幸楽苑", calories: 560, protein: 19, fat: 17, carbs: 78 },

  // 築地銀だこ
  { id: "s109", name: "たこ焼き(8個)", brand: "築地銀だこ", calories: 400, protein: 12, fat: 16, carbs: 50 },

  // スシロー
  { id: "s110", name: "にぎり寿司(2貫×5種盛り合わせ)", brand: "スシロー", calories: 420, protein: 20, fat: 5, carbs: 70 },
];
