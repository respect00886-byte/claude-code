import type { MealEntry } from "../types";
import { MEAL_TYPE_LABELS } from "../types";

interface MealListProps {
  entries: MealEntry[];
  onEdit: (entry: MealEntry) => void;
  onDelete: (id: string) => void;
  onSaveFavorite: (entry: MealEntry) => void;
}

function formatNutrient(value: number | undefined, unit: string): string {
  return value == null ? "—" : `${value}${unit}`;
}

export function MealList({ entries, onEdit, onDelete, onSaveFavorite }: MealListProps) {
  if (entries.length === 0) {
    return <p className="empty-state">記録がありません</p>;
  }

  return (
    <ul className="meal-list">
      {entries.map((entry) => (
        <li key={entry.id} className="meal-list-item">
          <div className="meal-list-main">
            <span className="meal-type-badge">{MEAL_TYPE_LABELS[entry.mealType]}</span>
            <span className="meal-name">{entry.name}</span>
          </div>
          <div className="meal-nutrients">
            <span>{formatNutrient(entry.calories, "kcal")}</span>
            <span>P {formatNutrient(entry.protein, "g")}</span>
            <span>F {formatNutrient(entry.fat, "g")}</span>
            <span>C {formatNutrient(entry.carbs, "g")}</span>
          </div>
          <div className="meal-list-actions">
            <button type="button" onClick={() => onEdit(entry)}>
              編集
            </button>
            <button type="button" onClick={() => onDelete(entry.id)}>
              削除
            </button>
            <button type="button" onClick={() => onSaveFavorite(entry)}>
              お気に入りに保存
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
