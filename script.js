// Element References
const logBugBtn = document.getElementById("logBugBtn");
const bugForm = document.getElementById("bugForm");
const cancelBtn = document.getElementById("cancelBtn");
const form = document.getElementById("form");
const resolvedBugsContainer = document.getElementById("ResolvedBugs");
const toggle = document.getElementById("darkmode");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");

// On Page Load: Initialize Bugs & Theme
window.addEventListener("DOMContentLoaded", () => {
  const savedBugs = JSON.parse(localStorage.getItem("bugs")) || [];
  savedBugs.forEach(displayBugCard);

  const darkModeOn = localStorage.getItem("darkMode") === "true";
  if (darkModeOn) {
    document.body.classList.add("dark");
    toggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    toggle.textContent = "◐";
  }
});

// Search Filter
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const bugCards = Array.from(document.querySelectorAll(".bug-card"));

  let matchCount = 0;
  bugCards.forEach(card => {
    const isMatch = card.textContent.toLowerCase().includes(term);
    card.style.display = isMatch ? "block" : "none";
    if (isMatch) matchCount++;
  });

  if (matchCount === 0) {
    noResults.classList.remove("hidden");
  } else {
    noResults.classList.add("hidden");
  }
});

// Dark Mode Toggle
toggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark);
  toggle.textContent = isDark ? "☀️" : "◐";
});

// Show / Hide Bug Form + Scroll + Reset Pagination
logBugBtn.addEventListener("click", () => {
  // 1) show the form
  bugForm.classList.remove("hidden");

  // 2) scroll the window to the top so the form is visible
  window.scrollTo({ top: 0, behavior: "smooth" });

  // 3) reset pagination to page 1
  // — if you track currentPage in a variable, uncomment & adapt:
  // currentPage = 1;
  // renderBugs();

  // — or if you have buttons like <button data-page="1">1</button>, uncomment:
  // const pageOneBtn = document.querySelector('[data-page="1"]');
  // if (pageOneBtn) pageOneBtn.click();
});

cancelBtn.addEventListener("click", () => {
  bugForm.classList.add("hidden");
});

// Form Submission
form.addEventListener("submit", e => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const fix = document.getElementById("fix").value.trim();
  const tags = document.getElementById("tags").value.trim();

  const bug = { title, description, fix, tags };

  const bugs = JSON.parse(localStorage.getItem("bugs")) || [];
  bugs.push(bug);
  localStorage.setItem("bugs", JSON.stringify(bugs));

  displayBugCard(bug);

  form.reset();
  bugForm.classList.add("hidden");
});

// Display / Edit / Delete Helpers
function displayBugCard(bug) {
  const card = document.createElement("div");
  card.className = "bug-card";
  card.setAttribute("draggable", "true");

  const titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.innerHTML = `<strong>Title:</strong> ${bug.title}`;
  card.appendChild(titleEl);

  const descEl = document.createElement("div");
  descEl.className = "description";
  descEl.textContent = bug.description;
  card.appendChild(descEl);

  const fixEl = document.createElement("div");
  fixEl.className = "description";
  fixEl.innerHTML = `<strong>Fix:</strong> ${bug.fix}`;
  card.appendChild(fixEl);

  const tagsEl = document.createElement("div");
  tagsEl.className = "tags";
  tagsEl.textContent = bug.tags;
  card.appendChild(tagsEl);

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit";
  card.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  card.appendChild(deleteBtn);

  resolvedBugsContainer.appendChild(card);

  editBtn.addEventListener("click", () => {
    document.getElementById("title").value = bug.title;
    document.getElementById("description").value = bug.description;
    document.getElementById("fix").value = bug.fix;
    document.getElementById("tags").value = bug.tags;

    resolvedBugsContainer.removeChild(card);
    removeFromStorage(bug);
    bugForm.classList.remove("hidden");
  });

  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this bug?")) {
      resolvedBugsContainer.removeChild(card);
      removeFromStorage(bug);
    }
  });

  card.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", bug.title);
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    updateBugOrder();
  });

  resolvedBugsContainer.addEventListener("dragover", e => {
    e.preventDefault();
    const draggingCard = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(resolvedBugsContainer, e.clientY);
    if (!afterElement) {
      resolvedBugsContainer.appendChild(draggingCard);
    } else {
      resolvedBugsContainer.insertBefore(draggingCard, afterElement);
    }
  });
}

function updateBugOrder() {
  const bugCards = Array.from(document.querySelectorAll(".bug-card"));
  const bugs = bugCards.map(card => ({
    title: card.querySelector(".title").textContent,
    description: card.querySelector(".description").textContent,
    fix: card.querySelector(".fix")?.textContent || "",
    tags: card.querySelector(".tags").textContent
  }));
  localStorage.setItem("bugs", JSON.stringify(bugs));
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".bug-card:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    return offset < 0 && offset > closest.offset
      ? { offset, element: child }
      : closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function removeFromStorage(targetBug) {
  let bugs = JSON.parse(localStorage.getItem("bugs")) || [];
  bugs = bugs.filter(bug =>
    !(bug.title === targetBug.title &&
      bug.description === targetBug.description &&
      bug.fix === targetBug.fix &&
      bug.tags === targetBug.tags)
  );
  localStorage.setItem("bugs", JSON.stringify(bugs));
}
