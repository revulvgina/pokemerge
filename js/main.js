function showStats() {
  window.alert(`WxH: ${window.innerWidth}x${window.innerHeight}`);
}

(async () => {

  window.defaultPokeBallCell = `<img src="./images/poke-ball.png" onclick="onPokeBallCellClick(this)" ondragstart="onPokeBallCellClick(this)" />`;
  window.pokeBallRandomIndexList = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3,
  ];
  window.totalPokeBallRandomIndexList = window.pokeBallRandomIndexList.length;
  window.pokeBallNames = [
    "poke-ball",
    "great-ball",
    "ultra-ball",
    "master-ball",
  ];

	document.addEventListener('imports-loaded', async () => {
		await loadBasicEvolutionJson();
		await loadPokeCsv();

    createBuyerCells();
    createBackpackCells();

    attachContextMenus();

    initializeCurrentLevel();
    updateCurrentLevel();
    initializeCurrentGold();
    updateCurrentGold();
    updateExpForNextLevelElement();

    resetBuyers();

    deleteAudioElementCriesInterval();

    addEventListeners();

    initializeBackpackBalls();

    initializeEncounter();

    initializeMouseMoveListener();
	});
})();

async function loadPokeCsv() {
  const response = await fetch(
    "https://raw.githubusercontent.com/revulvgina/pokemerge/master/csv/pokemon.csv"
  );
  const text = await response.text();

  window.pokeCsv = csvToArray(text, ",");
}

async function loadBasicEvolutionJson() {
  const response = await fetch(
    `https://raw.githubusercontent.com/revulvgina/pokemerge/master/json/basic-evolutions.json`
  );
  const jsonResponse = await response.json();

  window.pokelist = jsonResponse.select;
}

function createBuyerCells() {
  const buyersGrid = document.getElementById("buyers-grid");

  for (let i = 0; i < 5; i += 1) {
    const eachBuyerCell = document.createElement("div");
    eachBuyerCell.id = `buyer-${i}`;
    eachBuyerCell.classList.add("no-highlight");
    eachBuyerCell.innerHTML = `<img src="./images/transparent-picture.png" />`;
    buyersGrid.appendChild(eachBuyerCell);
  }
}

function createBackpackCells() {
  const backpackGrid = document.getElementById("backpack-grid");

  for (let i = 0; i < 25; i += 1) {
    const eachBackpackCell = document.createElement("div");
    eachBackpackCell.id = `shuffled-cell-${i}`;
    eachBackpackCell.classList.add("backpack-0", "no-highlight");
    eachBackpackCell.innerHTML = `<img src="./images/transparent-picture.png" />`;
    backpackGrid.appendChild(eachBackpackCell);
  }
}

function initializeEncounter() {
  window._encounterDuration = -Infinity;
  window._encounterPokemonBallList = [2, 2, 2, 2, 3];
}

function adjustEncounterDisplay() {
  const { offsetWidth, offsetHeight } =
    document.querySelector("div.backpack-grid");
  document.querySelector("#spinning-box").style.width = `${offsetWidth}px`;
  document.querySelector("#spinning-box").style.height = `${offsetHeight}px`;
}

function createRandomPokeBallImage() {
  const imgTag = document.createElement("img");
  const randomPokeBallIndex = getRandomPokeBallIndex();
  const pokeBallName = window.pokeBallNames[randomPokeBallIndex];
  imgTag.setAttribute("src", `./images/${pokeBallName}.png`);
  imgTag.onclick = () => onPokeBallCellClick(imgTag, randomPokeBallIndex);
  imgTag.ondragstart = () => onPokeBallCellClick(imgTag, randomPokeBallIndex);
  imgTag.setAttribute("data-pokeball-index", randomPokeBallIndex);
  imgTag.setAttribute("data-click-price", getClickPrice(randomPokeBallIndex));
  imgTag.setAttribute(
    "title",
    `Open for ${getClickPrice(randomPokeBallIndex)} gold`
  );

  return imgTag;
}

function attachCellWithPokeBallImage(cellElement) {
  cellElement.innerHTML = "";
  cellElement.appendChild(createRandomPokeBallImage());
  cellElement.setAttribute(
    "data-evolution-count",
    Number.parseInt(
      cellElement.firstChild.getAttribute("data-pokeball-index"),
      10
    ) + 1
  );
}

