//! Ce fichier gère la persistance des donnes dans le localStorage.

const STORAGE_KEY = "todo-app-v1";

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearTasks() {
  localStorage.removeItem(STORAGE_KEY);
}

// ?util simple pour localStorage
const Storage = {
  key: "todo-app-v1",
  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch (e) {
      return [];
    }
  },
  save(tasks) {
    localStorage.setItem(this.key, JSON.stringify(tasks));
  },
};
