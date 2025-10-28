class TodoItem {
  constructor(text) {
    this.text = text;
    this.completed = false;
  }

  toggleCompleted() {
    this.completed = !this.completed;
  }

  get isCompleted() {
    return this.completed;
  }
}

export default TodoItem;

export function createTodoElement(task, { onToggle, onDelete, onEdit }) {
  const li = document.createElement("li");
  li.className = "task" + (task.completed ? " completed" : "");
  li.dataset.id = task.id;

  const left = document.createElement("div");
  left.className = "left";

  const checkbox = document.createElement("button");
  checkbox.className = "checkbox";
  checkbox.setAttribute("aria-pressed", String(!!task.completed));
  checkbox.title = task.completed
    ? "Marquer comme non terminé"
    : "Marquer comme terminé";
  checkbox.textContent = task.completed ? "✓" : "";

  const content = document.createElement("div");
  content.style.minWidth = "0";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = task.text;
  label.title = task.text;

  const meta = document.createElement("div");
  meta.className = "meta";

  // badge catégorie (texte)
  const cat = document.createElement("span");
  cat.className = "category-badge category-" + (task.category || "other");
  const catLabels = {
    work: "Travail",
    personal: "Perso",
    shopping: "Courses",
    other: "Autre",
  };
  cat.textContent = catLabels[task.category] || task.category || "Autre";
  cat.title =
    "Catégorie: " + (catLabels[task.category] || task.category || "Autre");

  // priorité badge
  const prio = document.createElement("span");
  prio.className = "priority " + (task.priority || "medium");
  prio.title = "Priorité: " + (task.priority || "medium");

  // date d'échéance si présente
  if (task.due) {
    const due = document.createElement("span");
    const d = new Date(task.due);
    due.textContent = d.toLocaleDateString();
    meta.appendChild(due);
  }

  // ordre d'affichage: priorité, catégorie, date
  meta.prepend(cat);
  meta.prepend(prio);

  content.append(label, meta);
  left.append(checkbox, content);

  const controls = document.createElement("div");

  const editBtn = document.createElement("button");
  editBtn.className = "btn";
  editBtn.textContent = "✎";
  editBtn.title = "Éditer";

  const delBtn = document.createElement("button");
  delBtn.className = "btn";
  delBtn.textContent = "✕";
  delBtn.title = "Supprimer";

  // ?events
  checkbox.addEventListener("click", () => onToggle(task.id));
  delBtn.addEventListener("click", () => onDelete(task.id));
  editBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.className = "edit-input";
    input.value = task.text;
    content.replaceChild(input, label);
    input.focus();
    input.select();

    function finish(save) {
      if (save) onEdit(task.id, { text: input.value.trim() });
      content.replaceChild(label, input);
      cleanup();
    }
    function onKey(e) {
      if (e.key === "Enter") finish(true);
      else if (e.key === "Escape") finish(false);
    }
    function cleanup() {
      input.removeEventListener("blur", onBlur);
      input.removeEventListener("keydown", onKey);
    }
    function onBlur() {
      finish(true);
    }

    input.addEventListener("blur", onBlur);
    input.addEventListener("keydown", onKey);
  });

  controls.append(editBtn, delBtn);
  li.append(left, controls);
  return li;
}
