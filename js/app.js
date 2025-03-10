// Elementos do DOM
const entryForm = document.getElementById("entry-form");
const entryTitle = document.getElementById("entry-title");
const entryContent = document.getElementById("entry-content");
const entryTags = document.getElementById("entry-tags");
const entryFavorite = document.getElementById("entry-favorite");
const tagsPreview = document.getElementById("tags-preview");
const entriesList = document.getElementById("entries-list");
const entryDetails = document.getElementById("entry-details");
const editModal = document.getElementById("edit-modal");
const closeBtn = document.querySelector(".close");
const closeEditBtn = document.querySelector(".close-edit");
const modalTitle = document.getElementById("modal-title");
const modalDate = document.querySelector("#modal-date span");
const modalContent = document.getElementById("modal-content");
const modalTags = document.getElementById("modal-tags");
const modalMood = document.getElementById("modal-mood");
const modalFavorite = document.getElementById("modal-favorite");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");
const editForm = document.getElementById("edit-form");
const editTitle = document.getElementById("edit-title");
const editContent = document.getElementById("edit-content");
const editTags = document.getElementById("edit-tags");
const editTagsPreview = document.getElementById("edit-tags-preview");
const editFavorite = document.getElementById("edit-favorite");
const searchInput = document.getElementById("search-input");
const filterSelect = document.getElementById("filter-select");
const moodOptions = document.querySelectorAll(".mood-selector .mood-option");
const editMoodOptions = document.querySelectorAll(
  "#edit-mood-selector .mood-option"
);
const entriesCount = document.getElementById("entries-count");
const totalEntries = document.getElementById("total-entries");
const favoriteEntries = document.getElementById("favorite-entries");
const totalWords = document.getElementById("total-words");
const currentStreak = document.getElementById("current-streak");
const moodChart = document.getElementById("mood-chart");
const toastContainer = document.getElementById("toast-container");

// Variáveis globais
let entries = JSON.parse(localStorage.getItem("journal-entries")) || [];
let currentEntryId = null;
let selectedMood = null;
let editSelectedMood = null;
let filteredEntries = [];

// Funções
function saveEntriesToLocalStorage() {
  localStorage.setItem("journal-entries", JSON.stringify(entries));
}

function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString("pt-BR", options);
}

function formatDateShort(date) {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  };
  return new Date(date).toLocaleDateString("pt-BR", options);
}

function getMoodEmoji(mood) {
  const moodEmojis = {
    happy: "😊",
    sad: "😔",
    angry: "😠",
    excited: "🤩",
    tired: "😴",
    neutral: "😐",
  };
  return moodEmojis[mood] || "";
}

function displayEntries(entriesToDisplay = null) {
  const displayList =
    entriesToDisplay || filteredEntries.length > 0 ? filteredEntries : entries;
  entriesList.innerHTML = "";

  if (displayList.length === 0) {
    entriesList.innerHTML =
      "<p>Nenhuma entrada encontrada. Comece a escrever!</p>";
    return;
  }

  displayList.forEach((entry) => {
    const entryCard = document.createElement("div");
    entryCard.classList.add("entry-card");
    if (entry.favorite) entryCard.classList.add("favorite");
    entryCard.setAttribute("data-id", entry.id);

    const preview =
      entry.content.length > 100
        ? entry.content.substring(0, 100) + "..."
        : entry.content;

    const moodEmoji = entry.mood ? getMoodEmoji(entry.mood) : "";
    const favoriteIcon = entry.favorite
      ? "<i class='fas fa-star favorite-icon'></i>"
      : "";

    entryCard.innerHTML = `
      <div class="entry-header">
        <h3>${entry.title} ${moodEmoji}</h3>
        ${favoriteIcon}
      </div>
      <div class="entry-date"><i class="far fa-calendar-alt"></i> ${formatDateShort(
        entry.date
      )}</div>
      <div class="entry-preview">${preview}</div>
    `;

    if (entry.tags && entry.tags.length > 0) {
      const tagsContainer = document.createElement("div");
      tagsContainer.classList.add("entry-tags");

      entry.tags.forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.classList.add("entry-tag");
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });

      entryCard.appendChild(tagsContainer);
    }

    entryCard.addEventListener("click", () => openEntryDetails(entry.id));

    entriesList.appendChild(entryCard);
  });

  updateStatistics();
}

function addNewEntry(title, content, tags, mood, favorite) {
  const newEntry = {
    id: Date.now().toString(),
    title,
    content,
    tags: tags || [],
    mood,
    favorite: favorite || false,
    date: new Date(),
  };

  entries.unshift(newEntry);
  saveEntriesToLocalStorage();
  displayEntries();
  showToast("Entrada adicionada com sucesso!", "success");
  updateStatistics();
}

