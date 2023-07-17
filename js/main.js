function showStats() {
  window.alert(`WxH: ${window.innerWidth}x${window.innerHeight}`);
}

(async () => {
  await loadBasicEvolutionJson();
  await loadPokeCsv();

  attachContextMenus();

  initializeCurrentLevel();
  updateCurrentLevel();
  initializeCurrentGold();
  updateCurrentGold();
  updateExpForNextLevelElement();

  resetBuyers();

  deleteAudioElementCries();

  addEventListeners();

  document.getElementById("right-box-pokeball").style.display = "block";
})();

async function loadPokeCsv() {
  const response = await fetch(
    "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon.csv"
  );
  const text = await response.text();

  window.pokeCsv = csvToArray(text, ",");
}

async function loadBasicEvolutionJson() {
  const response = await fetch(
    `https://lznnwinmjydhyenhcjry.supabase.co/storage/v1/object/public/json/basic-evolutions.json?v=2`
  );
  const jsonResponse = await response.json();

  window.pokelist = jsonResponse.select;
}

function changePokeBall() {
  if (0 !== Math.floor(Math.random() * 10)) {
    const pokeBalls = ["poke-ball", "great-ball", "ultra-ball", "master-ball"];

    const pokeBallName =
      pokeBalls[Math.floor(Math.random() * pokeBalls.length)];

    document.getElementById(
      "poke-ball"
    ).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${pokeBallName}.png`;
  }
}

function addEventListeners() {
  addEventListener("mouseup", (event) => {
    clearInterval(window._mouseDownInterval);
  });

  addEventListener("keydown", (event) => {
    if (event.code === "KeyP") {
      onPokeBallClick();
    }
  });
}

function attachContextMenus() {
  const shuffledCells = getAllShuffledCells();

  shuffledCells.forEach((eachShuffledCell) => {
    attachBackpackContextMenu(eachShuffledCell);
  });

  const buyerCells = Array.from(document.querySelectorAll("[id^=buyer-]"));

  buyerCells.forEach((eachShuffledCell) => {
    attachBuyerContextMenu(eachShuffledCell);
  });
}

function playBgm() {
  const bgmElement = document.getElementById("pokemon-theme-bgm");

  if (!bgmElement.paused) {
    return;
  }

  bgmElement.volume = 0.01;
  bgmElement.play();
}

function initializeCurrentLevel() {
  window.currentLevel = Number.parseInt(
    window.localStorage.getItem("current_lv"),
    10
  );

  if (!window.currentLevel) {
    window.currentLevel = 1;
    window.localStorage.setItem("current_lv", window.currentLevel);
  }
}

function initializeCurrentGold() {
  window.currentGold = Number.parseInt(
    window.localStorage.getItem("current_gold"),
    10
  );

  if (!window.currentGold) {
    window.currentGold = 0;
    window.localStorage.setItem("current_gold", window.currentGold);
  }
}

const _MAX_ROW_COLUMN_ELEMENTS = 10;
const _ONE_EVOLUTION_LEVEL_REQUIREMENT = 50;
const _FIFTY_MAX_BELOW_LEVEL = 10;

function getPool() {
  let pool = window.pokelist;

  pool = pool.slice(0, window.currentLevel);

  return pool;
}

function getIdentifierForCsv(displayName, callerName) {
  return displayName
    .replaceAll(".", "")
    .replaceAll(" ", "-")
    .replaceAll(":", "")
    .replaceAll("♀", "-m")
    .replaceAll("♂", "-f")
    .replaceAll(`'`, "")
    .replaceAll("é", "e")
    .toLowerCase();
}

function shuffleArray(anArrayCopy) {
  for (let i = anArrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [anArrayCopy[i], anArrayCopy[j]] = [anArrayCopy[j], anArrayCopy[i]];
  }
}

function getSecondEvolutionPokemonDisplayNameByChance(chainDataList) {
  if (1 === chainDataList.length) {
    return chainDataList[0];
  }

  if (Math.floor(Math.random() * 20) > 0) {
    return chainDataList[0];
  }

  return chainDataList[1];
}

function getCellsWithDisplayName() {
  const allShuffledCells = getAllShuffledCells();

  return allShuffledCells.filter(
    (eachCell) => null !== eachCell.getAttribute("data-display-name")
  );
}

function getIncreasingChanceByLevel(maxIncrease = 15) {
  return Math.min(maxIncrease, Math.floor(window.currentLevel / 1.5));
}

function getChainData() {
  let pool = getPool();

  if (0 === Math.floor(Math.random() * (20 - getIncreasingChanceByLevel(15)))) {
    const buyerCellsWithChainIndex = Array.from(
      document.querySelectorAll("[id^=buyer-][data-chain-index]")
    );

    const totalBuyerCellsWithChainIndex = buyerCellsWithChainIndex.length;
    if (totalBuyerCellsWithChainIndex > 0) {
      const randomBuyerCellWithChainIndex =
        buyerCellsWithChainIndex[
          Math.floor(Math.random() * totalBuyerCellsWithChainIndex)
        ];

      const chainIndex = Number.parseInt(
        randomBuyerCellWithChainIndex.getAttribute("data-chain-index"),
        10
      );
      return pool[chainIndex];
    }
  }

  if (0 === Math.floor(Math.random() * (20 - getIncreasingChanceByLevel(15)))) {
    const cellsWithDisplayName = getCellsWithDisplayName();

    const totalCellsWithDisplayName = cellsWithDisplayName.length;
    if (totalCellsWithDisplayName > 0) {
      const randomCellWithDisplayName =
        cellsWithDisplayName[
          Math.floor(Math.random() * totalCellsWithDisplayName)
        ];
      const chainIndex = Number.parseInt(
        randomCellWithDisplayName.getAttribute("data-chain-index"),
        10
      );

      return pool[chainIndex];
    }
  }

  const totalLength = pool.length;

  const randomNumber = Math.floor(Math.random() * totalLength);

  return pool[randomNumber];
}

function randomizeCell(cellElement) {
  const chainData = getChainData();

  cellElement.setAttribute("data-chain-index", chainData.chainIndex);
  cellElement.setAttribute("data-chain-length", chainData.list.length);
  cellElement.setAttribute(
    "data-evolution-chain-string",
    chainData.list
      .map((eachEvolutionName) =>
        Array.isArray(eachEvolutionName)
          ? eachEvolutionName.join("/")
          : eachEvolutionName
      )
      .join(" > ")
  );

  let pokemonDisplayName = getSecondEvolutionPokemonDisplayNameByChance(
    chainData.list
  );

  if (Array.isArray(pokemonDisplayName)) {
    pokemonDisplayName =
      pokemonDisplayName[Math.floor(Math.random() * pokemonDisplayName.length)];
  }

  cellElement.setAttribute("data-display-name", pokemonDisplayName);

  decorateCell(cellElement, pokemonDisplayName, 1);
}

function updateExpForNextLevelElement() {
  window.upgradeCountForCurrentLevel = window.upgradeCountForCurrentLevel || 0;
  const expForNextLevelElement = document.getElementById("exp-for-next-level");
  expForNextLevelElement.innerText = `(${window.upgradeCountForCurrentLevel} / ${window.currentLevel})`;
}

function updateCurrentLevel() {
  const currentLevelElement = document.getElementById("current-level");
  currentLevelElement.innerText = window.currentLevel;
}

function updateCurrentGold() {
  const currentGoldElement = document.getElementById("current-gold");
  currentGoldElement.innerText = `${window.currentGold}`;
}

function increaseCurrentGold(goldIncrease) {
  window.currentGold += goldIncrease;

  window.localStorage.setItem("current_gold", window.currentGold);

  updateCurrentGold();
}

function updateUpgradeCount() {
  window.upgradeCountForCurrentLevel =
    (window.upgradeCountForCurrentLevel || 0) + 1;

  const expForNextLevelElement = document.getElementById("exp-for-next-level");

  if (window.upgradeCountForCurrentLevel < window.currentLevel) {
    updateExpForNextLevelElement();
    return;
  }

  window.currentLevel += 1;
  localStorage.setItem("current_lv", window.currentLevel);
  window.upgradeCountForCurrentLevel = 0;
  updateExpForNextLevelElement();
  updateCurrentLevel();
  playSound("level-up-sound");
}

function clearIdentifierAttributes(cellElement) {
  const attributeNames = Array.from(cellElement.attributes).map(
    ({ name }) => name
  );

  attributeNames.forEach((eachAttributeName) => {
    if (/^data\-identifier\-/.test(eachAttributeName)) {
      cellElement.removeAttribute(eachAttributeName);
    }
  });
}

function upgradeCell(previousCellElement, cellElement) {
  const currentEvolutionCount = Number.parseInt(
    cellElement.getAttribute("data-evolution-count"),
    10
  );
  const chainLength = Number.parseInt(
    cellElement.getAttribute("data-chain-length"),
    10
  );

  if (currentEvolutionCount == chainLength) {
    setSelectedCell(window.selectedCellElement);
    return;
  }

  clearIdentifierAttributes(previousCellElement);
  clearIdentifierAttributes(cellElement);

  const chainIndex = Number.parseInt(
    cellElement.getAttribute("data-chain-index"),
    10
  );

  const nextEvolutionCount = currentEvolutionCount + 1;

  cellElement.setAttribute("data-evolution-count", nextEvolutionCount);
  cellElement.setAttribute(`evolution-${nextEvolutionCount + 1}`, "true");

  let nextEvolutionName =
    window.pokelist[chainIndex].list[nextEvolutionCount - 1];

  const maybeArrayLength = nextEvolutionName.length;

  if (Array.isArray(nextEvolutionName) && maybeArrayLength > 1) {
    nextEvolutionName =
      nextEvolutionName[Math.floor(Math.random() * maybeArrayLength)];
  }

  decorateCell(cellElement, nextEvolutionName, nextEvolutionCount);

  clearShuffledCell(previousCellElement);

  clearSelectedCell();

  updateUpgradeCount();
  playSound("plus-sound");
}

function findPokemonFromCsv(identifierPrefix) {
  const exactMatch = window.pokeCsv.find(
    (eachPokemon) => eachPokemon.identifier === identifierPrefix
  );

  if (exactMatch) {
    return exactMatch;
  }

  return window.pokeCsv.find((eachPokemon) =>
    eachPokemon.identifier.match(`^${identifierPrefix}`)
  );
}

function getPokemonImageUrl(pokemonId) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

function updateDisplayCell(
  cellElement,
  pokemonId,
  pokemonDisplayName,
  isBuyer
) {
  cellElement.firstElementChild &&
    cellElement.removeChild(cellElement.firstElementChild);
  cellElement.firstElementChild &&
    cellElement.removeChild(cellElement.firstElementChild);
  cellElement.firstElementChild &&
    cellElement.removeChild(cellElement.firstElementChild);
  cellElement.firstElementChild &&
    cellElement.removeChild(cellElement.firstElementChild);
  cellElement.firstElementChild &&
    cellElement.removeChild(cellElement.firstElementChild);

  const imageUrl = getPokemonImageUrl(pokemonId);
  let img = document.createElement("img");
  img.src = imageUrl;
  img.classList.add("pixelated");

  const divElement = document.createElement("div");
  divElement.classList.add("image-container");
  divElement.appendChild(img);
  // divElement.classList.add('occupy-height');
  cellElement.appendChild(divElement);

  const textContainerElement = document.createElement("div");
  textContainerElement.classList.add("text-container");

  const textDivElement = document.createElement("div");
  textDivElement.innerText = pokemonDisplayName;
  textDivElement.classList.add("occupy-center");
  textContainerElement.appendChild(textDivElement);

  if (!isBuyer) {
    cellElement.appendChild(textContainerElement);
    return;
  }
  const buyPriceDivElement = document.createElement("div");
  const finalSellValue = cellElement.getAttribute("data-buyer-sell-value");
  buyPriceDivElement.innerHTML = `<span>Sell for ${finalSellValue}<span>`;
  buyPriceDivElement.classList.add("occupy-center", "second-center-text");

  textContainerElement.appendChild(buyPriceDivElement);

  cellElement.appendChild(textContainerElement);
}

function setSelectedCell(cellElement) {
  clearSelectedCell();

  window.selectedCellElement = cellElement;
  cellElement.classList.add("selected-cell");

  document.getElementById("evolution-chain").innerText =
    cellElement.getAttribute("data-evolution-chain-string");

  document
    .getElementById("left-box-evolution-chain")
    .setAttribute("data-show-that", "show");

  setBackpackSameIdentifier(cellElement.getAttribute("data-identifier"));

  playSound("click-sound");
  playBgm();
}

function sellCell(cellElement) {
  const evolutionCount = Number.parseInt(
    cellElement.getAttribute("data-evolution-count"),
    10
  );

  cellElement.classList.remove("selected-cell");
  clearSelectedCell();
  increaseCurrentGold(Math.pow(evolutionCount, 2));

  playSound("coin-sound");
}

function attachBackpackContextMenu(cellElement) {
  cellElement.removeEventListener("contextmenu", onBackpackContextMenu);
  cellElement.addEventListener("contextmenu", onBackpackContextMenu);

  function onBackpackContextMenu(event) {
    event.preventDefault();

    if (null === cellElement.getAttribute("data-identifier")) {
      return;
    }

    sellCell(cellElement);
    clearShuffledCell(cellElement);
  }
}

function decorateCell(cellElement, pokemonDisplayName, evolutionCount) {
  const validNameForCsv = getIdentifierForCsv(
    pokemonDisplayName,
    "decorateCell"
  );

  const pokemonData = findPokemonFromCsv(validNameForCsv);

  if (!pokemonData) {
    console.error(`No data for ${pokemonDisplayName}`);
    return;
  }

  const pokemonId = pokemonData.id;

  const pokemonIdentifier = pokemonData.identifier;

  updateDisplayCell(cellElement, pokemonId, pokemonDisplayName);

  const sellValue = Math.pow(evolutionCount, 2);

  cellElement.setAttribute(
    "title",
    `${cellElement.getAttribute(
      "data-evolution-chain-string"
    )}\nRight click to sell for ${sellValue} gold.`
  );
  cellElement.setAttribute("data-identifier", pokemonIdentifier);
  cellElement.setAttribute(`data-identifier-${pokemonIdentifier}`, "true");
  cellElement.setAttribute("data-evolution-count", evolutionCount);
  cellElement.setAttribute(`data-evolution-${evolutionCount}`, "true");

  cellElement.onclick = () => {
    if (null === cellElement.getAttribute("data-identifier")) {
      return;
    }

    if (window.selectedCellElement) {
      window.selectedCellElement.classList.remove("selected-cell");

      if (
        pokemonIdentifier ===
          window.selectedCellElement.getAttribute("data-identifier") &&
        cellElement.getAttribute("id") !==
          window.selectedCellElement.getAttribute("id")
      ) {
        upgradeCell(window.selectedCellElement, cellElement);
        return;
      }
    }

    setSelectedCell(cellElement);
  };
}

function getEmptyShuffledCell() {
  const everyCells = getAllShuffledCells();

  return everyCells.findIndex(
    (eachCell) => null === eachCell.getAttribute("data-display-name")
  );
}

function getAllShuffledCells() {
  return Array.from(document.querySelectorAll("[id^=shuffled-cell-]"));
}

function playSound(audioId) {
  const thisAudio = document.getElementById(audioId);

  const volumeMap = {
    ["pokeball-open-sound"]: 0.25,
  };

  thisAudio.volume = volumeMap[audioId] || 1;

  thisAudio.pause();
  thisAudio.currentTime = 0;
  thisAudio.play();
}

function onPokeBallClick() {
  let indexWithoutDisplayName = getEmptyShuffledCell();

  if (
    "number" === typeof indexWithoutDisplayName &&
    indexWithoutDisplayName >= 0
  ) {
    randomizeCell(
      document.getElementById(`shuffled-cell-${indexWithoutDisplayName}`)
    );

    const pokeBall = document.getElementById("poke-ball");
    pokeBall.style.animation = "none";
    pokeBall.offsetHeight; /* trigger reflow */
    pokeBall.style.animation = null;
    playSound("pokeball-open-sound");
    changePokeBall();
  }

  clearSelectedCell();
}

function onPokeballMouseDown() {
  clearInterval(window._mouseDownInterval);
  clearTimeout(window._mouseDownTimeout);
  window._mouseDownTimeout = setTimeout(() => {
    clearInterval(window._mouseDownInterval);
    window._mouseDownInterval = setInterval(() => {
      onPokeBallClick();
    }, 100);
  }, 800);
}

function onPokeballMouseUp() {
  clearTimeout(window._mouseDownTimeout);
  clearInterval(window._mouseDownInterval);
}

function randomizeBuyerCell(cellElement) {
  let allShuffledCells = getAllShuffledCells();

  const indexNotNull = allShuffledCells.findIndex(
    (eachCell) => null !== eachCell.getAttribute("data-display-name")
  );

  if ("number" !== typeof indexNotNull || indexNotNull < 0) {
    return;
  }

  if (cellElement._nextRandomForThisCell > Date.now()) {
    return;
  }

  const allDisplayNames = Array.from(
    document.querySelectorAll("[id^=shuffled-cell-]")
  ).map((eachCell) => eachCell.getAttribute("data-display-name"));

  const duplicateMap = {};
  allDisplayNames.forEach((eachName) => {
    duplicateMap[eachName] = (duplicateMap[eachName] || 0) + 1;
  });

  const getRandomHigherEvolutionNumber = Math.floor(Math.random() * 2);

  const namesOnly = Object.entries(duplicateMap)
    .filter(([k, v]) => v > getRandomHigherEvolutionNumber)
    .map(([k, v]) => k);

  const allUniqueNamesCopy = [...namesOnly].filter(
    (removeSomeNamesThatAreNullString) =>
      removeSomeNamesThatAreNullString !== "null"
  );

  const allUniqueNamesLength = allUniqueNamesCopy.length;

  const randomIndexFromNames = Math.floor(Math.random() * allUniqueNamesLength);

  const randomUniqueName = allUniqueNamesCopy[randomIndexFromNames];

  const numberOfDuplicates = duplicateMap[randomUniqueName];

  let pokemonDisplayName = randomUniqueName;

  const thatElement = Array.from(
    document.querySelectorAll("[id^=shuffled-cell-]")
  ).find(
    (eachCell) =>
      pokemonDisplayName === eachCell.getAttribute("data-display-name")
  );

  const chainString = thatElement.getAttribute("data-evolution-chain-string");
  const chainIndex = thatElement.getAttribute("data-chain-index");

  let additionalSellValue = 0;

  if (numberOfDuplicates > 1) {
    const matches = chainString.match(
      new RegExp(`${pokemonDisplayName} > (.+)`)
    );

    if (null !== matches) {
      const [_, thatMatch] = matches;

      pokemonDisplayName = thatMatch.split(" > ").at(0);
      additionalSellValue = 5;

      const maybeMoreByEvolutionLevel = pokemonDisplayName.split("/");

      if (maybeMoreByEvolutionLevel.length > 1) {
        pokemonDisplayName =
          maybeMoreByEvolutionLevel[
            Math.floor(Math.random() * maybeMoreByEvolutionLevel.length)
          ];
        additionalSellValue = 10;
      }
    }
  }

  const allBuyers = Array.from(document.querySelectorAll("[id^=buyer-]"));
  const existingBuyersWithDisplayName = allBuyers.filter(
    (eachBuyerCell) =>
      pokemonDisplayName === eachBuyerCell.getAttribute("data-display-name")
  );

  if (existingBuyersWithDisplayName.length > 1) {
    return;
  }

  const basicEvolutionData = window.pokelist.find(({ list }) =>
    list.find((eachInList) => new RegExp(pokemonDisplayName).test(eachInList))
  );

  const minimumSellValue = Math.max(1, 10 - numberOfDuplicates);
  const maximumSellValue =
    minimumSellValue +
    additionalSellValue * 2 +
    (5 - basicEvolutionData.list.length) * 2;
  const differenceSellValue = maximumSellValue - minimumSellValue;
  const finalSellValue =
    minimumSellValue + Math.floor(Math.random() * differenceSellValue);

  cellElement.setAttribute("data-buyer-sell-value", finalSellValue);
  cellElement.setAttribute("data-evolution-chain-string", chainString);
  cellElement.setAttribute("data-chain-index", chainIndex);

  const evolutionIndex = chainString
    .split(" > ")
    .findIndex((eachItem) => eachItem.split("/").includes(pokemonDisplayName));

  cellElement.setAttribute(`data-evolution-${evolutionIndex + 1}`, true);

  decorateBuyerCell(cellElement, pokemonDisplayName);

  const buyerRefreshElement = document.createElement("div");
  buyerRefreshElement.classList.add("buyer-refresh");
  buyerRefreshElement.setAttribute("title", "Randomize for 10 Gold");
  buyerRefreshElement.setAttribute(
    "id",
    `buyer-refresh-${cellElement.getAttribute("id")}`
  );
  buyerRefreshElement.innerText = "⟳";
  cellElement.prepend(buyerRefreshElement);

  restartBuyerRandomizeTimeout(cellElement);
}

function restartBuyerRandomizeTimeout(cellElement) {
  cellElement._allowBuyerRandomizeTimeout &&
    clearTimeout(cellElement._allowBuyerRandomizeTimeout);
  cellElement._allowBuyerRandomizeTimeout = setTimeout(() => {
    clearTimeout(cellElement._allowBuyerRandomizeTimeout);
    cellElement.setAttribute("data-display-buyer-randomize-button", true);
  }, 6000);
}

function resetBuyers() {
  window._buyerInterval && clearInterval(window._buyerInterval);
  window._buyerInterval = setInterval(() => {
    for (let i = 0; i < 5; i += 1) {
      const cellElement = document.getElementById(`buyer-${i}`);

      if (null !== cellElement.getAttribute("data-identifier")) {
        continue;
      }

      if (cellElement._nextRandomForThisCell > Date.now()) {
        continue;
      }

      randomizeBuyerCell(cellElement);

      return;
    }
  }, 1000);
}

function clearSelectedCell() {
  if (window.selectedCellElement) {
    window.selectedCellElement.classList.remove("selected-cell");
    window.selectedCellElement = null;
  }

  Array.from(document.querySelectorAll(`[id^=buyer-]`)).forEach((eachItem) =>
    eachItem.classList.remove("highlight-border")
  );
  Array.from(document.querySelectorAll(`[id^=shuffled-cell-]`)).forEach(
    (eachItem) => eachItem.classList.remove("highlight-border")
  );

  document
    .getElementById("left-box-evolution-chain")
    .removeAttribute("data-show-that");
}

function setBackpackSameIdentifier(dataIdentifierName) {
  Array.from(
    document.querySelectorAll(`[data-identifier-${dataIdentifierName}]`)
  ).forEach((eachItem) => eachItem.classList.add("highlight-border"));
}

function clearShuffledCell(cellElement) {
  cellElement.classList.remove("selected-cell");
  cellElement.removeAttribute("data-chain-index");
  cellElement.removeAttribute("data-chain-length");
  cellElement.removeAttribute("data-evolution-chain-string");
  cellElement.removeAttribute("data-display-name");
  cellElement.removeAttribute("title");
  cellElement.removeAttribute("data-identifier");
  cellElement.removeAttribute("data-evolution-count");
  cellElement.removeAttribute("data-evolution-1");
  cellElement.removeAttribute("data-evolution-2");
  cellElement.removeAttribute("data-evolution-3");
  cellElement.removeAttribute("data-evolution-4");
  clearIdentifierAttributes(cellElement);

  cellElement.innerHTML = '<img src="transparent-picture.png" />';
}

function deleteAudioElementCries() {
  window._playedCries = window._playedCries || {};
  window._deleteCriesInterval && clearInterval(window._deleteCriesInterval);
  window._deleteCriesInterval = setInterval(() => {
    const allCriesKeys = Object.keys(window._playedCries);

    if (!allCriesKeys.length) {
      return;
    }

    const currentDate = Date.now();

    for (let keyIndex = 0; keyIndex < allCriesKeys.length; keyIndex += 1) {
      const audioElementId = allCriesKeys[keyIndex];
      if (window._playedCries[audioElementId] > currentDate) {
        continue;
      }

      window._playedCries[audioElementId] = undefined;
      delete window._playedCries[audioElementId];

      document.getElementById(audioElementId).remove();
    }
  }, 500);
}

function playCry(pokemonIdentifier) {
  const audioElement = document.createElement("audio");
  const audioElementId = `pokemon-cry-${pokemonIdentifier}`;
  audioElement.setAttribute("id", audioElementId);
  audioElement.setAttribute(
    "src",
    `https://play.pokemonshowdown.com/audio/cries/${pokemonIdentifier}.mp3`
  );
  audioElement.volume = 0.1;

  document.getElementById("audio-cries").appendChild(audioElement);

  playSound(audioElementId);
  window._playedCries = window._playedCries || {};
  window._playedCries[audioElementId] = Date.now() + 3000;
}

function attachBuyerContextMenu(cellElement) {
  cellElement.addEventListener("contextmenu", onBuyerContextMenu, true);

  function onBuyerContextMenu(event) {
    event.preventDefault();

    if (window.currentGold < 10) {
      return;
    }

    if (null === cellElement.getAttribute("data-identifier")) {
      return;
    }

    if (cellElement._nextRandomForThisCell > Date.now()) {
      return;
    }

    cellElement.removeAttribute("data-evolution-1");
    cellElement.removeAttribute("data-evolution-2");
    cellElement.removeAttribute("data-evolution-3");
    cellElement.removeAttribute("data-evolution-4");

    randomizeBuyerCell(cellElement);
    cellElement.removeAttribute("data-display-buyer-randomize-button");

    increaseCurrentGold(-10);

    cellElement._nextRandomForThisCell = Date.now() + 6000;
    restartBuyerRandomizeTimeout(cellElement);

    playSound("shuffle-sound");
  }
}

function decorateBuyerCell(cellElement, pokemonDisplayName) {
  const validNameForCsv = getIdentifierForCsv(
    pokemonDisplayName,
    "decorateBuyerCell"
  );

  const pokemonData = findPokemonFromCsv(validNameForCsv);

  if (!pokemonData) {
    console.error(`No data for ${pokemonDisplayName}`);
    return;
  }

  const pokemonId = pokemonData.id;

  const pokemonIdentifier = pokemonData.identifier;

  updateDisplayCell(cellElement, pokemonId, pokemonDisplayName, true);

  // cellElement.setAttribute('title', pokemonDisplayName);
  cellElement.setAttribute(
    "title",
    cellElement.getAttribute("data-evolution-chain-string")
  );
  cellElement.setAttribute("data-identifier", pokemonIdentifier);
  cellElement.setAttribute(`data-identifier-${pokemonIdentifier}`, "true");
  cellElement.setAttribute("data-display-name", pokemonDisplayName);

  cellElement.onclick = () => {
    if (!window.selectedCellElement) {
      return;
    }

    const selectedIdentifier =
      window.selectedCellElement.getAttribute("data-identifier");

    const thisIdentifier = cellElement.getAttribute("data-identifier");

    if (selectedIdentifier !== thisIdentifier) {
      return;
    }

    clearIdentifierAttributes(cellElement);

    resetBuyers();

    cellElement.removeAttribute("data-display-buyer-randomize-button");
    cellElement.removeAttribute("data-chain-index");
    cellElement.removeAttribute("title");
    cellElement.removeAttribute("data-display-name");

    const goldIncreaseValue = Number.parseInt(
      cellElement.getAttribute("data-buyer-sell-value"),
      10
    );

    cellElement.removeAttribute("data-buyer-sell-value");
    cellElement.removeAttribute("data-evolution-chain-string");
    cellElement.removeAttribute("data-identifier");

    cellElement.removeAttribute("data-evolution-1");
    cellElement.removeAttribute("data-evolution-2");
    cellElement.removeAttribute("data-evolution-3");
    cellElement.removeAttribute("data-evolution-4");

    increaseCurrentGold(goldIncreaseValue);

    navigator.vibrate(150);

    cellElement.innerHTML = '<img src="transparent-picture.png" />';

    clearShuffledCell(window.selectedCellElement);

    clearSelectedCell();

    playSound("gold-sound");

    playCry(pokemonIdentifier);
  };
}

function openSettings() {}
