import { useState } from "react";
import type { AppSettings } from "../types";

interface GoalSettingsProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

type GoalKey = keyof AppSettings;

const FIELDS: { key: GoalKey; label: string; unit: string }[] = [
  { key: "dailyCalorieGoal", label: "カロリー", unit: "kcal" },
  { key: "dailyProteinGoal", label: "たんぱく質", unit: "g" },
  { key: "dailyFatGoal", label: "脂質", unit: "g" },
  { key: "dailyCarbsGoal", label: "炭水化物", unit: "g" },
];

function toNumberOrUndefined(raw: string): number | undefined {
  if (raw === "") return undefined;
  const n = Number(raw);
  return Number.isNaN(n) ? undefined : n;
}

export function GoalSettings({ settings, onChange }: GoalSettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="goal-settings">
      <button type="button" onClick={() => setOpen(!open)}>
        1日の目標を{open ? "閉じる" : "設定"}
      </button>
      {open && (
        <div className="goal-settings-fields">
          {FIELDS.map(({ key, label, unit }) => (
            <label key={key}>
              {label}目標({unit})
              <input
                type="number"
                min={0}
                value={settings[key] ?? ""}
                onChange={(e) =>
                  onChange({ ...settings, [key]: toNumberOrUndefined(e.target.value) })
                }
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
