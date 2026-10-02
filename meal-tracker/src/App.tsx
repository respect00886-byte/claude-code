import { useState } from "react";
import type { AppSettings, MealEntry, MenuItem } from "./types";
import { loadEntries, loadFavorites, loadSettings, saveEntries, saveFavorites, saveSettings } from "./lib/storage";
import { suggestMealType, todayStr } from "./lib/date";
import { MealForm, type MealFormValues } from "./components/MealForm";
import { MealList } from "./components/MealList";
import { DailySummary } from "./components/DailySummary";
import { GoalSettings } from "./components/GoalSettings";
import { HistoryView } from "./components/HistoryView";
import { MenuSearch } from "./components/MenuSearch";

type View = "today" | "history";

export default function App() {
  const [entries, setEntries] = useState<MealEntry[]>(() => loadEntries());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [favorites, setFavorites] = useState<MenuItem[]>(() => loadFavorites());
  const [editingEntry, setEditingEntry] = useState<MealEntry | null>(null);
  const [view, setView] = useState<View>("today");

  const todayEntries = entries.filter((e) => e.date === todayStr());

  function updateEntries(next: MealEntry[]) {
    setEntries(next);
    saveEntries(next);
  }

  function updateSettings(next: AppSettings) {
    setSettings(next);
    saveSettings(next);
  }

  function updateFavorites(next: MenuItem[]) {
    setFavorites(next);
    saveFavorites(next);
  }

  function handleFormSubmit(values: MealFormValues) {
    if (editingEntry) {
      updateEntries(entries.map((e) => (e.id === editingEntry.id ? { ...editingEntry, ...values } : e)));
      setEditingEntry(null);
    } else {
      const newEntry: MealEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...values,
      };
      updateEntries([...entries, newEntry]);
    }
  }

  function handleEdit(entry: MealEntry) {
    setEditingEntry(entry);
    setView("today");
  }

  function handleDelete(id: string) {
    updateEntries(entries.filter((e) => e.id !== id));
    if (editingEntry?.id === id) setEditingEntry(null);
  }

  function handleQuickAdd(item: MenuItem) {
    const newEntry: MealEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      date: todayStr(),
      mealType: suggestMealType(),
      name: item.brand ? `${item.name}(${item.brand})` : item.name,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
    };
    updateEntries([...entries, newEntry]);
  }

  function handleAddFavorite(item: Omit<MenuItem, "id">) {
    updateFavorites([...favorites, { id: crypto.randomUUID(), ...item }]);
  }

  function handleSaveFavoriteFromEntry(entry: MealEntry) {
    handleAddFavorite({
      name: entry.name,
      calories: entry.calories,
      protein: entry.protein,
      fat: entry.fat,
      carbs: entry.carbs,
    });
  }

  return (
    <div className="app">
      <header>
        <h1>毎日の食事管理</h1>
        <GoalSettings settings={settings} onChange={updateSettings} />
      </header>

      <nav className="view-tabs">
        <button type="button" className={view === "today" ? "active" : ""} onClick={() => setView("today")}>
          今日
        </button>
        <button type="button" className={view === "history" ? "active" : ""} onClick={() => setView("history")}>
          履歴
        </button>
      </nav>

      {view === "today" ? (
        <main>
          <MenuSearch favorites={favorites} onQuickAdd={handleQuickAdd} onAddFavorite={handleAddFavorite} />
          <MealForm
            editingEntry={editingEntry}
            defaultDate={todayStr()}
            onSubmit={handleFormSubmit}
            onCancelEdit={() => setEditingEntry(null)}
          />
          <DailySummary entries={todayEntries} settings={settings} title="今日の合計" />
          <MealList
            entries={todayEntries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSaveFavorite={handleSaveFavoriteFromEntry}
          />
        </main>
      ) : (
        <HistoryView
          entries={entries}
          settings={settings}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSaveFavorite={handleSaveFavoriteFromEntry}
        />
      )}
    </div>
  );
}
