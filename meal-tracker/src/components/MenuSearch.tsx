import { useMemo, useState } from "react";
import type { MenuItem } from "../types";
import { starterMenu } from "../data/starterMenu";
import { genericFoods } from "../data/genericFoods";
import { extractBrands, searchMenuItems } from "../lib/search";

interface MenuSearchProps {
  favorites: MenuItem[];
  onQuickAdd: (item: MenuItem) => void;
  onAddFavorite: (item: Omit<MenuItem, "id">) => void;
}

interface NewFavoriteForm {
  name: string;
  brand: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
}

const EMPTY_FORM: NewFavoriteForm = { name: "", brand: "", calories: "", protein: "", fat: "", carbs: "" };

function toNumberOrUndefined(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isNaN(n) ? undefined : n;
}

export function MenuSearch({ favorites, onQuickAdd, onAddFavorite }: MenuSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState<NewFavoriteForm>(EMPTY_FORM);

  const allItems = useMemo(() => [...favorites, ...starterMenu, ...genericFoods], [favorites]);
  const brands = useMemo(() => extractBrands(allItems), [allItems]);
  const textFiltered = useMemo(
    () => (query.trim() !== "" ? searchMenuItems(query, allItems) : allItems),
    [query, allItems],
  );
  const results = useMemo(
    () => (selectedBrand ? textFiltered.filter((item) => item.brand === selectedBrand) : textFiltered),
    [textFiltered, selectedBrand],
  );
  const showResults = query.trim() !== "" || selectedBrand !== null;

  function handleAddFavorite(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim() === "") return;
    onAddFavorite({
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      calories: toNumberOrUndefined(form.calories),
      protein: toNumberOrUndefined(form.protein),
      fat: toNumberOrUndefined(form.fat),
      carbs: toNumberOrUndefined(form.carbs),
    });
    setForm(EMPTY_FORM);
    setShowNewForm(false);
  }

  return (
    <div className="menu-search">
      <h3>メニューを検索してワンタップ記録</h3>
      <input
        type="text"
        className="menu-search-input"
        placeholder="例: おにぎり、ビッグマック"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {brands.length > 0 && (
        <div className="brand-chip-row">
          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              className={`brand-chip${selectedBrand === brand ? " active" : ""}`}
              onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      )}
      {showResults && (
        <ul className="menu-search-results">
          {results.map((item) => (
            <li key={item.id}>
              <button type="button" className="menu-item-button" onClick={() => onQuickAdd(item)}>
                <span className="menu-item-name">
                  {item.name}
                  {item.brand && <span className="menu-item-brand"> ({item.brand})</span>}
                </span>
                <span className="menu-item-cal">{item.calories != null ? `${item.calories}kcal` : "—"}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="empty-state">見つかりません。手入力するか、下から新しいメニューを登録してください</li>
          )}
        </ul>
      )}

      <button type="button" onClick={() => setShowNewForm(!showNewForm)}>
        {showNewForm ? "閉じる" : "新しいメニューを登録"}
      </button>
      {showNewForm && (
        <form className="new-favorite-form" onSubmit={handleAddFavorite}>
          <label>
            名前
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            ブランド(任意)
            <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </label>
          <div className="form-row nutrients">
            <label>
              カロリー
              <input
                type="number"
                min={0}
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
            </label>
            <label>
              たんぱく質(g)
              <input
                type="number"
                min={0}
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: e.target.value })}
              />
            </label>
            <label>
              脂質(g)
              <input type="number" min={0} value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
            </label>
            <label>
              炭水化物(g)
              <input
                type="number"
                min={0}
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
              />
            </label>
          </div>
          <button type="submit">お気に入りに登録</button>
        </form>
      )}
    </div>
  );
}
