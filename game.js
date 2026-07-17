"use strict";

const MAX_MISSES = 6;
const STATS_KEY = "hangman-stats";
const LETTERS = "AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ".split("");
const WORDS = {
  animals: ["MACSKA", "KUTYA", "RÓKA", "MEDVE", "SÜN", "BAGOLY", "VADLÓ", "PÁRDUC", "KENGURU", "TEKNŐS"],
  cities: ["BUDAPEST", "SZEGED", "PÉCS", "GYŐR", "DEBRECEN", "VESZPRÉM", "EGER", "SOPRON", "MISKOLC", "KECSKEMÉT"],
  objects: ["TELEFON", "BÖGRE", "LÁMPA", "KULCS", "CERUZA", "ABLAK", "ASZTAL", "SZÉK", "KÖNYV", "TÁSKA"]
};

const wordEl = document.getElementById("word");
const keyboardEl = document.getElementById("keyboard");
const statusTitle = document.getElementById("statusTitle");
const statusText = document.getElementById("statusText");
const missesEl = document.getElementById("misses");
const winsEl = document.getElementById("wins");
const streakEl = document.getElementById("streak");
const bodyParts = [
  "partHead",
  "partBody",
  "partLeftArm",
  "partRightArm",
  "partLeftLeg",
  "partRightLeg"
].map((id) => document.getElementById(id));

let category = "all";
let answer = "";
let guessed = new Set();
let misses = 0;
let finished = false;
let stats = readStats();

newGame();

document.getElementById("newButton").addEventListener("click", newGame);

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    category = button.dataset.category;
    updateCategoryButtons();
    newGame();
  });
});

window.addEventListener("keydown", (event) => {
  const letter = event.key.toLocaleUpperCase("hu-HU");
  if (LETTERS.includes(letter)) guess(letter);
});

function readStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || { wins: 0, losses: 0, streak: 0 };
  } catch {
    return { wins: 0, losses: 0, streak: 0 };
  }
}

function saveStats() {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function newGame() {
  answer = pickWord();
  guessed = new Set();
  misses = 0;
  finished = false;
  setStatus("Találd ki a szót", categoryLabel());
  render();
}

function pickWord() {
  const pool = category === "all"
    ? Object.values(WORDS).flat()
    : WORDS[category];
  return pool[Math.floor(Math.random() * pool.length)];
}

function guess(letter) {
  if (finished || guessed.has(letter)) return;

  guessed.add(letter);

  if (!answer.includes(letter)) {
    misses += 1;
  }

  if (isSolved()) {
    finished = true;
    stats.wins += 1;
    stats.streak += 1;
    saveStats();
    setStatus("Megvan", `A szó: ${answer}`);
  } else if (misses >= MAX_MISSES) {
    finished = true;
    stats.losses += 1;
    stats.streak = 0;
    saveStats();
    setStatus("Vége", `A megfejtés: ${answer}`);
  } else if (answer.includes(letter)) {
    setStatus("Talált", `${letter} benne van.`);
  } else {
    setStatus("Nincs benne", `${MAX_MISSES - misses} hiba maradt.`);
  }

  render();
}

function isSolved() {
  return answer.split("").every((char) => char === " " || guessed.has(char));
}

function render() {
  renderWord();
  renderKeyboard();
  missesEl.textContent = misses;
  winsEl.textContent = stats.wins;
  streakEl.textContent = stats.streak;
  bodyParts.forEach((part, index) => {
    part.classList.toggle("visible", index < misses);
  });
}

function renderWord() {
  wordEl.innerHTML = "";
  answer.split("").forEach((char) => {
    const tile = document.createElement("span");
    tile.className = "letter";

    if (char === " ") {
      tile.classList.add("space");
      tile.textContent = "";
    } else {
      tile.textContent = guessed.has(char) || finished ? char : "";
    }

    wordEl.appendChild(tile);
  });
}

function renderKeyboard() {
  keyboardEl.innerHTML = "";
  LETTERS.forEach((letter) => {
    const key = document.createElement("button");
    key.className = "key";
    key.type = "button";
    key.textContent = letter;
    key.disabled = finished || guessed.has(letter);

    if (guessed.has(letter)) {
      key.classList.add(answer.includes(letter) ? "good" : "bad");
    }

    key.addEventListener("click", () => guess(letter));
    keyboardEl.appendChild(key);
  });
}

function setStatus(title, text) {
  statusTitle.textContent = title;
  statusText.textContent = text;
}

function categoryLabel() {
  if (category === "animals") return "Kategória: állatok.";
  if (category === "cities") return "Kategória: városok.";
  if (category === "objects") return "Kategória: tárgyak.";
  return "Vegyes kategória.";
}

function updateCategoryButtons() {
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
}