function updateEntry(id, title, content, tags, mood, favorite) {
  const index = entries.findIndex((entry) => entry.id === id);

  if (index !== -1) {
    entries[index].title = title;
    entries[index].content = content;
    entries[index].tags = tags || [];
    entries[index].mood = mood;
    entries[index].favorite = favorite || false;

    saveEntriesToLocalStorage();
    displayEntries();
    showToast("Entrada atualizada com sucesso!", "success");
    updateStatistics();
  }
}

function deleteEntry(id) {
  entries = entries.filter((entry) => entry.id !== id);
  saveEntriesToLocalStorage();
  displayEntries();
  showToast("Entrada excluída com sucesso!", "success");
  updateStatistics();
}

function getEntryById(id) {
  return entries.find((entry) => entry.id === id);
}

function openEntryDetails(id) {
  const entry = getEntryById(id);

  if (entry) {
    currentEntryId = id;
    modalTitle.textContent = entry.title;
    modalDate.textContent = formatDate(entry.date);
    modalContent.textContent = entry.content;

    // Exibir o humor
    if (entry.mood) {
      modalMood.textContent = getMoodEmoji(entry.mood);
      modalMood.style.display = "block";
    } else {
      modalMood.style.display = "none";
    }

    // Exibir o ícone de favorito
    if (entry.favorite) {
      modalFavorite.innerHTML = "<i class='fas fa-star'></i>";
      modalFavorite.classList.add("active");
    } else {
      modalFavorite.innerHTML = "<i class='far fa-star'></i>";
      modalFavorite.classList.remove("active");
    }

    // Exibir as tags
    modalTags.innerHTML = "";
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.classList.add("entry-tag");
        tagElement.textContent = tag;
        modalTags.appendChild(tagElement);
      });
      modalTags.style.display = "flex";
    } else {
      modalTags.style.display = "none";
    }

    entryDetails.style.display = "block";
  }
}

function openEditModal() {
  const entry = getEntryById(currentEntryId);

  if (entry) {
    editTitle.value = entry.title;
    editContent.value = entry.content;

    // Preencher as tags
    if (entry.tags && entry.tags.length > 0) {
      editTags.value = entry.tags.join(", ");
      updateTagsPreview(editTags.value, editTagsPreview);
    } else {
      editTags.value = "";
      editTagsPreview.innerHTML = "";
    }

    // Selecionar o humor
    editSelectedMood = entry.mood;
    editMoodOptions.forEach((option) => {
      if (option.getAttribute("data-mood") === entry.mood) {
        option.classList.add("selected");
      } else {
        option.classList.remove("selected");
      }
    });

    // Marcar como favorito
    editFavorite.checked = entry.favorite;

    editModal.style.display = "block";
  }
}

function filterEntries() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const filterValue = filterSelect.value;

  filteredEntries = entries.filter((entry) => {
    // Filtrar por termo de pesquisa
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm) ||
      entry.content.toLowerCase().includes(searchTerm) ||
      (entry.tags &&
        entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm)));

    if (!matchesSearch) return false;

    // Filtrar por período
    const entryDate = new Date(entry.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    switch (filterValue) {
      case "today":
        return entryDate >= today;
      case "week":
        return entryDate >= weekStart;
      case "month":
        return entryDate >= monthStart;
      case "favorites":
        return entry.favorite;
      default:
        return true;
    }
  });

  displayEntries(filteredEntries);
}

function updateTagsPreview(tagsString, container) {
  container.innerHTML = "";

  if (!tagsString.trim()) return;

  const tags = tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  tags.forEach((tag) => {
    const tagElement = document.createElement("div");
    tagElement.classList.add("tag");
    tagElement.innerHTML = `
      ${tag}
      <i class="fas fa-times"></i>
    `;

    tagElement.querySelector("i").addEventListener("click", (e) => {
      e.stopPropagation();
      const updatedTags = tagsString
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== tag)
        .join(", ");

      if (container === tagsPreview) {
        entryTags.value = updatedTags;
        updateTagsPreview(updatedTags, tagsPreview);
      } else {
        editTags.value = updatedTags;
        updateTagsPreview(updatedTags, editTagsPreview);
      }
    });

    container.appendChild(tagElement);
  });
}

