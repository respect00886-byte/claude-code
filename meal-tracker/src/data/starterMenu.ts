import type { MenuItem } from "../types";

/**
 * A broad starter set of common convenience-store and chain-restaurant items,
 * so menu search is useful from day one. Many figures are sourced from each
 * chain's official published nutrition disclosures (as of research done in
 * October 2026); where no official figure could be found, values are
 * reasonable illustrative estimates. Verify against current official info if
 * precision matters, and use the favorites feature to add/correct items.
 */
export const starterMenu: MenuItem[] = [
  // セブンイレブン
  { id: "s1", name: "おにぎり もち麦おむすび 塩こんぶ枝豆", brand: "セブンイレブン", calories: 162, protein: 5, fat: 1, carbs: 34 },
  { id: "s2", name: "おにぎり もち麦おむすび 梅ひじき", brand: "セブンイレブン", calories: 160, protein: 5, fat: 2, carbs: 33 },
  { id: "s3", name: "手巻きおにぎり 炭火焼紅しゃけ", brand: "セブンイレブン", calories: 174, protein: 5, fat: 2, carbs: 36 },
  { id: "s4", name: "おにぎり(ツナマヨ)", brand: "セブンイレブン", calories: 258, protein: 5, fat: 11, carbs: 37 },
  { id: "s5", name: "おにぎり(おかか)", brand: "セブンイレブン", calories: 170, protein: 4, fat: 1, carbs: 38 },
  { id: "s6", name: "おにぎり(焼鮭)", brand: "セブンイレブン", calories: 181, protein: 5, fat: 1, carbs: 39 },
  { id: "s7", name: "おにぎり(辛子明太子)", brand: "セブンイレブン", calories: 173, protein: 5, fat: 1, carbs: 37 },
  { id: "s8", name: "おにぎり(梅)", brand: "セブンイレブン", calories: 176, protein: 3, fat: 1, carbs: 39 },
  { id: "s9", name: "おにぎり(紅鮭切り身)", brand: "セブンイレブン", calories: 184, protein: 6, fat: 1, carbs: 38 },
  { id: "s10", name: "サラダチキン(プレーン)", brand: "セブンイレブン", calories: 113, protein: 25, fat: 1, carbs: 1 },
  { id: "s11", name: "サラダチキン(スモーク)", brand: "セブンイレブン", calories: 138, protein: 29, fat: 2, carbs: 1 },
  { id: "s12", name: "サラダチキン(ハーブ)", brand: "セブンイレブン", calories: 124, protein: 27, fat: 2, carbs: 0 },
  { id: "s13", name: "からあげ弁当", brand: "セブンイレブン", calories: 820, protein: 27, fat: 34, carbs: 95 },
  { id: "s14", name: "幕の内弁当", brand: "セブンイレブン", calories: 628, protein: 25, fat: 15, carbs: 100 },
  { id: "s15", name: "和風幕の内弁当", brand: "セブンイレブン", calories: 512, protein: 21, fat: 8, carbs: 89 },
  { id: "s16", name: "メロンパン", brand: "セブンイレブン", calories: 363, protein: 8, fat: 14, carbs: 52 },
  { id: "s17", name: "カレーパン", brand: "セブンイレブン", calories: 244, protein: 5, fat: 11, carbs: 32 },

  // 吉野家
  { id: "s18", name: "牛丼(小盛)", brand: "吉野家", calories: 474, protein: 15, fat: 20, carbs: 61 },
  { id: "s19", name: "牛丼(並盛)", brand: "吉野家", calories: 633, protein: 20, fat: 24, carbs: 88 },
  { id: "s20", name: "牛丼(アタマの大盛)", brand: "吉野家", calories: 725, protein: 23, fat: 27, carbs: 89 },
  { id: "s21", name: "牛丼(大盛)", brand: "吉野家", calories: 823, protein: 25, fat: 29, carbs: 120 },
  { id: "s22", name: "牛丼(特盛)", brand: "吉野家", calories: 1006, protein: 34, fat: 44, carbs: 122 },
  { id: "s23", name: "牛丼(超特盛)", brand: "吉野家", calories: 1159, protein: 42, fat: 55, carbs: 150 },
  { id: "s24", name: "豚丼(並盛)", brand: "吉野家", calories: 598, protein: 20, fat: 18, carbs: 88 },
  { id: "s25", name: "牛鍋丼(並盛)", brand: "吉野家", calories: 647, protein: 21, fat: 23, carbs: 88 },
  { id: "s26", name: "牛カルビ丼(並盛)", brand: "吉野家", calories: 696, protein: 21, fat: 26, carbs: 85 },
  { id: "s27", name: "鰻重(並)", brand: "吉野家", calories: 750, protein: 25, fat: 20, carbs: 105 },
  { id: "s28", name: "牛皿定食(並盛)", brand: "吉野家", calories: 720, protein: 24, fat: 30, carbs: 70 },
  { id: "s29", name: "牛皿定食(大盛)", brand: "吉野家", calories: 783, protein: 27, fat: 33, carbs: 78 },
  { id: "s30", name: "牛皿定食(特盛)", brand: "吉野家", calories: 971, protein: 35, fat: 42, carbs: 95 },
  { id: "s31", name: "牛焼肉定食", brand: "吉野家", calories: 760, protein: 29, fat: 33, carbs: 88 },
  { id: "s32", name: "牛鉄板焼肉定食", brand: "吉野家", calories: 928, protein: 35, fat: 45, carbs: 85 },
  { id: "s33", name: "牛カルビ定食", brand: "吉野家", calories: 750, protein: 32, fat: 25, carbs: 70 },
  { id: "s34", name: "牛鮭定食", brand: "吉野家", calories: 662, protein: 28, fat: 22, carbs: 85 },
  { id: "s35", name: "ねぎ塩豚定食", brand: "吉野家", calories: 673, protein: 25, fat: 24, carbs: 80 },
  { id: "s36", name: "からあげ定食", brand: "吉野家", calories: 1168, protein: 42, fat: 59, carbs: 95 },
  { id: "s37", name: "牛すき鍋膳", brand: "吉野家", calories: 680, protein: 24, fat: 28, carbs: 78 },
  { id: "s38", name: "味噌汁", brand: "吉野家", calories: 20, protein: 1, fat: 1, carbs: 3 },
  { id: "s39", name: "あさり汁", brand: "吉野家", calories: 53, protein: 7, fat: 1, carbs: 3 },
  { id: "s40", name: "生野菜サラダ", brand: "吉野家", calories: 23, protein: 1, fat: 0, carbs: 5 },
  { id: "s41", name: "ポテトサラダ", brand: "吉野家", calories: 95, protein: 2, fat: 5, carbs: 12 },
  { id: "s42", name: "玉子(トッピング)", brand: "吉野家", calories: 76, protein: 6, fat: 5, carbs: 0 },
  { id: "s43", name: "ねぎ玉子(トッピング)", brand: "吉野家", calories: 103, protein: 7, fat: 6, carbs: 6 },
  { id: "s44", name: "納豆(トッピング)", brand: "吉野家", calories: 98, protein: 8, fat: 5, carbs: 6 },
  { id: "s45", name: "鮭(トッピング)", brand: "吉野家", calories: 133, protein: 14, fat: 9, carbs: 0 },
  { id: "s46", name: "キムチ(トッピング)", brand: "吉野家", calories: 26, protein: 1, fat: 0, carbs: 5 },
  { id: "s47", name: "のり(トッピング)", brand: "吉野家", calories: 5, protein: 1, fat: 0, carbs: 1 },

  { id: "s128", name: "牛皿(単品・並盛)", brand: "吉野家", calories: 281, protein: 17, fat: 20, carbs: 5 }, // calorie via aggregated 2024 menu table; macros estimated
  { id: "s129", name: "牛皿(単品・大盛)", brand: "吉野家", calories: 344, protein: 21, fat: 25, carbs: 6 }, // calorie via aggregated 2024 menu table; macros estimated
  { id: "s130", name: "牛皿(単品・特盛)", brand: "吉野家", calories: 532, protein: 32, fat: 39, carbs: 9 }, // calorie via aggregated 2024 menu table (uncertain jump vs 大盛; treat cautiously); macros estimated
  { id: "s131", name: "から揚げ定食(大盛)", brand: "吉野家", calories: 1366, protein: 51, fat: 73, carbs: 123 }, // FatSecret-sourced
  { id: "s132", name: "から揚げ定食(特盛)", brand: "吉野家", calories: 1563, protein: 60, fat: 88, carbs: 130 }, // FatSecret-sourced
  { id: "s133", name: "牛カルビ丼(小盛)", brand: "吉野家", calories: 568, protein: 17, fat: 23, carbs: 72 }, // calorie via FatSecret; macros estimated, scaled from 並盛
  { id: "s134", name: "牛カルビ丼(大盛)", brand: "吉野家", calories: 987, protein: 30, fat: 37, carbs: 128 }, // calorie via FatSecret; macros estimated, scaled from 並盛
  { id: "s135", name: "牛カルビ丼(特盛)", brand: "吉野家", calories: 1226, protein: 37, fat: 46, carbs: 165 }, // calorie via FatSecret; macros estimated, scaled from 並盛
  { id: "s136", name: "鰻皿(二枚盛)", brand: "吉野家", calories: 651, protein: 51, fat: 46, carbs: 12 }, // FatSecret-sourced
  { id: "s137", name: "鰻重(二枚盛)", brand: "吉野家", calories: 1068, protein: 45, fat: 43, carbs: 115 }, // [fully estimated] extrapolated from 鰻重(一枚盛)
  { id: "s138", name: "旨辛カレー", brand: "吉野家", calories: 604, protein: 18, fat: 15, carbs: 97 }, // FatSecret-sourced (archived listing)
  { id: "s139", name: "肉だくバタービーフカレー(並盛)", brand: "吉野家", calories: 788, protein: 22, fat: 31, carbs: 108 }, // FatSecret-sourced
  { id: "s140", name: "鉄板バタービーフカレー", brand: "吉野家", calories: 838, protein: 25, fat: 31, carbs: 118 }, // FatSecret-sourced
  { id: "s141", name: "焼鮭定食", brand: "吉野家", calories: 568, protein: 26, fat: 18, carbs: 75 }, // calorie via media comparison article; macros estimated
  { id: "s142", name: "ハムエッグ納豆定食", brand: "吉野家", calories: 581, protein: 28, fat: 22, carbs: 65 }, // calorie via FatSecret; macros estimated
  { id: "s143", name: "Wハムエッグ納豆定食", brand: "吉野家", calories: 683, protein: 35, fat: 28, carbs: 68 }, // calorie via FatSecret; macros estimated
  { id: "s144", name: "納豆牛小鉢定食", brand: "吉野家", calories: 612, protein: 26, fat: 20, carbs: 78 }, // calorie via FatSecret; macros estimated
  { id: "s145", name: "特朝定食(鮭)", brand: "吉野家", calories: 653, protein: 27, fat: 20, carbs: 88 }, // calorie via FatSecret; macros estimated
  { id: "s146", name: "牛鍋丼(大盛)", brand: "吉野家", calories: 841, protein: 27, fat: 30, carbs: 114 }, // [fully estimated] scaled from 並盛
  { id: "s147", name: "お新香(お漬物)", brand: "吉野家", calories: 20, protein: 1, fat: 0, carbs: 4 }, // [fully estimated]
  { id: "s148", name: "ご飯(並盛)", brand: "吉野家", calories: 252, protein: 4, fat: 1, carbs: 55 }, // [fully estimated], typical white-rice bowl figure
  { id: "s149", name: "ご飯(大盛)", brand: "吉野家", calories: 377, protein: 6, fat: 1, carbs: 83 }, // [fully estimated], typical white-rice bowl figure
  { id: "s150", name: "ハムエッグ(単品)", brand: "吉野家", calories: 190, protein: 13, fat: 14, carbs: 2 }, // [fully estimated]
  // はなまるうどん
  { id: "s48", name: "かけうどん(小)", brand: "はなまるうどん", calories: 292, protein: 6, fat: 2, carbs: 58 },
  { id: "s49", name: "かけうどん(中)", brand: "はなまるうどん", calories: 573, protein: 11, fat: 4, carbs: 112 },
  { id: "s50", name: "かけうどん(大)", brand: "はなまるうどん", calories: 856, protein: 16, fat: 6, carbs: 166 },
  { id: "s51", name: "おろししょうゆうどん(小)", brand: "はなまるうどん", calories: 294, protein: 6, fat: 2, carbs: 59 },
  { id: "s52", name: "わかめうどん(小)", brand: "はなまるうどん", calories: 299, protein: 7, fat: 2, carbs: 58 },
  { id: "s53", name: "ざるうどん(小)", brand: "はなまるうどん", calories: 312, protein: 6, fat: 1, carbs: 71 },
  { id: "s54", name: "釜上げうどん(小)", brand: "はなまるうどん", calories: 312, protein: 6, fat: 2, carbs: 62 },
  { id: "s55", name: "きつねうどん(小)", brand: "はなまるうどん", calories: 443, protein: 10, fat: 8, carbs: 75 },
  { id: "s56", name: "牛肉うどん(小)", brand: "はなまるうどん", calories: 497, protein: 15, fat: 12, carbs: 75 },
  { id: "s57", name: "カレーうどん(小)", brand: "はなまるうどん", calories: 522, protein: 9, fat: 16, carbs: 85 },
  { id: "s58", name: "カレーうどん(中)", brand: "はなまるうどん", calories: 866, protein: 16, fat: 21, carbs: 154 },
  { id: "s59", name: "温玉ぶっかけ(小)", brand: "はなまるうどん", calories: 380, protein: 9, fat: 8, carbs: 70 },
  { id: "s60", name: "釜玉うどん(小)", brand: "はなまるうどん", calories: 358, protein: 11, fat: 7, carbs: 60 },
  { id: "s61", name: "ぶっかけうどん(小)", brand: "はなまるうどん", calories: 290, protein: 8, fat: 2, carbs: 58 },
  { id: "s62", name: "ヤングコーン天", brand: "はなまるうどん", calories: 59, protein: 1, fat: 4, carbs: 6 },
  { id: "s63", name: "ごぼう天", brand: "はなまるうどん", calories: 70, protein: 1, fat: 4, carbs: 7 },
  { id: "s64", name: "なす天", brand: "はなまるうどん", calories: 90, protein: 1, fat: 6, carbs: 8 },
  { id: "s65", name: "れんこん天", brand: "はなまるうどん", calories: 109, protein: 1, fat: 6, carbs: 11 },
  { id: "s66", name: "ちくわ磯辺揚げ", brand: "はなまるうどん", calories: 142, protein: 5, fat: 6, carbs: 15 },
  { id: "s67", name: "とり天", brand: "はなまるうどん", calories: 142, protein: 11, fat: 7, carbs: 6 },
  { id: "s68", name: "大海老天", brand: "はなまるうどん", calories: 162, protein: 5, fat: 8, carbs: 15 },
  { id: "s69", name: "野菜かき揚げ", brand: "はなまるうどん", calories: 188, protein: 2, fat: 14, carbs: 15 },
  { id: "s70", name: "かしわ天", brand: "はなまるうどん", calories: 150, protein: 9, fat: 9, carbs: 10 },
  { id: "s71", name: "半熟たまご(トッピング)", brand: "はなまるうどん", calories: 76, protein: 6, fat: 5, carbs: 1 },
  { id: "s72", name: "いなり", brand: "はなまるうどん", calories: 110, protein: 3, fat: 4, carbs: 16 },
  { id: "s73", name: "おにぎり(昆布)", brand: "はなまるうどん", calories: 170, protein: 3, fat: 1, carbs: 37 },
  { id: "s74", name: "おでん(大根おろし)", brand: "はなまるうどん", calories: 4, protein: 0, fat: 0, carbs: 1 },
  { id: "s75", name: "おでん(こんにゃく)", brand: "はなまるうどん", calories: 13, protein: 0, fat: 0, carbs: 3 },
  { id: "s76", name: "おでん(牛すじ)", brand: "はなまるうどん", calories: 37, protein: 4, fat: 2, carbs: 1 },
  { id: "s77", name: "おでん(たまご)", brand: "はなまるうどん", calories: 79, protein: 6, fat: 5, carbs: 1 },

  { id: "s151", name: "きつねうどん(中)", brand: "はなまるうどん", calories: 716, protein: 16, fat: 13, carbs: 135 }, // calorie via scraped official-style listing; macros estimated
  { id: "s152", name: "きつねうどん(大)", brand: "はなまるうどん", calories: 975, protein: 22, fat: 18, carbs: 180 }, // calorie via scraped official-style listing; macros estimated
  { id: "s153", name: "カレーうどん(大)", brand: "はなまるうどん", calories: 1253, protein: 22, fat: 38, carbs: 210 }, // calorie via scraped official-style listing; macros estimated
  { id: "s154", name: "牛肉うどん(中)", brand: "はなまるうどん", calories: 870, protein: 26, fat: 21, carbs: 140 }, // [fully estimated] scaled from 小
  { id: "s155", name: "牛肉うどん(大)", brand: "はなまるうどん", calories: 1243, protein: 38, fat: 30, carbs: 200 }, // [fully estimated] scaled from 小
  { id: "s156", name: "おろししょうゆうどん(中)", brand: "はなまるうどん", calories: 576, protein: 12, fat: 4, carbs: 125 }, // [fully estimated] scaled from 小
  { id: "s157", name: "おろししょうゆうどん(大)", brand: "はなまるうどん", calories: 853, protein: 17, fat: 6, carbs: 180 }, // [fully estimated] scaled from 小
  { id: "s158", name: "わかめうどん(中)", brand: "はなまるうどん", calories: 586, protein: 14, fat: 4, carbs: 130 }, // [fully estimated] scaled from 小
  { id: "s159", name: "わかめうどん(大)", brand: "はなまるうどん", calories: 867, protein: 20, fat: 6, carbs: 180 }, // [fully estimated] scaled from 小
  { id: "s160", name: "ざるうどん(中)", brand: "はなまるうどん", calories: 593, protein: 11, fat: 2, carbs: 135 }, // [fully estimated] scaled from 小
  { id: "s161", name: "釜上げうどん(中)", brand: "はなまるうどん", calories: 593, protein: 11, fat: 4, carbs: 130 }, // [fully estimated] scaled from 小
  { id: "s162", name: "温玉ぶっかけ(中)", brand: "はなまるうどん", calories: 650, protein: 14, fat: 12, carbs: 120 }, // [fully estimated] scaled from 小
  { id: "s163", name: "釜玉うどん(中)", brand: "はなまるうどん", calories: 620, protein: 17, fat: 11, carbs: 110 }, // [fully estimated] scaled from 小
  { id: "s164", name: "ぶっかけうどん(中)", brand: "はなまるうどん", calories: 551, protein: 14, fat: 4, carbs: 110 }, // [fully estimated] scaled from 小
  { id: "s165", name: "豚しゃぶうどん(小)", brand: "はなまるうどん", calories: 510, protein: 18, fat: 16, carbs: 70 }, // calorie via FatSecret; macros estimated
  { id: "s166", name: "豚しゃぶうどん(中)", brand: "はなまるうどん", calories: 799, protein: 28, fat: 25, carbs: 115 }, // calorie via FatSecret; macros estimated
  { id: "s167", name: "豚しゃぶうどん(大)", brand: "はなまるうどん", calories: 1185, protein: 42, fat: 37, carbs: 165 }, // calorie via FatSecret; macros estimated
  { id: "s168", name: "おにぎり(辛子明太子)", brand: "はなまるうどん", calories: 181, protein: 3, fat: 1, carbs: 39 }, // calorie via scraped listing; macros estimated
  { id: "s169", name: "おにぎり(鮭)", brand: "はなまるうどん", calories: 191, protein: 4, fat: 2, carbs: 39 }, // calorie via scraped listing; macros estimated
  { id: "s170", name: "北海道男爵のコロッケ", brand: "はなまるうどん", calories: 231, protein: 3, fat: 12, carbs: 28 }, // FatSecret-sourced
  { id: "s171", name: "いか天", brand: "はなまるうどん", calories: 108, protein: 5, fat: 6, carbs: 9 }, // calorie via mynavi listing; macros estimated
  { id: "s172", name: "かぼちゃ天", brand: "はなまるうどん", calories: 124, protein: 1, fat: 8, carbs: 11 }, // calorie via scraped listing; macros estimated
  { id: "s173", name: "塩豚温玉ぶっかけ", brand: "はなまるうどん", calories: 450, protein: 16, fat: 14, carbs: 65 }, // [fully estimated]
  // 日高屋
  { id: "s78", name: "中華そば", brand: "日高屋", calories: 669, protein: 23, fat: 18, carbs: 84 },
  { id: "s79", name: "タンメン", brand: "日高屋", calories: 480, protein: 17, fat: 14, carbs: 68 },
  { id: "s80", name: "とんこつラーメン", brand: "日高屋", calories: 669, protein: 22, fat: 20, carbs: 85 },
  { id: "s81", name: "野菜たっぷりみそラーメン", brand: "日高屋", calories: 620, protein: 20, fat: 20, carbs: 82 },
  { id: "s82", name: "野菜たっぷりタンメン", brand: "日高屋", calories: 826, protein: 24, fat: 22, carbs: 100 },
  { id: "s83", name: "秘伝の辛味噌ラーメン", brand: "日高屋", calories: 1034, protein: 30, fat: 40, carbs: 120 },
  { id: "s84", name: "ネギタワー味噌ラーメン", brand: "日高屋", calories: 871, protein: 28, fat: 35, carbs: 100 },
  { id: "s85", name: "五目あんかけラーメン", brand: "日高屋", calories: 907, protein: 28, fat: 35, carbs: 110 },
  { id: "s86", name: "カタヤキソバ", brand: "日高屋", calories: 822, protein: 22, fat: 30, carbs: 100 },
  { id: "s87", name: "半ラーメン", brand: "日高屋", calories: 324, protein: 12, fat: 10, carbs: 40 },
  { id: "s88", name: "ワンタン麺", brand: "日高屋", calories: 755, protein: 22, fat: 16, carbs: 95 },
  { id: "s89", name: "ワンタン麺(大盛)", brand: "日高屋", calories: 949, protein: 28, fat: 20, carbs: 120 },
  { id: "s90", name: "肉そば", brand: "日高屋", calories: 520, protein: 22, fat: 16, carbs: 70 },
  { id: "s91", name: "冷やし中華", brand: "日高屋", calories: 550, protein: 18, fat: 14, carbs: 80 },
  { id: "s92", name: "餃子(3個)", brand: "日高屋", calories: 163, protein: 5, fat: 8, carbs: 12 },
  { id: "s93", name: "餃子(6個)", brand: "日高屋", calories: 326, protein: 10, fat: 16, carbs: 24 },
  { id: "s94", name: "チャーハン", brand: "日高屋", calories: 726, protein: 14, fat: 20, carbs: 95 },
  { id: "s95", name: "半チャーハン", brand: "日高屋", calories: 313, protein: 7, fat: 9, carbs: 45 },
  { id: "s96", name: "チャーハン(大盛)", brand: "日高屋", calories: 1052, protein: 20, fat: 28, carbs: 135 },
  { id: "s97", name: "ライス(普通)", brand: "日高屋", calories: 420, protein: 6, fat: 1, carbs: 92 },
  { id: "s98", name: "半ライス", brand: "日高屋", calories: 252, protein: 4, fat: 1, carbs: 55 },
  { id: "s99", name: "ライス(大盛)", brand: "日高屋", calories: 588, protein: 9, fat: 1, carbs: 129 },
  { id: "s100", name: "から揚げ単品(5個)", brand: "日高屋", calories: 743, protein: 30, fat: 45, carbs: 25 },
  { id: "s101", name: "から揚げ(3個)", brand: "日高屋", calories: 202, protein: 14, fat: 13, carbs: 9 },
  { id: "s102", name: "野菜炒め(単品)", brand: "日高屋", calories: 388, protein: 12, fat: 28, carbs: 20 },
  { id: "s103", name: "野菜炒め定食", brand: "日高屋", calories: 826, protein: 25, fat: 35, carbs: 90 },
  { id: "s104", name: "唐揚げ定食", brand: "日高屋", calories: 885, protein: 32, fat: 32, carbs: 108 },
  { id: "s105", name: "ニラレバ炒め定食", brand: "日高屋", calories: 982, protein: 35, fat: 45, carbs: 90 },
  { id: "s106", name: "バクダン炒め定食", brand: "日高屋", calories: 960, protein: 30, fat: 45, carbs: 90 },
  { id: "s107", name: "W餃子定食(白菜キムチ)", brand: "日高屋", calories: 1120, protein: 30, fat: 50, carbs: 110 },
  { id: "s108", name: "生姜焼き定食", brand: "日高屋", calories: 1070, protein: 35, fat: 41, carbs: 130 }, // FatSecret-sourced
  { id: "s109", name: "汁なしラーメン(油そば)", brand: "日高屋", calories: 1036, protein: 27, fat: 46, carbs: 127 }, // calorie via FatSecret(archived); macros estimated
  { id: "s110", name: "味玉とんこつラーメン", brand: "日高屋", calories: 749, protein: 27, fat: 27, carbs: 95 }, // [fully estimated] base + flavored egg
  { id: "s111", name: "ニラレバ炒め(単品)", brand: "日高屋", calories: 473, protein: 22, fat: 33, carbs: 16 }, // calorie via ranking.net; macros estimated
  { id: "s112", name: "バクダン炒め(単品)", brand: "日高屋", calories: 430, protein: 17, fat: 30, carbs: 22 }, // [fully estimated]
  { id: "s113", name: "水餃子(6個)", brand: "日高屋", calories: 250, protein: 9, fat: 9, carbs: 32 }, // [fully estimated]
  { id: "s114", name: "五目春巻き(2本)", brand: "日高屋", calories: 220, protein: 6, fat: 12, carbs: 21 }, // [fully estimated]
  { id: "s115", name: "中華そば(大盛)", brand: "日高屋", calories: 849, protein: 29, fat: 23, carbs: 107 }, // estimated, scaled from 並盛
  { id: "s116", name: "タンメン(大盛)", brand: "日高屋", calories: 660, protein: 23, fat: 19, carbs: 93 }, // estimated, scaled from 並盛
  { id: "s117", name: "とんこつラーメン(大盛)", brand: "日高屋", calories: 849, protein: 28, fat: 25, carbs: 108 }, // estimated, scaled from 並盛
  { id: "s118", name: "野菜たっぷりみそラーメン(大盛)", brand: "日高屋", calories: 820, protein: 26, fat: 26, carbs: 108 }, // estimated, scaled from 並盛
  { id: "s119", name: "秘伝の辛味噌ラーメン(大盛)", brand: "日高屋", calories: 1234, protein: 36, fat: 48, carbs: 143 }, // estimated, scaled from 並盛
  { id: "s120", name: "五目あんかけラーメン(大盛)", brand: "日高屋", calories: 1107, protein: 34, fat: 43, carbs: 134 }, // estimated, scaled from 並盛
  { id: "s121", name: "ラ・餃・チャセット", brand: "日高屋", calories: 800, protein: 24, fat: 27, carbs: 97 }, // estimated, = 半ラーメン+半チャーハン+餃子3個
  { id: "s122", name: "おつまみ枝豆", brand: "日高屋", calories: 110, protein: 9, fat: 5, carbs: 8 }, // [fully estimated]
  { id: "s123", name: "おつまみネギチャーシュー", brand: "日高屋", calories: 180, protein: 18, fat: 11, carbs: 3 }, // [fully estimated]
  { id: "s124", name: "コリ旨!砂肝", brand: "日高屋", calories: 150, protein: 17, fat: 8, carbs: 2 }, // [fully estimated]
  { id: "s125", name: "三品盛り合わせ", brand: "日高屋", calories: 280, protein: 15, fat: 18, carbs: 13 }, // [fully estimated]
  { id: "s126", name: "冷やし中華(大盛)", brand: "日高屋", calories: 770, protein: 25, fat: 20, carbs: 120 }, // estimated, scaled from 並盛
  { id: "s127", name: "肉そば(大盛)", brand: "日高屋", calories: 728, protein: 31, fat: 22, carbs: 98 }, // estimated, scaled from 並盛
];
