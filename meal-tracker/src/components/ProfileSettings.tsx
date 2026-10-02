import { useState } from "react";
import type { ActivityLevel, AppSettings, GoalDirection, Sex, UserProfile } from "../types";
import { ACTIVITY_LEVEL_LABELS, GOAL_DIRECTION_LABELS } from "../types";
import { calculateGoalsFromProfile } from "../lib/bmr";
import { loadProfile, saveProfile } from "../lib/storage";

interface ProfileSettingsProps {
  onApplyGoals: (goals: Partial<AppSettings>) => void;
}

function toNumberOrUndefined(raw: string): number | undefined {
  if (raw === "") return undefined;
  const n = Number(raw);
  return Number.isNaN(n) ? undefined : n;
}

export function ProfileSettings({ onApplyGoals }: ProfileSettingsProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [error, setError] = useState<string | null>(null);

  function update(next: UserProfile) {
    setProfile(next);
    saveProfile(next);
  }

  function handleCalculate() {
    const goals = calculateGoalsFromProfile(profile);
    if (!goals) {
      setError("身長・体重・年齢・性別・活動量をすべて入力してください");
      return;
    }
    setError(null);
    onApplyGoals({
      dailyCalorieGoal: goals.calories,
      dailyProteinGoal: goals.protein,
      dailyFatGoal: goals.fat,
      dailyCarbsGoal: goals.carbs,
    });
  }

  return (
    <div className="profile-settings">
      <button type="button" onClick={() => setOpen(!open)}>
        プロフィールから目標を自動計算{open ? "を閉じる" : ""}
      </button>
      {open && (
        <div className="profile-settings-fields">
          <label>
            身長(cm)
            <input
              type="number"
              min={0}
              value={profile.heightCm ?? ""}
              onChange={(e) => update({ ...profile, heightCm: toNumberOrUndefined(e.target.value) })}
            />
          </label>
          <label>
            体重(kg)
            <input
              type="number"
              min={0}
              value={profile.weightKg ?? ""}
              onChange={(e) => update({ ...profile, weightKg: toNumberOrUndefined(e.target.value) })}
            />
          </label>
          <label>
            年齢
            <input
              type="number"
              min={0}
              value={profile.age ?? ""}
              onChange={(e) => update({ ...profile, age: toNumberOrUndefined(e.target.value) })}
            />
          </label>
          <label>
            性別
            <select
              value={profile.sex ?? ""}
              onChange={(e) => update({ ...profile, sex: (e.target.value || undefined) as Sex | undefined })}
            >
              <option value="">選択してください</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </label>
          <label>
            活動量
            <select
              value={profile.activityLevel ?? ""}
              onChange={(e) =>
                update({ ...profile, activityLevel: (e.target.value || undefined) as ActivityLevel | undefined })
              }
            >
              <option value="">選択してください</option>
              {(Object.keys(ACTIVITY_LEVEL_LABELS) as ActivityLevel[]).map((level) => (
                <option key={level} value={level}>
                  {ACTIVITY_LEVEL_LABELS[level]}
                </option>
              ))}
            </select>
          </label>
          <label>
            目標の種類
            <select
              value={profile.goalDirection ?? "maintain"}
              onChange={(e) => update({ ...profile, goalDirection: e.target.value as GoalDirection })}
            >
              {(Object.keys(GOAL_DIRECTION_LABELS) as GoalDirection[]).map((direction) => (
                <option key={direction} value={direction}>
                  {GOAL_DIRECTION_LABELS[direction]}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="profile-error">{error}</p>}
          <button type="button" onClick={handleCalculate}>
            自動計算して目標に反映
          </button>
        </div>
      )}
    </div>
  );
}
