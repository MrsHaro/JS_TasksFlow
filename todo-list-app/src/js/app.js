// !Fichier app.js pour la gestion de la logique de l'application To-Do List

document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskButton = document.getElementById("add-task-button");
  const taskList = document.getElementById("task-list");

  loadTasks();

  addTaskButton.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
      addTask(taskText);
      taskInput.value = "";
    }
  });
  // ?Ajouter une nouvelle tâche
  function addTask(taskText) {
    const taskItem = document.createElement("li");
    taskItem.textContent = taskText;
    taskItem.classList.add("task-item");

    // *Marquer la tâche comme terminée
    taskItem.addEventListener("click", () => {
      taskItem.classList.toggle("completed");
      updateLocalStorage();
    });

    // *Supprimer la tâche
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      taskList.removeChild(taskItem);
      updateLocalStorage();
    });

    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
    updateLocalStorage();
  }

  // ?Charger les tâches depuis le localStorage
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
      addTask(task.text);
      if (task.completed) {
        const taskItems = document.querySelectorAll(".task-item");
        taskItems[taskItems.length - 1].classList.add("completed");
      }
    });
  }

  // ?Mettre à jour le localStorage
  function updateLocalStorage() {
    const tasks = [];
    const taskItems = document.querySelectorAll(".task-item");
    taskItems.forEach((item) => {
      tasks.push({
        text: item.firstChild.textContent,
        completed: item.classList.contains("completed"),
      });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
});

// filepath: c:\Users\arthu\OneDrive\Bureau\P.jS\todo-list-app\src\js\app.js
import { getTasks, saveTasks, clearTasks } from "./storage.js";
import { createTodoElement } from "../components/todo-item.js";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const dueInput = document.getElementById("due-input");
const prioritySelect = document.getElementById("priority-select");
const categorySelect = document.getElementById("category-select");
const list = document.getElementById("tasks");
const filters = document.querySelectorAll(".filter");
const countEl = document.getElementById("count");
const clearCompletedBtn = document.getElementById("clear-completed");
const categoryFilter = document.getElementById("category-filter");

const sortSelect = document.getElementById("sort-select");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const confettiCanvas = document.getElementById("confetti-canvas");

let tasks = getTasks();
let activeFilter = "all";
let activeCategory = "all";
let activeSort = "created";
let lastToggledCompletedId = null;

// initialise la date par défaut au jour courant (format YYYY-MM-DD)
const todayISO = new Date().toISOString().slice(0, 10);
if (dueInput) dueInput.value = todayISO;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* -----------------------
   FLIP helper : mesure positions avant/après et anime
   ----------------------- */
function runFLIP(prevRects) {
  const duration = 360;
  const ease = "cubic-bezier(.2,.9,.3,1)";
  const children = Array.from(list.children);
  children.forEach((li) => {
    const id = li.dataset.id;
    const prev = prevRects.get(id);
    if (!prev) return;
    const next = li.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (dx || dy) {
      li.style.transform = `translate(${dx}px, ${dy}px)`;
      li.style.transition = "transform 0s";
      requestAnimationFrame(() => {
        li.style.transition = `transform ${duration}ms ${ease}`;
        li.style.transform = "";
        const cleanup = () => {
          li.style.transition = "";
          li.removeEventListener("transitionend", cleanup);
        };
        li.addEventListener("transitionend", cleanup);
      });
    }
  });
}

/* -----------------------
   Confetti (canvas) simple
   ----------------------- */
function spawnConfettiAt(x, y) {
  if (!confettiCanvas) return;
  const ctx = confettiCanvas.getContext("2d");
  const cw = (confettiCanvas.width = window.innerWidth);
  const ch = (confettiCanvas.height = window.innerHeight);
  const colours = [
    "#F97316",
    "#60A5FA",
    "#34D399",
    "#F43F5E",
    "#A78BFA",
    "#F59E0B",
  ];
  const pieces = [];
  const COUNT = 28;
  for (let i = 0; i < COUNT; i++) {
    pieces.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 1.5) * 8,
      r: 6 + Math.random() * 6,
      color: colours[Math.floor(Math.random() * colours.length)],
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
    });
  }
  let t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    const dt = (ts - t0) / 1000;
    t0 = ts;
    ctx.clearRect(0, 0, cw, ch);
    pieces.forEach((p) => {
      p.vy += 400 * (1 / 60) * 0.016; // gravity approximated
      p.x += p.vx;
      p.y += (p.vy * 0.016 * 60) / 60;
      p.rot += (p.vr * 0.016 * 60) / 60;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    // fade out after some time
    const alive = pieces.filter((p) => p.y < ch + 60);
    if (alive.length === 0) {
      ctx.clearRect(0, 0, cw, ch);
      return;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* -----------------------
   render with FLIP + confettir
   ----------------------- */
function sortTasks(listToSort) {
  const copy = Array.from(listToSort);
  if (activeSort === "created") {
    copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (activeSort === "due") {
    copy.sort((a, b) => {
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      return new Date(a.due) - new Date(b.due);
    });
  } else if (activeSort === "priority") {
    const weight = { high: 0, medium: 1, low: 2 };
    copy.sort(
      (a, b) =>
        weight[a.priority || "medium"] - weight[b.priority || "medium"] ||
        new Date(a.createdAt) - new Date(b.createdAt)
    );
  }
  return copy;
}

function render() {
  // capture positions avant (PrevRects)
  const prevRects = new Map(
    Array.from(list.children).map((li) => [
      li.dataset.id,
      li.getBoundingClientRect(),
    ])
  );

  list.innerHTML = "";
  const visible = tasks.filter((t) => {
    if (activeFilter === "active" && t.completed) return false;
    if (activeFilter === "completed" && !t.completed) return false;
    if (activeCategory !== "all" && t.category !== activeCategory) return false;
    return true;
  });

  const sorted = sortTasks(visible);

  sorted.forEach((t) =>
    list.appendChild(
      createTodoElement(t, {
        onToggle: toggleTask,
        onDelete: deleteTaskAnimated,
        onEdit: editTask,
      })
    )
  );
  // mesure positions après et anime via FLIP
  requestAnimationFrame(() => runFLIP(prevRects));

  saveTasks(tasks);
  updateCount();

  // confetti if recently toggled to completed
  if (lastToggledCompletedId) {
    const li = list.querySelector(`li[data-id="${lastToggledCompletedId}"]`);
    if (li) {
      const box = li.getBoundingClientRect();
      spawnConfettiAt(box.left + box.width / 2, box.top + box.height / 2);
    }
    lastToggledCompletedId = null;
  }
}

function updateCount() {
  const total = tasks.length;
  const remaining = tasks.filter((t) => !t.completed).length;
  countEl.textContent = `${remaining}/${total} actifs`;
}

function addTask(text, due, priority, category) {
  const task = {
    id: generateId(),
    text,
    due: due || todayISO,
    priority: priority || "medium",
    category: category || "other",
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  render();

  // animation: trouver l'élément et ajouter la classe 'added'
  requestAnimationFrame(() => {
    const li = list.querySelector(`li[data-id="${task.id}"]`);
    if (li) {
      li.classList.add("added");
      setTimeout(() => li.classList.remove("added"), 600);
    }
  });
}

function toggleTask(id) {
  let completedNow = false;
  tasks = tasks.map((t) => {
    if (t.id === id) {
      const flipped = { ...t, completed: !t.completed };
      completedNow = flipped.completed;
      return flipped;
    }
    return t;
  });
  if (completedNow) lastToggledCompletedId = id;
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  render();
}

// suppression animée : ajoute classe removing au DOM, puis supprime après animation
function deleteTaskAnimated(id) {
  const li = list.querySelector(`li[data-id="${id}"]`);
  if (li) {
    li.classList.add("removing");
    setTimeout(() => {
      deleteTask(id);
    }, 260);
  } else {
    deleteTask(id);
  }
}

function editTask(id, changes) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, ...changes } : t));
  render();
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(
    text,
    dueInput.value || todayISO,
    prioritySelect.value,
    categorySelect.value
  );
  input.value = "";
  dueInput.value = todayISO;
  prioritySelect.value = "medium";
  categorySelect.value = "personal";
});

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

categoryFilter.addEventListener("change", () => {
  activeCategory = categoryFilter.value;
  render();
});

sortSelect.addEventListener("change", () => {
  activeSort = sortSelect.value;
  render();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  render();
});

// exporter / importer (unchanged)
exportBtn.addEventListener("click", () => {
  try {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todo-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed", err);
  }
});
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed))
      throw new Error("Fichier JSON invalide (attendu tableau)");
    const normalized = parsed.map((item) => {
      const it = { ...item };
      if (!it.id) it.id = generateId();
      if (!it.createdAt) it.createdAt = new Date().toISOString();
      return it;
    });
    const existingIds = new Set(tasks.map((t) => t.id));
    const toAdd = normalized.filter((n) => !existingIds.has(n.id));
    tasks = [...toAdd, ...tasks];
    render();
    importFile.value = "";
  } catch (err) {
    console.error("Import failed", err);
    alert("Impossible d'importer le fichier JSON (format invalide).");
    importFile.value = "";
  }
});

// ?helper dev
window.__todo_clear_all = () => {
  tasks = [];
  clearTasks();
  render();
};

render();