function initializeBackpackBalls() {
  const backpackCells = Array.from(
    document.querySelectorAll("[id^=shuffled-cell-]")
  );

  backpackCells.forEach((eachCell) => {
    attachCellWithPokeBallImage(eachCell);
  });
}

function getBasePrice(evolutionCount) {
  return Math.pow(evolutionCount, evolutionCount);
}

function getRandomBuyerPrice(evolutionCount) {
  const basePrice = getBasePrice(evolutionCount);

  return 3 + basePrice + Math.floor(Math.random() * basePrice);
}

function getClickPrice(pokeBallIndex) {
  return Math.min(10, (pokeBallIndex + 1) * 3);
}

function getRandomPokeBallIndex() {
  if (window._encounterDuration > Date.now()) {
    return getRandomItem(window._encounterPokemonBallList);
  }

  return window.pokeBallRandomIndexList[
    Math.floor(Math.random() * window.totalPokeBallRandomIndexList)
  ];
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

  bgmElement.volume = 0.03;
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
    window.currentGold = 100;
    window.localStorage.setItem("current_gold", window.currentGold);
  }
}

function getPool() {
  return window.pokelist.slice(0, window.currentLevel);
}

function formatDisplayNameAsIdentifierForCsv(displayName) {
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

function getDisplayNameAndSecondEvolutionByChance(chainDataList) {
  if (1 === chainDataList.length) {
    return {
      pokemonDisplayName: chainDataList[0],
      evolutionCount: 1,
    };
  }

  if (Math.floor(Math.random() * 20) > 0) {
    return {
      pokemonDisplayName: chainDataList[0],
      evolutionCount: 1,
    };
  }

  let pokemonDisplayName = chainDataList[1];

  if (Array.isArray(pokemonDisplayName)) {
    pokemonDisplayName =
      pokemonDisplayName[Math.floor(Math.random() * pokemonDisplayName.length)];
  }

  return {
    pokemonDisplayName,
    evolutionCount: 2,
  };
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

function findInPool(thisPool, displayName) {
  return thisPool.find(({ list }) =>
    list.find((eachInList) =>
      Array.isArray(eachInList)
        ? eachInList.includes(displayName)
        : eachInList === displayName
    )
  );
}

function getRandomItem(listOfItems) {
  const totalItems = listOfItems.length;

  return listOfItems[Math.floor(Math.random() * totalItems)];
}

function getChainData(pokeBallIndex) {
  let pool = getPool();

  const poolByPokeBallIndex = pool.filter((eachChain) => {
    return eachChain.list.length >= Math.min(3, pokeBallIndex + 1);
  });

  const allNamesInPool = poolByPokeBallIndex
    .map((eachChain) => {
      if (3 === pokeBallIndex) {
        return eachChain.list[2];
      }

      return eachChain.list.slice(0, pokeBallIndex + 1);
    })
    .flat(3);

  if (0 === Math.floor(Math.random() * (20 - getIncreasingChanceByLevel(15)))) {
    const buyerCellsWithNames = Array.from(
      document.querySelectorAll("[id^=buyer-][data-display-name]")
    );

    if (buyerCellsWithNames.length > 0) {
      const allBuyerCellNames = buyerCellsWithNames.map((eachBuyerCell) =>
        eachBuyerCell.getAttribute("data-display-name")
      );

      const matchingBuyerDisplayName = allBuyerCellNames.find((eachName) =>
        allNamesInPool.includes(eachName)
      );

      if (matchingBuyerDisplayName) {
        const chainData = findInPool(
          poolByPokeBallIndex,
          matchingBuyerDisplayName
        );

        const evolutionIndex = chainData.list.findIndex((eachInList) =>
          Array.isArray(eachInList)
            ? eachInList.includes(matchingBuyerDisplayName)
            : eachInList === matchingBuyerDisplayName
        );

        return {
          pokemonDisplayName: matchingBuyerDisplayName,
          evolutionIndex,
          chainData,
        };
      }
    }
  }

  if (0 === Math.floor(Math.random() * (20 - getIncreasingChanceByLevel(15)))) {
    const backpackCellsWithNames = Array.from(
      document.querySelectorAll("[id^=shuffled-cell-][data-display-name]")
    );

    if (backpackCellsWithNames.length > 0) {
      const allBackpackCellNames = backpackCellsWithNames.map((eachBuyerCell) =>
        eachBuyerCell.getAttribute("data-display-name")
      );

      const matchingBackpackDisplayName = allBackpackCellNames.find(
        (eachName) => allNamesInPool.includes(eachName)
      );

      if (matchingBackpackDisplayName) {
        const chainData = findInPool(
          poolByPokeBallIndex,
          matchingBackpackDisplayName
        );

        const evolutionIndex = chainData.list.findIndex((eachInList) =>
          Array.isArray(eachInList)
            ? eachInList.includes(matchingBackpackDisplayName)
            : eachInList === matchingBackpackDisplayName
        );

        return {
          pokemonDisplayName: matchingBackpackDisplayName,
          evolutionIndex,
          chainData,
        };
      }
    }
  }

  let randomPokemonDisplayNameInChain = getRandomItem(allNamesInPool);

  if (Array.isArray(randomPokemonDisplayNameInChain)) {
    randomPokemonDisplayNameInChain = getRandomItem(
      randomPokemonDisplayNameInChain
    );
  }

  const chainData = findInPool(
    poolByPokeBallIndex,
    randomPokemonDisplayNameInChain
  );

  const evolutionIndex = chainData.list.findIndex((eachInList) =>
    Array.isArray(eachInList)
      ? eachInList.includes(randomPokemonDisplayNameInChain)
      : eachInList === randomPokemonDisplayNameInChain
  );

  return {
    pokemonDisplayName: randomPokemonDisplayNameInChain,
    evolutionIndex,
    chainData,
  };
}

function getChainStringFromChainDataArray(chainDataList) {
  return chainDataList
    .map((eachEvolutionName) =>
      Array.isArray(eachEvolutionName)
        ? eachEvolutionName.join("/")
        : eachEvolutionName
    )
    .join(" > ");
}

function randomizeBackpackCell(cellElement, pokeBallIndex) {
  const { pokemonDisplayName, chainData, evolutionIndex } =
    getChainData(pokeBallIndex);

  cellElement.setAttribute("data-chain-index", chainData.chainIndex);
  cellElement.setAttribute("data-chain-length", chainData.list.length);
  cellElement.setAttribute(
    "data-evolution-chain-string",
    getChainStringFromChainDataArray(chainData.list)
  );

  const evolutionCount = evolutionIndex + 1;

  cellElement.setAttribute("data-display-name", pokemonDisplayName);

  decorateBackpackCell(cellElement, pokemonDisplayName, evolutionCount);
}

function updateExpForNextLevelElement() {
  window.expCountForNextLevel = window.expCountForNextLevel || 0;
  const expForNextLevelElement = document.getElementById("exp-for-next-level");
  expForNextLevelElement.innerText = `(${window.expCountForNextLevel} / ${window.currentLevel})`;
  document.getElementById("exp-bar").style.width = `${
    100 * (window.expCountForNextLevel / window.currentLevel)
  }%`;
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

function updateExpForNextLevelCount() {
  window.expCountForNextLevel = (window.expCountForNextLevel || 0) + 1;

  if (window.expCountForNextLevel < window.currentLevel) {
    updateExpForNextLevelElement();
    return;
  }

  increaseCurrentGold(window.currentLevel * 5);

  window.currentLevel += 1;
  localStorage.setItem("current_lv", window.currentLevel);
  window.expCountForNextLevel = 0;
  updateExpForNextLevelElement();
  updateCurrentLevel();
  playSound("level-up-sound");

  if (0 === window.currentLevel % 5) {
    adjustEncounterDisplay();
    playEncounter();
    window._encounterDuration = Date.now() + 30000;
    document
      .getElementById("encounter-container")
      .classList.remove("display-none");
    window._encounterDurationNotification = setTimeout(() => {
      document
        .getElementById("encounter-container")
        .classList.add("display-none");
    }, 30000);
  }
}

function clearElementAttributesByPrefix(cellElement, attributePrefix) {
  const attributeNames = Array.from(cellElement.attributes).map(
    ({ name }) => name
  );

  attributeNames.forEach((eachAttributeName) => {
    if (new RegExp(`^${attributePrefix}`).test(eachAttributeName)) {
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

  clearElementAttributesByPrefix(cellElement, "data-identifier-");
  clearElementAttributesByPrefix(previousCellElement, "data-identifier-");

  const chainIndex = Number.parseInt(
    cellElement.getAttribute("data-chain-index"),
    10
  );

  cellElement.removeAttribute("data-evolution-count");

  const nextEvolutionCount = currentEvolutionCount + 1;

  cellElement.setAttribute("data-evolution-count", nextEvolutionCount);

  let nextEvolutionName =
    window.pokelist[chainIndex].list[nextEvolutionCount - 1];

  const maybeArrayLength = nextEvolutionName.length;

  if (Array.isArray(nextEvolutionName) && maybeArrayLength > 1) {
    nextEvolutionName =
      nextEvolutionName[Math.floor(Math.random() * maybeArrayLength)];
  }

  decorateBackpackCell(cellElement, nextEvolutionName, nextEvolutionCount);

  clearShuffledCell(previousCellElement);

  clearSelectedCell();

  setSelectedCell(cellElement);

  updateExpForNextLevelCount();

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
  cellElement.innerHTML = "";

  const imageUrl = getPokemonImageUrl(pokemonId);
  let img = document.createElement("img");
  img.src = imageUrl;
  img.setAttribute("draggable", "false");

  const divElement = document.createElement("div");
  divElement.classList.add("image-container");
  divElement.appendChild(img);
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

function setFloatingImageCoordinates({ clientX, clientY }) {
	const floatingImageElement = document.getElementById("floating-image");
	floatingImageElement.style.left = `${window._recordedMouseMoveEvent.clientX-10}px`;
	floatingImageElement.style.top = `${window._recordedMouseMoveEvent.clientY}px`;
}

function initializeMouseMoveListener() {
	document.addEventListener("mousemove", (e) => {
		window._recordedMouseMoveEvent = e;

    if (!window.selectedCellElement) {
      return;
    }

    const pokemonId =
      window.selectedCellElement.getAttribute("data-pokemon-id");
    if (!pokemonId) {
      return;
    }

    const floatingImageElement = document.getElementById("floating-image");
    if (!floatingImageElement.getAttribute("src")) {
      return;
		}

		setFloatingImageCoordinates(window._recordedMouseMoveEvent);
  });
}

function setFloatingImage(pokemonIdString) {
  const floatingImage = document.getElementById("floating-image");
  floatingImage.setAttribute(
    "src",
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonIdString}.png`
	);

	const mouseMoveEvent = window._recordedMouseMoveEvent;
	
	setFloatingImageCoordinates(mouseMoveEvent);
}

function getPokemonDataByDisplayName(pokemonDisplayName) {
  const csvIdentifier = formatDisplayNameAsIdentifierForCsv(pokemonDisplayName);

  return findPokemonFromCsv(csvIdentifier);
}

function setEvolutionChain(cellElement) {
	const chainIndex = Number.parseInt(cellElement.getAttribute('data-chain-index'), 10);
	const chainData = window.pokelist[chainIndex];

	const displayNameInCell = cellElement.getAttribute('data-display-name');

	let collectEach = [];
	chainData.list.forEach((eachDisplayName) => {
		let htmlString = '';
		if (Array.isArray(eachDisplayName)) {
			let listInList = [];
			eachDisplayName.forEach((eachInListInList) => {
				const pokemonData = getPokemonDataByDisplayName(eachInListInList);
				listInList.push(`<div title="${eachInListInList}"${getSelectedCellBorderStyle(eachInListInList)}><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png" /></div>`);
			});

			collectEach.push(listInList.join('<span>|</span>'));
			return;
		}

		const pokemonData = getPokemonDataByDisplayName(eachDisplayName);
		
		collectEach.push(`<div title="${eachDisplayName}"${getSelectedCellBorderStyle(eachDisplayName)}><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png" /></div>`);
	})

	document.getElementById('evolution-chain').innerHTML = collectEach.join('<div><span> > </span></div>');

	function getSelectedCellBorderStyle(displayName) {
		if (displayNameInCell !== displayName) {
			return '';
		}

		return ` class="evolution-chain-border-current"`;
	}
}

function setSelectedCell(cellElement) {
  clearSelectedCell();

  window.selectedCellElement = cellElement;
  cellElement.classList.add("selected-cell");

  document.getElementById("evolution-chain").innerText =
		cellElement.getAttribute("data-evolution-chain-string");
	
	setEvolutionChain(cellElement);
	
  document
    .getElementById("left-box-evolution-chain")
    .setAttribute("data-show-that", "show");

		setFloatingImage(cellElement.getAttribute(
      "data-pokemon-id"
    ));

  if (
    cellElement.getAttribute("data-evolution-count") !==
    cellElement.getAttribute("data-chain-length")
  ) {
    highlightBackpackSameIdentifier(
      cellElement.getAttribute("data-identifier")
    );
  } else {
    highlightBuyerSameIdentifier(cellElement.getAttribute("data-identifier"));
  }

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

  increaseCurrentGold(getBasePrice(evolutionCount));

  playSound("coin-sound");
}

function attachBackpackContextMenu(cellElement) {
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

function decorateBackpackCell(cellElement, pokemonDisplayName, evolutionCount) {
  const pokemonData = getPokemonDataByDisplayName(pokemonDisplayName);

  if (!pokemonData) {
    console.error(`No data for ${pokemonDisplayName}`);
    return;
  }

  const pokemonId = pokemonData.id;

  cellElement.setAttribute("data-pokemon-id", pokemonId);

  const pokemonIdentifier = pokemonData.identifier;

  updateDisplayCell(cellElement, pokemonId, pokemonDisplayName);

  const sellValue = getBasePrice(evolutionCount);

  cellElement.setAttribute(
    "title",
    `${cellElement.getAttribute(
      "data-evolution-chain-string"
    )}\nRight click to sell for ${sellValue} gold.`
  );
  cellElement.setAttribute("data-identifier", pokemonIdentifier);
  cellElement.setAttribute(`data-identifier-${pokemonIdentifier}`, "true");
  cellElement.setAttribute("data-evolution-count", evolutionCount);
  cellElement.setAttribute(`data-display-name`, pokemonDisplayName);

  cellElement.onclick = () => onBackpackMouseDown(cellElement);
  cellElement.ondragstart = () => onBackpackMouseDown(cellElement);
}

function onBackpackMouseDown(cellElement) {
  const thisDataIdentifier = cellElement.getAttribute("data-identifier");
  if (null === thisDataIdentifier) {
    return;
  }

  if (window.selectedCellElement) {
    window.selectedCellElement.classList.remove("selected-cell");

    if (
      thisDataIdentifier ===
        window.selectedCellElement.getAttribute("data-identifier") &&
      cellElement.getAttribute("id") !==
        window.selectedCellElement.getAttribute("id")
    ) {
      upgradeCell(window.selectedCellElement, cellElement);
      return;
    }
  }

  setSelectedCell(cellElement);
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

  // thisAudio.pause();
  thisAudio.currentTime = 0;
  thisAudio.play();
}

function reanimateElement(element) {
  element.style.animation = "none";
  element.offsetHeight; /* trigger reflow */
  element.style.animation = null;
}

function onPokeBallClick() {
  let indexWithoutDisplayName = getEmptyShuffledCell();

  if (
    "number" === typeof indexWithoutDisplayName &&
    indexWithoutDisplayName >= 0
  ) {
    randomizeBackpackCell(
      document.getElementById(`shuffled-cell-${indexWithoutDisplayName}`),
      Math.floor(Math.random() * 3)
    );

    playSound("pokeball-open-sound");
  }

  clearSelectedCell();
}
function onPokeBallCellClick(imgElement, pokeBallIndex) {
  clearSelectedCell();

  const dataClickPrice = Number.parseInt(
    imgElement.getAttribute("data-click-price"),
    10
  );

  reanimateElement(imgElement);

  if (window.currentGold < dataClickPrice) {
    return;
  }

  increaseCurrentGold(-dataClickPrice);

  const parentElement = imgElement.parentElement;
	randomizeBackpackCell(parentElement, pokeBallIndex);
  // setSelectedCell(parentElement);
  playSound("pokeball-open-sound");
}

function getEvolutionIndexByChainString(pokemonDisplayName, chainString) {
  return chainString
    .split(" > ")
    .findIndex((eachItem) => eachItem.split("/").includes(pokemonDisplayName));
}

function randomizeBuyerCell(cellElement) {
  const openedShuffledCells = document.querySelectorAll(
    "[id^=shuffled-cell-][data-identifier]"
  );

  if (openedShuffledCells.length <= 1) {
    return;
  }

  if (cellElement._nextRandomForThisCell > Date.now()) {
    return;
  }

  const allDisplayNames = Array.from(
    document.querySelectorAll("[id^=shuffled-cell-][data-identifier]")
  ).map((eachCell) => eachCell.getAttribute("data-display-name"));

  const duplicateMap = {};
  allDisplayNames.forEach((eachName) => {
    duplicateMap[eachName] = (duplicateMap[eachName] || 0) + 1;
  });

  const getRandomHigherEvolutionNumber = Math.floor(Math.random() * 2);

  const namesWithGreaterThanDuplicateNumber = Object.entries(duplicateMap)
    .filter(([k, v]) => v > getRandomHigherEvolutionNumber)
    .map(([k, v]) => k);

  const namesToFilter = namesWithGreaterThanDuplicateNumber.length
    ? namesWithGreaterThanDuplicateNumber
    : Object.keys(duplicateMap);

  const allUniqueNamesCopy = [...namesToFilter].filter(
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
    (eachCell, index) =>
      eachCell &&
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

  const evolutionIndex = getEvolutionIndexByChainString(
    pokemonDisplayName,
    chainString
  );

  const finalSellValue = getRandomBuyerPrice(evolutionIndex + 1);

  cellElement.setAttribute("data-buyer-sell-value", finalSellValue);
  cellElement.setAttribute("data-evolution-chain-string", chainString);
  cellElement.setAttribute("data-chain-index", chainIndex);

  cellElement.setAttribute("data-evolution-count", evolutionIndex + 1);

  decorateBuyerCell(cellElement, pokemonDisplayName);

  attachBuyerRefreshElement(cellElement);

  restartBuyerRandomizeTimeout(cellElement);

  if (
    window.selectedCellElement &&
    null !== window.selectedCellElement.getAttribute("data-identifier")
  ) {
    highlightBackpackSameIdentifier(
      window.selectedCellElement.getAttribute("data-identifier")
    );
  }
}

function attachBuyerRefreshElement(cellElement) {
  const buyerRefreshElement = document.createElement("div");
  buyerRefreshElement.classList.add("buyer-refresh");
  buyerRefreshElement.setAttribute("title", "Randomize for 10 Gold");
  buyerRefreshElement.setAttribute(
    "id",
    `buyer-refresh-${cellElement.getAttribute("id")}`
  );
  buyerRefreshElement.innerText = "⟳";
  cellElement.appendChild(buyerRefreshElement);
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

function clearAllHighlight() {
  Array.from(document.querySelectorAll(`[id^=buyer-]`)).forEach((eachItem) =>
    eachItem.classList.remove("highlight-border")
  );
  Array.from(document.querySelectorAll(`[id^=shuffled-cell-]`)).forEach(
    (eachItem) => eachItem.classList.remove("highlight-border")
  );
}

function clearSelectedCell() {
	document.getElementById("floating-image").removeAttribute('src');
  if (window.selectedCellElement) {
    window.selectedCellElement.classList.remove("selected-cell");
    window.selectedCellElement = null;
  }

  clearAllHighlight();

  document
    .getElementById("left-box-evolution-chain")
    .removeAttribute("data-show-that");
}

function highlightBackpackSameIdentifier(dataIdentifierName) {
  Array.from(
    document.querySelectorAll(`[data-identifier-${dataIdentifierName}]`)
  ).forEach((eachItem) => eachItem.classList.add("highlight-border"));
}

function highlightBuyerSameIdentifier(dataIdentifierName) {
  Array.from(
    document.querySelectorAll(
      `[id^=buyer-][data-identifier-${dataIdentifierName}]`
    )
  ).forEach((eachItem) => eachItem.classList.add("highlight-border"));
}

function clearShuffledCell(cellElement) {
  cellElement.classList.remove("selected-cell");
  cellElement.removeAttribute("title");
  clearElementAttributesByPrefix(cellElement, "data-");

  cellElement.innerHTML = "";

  attachCellWithPokeBallImage(cellElement);
}

function deleteAudioElementCriesInterval() {
  window._deleteCriesInterval && clearInterval(window._deleteCriesInterval);
  window._deleteCriesInterval = setInterval(() => {
    const allCryElements = Array.from(
      document.querySelectorAll("[id^=pokemon-cry-][data-delete-element-after]")
    );
    const totalCryElements = allCryElements.length;

    for (let i = 0; i < totalCryElements; i += 1) {
      const aCryElement = allCryElements[i];

      const deleteElementAfter = Number.parseInt(
        aCryElement.getAttribute("data-delete-element-after")
      );

      if (Date.now() < deleteElementAfter) {
        continue;
      }

      aCryElement.remove();

      return;
    }
  }, 500);
}

function formatCryMp3Link(pokemonIdentifier) {
  const cryMp3LinkMap = {
    ["nidoran-f"]: "nidoranf",
    ["nidoran-m"]: "nidoranm",
  };

  return cryMp3LinkMap[pokemonIdentifier] || pokemonIdentifier;
}

function createOrUpdateCryElement(pokemonIdentifier) {
  const audioElementId = `pokemon-cry-${pokemonIdentifier}`;
  const existingCryElement = document.getElementById(audioElementId);

  if (null !== existingCryElement) {
    existingCryElement.setAttribute(
      "data-delete-element-after",
      Date.now() + 3000
    );

    return existingCryElement;
  }

  const audioElement = document.createElement("audio");
  audioElement.setAttribute("id", audioElementId);
  audioElement.setAttribute(
    "src",
    `https://play.pokemonshowdown.com/audio/cries/${formatCryMp3Link(
      pokemonIdentifier
    )}.mp3`
  );
  audioElement.setAttribute("data-delete-element-after", Date.now() + 3000);

  document.getElementById("audio-cries").appendChild(audioElement);

  audioElement.volume = 0.1;

  return audioElement;
}

function playCry(pokemonIdentifier) {
  const audioElement = createOrUpdateCryElement(pokemonIdentifier);

  playSound(audioElement.id);
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

    // randomizeBuyerCell(cellElement);
    // cellElement.removeAttribute("data-display-buyer-randomize-button");
    clearElementAttributesByPrefix(cellElement, "data-");
    cellElement.removeAttribute("title");

    cellElement.innerHTML = '<img src="./images/transparent-picture.png" />';

    increaseCurrentGold(-10);

    cellElement._nextRandomForThisCell = Date.now() + 6000;

    restartBuyerRandomizeTimeout(cellElement);

    playSound("shuffle-sound");
  }
}

function onBuyerMouseDown(cellElement) {
  if (!window.selectedCellElement) {
    return;
  }

  const selectedIdentifier =
    window.selectedCellElement.getAttribute("data-identifier");

  const thisIdentifier = "" + cellElement.getAttribute("data-identifier");

  if (selectedIdentifier !== thisIdentifier) {
    return;
  }

  resetBuyers();

  const goldIncreaseValue = Number.parseInt(
    cellElement.getAttribute("data-buyer-sell-value"),
    10
  );

  cellElement.removeAttribute("title");

  clearElementAttributesByPrefix(cellElement, "data-");

  increaseCurrentGold(goldIncreaseValue);

  reanimateElement(cellElement);

  reanimateElement(document.getElementById("pokemerge-brand"));
  reanimateElement(document.querySelector("h1[onclick]"));
  reanimateElement(document.querySelector("#exp-bar"));

  updateExpForNextLevelCount();

  doVibrate();

  cellElement.innerHTML = '<img src="./images/transparent-picture.png" />';

  clearShuffledCell(window.selectedCellElement);

  clearSelectedCell();

  playSound("gold-sound");

  playCry(thisIdentifier);
}

function initializeVibration() {
  if (null === window.localStorage.getItem("enable-vibration")) {
    window.localStorage.setItem("enable-vibration", true);
  }
}

function doVibrate() {
  if ("true" === window.localStorage.getItem("enable-vibration")) {
    navigator.vibrate(150);
  }
}

function playEncounter() {
  playSound("pokemon-encounter");

  clearTimeout(window._showStreakAnimation);
  document.getElementById("spinning-box").classList.remove("display-none");
  window._showStreakAnimation = setTimeout(() => {
    document.getElementById("spinning-box").classList.add("display-none");
  }, 4000);
}

function decorateBuyerCell(cellElement, pokemonDisplayName) {
	const pokemonData = getPokemonDataByDisplayName(pokemonDisplayName);

  if (!pokemonData) {
    console.error(`No data for ${pokemonDisplayName}`);
    return;
  }

  const pokemonId = pokemonData.id;

  const pokemonIdentifier = pokemonData.identifier;

  updateDisplayCell(cellElement, pokemonId, pokemonDisplayName, true);

  cellElement.setAttribute(
    "title",
    `${cellElement.getAttribute(
      "data-evolution-chain-string"
    )}\nRight click to shuffle for 10 gold.`
  );

  cellElement.setAttribute("data-identifier", pokemonIdentifier);
  cellElement.setAttribute(`data-identifier-${pokemonIdentifier}`, "true");
  cellElement.setAttribute("data-display-name", pokemonDisplayName);

  cellElement.onclick = () => onBuyerMouseDown(cellElement);
  cellElement.ondragstart = () => onBuyerMouseDown(cellElement);
}
