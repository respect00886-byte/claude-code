import type { MenuItem } from "../types";

/**
 * A small starter set of common convenience-store and chain-restaurant items,
 * so menu search is useful from day one. Values are approximate/illustrative —
 * verify against the current official nutrition info if precision matters, and
 * use the favorites feature to add or correct items as needed.
 */
export const starterMenu: MenuItem[] = [
  { id: "s1", name: "おにぎり(鮭)", brand: "コンビニ", calories: 180, protein: 4, fat: 3, carbs: 34 },
  { id: "s2", name: "おにぎり(ツナマヨ)", brand: "コンビニ", calories: 210, protein: 5, fat: 8, carbs: 30 },
  { id: "s3", name: "おにぎり(梅)", brand: "コンビニ", calories: 170, protein: 3, fat: 1, carbs: 38 },
  { id: "s4", name: "サラダチキン(プレーン)", brand: "コンビニ", calories: 110, protein: 24, fat: 1, carbs: 0 },
  { id: "s5", name: "サンドイッチ(ミックス)", brand: "コンビニ", calories: 350, protein: 12, fat: 16, carbs: 38 },
  { id: "s6", name: "から揚げ弁当", brand: "コンビニ", calories: 850, protein: 28, fat: 35, carbs: 100 },
  { id: "s7", name: "幕の内弁当", brand: "コンビニ", calories: 650, protein: 22, fat: 20, carbs: 90 },
  { id: "s8", name: "カップ麺(醤油)", brand: "コンビニ", calories: 400, protein: 10, fat: 16, carbs: 55 },
  { id: "s9", name: "肉まん", brand: "コンビニ", calories: 240, protein: 8, fat: 6, carbs: 38 },
  { id: "s10", name: "プロテインバー", brand: "コンビニ", calories: 200, protein: 15, fat: 7, carbs: 20 },
  { id: "s11", name: "ビッグマック", brand: "マクドナルド", calories: 525, protein: 26, fat: 28, carbs: 42 },
  { id: "s12", name: "チーズバーガー", brand: "マクドナルド", calories: 315, protein: 16, fat: 14, carbs: 30 },
  { id: "s13", name: "ポテト(M)", brand: "マクドナルド", calories: 410, protein: 4, fat: 20, carbs: 51 },
  { id: "s14", name: "牛丼(並盛)", brand: "吉野家", calories: 635, protein: 22, fat: 21, carbs: 92 },
  { id: "s15", name: "牛丼(並盛)", brand: "すき家", calories: 733, protein: 20, fat: 25, carbs: 104 },
  { id: "s16", name: "カレーライス(並盛)", brand: "松屋", calories: 640, protein: 13, fat: 20, carbs: 100 },
  { id: "s17", name: "醤油ラーメン", brand: "ラーメン店", calories: 500, protein: 20, fat: 15, carbs: 65 },
  { id: "s18", name: "そば(かけ)", brand: "立ち食いそば", calories: 320, protein: 12, fat: 3, carbs: 60 },
];
