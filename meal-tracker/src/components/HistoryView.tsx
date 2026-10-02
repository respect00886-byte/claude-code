import { useState } from "react";
import type { AppSettings, MealEntry } from "../types";
import { todayStr } from "../lib/date";
import { MealList } from "./MealList";
import { DailySummary } from "./DailySummary";

interface HistoryViewProps {
  entries: MealEntry[];
  settings: AppSettings;
  onEdit: (entry: MealEntry) => void;
  onDelete: (id: string) => void;
  onSaveFavorite: (entry: MealEntry) => void;
}

export function HistoryView({ entries, settings, onEdit, onDelete, onSaveFavorite }: HistoryViewProps) {
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const dayEntries = entries.filter((e) => e.date === selectedDate);

  return (
    <div className="history-view">
      <label>
        日付を選択
        <input type="date" value={selectedDate} max={todayStr()} onChange={(e) => setSelectedDate(e.target.value)} />
      </label>
      <DailySummary entries={dayEntries} settings={settings} title={`${selectedDate} の合計`} />
      <MealList entries={dayEntries} onEdit={onEdit} onDelete={onDelete} onSaveFavorite={onSaveFavorite} />
    </div>
  );
}
