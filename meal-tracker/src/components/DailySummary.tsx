import type { AppSettings, MealEntry } from "../types";
import { remaining, sumCalories, sumCarbs, sumFat, sumProtein } from "../lib/calories";

interface DailySummaryProps {
  entries: MealEntry[];
  settings: AppSettings;
  title: string;
}

interface RowProps {
  label: string;
  unit: string;
  total: number;
  goal?: number;
}

function SummaryRow({ label, unit, total, goal }: RowProps) {
  const rem = remaining(total, goal);
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className="summary-total">
        {total}
        {unit}
      </span>
      {rem != null && (
        <span className={rem < 0 ? "summary-over" : "summary-remaining"}>
          {rem < 0
            ? `目標を ${Math.abs(rem)}${unit} 超過`
            : `残り ${rem}${unit}`}
        </span>
      )}
    </div>
  );
}

export function DailySummary({ entries, settings, title }: DailySummaryProps) {
  return (
    <div className="daily-summary">
      <h3>{title}</h3>
      <SummaryRow label="カロリー" unit="kcal" total={sumCalories(entries)} goal={settings.dailyCalorieGoal} />
      <SummaryRow label="たんぱく質" unit="g" total={sumProtein(entries)} goal={settings.dailyProteinGoal} />
      <SummaryRow label="脂質" unit="g" total={sumFat(entries)} goal={settings.dailyFatGoal} />
      <SummaryRow label="炭水化物" unit="g" total={sumCarbs(entries)} goal={settings.dailyCarbsGoal} />
    </div>
  );
}