function updateStatistics() {
  // Atualizar contadores
  entriesCount.textContent = entries.length;
  totalEntries.textContent = entries.length;

  const favCount = entries.filter((entry) => entry.favorite).length;
  favoriteEntries.textContent = favCount;

  // Calcular total de palavras
  const words = entries.reduce((total, entry) => {
    return (
      total + entry.content.split(/\s+/).filter((word) => word.trim()).length
    );
  }, 0);
  totalWords.textContent = words;

  // Calcular sequência atual
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Verificar se há uma entrada hoje
  const hasEntryToday = entries.some((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });

  if (hasEntryToday) {
    streak = 1;

    // Verificar dias anteriores consecutivos
    let checkDate = new Date(today);
    let consecutive = true;

    while (consecutive) {
      checkDate.setDate(checkDate.getDate() - 1);

      const hasEntryOnDate = entries.some((entry) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });

      if (hasEntryOnDate) {
        streak++;
      } else {
        consecutive = false;
      }
    }
  }

  currentStreak.textContent = `${streak} dia${streak !== 1 ? "s" : ""}`;

  // Atualizar gráfico de humor
  updateMoodChart();
}

function updateMoodChart() {
  moodChart.innerHTML = "";

  const moodCounts = {
    happy: 0,
    sad: 0,
    angry: 0,
    excited: 0,
    tired: 0,
    neutral: 0,
  };

  // Contar ocorrências de cada humor
  entries.forEach((entry) => {
    if (entry.mood && moodCounts.hasOwnProperty(entry.mood)) {
      moodCounts[entry.mood]++;
    }
  });

  // Encontrar o valor máximo para normalizar as barras
  const maxCount = Math.max(...Object.values(moodCounts));

  // Criar barras para cada humor
  for (const [mood, count] of Object.entries(moodCounts)) {
    if (count > 0) {
      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

      const moodBar = document.createElement("div");
      moodBar.classList.add("mood-bar");
      moodBar.innerHTML = `
        <div class="mood-emoji">${getMoodEmoji(mood)}</div>
        <div class="bar-container">
          <div class="bar" style="width: ${percentage}%"></div>
        </div>
        <div class="mood-count">${count}</div>
      `;

      moodChart.appendChild(moodBar);
    }
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${
      type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
    }"></i>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  // Remover o toast após 3 segundos
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Event Listeners
entryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = entryTitle.value.trim();
  const content = entryContent.value.trim();
  const tagsString = entryTags.value.trim();
  const tags = tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
    : [];
  const favorite = entryFavorite.checked;

  if (title && content) {
    addNewEntry(title, content, tags, selectedMood, favorite);
    entryTitle.value = "";
    entryContent.value = "";
    entryTags.value = "";
    entryFavorite.checked = false;
    tagsPreview.innerHTML = "";

    // Resetar seleção de humor
    moodOptions.forEach((option) => option.classList.remove("selected"));
    selectedMood = null;
  }
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = editTitle.value.trim();
  const content = editContent.value.trim();
  const tagsString = editTags.value.trim();
  const tags = tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
    : [];
  const favorite = editFavorite.checked;

  if (title && content && currentEntryId) {
    updateEntry(
      currentEntryId,
      title,
      content,
      tags,
      editSelectedMood,
      favorite
    );
    editModal.style.display = "none";
    entryDetails.style.display = "none";
  }
});

// Selecionar humor
moodOptions.forEach((option) => {
  option.addEventListener("click", () => {
    moodOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    selectedMood = option.getAttribute("data-mood");
  });
});

editMoodOptions.forEach((option) => {
  option.addEventListener("click", () => {
    editMoodOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    editSelectedMood = option.getAttribute("data-mood");
  });
});

// Favoritar no modal
modalFavorite.addEventListener("click", () => {
  const entry = getEntryById(currentEntryId);
  if (entry) {
    entry.favorite = !entry.favorite;

    if (entry.favorite) {
      modalFavorite.innerHTML = "<i class='fas fa-star'></i>";
      modalFavorite.classList.add("active");
    } else {
      modalFavorite.innerHTML = "<i class='far fa-star'></i>";
      modalFavorite.classList.remove("active");
    }

    saveEntriesToLocalStorage();
    displayEntries();
  }
});

// Atualizar preview de tags
entryTags.addEventListener("input", () => {
  updateTagsPreview(entryTags.value, tagsPreview);
});

editTags.addEventListener("input", () => {
  updateTagsPreview(editTags.value, editTagsPreview);
});

// Pesquisa e filtros
searchInput.addEventListener("input", filterEntries);
filterSelect.addEventListener("change", filterEntries);

editBtn.addEventListener("click", openEditModal);

deleteBtn.addEventListener("click", () => {
  if (
    currentEntryId &&
    confirm("Tem certeza que deseja excluir esta entrada?")
  ) {
    deleteEntry(currentEntryId);
    entryDetails.style.display = "none";
  }
});

closeBtn.addEventListener("click", () => {
  entryDetails.style.display = "none";
});

closeEditBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === entryDetails) {
    entryDetails.style.display = "none";
  }
  if (e.target === editModal) {
    editModal.style.display = "none";
  }
});

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Aplicar modo escuro sempre
  document.body.classList.add("dark-mode");

  displayEntries();
  updateStatistics();
});
