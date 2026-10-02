import { useEffect, useState } from "react";
import type { MealEntry, MealType } from "../types";
import { MEAL_TYPE_LABELS } from "../types";
import { suggestMealType, todayStr } from "../lib/date";

export interface MealFormValues {
  date: string;
  mealType: MealType;
  name: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

interface MealFormProps {
  editingEntry: MealEntry | null;
  defaultDate: string;
  onSubmit: (values: MealFormValues) => void;
  onCancelEdit: () => void;
}

function emptyValues(defaultDate: string): MealFormValues {
  return {
    date: defaultDate,
    mealType: suggestMealType(),
    name: "",
    calories: undefined,
    protein: undefined,
    fat: undefined,
    carbs: undefined,
  };
}

function toNumberOrUndefined(raw: string): number | undefined {
  if (raw === "") return undefined;
  const n = Number(raw);
  return Number.isNaN(n) ? undefined : n;
}

export function MealForm({ editingEntry, defaultDate, onSubmit, onCancelEdit }: MealFormProps) {
  const [values, setValues] = useState<MealFormValues>(() => emptyValues(defaultDate));

  useEffect(() => {
    if (editingEntry) {
      setValues({
        date: editingEntry.date,
        mealType: editingEntry.mealType,
        name: editingEntry.name,
        calories: editingEntry.calories,
        protein: editingEntry.protein,
        fat: editingEntry.fat,
        carbs: editingEntry.carbs,
      });
    } else {
      setValues(emptyValues(defaultDate));
    }
  }, [editingEntry, defaultDate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (values.name.trim() === "") return;
    onSubmit(values);
    if (!editingEntry) {
      setValues(emptyValues(defaultDate));
    }
  }

  return (
    <form className="meal-form" onSubmit={handleSubmit}>
      <h3>{editingEntry ? "食事を編集" : "食事を記録"}</h3>
      <div className="form-row">
        <label>
          日付
          <input
            type="date"
            value={values.date}
            max={todayStr()}
            onChange={(e) => setValues({ ...values, date: e.target.value })}
          />
        </label>
        <label>
          区分
          <select
            value={values.mealType}
            onChange={(e) => setValues({ ...values, mealType: e.target.value as MealType })}
          >
            {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => (
              <option key={type} value={type}>
                {MEAL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        内容
        <input
          type="text"
          value={values.name}
          placeholder="例: サラダ"
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
        />
      </label>
      <div className="form-row nutrients">
        <label>
          カロリー(任意)
          <input
            type="number"
            min={0}
            value={values.calories ?? ""}
            onChange={(e) => setValues({ ...values, calories: toNumberOrUndefined(e.target.value) })}
          />
        </label>
        <label>
          たんぱく質(g)
          <input
            type="number"
            min={0}
            value={values.protein ?? ""}
            onChange={(e) => setValues({ ...values, protein: toNumberOrUndefined(e.target.value) })}
          />
        </label>
        <label>
          脂質(g)
          <input
            type="number"
            min={0}
            value={values.fat ?? ""}
            onChange={(e) => setValues({ ...values, fat: toNumberOrUndefined(e.target.value) })}
          />
        </label>
        <label>
          炭水化物(g)
          <input
            type="number"
            min={0}
            value={values.carbs ?? ""}
            onChange={(e) => setValues({ ...values, carbs: toNumberOrUndefined(e.target.value) })}
          />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit">{editingEntry ? "更新" : "追加"}</button>
        {editingEntry && (
          <button type="button" onClick={onCancelEdit}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
