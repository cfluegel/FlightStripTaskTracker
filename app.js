(function () {
  const STORAGE_KEY = "flightStripTasks";
  const STORAGE_ORDER_KEY = "flightStripTasksOrder";
  const STORAGE_ARCHIVE_KEY = "flightStripArchive";
  const STORAGE_ARCHIVE_ORDER_KEY = "flightStripArchiveOrder";
  const THEME_KEY = "flightStripTheme";

  const taskList = document.getElementById("taskList");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const themeToggle = document.getElementById("themeToggle");
  const taskModal = document.getElementById("taskModal");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const taskForm = document.getElementById("taskForm");
  const titleInput = document.getElementById("taskTitle");
  const receivedInput = document.getElementById("taskReceived");
  const template = document.getElementById("taskTemplate");
  const archiveBtn = document.getElementById("archiveBtn");
  const archiveModal = document.getElementById("archiveModal");
  const archiveList = document.getElementById("archiveList");
  const closeArchiveBtn = document.getElementById("closeArchiveBtn");
  const archiveTemplate = document.getElementById("archiveTaskTemplate");
  const dataBtn = document.getElementById("dataBtn");
  const dataModal = document.getElementById("dataModal");
  const closeDataBtn = document.getElementById("closeDataBtn");
  const exportLink = document.getElementById("exportLink");
  const importForm = document.getElementById("importForm");
  const importFile = document.getElementById("importFile");
  const root = document.documentElement;

  const defaultTasks = [
    {
      id: "task-1",
      title: "Anflug AZ472 priorisieren",
      contact: "Tower",
      received: "2024-01-12",
      notes: "Sequenz 1, Startbereit in 12 Minuten."
    },
    {
      id: "task-2",
      title: "Koordination Bodenfreigabe",
      contact: "S. Meyer",
      received: "2024-01-12",
      notes: "Gate-Bestätigung für Stand 4A einholen."
    },
    {
      id: "task-3",
      title: "Slot-Update für LH218 prüfen",
      contact: "Dispatch",
      received: "2024-01-11",
      notes: "Neues EOBT erwartet 12:05Z."
    }
  ];

  let tasks = loadTasks();
  let archivedTasks = loadArchive();
  let currentTheme = getInitialTheme();
  let exportUrl = null;

  applyTheme(currentTheme);
  renderTasks();
  renderArchive();

  addTaskBtn.addEventListener("click", openModal);
  cancelModalBtn.addEventListener("click", closeModal);
  closeModalBtn.addEventListener("click", closeModal);
  taskModal.addEventListener("click", handleBackdropClick);
  archiveModal.addEventListener("click", handleArchiveBackdropClick);
  if (dataModal) {
    dataModal.addEventListener("click", handleDataBackdropClick);
  }
  document.addEventListener("keydown", handleKeydown);
  taskForm.addEventListener("submit", handleFormSubmit);
  taskList.addEventListener("dragover", handleDragOver);
  taskList.addEventListener("drop", handleDrop);
  archiveBtn.addEventListener("click", openArchive);
  closeArchiveBtn.addEventListener("click", closeArchive);
  if (dataBtn) {
    dataBtn.addEventListener("click", openDataModal);
  }
  if (closeDataBtn) {
    closeDataBtn.addEventListener("click", closeDataModal);
  }
  if (importForm) {
    importForm.addEventListener("submit", handleImportSubmit);
  }

  themeToggle.addEventListener("click", () => {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    persist(THEME_KEY, nextTheme);
  });

  function renderTasks() {
    taskList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    tasks.forEach((task) => {
      const card = template.content.firstElementChild.cloneNode(true);
      card.dataset.id = task.id;
      card.setAttribute("title", "Zum Sortieren ziehen");

      const title = card.querySelector(".task-card__title");
      const time = card.querySelector(".task-card__meta");
      const contact = card.querySelector(".task-card__contact");
      const notes = card.querySelector(".task-card__notes");
      const closeBtn = card.querySelector(".task-card__close");

      title.textContent = task.title;

      const receivedDate = normaliseDate(task.received);
      time.textContent = formatDate(receivedDate);
      time.dateTime = receivedDate ?? "";

      const contactName = task.contact && task.contact.trim() ? task.contact.trim() : "Kein Ansprechpartner";
      contact.textContent = `Ansprechpartner: ${contactName}`;

      if (task.notes && task.notes.trim()) {
        notes.textContent = task.notes.trim();
        notes.classList.remove("is-empty");
      } else {
        notes.textContent = "Keine zusätzlichen Notizen.";
        notes.classList.add("is-empty");
      }

      card.addEventListener("dragstart", handleDragStart);
      card.addEventListener("dragend", handleDragEnd);
      closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        archiveTask(task.id);
      });

      fragment.appendChild(card);
    });

    taskList.appendChild(fragment);
    refreshExportLink();
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(taskForm);
    const title = formData.get("title")?.toString().trim();
    const contact = formData.get("contact")?.toString().trim() ?? "";
    const receivedRaw = formData.get("received")?.toString().trim();
    const notes = formData.get("notes")?.toString().trim();

    if (!title) {
      return;
    }

    const received = normaliseDate(receivedRaw) ?? todayISO();
    const newTask = {
      id: createId(),
      title,
      contact: contact || "",
      received,
      notes: notes ?? ""
    };

    tasks = [newTask, ...tasks];
    saveTasks();
    renderTasks();
    closeModal();
  }

  function handleDragStart(event) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.id);
    event.currentTarget.classList.add("dragging");
  }

  function handleDragEnd(event) {
    event.currentTarget.classList.remove("dragging");
  }

  function handleDragOver(event) {
    event.preventDefault();
    const dragging = taskList.querySelector(".dragging");
    if (!dragging) {
      return;
    }

    const afterElement = getDragAfterElement(taskList, event.clientY);
    if (afterElement === null) {
      taskList.appendChild(dragging);
    } else if (afterElement !== dragging) {
      taskList.insertBefore(dragging, afterElement);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const orderedIds = Array.from(taskList.children, (card) => card.dataset.id);
    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    tasks = orderedIds.map((id) => taskMap.get(id)).filter(Boolean);
    saveTasks();
    renderTasks();
  }

  function archiveTask(taskId) {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      return;
    }

    const [task] = tasks.splice(taskIndex, 1);
    archivedTasks = [{ ...task, archivedAt: todayISO() }, ...archivedTasks];
    saveTasks();
    saveArchive();
    renderTasks();
    renderArchive();
  }

  function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll(".task-card:not(.dragging)")];
    return elements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  function openModal() {
    taskModal.classList.add("is-visible");
    const todayValue = todayISO();
    receivedInput.value = todayValue;
    setTimeout(() => titleInput.focus(), 10);
  }

  function closeModal() {
    taskModal.classList.remove("is-visible");
    taskForm.reset();
  }

  function handleBackdropClick(event) {
    if (event.target === taskModal) {
      closeModal();
    }
  }

  function handleArchiveBackdropClick(event) {
    if (event.target === archiveModal) {
      closeArchive();
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      if (taskModal.classList.contains("is-visible")) {
        closeModal();
      }
      if (archiveModal.classList.contains("is-visible")) {
        closeArchive();
      }
      if (dataModal.classList.contains("is-visible")) {
        closeDataModal();
      }
    }
  }

  function loadTasks() {
    const stored = safeParse(localStorage.getItem(STORAGE_KEY));
    const storedOrder = localStorage.getItem(STORAGE_ORDER_KEY);
    if (Array.isArray(stored)) {
      const validTasks = stored.filter(isValidTask);
      if (storedOrder === "desc") {
        return validTasks;
      }
      const reversed = [...validTasks].reverse();
      persist(STORAGE_KEY, reversed);
      persist(STORAGE_ORDER_KEY, "desc");
      return reversed;
    }
    persist(STORAGE_ORDER_KEY, "desc");
    return [...defaultTasks];
  }

  function loadArchive() {
    const stored = safeParse(localStorage.getItem(STORAGE_ARCHIVE_KEY));
    const storedOrder = localStorage.getItem(STORAGE_ARCHIVE_ORDER_KEY);
    if (Array.isArray(stored)) {
      const valid = stored.filter(isValidTask);
      if (storedOrder === "desc") {
        return valid;
      }
      const reversed = [...valid].reverse();
      persist(STORAGE_ARCHIVE_KEY, reversed);
      persist(STORAGE_ARCHIVE_ORDER_KEY, "desc");
      return reversed;
    }
    return [];
  }

  function saveTasks() {
    persist(STORAGE_KEY, tasks);
    persist(STORAGE_ORDER_KEY, "desc");
  }

  function saveArchive() {
    persist(STORAGE_ARCHIVE_KEY, archivedTasks);
    persist(STORAGE_ARCHIVE_ORDER_KEY, "desc");
  }

  function getInitialTheme() {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
    return prefersDarkMode() ? "dark" : "light";
  }

  function applyTheme(theme) {
    currentTheme = theme;
    root.dataset.theme = theme;
    const isDark = theme === "dark";
    themeToggle.textContent = isDark ? "🌞" : "🌙";
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Dark Mode aktiv, zu Light Mode wechseln" : "Light Mode aktiv, zu Dark Mode wechseln"
    );
  }

  function prefersDarkMode() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function persist(key, value) {
    try {
      const serialised = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serialised);
    } catch (error) {
      console.warn("Konnte Daten nicht speichern:", error);
    }
  }

  function safeParse(raw) {
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Konnte gespeicherte Daten nicht lesen:", error);
      return null;
    }
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normaliseDate(value) {
    if (!value) {
      return null;
    }
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    return new Date(timestamp).toISOString().split("T")[0];
  }

  function formatDate(value) {
    if (!value) {
      return "Heute";
    }
    try {
      const date = new Date(value);
      return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(date);
    } catch {
      return value;
    }
  }

  function todayISO() {
    return new Date().toISOString().split("T")[0];
  }

  function isValidTask(task) {
    return Boolean(task && task.id && task.title);
  }

  function renderArchive() {
    archiveList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    archivedTasks.forEach((task) => {
      const archiveItem = archiveTemplate.content.firstElementChild.cloneNode(true);
      const title = archiveItem.querySelector(".archive-card__title");
      const time = archiveItem.querySelector(".archive-card__meta");
      const contact = archiveItem.querySelector(".archive-card__contact");
      const notes = archiveItem.querySelector(".archive-card__notes");
      const deleteBtn = archiveItem.querySelector(".archive-card__delete");

      title.textContent = task.title;

      const receivedDate = normaliseDate(task.received);
      const archivedDate = normaliseDate(task.archivedAt);
      const metaText = [];
      if (receivedDate) {
        metaText.push(`Eingang: ${formatDate(receivedDate)}`);
      }
      if (archivedDate) {
        metaText.push(`Archiviert: ${formatDate(archivedDate)}`);
      }
      time.textContent = metaText.join(" · ");
      time.dateTime = archivedDate ?? receivedDate ?? "";

      const contactName = task.contact && task.contact.trim() ? task.contact.trim() : "Kein Ansprechpartner";
      contact.textContent = `Ansprechpartner: ${contactName}`;
      notes.textContent = task.notes?.trim() ?? "";

      deleteBtn.addEventListener("click", () => deleteArchivedTask(task.id));

      fragment.appendChild(archiveItem);
    });

    archiveList.appendChild(fragment);
    refreshExportLink();
  }

  function openArchive() {
    archiveModal.classList.add("is-visible");
    archiveList.scrollTop = 0;
  }

  function closeArchive() {
    archiveModal.classList.remove("is-visible");
  }

  function openDataModal() {
    if (!dataModal) {
      return;
    }
    updateExportLink();
    dataModal.classList.add("is-visible");
  }

  function closeDataModal() {
    if (!dataModal) {
      return;
    }
    dataModal.classList.remove("is-visible");
    if (importForm) {
      importForm.reset();
    }
  }

  function handleDataBackdropClick(event) {
    if (!dataModal) {
      return;
    }
    if (event.target === dataModal) {
      closeDataModal();
    }
  }

  function deleteArchivedTask(taskId) {
    const index = archivedTasks.findIndex((task) => task.id === taskId);
    if (index === -1) {
      return;
    }
    archivedTasks.splice(index, 1);
    saveArchive();
    renderArchive();
  }

  function refreshExportLink() {
    if (!dataModal || !dataModal.classList.contains("is-visible")) {
      return;
    }
    updateExportLink();
  }

  function updateExportLink() {
    if (!exportLink) {
      return;
    }
    if (exportUrl) {
      URL.revokeObjectURL(exportUrl);
      exportUrl = null;
    }
    const payload = {
      generatedAt: new Date().toISOString(),
      theme: currentTheme,
      tasks,
      archivedTasks
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    exportUrl = URL.createObjectURL(blob);
    exportLink.href = exportUrl;
  }

  function handleImportSubmit(event) {
    event.preventDefault();
    if (!importFile) {
      return;
    }
    const file = importFile.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        applyImportedData(parsed);
      } catch (error) {
        alert("Import fehlgeschlagen: Datei konnte nicht gelesen werden.");
      }
    };
    reader.onerror = () => {
      alert("Import fehlgeschlagen: Datei konnte nicht gelesen werden.");
    };
    reader.readAsText(file);
  }

  function applyImportedData(data) {
    if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.archivedTasks)) {
      alert("Import fehlgeschlagen: Ungültiges Datenformat.");
      return;
    }
    persist(STORAGE_KEY, data.tasks);
    persist(STORAGE_ORDER_KEY, "desc");
    persist(STORAGE_ARCHIVE_KEY, data.archivedTasks);
    persist(STORAGE_ARCHIVE_ORDER_KEY, "desc");
    if (typeof data.theme === "string") {
      const theme = data.theme === "dark" ? "dark" : "light";
      persist(THEME_KEY, theme);
    }
    window.location.reload();
  }
})();
