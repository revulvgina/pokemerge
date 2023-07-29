(() => {
  window.loadCommonElements = () => {
    window.pokemonBuffChanceContainerElement = document.getElementById(
      "pokemon-buff-chance-container"
    );
  };

  window.createBuyerCells = () => {
    const buyersGrid = document.getElementById("buyers-grid");

    for (let i = 0; i < 5; i += 1) {
      const eachBuyerCell = document.createElement("div");
      eachBuyerCell.id = `buyer-${i}`;
      eachBuyerCell.classList.add("no-highlight", "grid-cell");
      eachBuyerCell.innerHTML = `<img src="./images/transparent-picture.png" />`;
      buyersGrid.appendChild(eachBuyerCell);
    }
  };

  window.createBackpackCells = () => {
    const backpackGrid = document.getElementById("backpack-grid");

    for (let i = 0; i < 25; i += 1) {
      const eachBackpackCell = document.createElement("div");
      eachBackpackCell.id = `backpack-cell-${i}`;
      eachBackpackCell.classList.add("backpack-0", "no-highlight", "grid-cell");
      eachBackpackCell.innerHTML = `<img src="./images/transparent-picture.png" />`;
      backpackGrid.appendChild(eachBackpackCell);
    }

    window.temporaryTypeBuffs = [];
  };

  window.adjustEncounterDisplay = () => {
    const { offsetWidth, offsetHeight } =
      document.querySelector("div.backpack-grid");
    document.querySelector("#spinning-box").style.width = `${offsetWidth}px`;
    document.querySelector("#spinning-box").style.height = `${offsetHeight}px`;
  };

  window.createRandomPokeBallImage = () => {
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
  };

  window.attachCellWithPokeBallImage = (cellElement) => {
    cellElement.innerHTML = "";
    cellElement.appendChild(createRandomPokeBallImage());
    cellElement.setAttribute(
      "data-evolution-number",
      Number.parseInt(
        cellElement.firstChild.getAttribute("data-pokeball-index"),
        10
      ) + 1
    );
  };

  window.initializeBackpackBalls = () => {
    const backpackCells = Array.from(
      document.querySelectorAll("[id^=backpack-cell-]")
    );

    backpackCells.forEach((eachCell) => {
      attachCellWithPokeBallImage(eachCell);
    });
  };

  window.initializeLevelStarted = () => {
    const savedLevelStarted = window.localStorage.getItem("level-started");

    if (null !== savedLevelStarted) {
      window.setLevelStarted(Number.parseInt(savedLevelStarted, 10));
      return;
    }

    window.setLevelStarted(Date.now());
  };

  window.getBasePrice = (evolution_number) => {
    return Math.pow(evolution_number, evolution_number);
  };

  window.getRandomBuyerPrice = (evolutionNumber) => {
    const basePrice = getBasePrice(evolutionNumber);

    return 3 + basePrice + Math.floor(Math.random() * basePrice);
  };

  window.getClickPrice = (pokeBallIndex) => {
    return Math.min(
      window.MAXIMUM_POKEBALL_OPEN_PRICE,
      (pokeBallIndex + 1) * 3
    );
  };

  window.getRandomPokeBallIndex = () => {
    if (window._encounterDuration > Date.now()) {
      return window.getRandomItem(window._encounterPokemonBallList);
    }

    return window.getRandomItem(window.pokeBallRandomIndexList);
  };

  window.addEventListeners = () => {
    document.addEventListener("keydown", (event) => {
      if (event.code === "KeyP") {
        onPokeBallClick();
      }
    });
  };

  window.attachContextMenus = () => {
    const backpackCells = getAllBackpackCells();

    backpackCells.forEach((eachBackpackCell) => {
      attachBackpackContextMenu(eachBackpackCell);
    });

    const buyerCells = Array.from(document.querySelectorAll("[id^=buyer-]"));

    buyerCells.forEach((eachBuyerCell) => {
      _attachBuyerContextMenu(eachBuyerCell);
    });
  };

  window.playBgm = () => {
    const bgmElement = document.getElementById("pokemon-theme-bgm");

    if (!bgmElement.paused) {
      return;
    }

    bgmElement.volume = 0.1;
    bgmElement.play();
  };

  window.setCurrentGold = (numberValue) => {
    window.currentGold = Number.parseInt(numberValue, 10);
    window.localStorage.setItem("current_gold", numberValue);
  };

  window.setCurrentLevel = (numberValue) => {
    window.currentLevel = numberValue;
    window.localStorage.setItem("current_lv", numberValue);
  };

  window.updateLastUpdated = (lastUpdatedValue = Date.now()) => {
    window.localStorage.setItem("last-updated", lastUpdatedValue);
  };

  window.initializeCurrentLevel = () => {
    window.currentLevel =
      Number.parseInt(window.localStorage.getItem("current_lv"), 10) || 1;

    window.setCurrentLevel(window.currentLevel);
  };

  window.initializeCurrentGold = () => {
    const savedCurrentGold = Number.parseInt(
      window.localStorage.getItem("current_gold"),
      10
    );

    if ("number" === typeof savedCurrentGold && savedCurrentGold >= 0) {
      window.currentGold = savedCurrentGold;
    } else {
      window.currentGold = 100;
    }

    window.setCurrentGold(window.currentGold);
  };

  window.initializeExpCountForNextLevel = () => {
    const savedExpCountForNextLevel = Number.parseInt(
      window.localStorage.getItem("exp-count-for-next-level"),
      10
    );

    if (
      "number" === typeof savedExpCountForNextLevel &&
      savedExpCountForNextLevel >= 0
    ) {
      window.expCountForNextLevel = savedExpCountForNextLevel;
    } else {
      window.expCountForNextLevel = 0;
    }

    window.setExpCountForNextLevel(window.expCountForNextLevel);
  };

  window.getPoolByLevel = () => {
    const totalSpeciesChainEvolution = Object.keys(
      window.pokemonSpeciesChain
    ).length;
    const maxEvolutionChainNumber = Math.min(
      window.currentLevel,
      totalSpeciesChainEvolution
    );

    return [...Array(maxEvolutionChainNumber).keys()].map((levelIndex) => {
      return window.pokemonSpeciesChain[`evolution_chain_id-${levelIndex + 1}`];
    });
  };

  window.getIncreasingChanceByLevel = (maxIncrease = 15) => {
    return Math.min(maxIncrease, Math.floor(window.currentLevel / 1.5));
  };

  const _getBackpackRandomPokemonId = (pokeBallIndex) => {
    // return {
    // 	pokemonId: 133
    // };
    let pool = getPoolByLevel();

    const poolByPokeBallIndex = pool.filter((eachEvolutionChainList) => {
      return eachEvolutionChainList.some(
        ({ evolution_number }) =>
          evolution_number >=
          Math.min(window.MAXIMUM_POKEMON_EVOLUTION_NUMBER, pokeBallIndex + 1)
      );
    });

    const allPokemonIdsInPool = poolByPokeBallIndex
      .map((eachEvolutionChainList) => {
        if (3 === pokeBallIndex) {
          return eachEvolutionChainList
            .filter(
              ({ evolution_number }) =>
                window.MAXIMUM_POKEMON_EVOLUTION_NUMBER === evolution_number
            )
            .map(({ id }) => id);
        }

        return eachEvolutionChainList
          .filter(
            ({ evolution_number }) => evolution_number <= pokeBallIndex + 1
          )
          .map(({ id }) => id);
      })
			.flat(3);
		
    let filteredPokemonIdsInPoolByBuffTypeByChance = allPokemonIdsInPool.filter(
      (eachPokemonIdInPool) => {
				if (!window.isRandomSuccess(window.TYPE_BUFF_FILTER_RATE)) {
          return true;
        }

        if (0 === window.temporaryTypeBuffs.length) {
          return true;
        }

        const pokemonTypeInPool =
					window.pokemonTypes[`pokemon-id-${eachPokemonIdInPool}`];

        return window.temporaryTypeBuffs.includes(pokemonTypeInPool);
      }
    );

    if (!filteredPokemonIdsInPoolByBuffTypeByChance.length) {
      filteredPokemonIdsInPoolByBuffTypeByChance = allPokemonIdsInPool;
    }

    if (
      0 === Math.floor(Math.random() * (20 - getIncreasingChanceByLevel(15)))
    ) {
      const buyerCellsPokemonId = _collectBuyerCellsPokemonId();
      const randomBuyerPokemonOverlapWithPool = buyerCellsPokemonId.filter(
        (buyerCellPokemonId) =>
          filteredPokemonIdsInPoolByBuffTypeByChance.includes(
            buyerCellsPokemonId
          )
      );

      if (randomBuyerPokemonOverlapWithPool.length > 0) {
        return {
          pokemonId: window.getRandomItem(randomBuyerPokemonOverlapWithPool),
        };
      }
    }

    if (
      0 === Math.floor(Math.random() * (20 - getIncreasingChanceByLevel(15)))
    ) {
      const backpackCellsPokemonId = Array.from(
        document.querySelectorAll("[id^=backpack-cell-][data-pokemon-id]")
      ).map((eachBackpackCell) =>
        eachBackpackCell.getAttribute("data-pokemon-id")
      );

      const randomBackpackCellOverlapWithPool = backpackCellsPokemonId.filter(
        (eachBackpackCellPokemonId) =>
          filteredPokemonIdsInPoolByBuffTypeByChance.includes(
            eachBackpackCellPokemonId
          )
      );

      if (randomBackpackCellOverlapWithPool.length > 0) {
        return {
          pokemonId: window.getRandomItem(randomBackpackCellOverlapWithPool),
        };
      }
    }

    return {
      pokemonId: window.getRandomItem(
        filteredPokemonIdsInPoolByBuffTypeByChance
      )
    };
  };

  window.getChainStringFromChainDataArray = (chainDataList) => {
    return chainDataList
      .map((eachEvolutionName) =>
        Array.isArray(eachEvolutionName)
          ? eachEvolutionName.join("/")
          : eachEvolutionName
      )
      .join(" > ");
  };

  window.randomizeBackpackCell = (cellElement, pokeBallIndex) => {
    const { pokemonId } = _getBackpackRandomPokemonId(pokeBallIndex);

    const pokemonSpeciesObject =
      window.pokemonSpecies[`pokemon-id-${pokemonId}`];

    cellElement.setAttribute("data-pokemon-id", pokemonId);
    cellElement.setAttribute(
      "data-evolution-chain-id",
      pokemonSpeciesObject.evolution_chain_id
    );

    window.setEvolutionChainIdsAndNames(cellElement);

    cellElement.setAttribute(
      "data-display-name",
      window.pokemonNames[`pokemon-id-${pokemonId}`]
    );

    _decorateBackpackCell(cellElement, pokemonId);
  };

  window.updateExpCountForNextLevelElement = () => {
    const expForNextLevelElement =
      document.getElementById("exp-for-next-level");
    expForNextLevelElement.innerText = `(${window.expCountForNextLevel} / ${window.currentLevel})`;
    document.getElementById("exp-bar").style.width = `${
      100 * (window.expCountForNextLevel / window.currentLevel)
    }%`;
  };

  window.updateCurrentLevel = () => {
    const currentLevelElement = document.getElementById("current-level");
    currentLevelElement.innerText = window.currentLevel;
  };

  window.updateCurrentGold = () => {
    const currentGoldElement = document.getElementById("current-gold");
    currentGoldElement.innerText = `${window.currentGold}`;
  };

  window.increaseCurrentGold = (goldIncrease) => {
    window.setCurrentGold(window.currentGold + goldIncrease);

    updateCurrentGold();

    window.updateLastUpdated();

    if (goldIncrease > 0) {
      publishHighestGold();
    }
  };

  window.updateExpForNextLevelCount = (increaseValue) => {
    window.setExpCountForNextLevel(
      (window.expCountForNextLevel || 0) +
        Math.floor(increaseValue * Math.max(1, window.currentLevel / 40))
    );

    window.updateLastUpdated();

    if (window.expCountForNextLevel < window.currentLevel) {
      updateExpCountForNextLevelElement();
      return;
    }

    increaseCurrentGold(window.currentLevel * 5);

    let excessValue = window.expCountForNextLevel - window.currentLevel;

    if (excessValue >= window.currentLevel + 1) {
      window.setCurrentLevel(window.currentLevel + 2);
      excessValue = Math.max(0, excessValue - (window.currentLevel - 1));
    } else {
      window.setCurrentLevel(window.currentLevel + 1);
    }

    window.setExpCountForNextLevel(excessValue);

    window.updateLastUpdated();

    updateExpCountForNextLevelElement();
    updateCurrentLevel();

    playIndexSound("level-up-sound");

    window.levelUpSoundPriorityTimeout = Date.now() + 2000;

    publishHighestLevel();
    publishFastestLevel();

    window.setLevelStarted(Date.now());

    if (0 === window.currentLevel % 5) {
      adjustEncounterDisplay();
      playEncounter();
      window._encounterDuration = Date.now() + 30000;
      document
        .getElementById("encounter-container")
        .classList.remove("opacity-zero");
      document
        .getElementById("backpack-icon")
        .setAttribute("src", "./images/master-ball.png");
      window._encounterDurationNotification = setTimeout(() => {
        document
          .getElementById("encounter-container")
          .classList.add("opacity-zero");
        document
          .getElementById("backpack-icon")
          .setAttribute("src", "./images/backpack.png");
      }, 30000);
    }
  };

  window.setExpCountForNextLevel = (thatValue, isRestored = false) => {
    window.expCountForNextLevel = thatValue;
    window.localStorage.setItem("exp-count-for-next-level", thatValue);
  };

  window.setLevelStarted = (timestamp) => {
    window.levelStarted = timestamp;
    window.localStorage.setItem("level-started", timestamp);
  };

  window.clearElementAttributesByPrefix = (cellElement, attributePrefix) => {
    const attributeNames = Array.from(cellElement.attributes).map(
      ({ name }) => name
    );

    attributeNames.forEach((eachAttributeName) => {
      if (new RegExp(`^${attributePrefix}`).test(eachAttributeName)) {
        cellElement.removeAttribute(eachAttributeName);
      }
    });
  };

  window.getNextEvolutions = (evolutionChainId, pokemonId) => {
    const evolutionChainList =
      window.pokemonSpeciesChain[`evolution_chain_id-${evolutionChainId}`];

    return evolutionChainList.filter(
      ({ evolves_from_species_id }) =>
        evolves_from_species_id.toString() === pokemonId.toString()
    );
  };

  window.hasNextEvolutions = (evolutionChainId, pokemonId) => {
    return !!window.getNextEvolutions(evolutionChainId, pokemonId).length;
  };

  const _upgradeCell = (cellElement) => {
    const currentEvolutionNumber = Number.parseInt(
      cellElement.getAttribute("data-evolution-number"),
      10
    );

    const evolutionChainId = Number.parseInt(
      cellElement.getAttribute("data-evolution-chain-id"),
      10
    );
    const evolutionChainList =
      window.pokemonSpeciesChain[`evolution_chain_id-${evolutionChainId}`];

    const pokemonId = Number.parseInt(
      cellElement.getAttribute("data-pokemon-id"),
      10
    );

    const nextEvolutions = evolutionChainList.filter(
      ({ evolves_from_species_id }) =>
        evolves_from_species_id.toString() === pokemonId.toString()
    );

    if (!nextEvolutions.length) {
      setSelectedCell(window.selectedCellElement);
      return;
    }

    clearElementAttributesByPrefix(cellElement, "data-identifier-");
    clearElementAttributesByPrefix(
      window.selectedCellElement,
      "data-identifier-"
		);
		
		_resetBorderColor(cellElement);

    const nextRandomEvolutionSpeciesObject =
      window.getRandomItem(nextEvolutions);

    cellElement.setAttribute(
      "data-evolution-number",
      nextRandomEvolutionSpeciesObject.evolution_number
    );

    _decorateBackpackCell(cellElement, nextRandomEvolutionSpeciesObject.id);

    _clearBackpackCellAndCreateRandomPokeball(window.selectedCellElement);

		_resetBorderColor(window.selectedCellElement);

    _clearSelectedCell();

    setSelectedCell(cellElement);

    updateExpForNextLevelCount(currentEvolutionNumber);

    playIndexSound("plus-sound");
  };

  window.getPokemonImageUrl = (pokemonId) => {
    return `.	/images/bit/${pokemonId}.png`;
  };

  window.updateDisplayCell = (
    cellElement,
    pokemonId,
    pokemonDisplayName,
    isBuyer
  ) => {
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
  };

  window.setFloatingImageCoordinates = ({ clientX, clientY }) => {
    const floatingImageElement = document.getElementById("floating-image");
    floatingImageElement.style.left = `${
      window._recordedMouseMoveEvent.clientX - 10
    }px`;
    floatingImageElement.style.top = `${window._recordedMouseMoveEvent.clientY}px`;
  };

  window.initializeMouseMoveListener = () => {
    if (isMobile()) {
      return;
    }

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

      window._recordedMouseMoveEvent.clientX >= 0 &&
        setFloatingImageCoordinates(window._recordedMouseMoveEvent);
    });
  };

  window.setFloatingImage = (pokemonIdString) => {
    const floatingImage = document.getElementById("floating-image");
    floatingImage.setAttribute("src", `./images/bit/${pokemonIdString}.png`);

    const mouseMoveEvent = window._recordedMouseMoveEvent;

    setFloatingImageCoordinates(mouseMoveEvent);
  };

  window.getSelectedCellBorderStyle = (displayNameInCell, displayName) => {
    if (displayNameInCell !== displayName) {
      return "";
    }

    return ` evolution-chain-border-current`;
  };

  window.setEvolutionChain = (cellElement) => {
    const chainIndex = Number.parseInt(
      cellElement.getAttribute("data-chain-index"),
      10
    );

    const evolutionChainIds = cellElement.getAttribute(
      "data-evolution-chain-ids"
    );

    const displayNameInCell = cellElement.getAttribute("data-display-name");

    document.getElementById("evolution-chain").innerHTML = "";

    let collectEach = [];
    evolutionChainIds.split(/,/).forEach((eachEvolutionSpeciesId) => {
      const eachDisplayName =
        window.pokemonNames[`pokemon-id-${eachEvolutionSpeciesId}`];
      collectEach.push(
        `<div title="${eachDisplayName}" class="evolution-chain-image-container${getSelectedCellBorderStyle(
          displayNameInCell,
          eachDisplayName
        )}"><img src="./images/bit/${eachEvolutionSpeciesId}.png" /></div>`
      );
    });

    document.getElementById("evolution-chain").innerHTML = collectEach.join("");
  };

  window.setSelectedCell = (cellElement) => {
    _clearSelectedCell();

    window.selectedCellElement = cellElement;
    cellElement.classList.add("selected-cell");

    setEvolutionChain(cellElement);

    document
      .getElementById("left-box-evolution-chain")
      .setAttribute("data-show-that", "show");

    if (!isMobile()) {
      setFloatingImage(cellElement.getAttribute("data-pokemon-id"));
    }

    if (
      window.hasNextEvolutions(
        cellElement.getAttribute("data-evolution-chain-id"),
        cellElement.getAttribute("data-pokemon-id")
      )
    ) {
      _highlightBackpackAndBuyerSameIdentifier(
        cellElement.getAttribute("data-identifier")
      );
    } else {
      _highlightBuyerSameIdentifier(
        cellElement.getAttribute("data-identifier")
      );
    }

    playIndexSound("click-sound");
    playBgm();
  };

  window.sellBackpackCell = (cellElement) => {
    const evolutionNumber = Number.parseInt(
      cellElement.getAttribute("data-evolution-number"),
      10
    );

		_addTypeBuff(cellElement);
		_resetBorderColor(cellElement);

    cellElement.classList.remove("selected-cell");
    _clearSelectedCell();

    increaseCurrentGold(getBasePrice(evolutionNumber));

    playIndexSound("coin-sound");
	};
	
	const _willAddBuff = (evolutionChainId, pokemonId) => {
		const pokemonHasNextEvolutions = hasNextEvolutions(
			evolutionChainId,
			pokemonId
		);

		const allExistingBuyerCellsPokemonId = Array.from(
			document.querySelectorAll("[id^=buyer-][data-pokemon-id]")
		).map((eachBuyerCell) => eachBuyerCell.getAttribute("data-pokemon-id"));
		
		return !pokemonHasNextEvolutions && allExistingBuyerCellsPokemonId.includes(pokemonId);
	};

  const _addTypeBuff = (cellElement) => {
    const soldPokemonId = cellElement.getAttribute("data-pokemon-id");

    const allExistingBuyerCellsPokemonId = Array.from(
      document.querySelectorAll("[id^=buyer-][data-pokemon-id]")
    ).map((eachBuyerCell) => eachBuyerCell.getAttribute("data-pokemon-id"));

		if (!_willAddBuff(cellElement.getAttribute("data-evolution-chain-id"), soldPokemonId)) {
			return;
		}

    const pokemonTypeData = window.pokemonTypes[`pokemon-id-${soldPokemonId}`];

    if (!Array.isArray(pokemonTypeData)) {
      return;
    }

    window.pokemonBuffChanceContainerElement.classList.remove("opacity-zero");

    window.temporaryTypeBuffs = [];

    for (
      let pokemonTypeBuffIndex = 0;
      pokemonTypeBuffIndex < 2;
      pokemonTypeBuffIndex += 1
    ) {
      const eachTypeObject = pokemonTypeData[pokemonTypeBuffIndex];

      if (!eachTypeObject) {
        window.pokemonBuffChanceContainerElement.children[
          pokemonTypeBuffIndex
        ].style.backgroundColor = "transparent";
        continue;
      }

      const pokemonTypeId = eachTypeObject.type_id;
			const typeName = window.pokemonTypeNames[`type-id-${pokemonTypeId}`];
			const elementToUpdate = window.pokemonBuffChanceContainerElement.children[
				pokemonTypeBuffIndex
			];
      elementToUpdate.style.backgroundColor =
				window.POKEMON_TYPE_COLORS[typeName.toLowerCase()];
			elementToUpdate.setAttribute('title', typeName);

      window.temporaryTypeBuffs.push(pokemonTypeId);
    }

    window.clearTimeout(window.typeBuffTimeout);
    window.typeBuffTimeout = setTimeout(() => {
      window.temporaryTypeBuffs = [];
			window.pokemonBuffChanceContainerElement.classList.add("opacity-zero");
    }, 30000);
  };

  window.attachBackpackContextMenu = (cellElement) => {
    const onBackpackContextMenu = (event) => {
      event.preventDefault();

      if (null === cellElement.getAttribute("data-identifier")) {
        return;
      }

      sellBackpackCell(cellElement);
      _clearBackpackCellAndCreateRandomPokeball(cellElement);
    };

    cellElement.addEventListener("contextmenu", onBackpackContextMenu);
	};
	
	const _setBackpackCellBorder = (cellElement, thisPokemonTypeNames) => {
		for (let eachTypeIndex = 0; eachTypeIndex < 2; eachTypeIndex += 1) {
			const eachTypeName = thisPokemonTypeNames[eachTypeIndex];

			const typeColor = !eachTypeName ? 'transparent' : window.POKEMON_TYPE_COLORS[eachTypeName.toLowerCase()];

			if (0 === eachTypeIndex) {
				cellElement.style.borderTopColor = typeColor;
				cellElement.style.borderLeftColor = typeColor;
				continue;
			}

			if (1 === eachTypeIndex) {
				cellElement.style.borderBottomColor = typeColor;
				cellElement.style.borderRightColor = typeColor;
				continue;
			}
		}
	};

	const _updateBackpackCell = (cellElement, pokemonId, isFromBuyerUpdate) => {
		cellElement.setAttribute("data-pokemon-id", pokemonId);

		const pokemonSpeciesObject =
			window.pokemonSpecies[`pokemon-id-${pokemonId}`];
		
		const thisPokemonTypeNames = _getPokemonTypeNames(pokemonId);

		const pokemonDisplayName = window.pokemonNames[`pokemon-id-${pokemonId}`];
		cellElement.setAttribute(`data-display-name`, pokemonDisplayName);

		const sellValue = getBasePrice(pokemonSpeciesObject.evolution_number);
		
		let titleString = `${cellElement.getAttribute('data-display-name')}#${pokemonId}\n`;
		titleString += `Type(s): ${thisPokemonTypeNames.join(', ')}\n`;
		titleString += `${cellElement.getAttribute("data-evolution-chain-names")}\n`;
		titleString += `Right click to dispose for ${sellValue} gold.`;

		if (_willAddBuff(cellElement.getAttribute('data-evolution-chain-id'), pokemonId)) {
			titleString += `\nDisposing will add ${thisPokemonTypeNames.join(', ')} buffs`
		}

		cellElement.setAttribute(
			"title",
			titleString
		);

		if (isFromBuyerUpdate) {
			return;
		}

		const pokemonIdentifier = pokemonSpeciesObject.identifier;

		const discoveredKey = `discovered-${pokemonIdentifier}`;
		if (!window.localStorage.getItem(discoveredKey)) {
			window.localStorage.setItem(discoveredKey, Date.now());
		}

		updateDisplayCell(cellElement, pokemonId, pokemonDisplayName);
		
		_setBackpackCellBorder(cellElement, thisPokemonTypeNames);

		cellElement.setAttribute("data-sell-value", sellValue);
		cellElement.setAttribute("data-identifier", pokemonIdentifier);
		cellElement.setAttribute(`data-identifier-${pokemonIdentifier}`, "true");
		cellElement.setAttribute(
			"data-evolution-number",
			pokemonSpeciesObject.evolution_number
		);

		cellElement.onclick = () => onBackpackMouseDown(cellElement);
		cellElement.ondragstart = () => onBackpackMouseDown(cellElement);
	};

	const _decorateBackpackCell = (cellElement, pokemonId) => {
		_updateBackpackCell(cellElement, pokemonId);

    publishHighestBackpack();
  };

  window.onBackpackMouseDown = (cellElement) => {
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
        _upgradeCell(cellElement);
        return;
      }
    }

    setSelectedCell(cellElement);
  };

  window.getEmptyBackpackCell = () => {
    const everyCells = getAllBackpackCells();

    return everyCells.findIndex(
      (eachCell) => null === eachCell.getAttribute("data-display-name")
    );
  };

  window.getAllBackpackCells = () => {
    return Array.from(document.querySelectorAll("[id^=backpack-cell-]"));
  };

  window.playIndexSound = (audioId) => {
    const volumeMap = {
      ["pokeball-open-sound"]: 0.05,
      ["click-sound"]: 0.25,
    };

    let volume = volumeMap[audioId] || 1;

    if (/^pokemon-cry-/.test(audioId)) {
      volume = 0.5;
    }

    if ((window.levelUpSoundPriorityTimeout || 0) > Date.now()) {
      volume = 0.15;
    }

    window.playSound(audioId, volume);
  };

  window.onPokeBallClick = () => {
    let indexWithoutDisplayName = getEmptyBackpackCell();

    if (
      "number" === typeof indexWithoutDisplayName &&
      indexWithoutDisplayName >= 0
    ) {
      const cellElement = document.getElementById(
        `backpack-cell-${indexWithoutDisplayName}`
      );

      randomizeBackpackCell(
        cellElement,
        Number.parseInt(cellElement.getAttribute("data-evolution-number"), 10) -
          1
      );

      playIndexSound("pokeball-open-sound");
    }

    _clearSelectedCell();
  };
  window.onPokeBallCellClick = (imgElement, pokeBallIndex) => {
    _clearSelectedCell();

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
    playIndexSound("pokeball-open-sound");
  };

  window.getEvolutionIndexByChainString = (pokemonDisplayName, chainString) => {
    return chainString
      .split(" > ")
      .findIndex((eachItem) =>
        eachItem.split("/").includes(pokemonDisplayName)
      );
  };

  const _getOpenedBackpackCells = () => {
    return document.querySelectorAll("[id^=backpack-cell-][data-pokemon-id]");
	};
	
	const _getOpenedBackpackCellElements = () => {
		return Array.from(_getOpenedBackpackCells());
	};

  const _isMinimumBackpackCellsOpened = (minimumValue) => {
    return _getOpenedBackpackCells().length >= minimumValue;
  };

  const _collectBuyerCellsPokemonId = () => {
    return Array.from(
      document.querySelectorAll("[id^=buyer-][data-pokemon-id]")
    ).map((eachBuyerCell) => eachBuyerCell.getAttribute("data-pokemon-id"));
  };

  const _getRandomBuyerPickFromBackpack = (cellElement) => {
    const allBackpackPokemonIds = Array.from(
      document.querySelectorAll("[id^=backpack-cell-][data-pokemon-id]")
    ).map((eachBackpackCell) =>
      eachBackpackCell.getAttribute("data-pokemon-id")
    );

    const duplicateCountOfEachPokemonIds = {};
    allBackpackPokemonIds.forEach((eachPokemonId) => {
      duplicateCountOfEachPokemonIds[eachPokemonId] =
        (duplicateCountOfEachPokemonIds[eachPokemonId] || 0) + 1;
    });

    const randomDuplicateCount = Math.floor(Math.random() * 2);

    const pokemonIdsWithGreaterThanDuplicateNumber = Object.entries(
      duplicateCountOfEachPokemonIds
    )
      .filter(
        ([_, backPokemonIdDuplicateCount]) =>
          backPokemonIdDuplicateCount > randomDuplicateCount
      )
      .map(([backpackPokemonId, _]) => backpackPokemonId);

    const backpackPokemonIdsToFilter =
      pokemonIdsWithGreaterThanDuplicateNumber.length
        ? pokemonIdsWithGreaterThanDuplicateNumber
        : Object.keys(duplicateCountOfEachPokemonIds);

    const allFilteredBackpackPokemonIds = [
      ...backpackPokemonIdsToFilter,
    ].filter(
      (pokemonIdsThatAreNullWhat) => pokemonIdsThatAreNullWhat !== "null"
    );

    const allBuyersPokemonId = _collectBuyerCellsPokemonId();

    let duplicateBuyerPokemonIdMap = {};
    allBuyersPokemonId.forEach((eachBuyerPokemonId) => {
      duplicateBuyerPokemonIdMap[eachBuyerPokemonId] =
        duplicateBuyerPokemonIdMap[eachBuyerPokemonId] || 0;
      duplicateBuyerPokemonIdMap[eachBuyerPokemonId] += 1;
    });

    const buyerPokemonIdsWithTwoDuplicates = Object.entries(
      duplicateBuyerPokemonIdMap
    )
      .filter(([pokemonId, duplicateCount]) => duplicateCount >= 2)
      .map(([pokemonId, _]) => pokemonId);

    const filteredBackpackPokemonIdsWithBuyerDuplicatePokemonIds =
      allFilteredBackpackPokemonIds.filter(
        (filteredBackpackPokemonId) =>
          !buyerPokemonIdsWithTwoDuplicates.includes(filteredBackpackPokemonId)
      );

    if (0 === filteredBackpackPokemonIdsWithBuyerDuplicatePokemonIds.length) {
      return;
    }

    let tentativeRandomPokemonId = window.getRandomItem(
      filteredBackpackPokemonIdsWithBuyerDuplicatePokemonIds
    );

    const numberOfDuplicates =
      duplicateCountOfEachPokemonIds[tentativeRandomPokemonId];

    let tentativePokemonDisplayName =
      window.pokemonNames[`pokemon-id-${tentativeRandomPokemonId}`];

    const thatElement = Array.from(
      document.querySelectorAll("[id^=backpack-cell-]")
    ).find(
      (eachCell) =>
        eachCell &&
        tentativePokemonDisplayName ===
          eachCell.getAttribute("data-display-name")
    );

    const randomBackpackCellElement = document.querySelector(
      `[id^=backpack-cell-][data-pokemon-id="${tentativeRandomPokemonId}"]`
    );

    const pokemonNextEvolutions = window.getNextEvolutions(
      randomBackpackCellElement.getAttribute("data-evolution-chain-id"),
      tentativeRandomPokemonId
    );

    if (numberOfDuplicates > 1 && pokemonNextEvolutions.length) {
      const nextRandomEvolutionPokemonId = window.getRandomItem(
        pokemonNextEvolutions
      ).id;
      if (
        allBuyersPokemonId.filter(
          (eachBuyerPokemonId) =>
            nextRandomEvolutionPokemonId === eachBuyerPokemonId
        ).length <= 1
      ) {
        tentativeRandomPokemonId = nextRandomEvolutionPokemonId;
      }
    }

    return tentativeRandomPokemonId;
  };

  const _getRandomPokemonIdFromPool = () => {
    const poolByLevel = window.getPoolByLevel();

    const randomChainList = window.getRandomItem(poolByLevel);

    const { id } = window.getRandomItem(randomChainList);

    return id;
  };

  const _getRandomBuyerPokemonId = (cellElement) => {
    if (!_isMinimumBackpackCellsOpened(1)) {
      return undefined;
    }

    if (0 === window.currentGold) {
      return _getRandomBuyerPickFromBackpack(cellElement);
    }

    const totalOpenedBackpackCells = _getOpenedBackpackCells().length;

    return window.isRandomSuccess(
      Math.floor(
        Math.random() *
          Math.max(
            0,
            window.MINIMUM_BACKPACK_OPENED_AMOUNT_BUYER_PICK -
              totalOpenedBackpackCells
          )
      )
    ) && window.currentGold >= window.BUYER_SHUFFLE_GOLD_DECREASE
      ? _getRandomBuyerPickFromBackpack(cellElement)
      : _getRandomPokemonIdFromPool();
  };

  const _randomizeBuyerCell = (cellElement) => {
    if (cellElement._nextRandomForThisCell > Date.now()) {
      return;
    }

    const randomPokemonId = _getRandomBuyerPokemonId(cellElement);

    if ("undefined" === typeof randomPokemonId) {
      return;
    }

    cellElement.setAttribute("data-pokemon-id", randomPokemonId);
    cellElement.setAttribute(
      "data-display-name",
      window.pokemonNames[`pokemon-id-${randomPokemonId}`]
    );

    const pokemonSpeciesObject =
      window.pokemonSpecies[`pokemon-id-${randomPokemonId}`];

    const evolutionNumber = pokemonSpeciesObject.evolution_number;

    const finalSellValue = getRandomBuyerPrice(evolutionNumber);

    cellElement.setAttribute("data-buyer-sell-value", finalSellValue);

    cellElement.setAttribute(
      "data-evolution-chain-id",
      pokemonSpeciesObject.evolution_chain_id
    );

    setEvolutionChainIdsAndNames(cellElement);

    cellElement.setAttribute(
      "data-evolution-number",
      pokemonSpeciesObject.evolution_number
    );

    _decorateBuyerCell(cellElement, randomPokemonId);

    _attachBuyerRefreshElement(cellElement);

    _restartBuyerRandomizeTimeout(cellElement);

    if (
      window.selectedCellElement &&
      null !== window.selectedCellElement.getAttribute("data-identifier")
    ) {
      _highlightBackpackAndBuyerSameIdentifier(
        window.selectedCellElement.getAttribute("data-identifier")
      );
    }
  };

  const _attachBuyerRefreshElement = (cellElement) => {
    const buyerRefreshElement = document.createElement("div");
    buyerRefreshElement.classList.add("buyer-refresh");
    buyerRefreshElement.setAttribute("title", "Randomize for 10 Gold");
    buyerRefreshElement.setAttribute(
      "id",
      `buyer-refresh-${cellElement.getAttribute("id")}`
    );
    buyerRefreshElement.innerText = "⟳";
    cellElement.appendChild(buyerRefreshElement);
  };

  const _restartBuyerRandomizeTimeout = (cellElement) => {
    cellElement._allowBuyerRandomizeTimeout &&
      clearTimeout(cellElement._allowBuyerRandomizeTimeout);
    cellElement._allowBuyerRandomizeTimeout = setTimeout(() => {
      clearTimeout(cellElement._allowBuyerRandomizeTimeout);
      cellElement.setAttribute("data-display-buyer-randomize-button", true);
    }, 6000);
	};
	
	const _updateBackCellsDetailsByBuyer = () => {
		_getOpenedBackpackCellElements().forEach((eachBackpackCellElement) => {
			const pokemonId = eachBackpackCellElement.getAttribute('data-pokemon-id');
			_updateBackpackCell(eachBackpackCellElement, pokemonId, true);
		});
	}

	const _resetBorderColor = (cellElement) => {
		cellElement.removeAttribute('style');
	};

	window.resetBuyers = () => {
		let isBuyersUpdated = false;
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

				_randomizeBuyerCell(cellElement);
				
				isBuyersUpdated = true;

        return;
			}

			if (isBuyersUpdated) {
				_updateBackCellsDetailsByBuyer();
			}
    }, 1000);
  };

  const _clearAllHighlight = () => {
    Array.from(document.querySelectorAll(`[id^=buyer-]`)).forEach((eachItem) =>
      eachItem.classList.remove("highlight-border")
    );
    Array.from(document.querySelectorAll(`[id^=backpack-cell-]`)).forEach(
      (eachItem) => eachItem.classList.remove("highlight-border")
    );
  };

  const _clearSelectedCell = () => {
    document.getElementById("floating-image").removeAttribute("src");

    if (window.selectedCellElement) {
      window.selectedCellElement.classList.remove("selected-cell");
      window.selectedCellElement = null;
		}
		

    _clearAllHighlight();

    document
      .getElementById("left-box-evolution-chain")
      .removeAttribute("data-show-that");
  };

  const _highlightBackpackAndBuyerSameIdentifier = (dataIdentifierName) => {
    Array.from(
      document.querySelectorAll(`[data-identifier-${dataIdentifierName}]`)
    ).forEach((eachItem) => eachItem.classList.add("highlight-border"));
  };

  const _highlightBuyerSameIdentifier = (dataIdentifierName) => {
    Array.from(
      document.querySelectorAll(
        `[id^=buyer-][data-identifier-${dataIdentifierName}]`
      )
    ).forEach((eachItem) => eachItem.classList.add("highlight-border"));
  };

  const _clearBackpackCellAndCreateRandomPokeball = (cellElement) => {
    cellElement.classList.remove("selected-cell");
    cellElement.removeAttribute("title");
    clearElementAttributesByPrefix(cellElement, "data-");

    cellElement.innerHTML = "";

    attachCellWithPokeBallImage(cellElement);
  };

  window.audioElementCriesDeleteInterval = () => {
    window._deleteCriesInterval && clearInterval(window._deleteCriesInterval);
    window._deleteCriesInterval = setInterval(() => {
      const allCryElements = Array.from(
        document.querySelectorAll(
          "[id^=pokemon-cry-][data-delete-element-after]"
        )
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
  };

  const _formatCryMp3Link = (pokemonIdentifier) => {
    return window.cryMp3LinkMap[pokemonIdentifier] || pokemonIdentifier;
  };

  const _createOrUpdateCryElement = (pokemonIdentifier) => {
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
      `https://play.pokemonshowdown.com/audio/cries/${_formatCryMp3Link(
        pokemonIdentifier
      )}.mp3`
    );
    audioElement.setAttribute("data-delete-element-after", Date.now() + 3000);

    document.getElementById("audio-cries").appendChild(audioElement);

    audioElement.volume = 0.1;

    return audioElement;
  };

  const _playCry = (pokemonIdentifier) => {
    const audioElement = _createOrUpdateCryElement(pokemonIdentifier);

    playIndexSound(audioElement.id);
  };

  const _attachBuyerContextMenu = (cellElement) => {
    const onBuyerContextMenu = (event) => {
      event.preventDefault();

      if (window.currentGold < window.BUYER_SHUFFLE_GOLD_DECREASE) {
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
			
			_resetBorderColor(cellElement);

      cellElement.innerHTML = '<img src="./images/transparent-picture.png" />';

			increaseCurrentGold(-window.BUYER_SHUFFLE_GOLD_DECREASE);

      cellElement._nextRandomForThisCell = Date.now() + 6000;

      _restartBuyerRandomizeTimeout(cellElement);

      playIndexSound("shuffle-sound");
    };

    cellElement.addEventListener("contextmenu", onBuyerContextMenu, true);
  };

  const _onBuyerMouseDown = (cellElement) => {
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
		_resetBorderColor(cellElement);

    increaseCurrentGold(goldIncreaseValue);

    reanimateElement(cellElement);

    reanimateElement(document.getElementById("pokemerge-brand"));
    reanimateElement(document.querySelector(".header-text > h1"));
    reanimateElement(document.querySelector("#exp-bar"));

    const evolutionNumber = Number.parseInt(
      window.selectedCellElement.getAttribute("data-evolution-number"),
      10
    );

    updateExpForNextLevelCount(evolutionNumber);

    _doVibrate();

    cellElement.innerHTML = '<img src="./images/transparent-picture.png" />';

    _clearBackpackCellAndCreateRandomPokeball(window.selectedCellElement);

		_resetBorderColor(window.selectedCellElement);
    _clearSelectedCell();

    playIndexSound("gold-sound");

    _playCry(thisIdentifier);
  };

  window.initializeVibration = () => {
    if (null === window.localStorage.getItem("enable-vibration")) {
      window.localStorage.setItem("enable-vibration", true);
    }
  };

  const _doVibrate = () => {
    if ("true" === window.localStorage.getItem("enable-vibration")) {
      navigator.vibrate(150);
    }
  };

  window.playEncounter = () => {
    playIndexSound("pokemon-encounter");

    clearTimeout(window._showStreakAnimation);
    document.getElementById("spinning-box").classList.remove("display-none");
    window._showStreakAnimation = setTimeout(() => {
      document.getElementById("spinning-box").classList.add("display-none");
    }, 4000);
  };

  window.setEvolutionChainIdsAndNames = (cellElement) => {
    const evolutionChainId = cellElement.getAttribute(
      "data-evolution-chain-id"
    );
    const pokemonId = cellElement.getAttribute("data-pokemon-id");
    const evolutionChainIds =
      window.pokemonSpeciesChain[`evolution_chain_id-${evolutionChainId}`];

    cellElement.setAttribute(
      "data-evolution-chain-ids",
      evolutionChainIds.map(({ id }) => id).join(",")
    );

    cellElement.setAttribute(
      "data-evolution-chain-names",
      evolutionChainIds
        .map(({ id }) => window.pokemonNames[`pokemon-id-${id}`])
        .join(",")
    );
	};
	
	const _getPokemonTypeNames = (pokemonId) => {
		return window.pokemonTypes[`pokemon-id-${pokemonId}`].map((eachPokemonType) => {
			return window.pokemonTypeNames[`type-id-${eachPokemonType.type_id}`];
		});
	}

  const _decorateBuyerCell = (cellElement, pokemonId) => {
    const pokemonSpeciesObject =
      window.pokemonSpecies[`pokemon-id-${pokemonId}`];
    const pokemonIdentifier = pokemonSpeciesObject.identifier;
    const pokemonDisplayName = window.pokemonNames[`pokemon-id-${pokemonId}`];

		const thisPokemonTypeNames = _getPokemonTypeNames(pokemonId);
		
		_setBackpackCellBorder(cellElement, thisPokemonTypeNames);

    updateDisplayCell(cellElement, pokemonId, pokemonDisplayName, true);

    cellElement.setAttribute(
      "title",
			`${cellElement.getAttribute('data-display-name')}#${pokemonId}\nType(s): ${thisPokemonTypeNames.join(', ')}\n${cellElement.getAttribute(
        "data-evolution-chain-names"
      )}\nRight click to shuffle for 10 gold.`
    );

    cellElement.setAttribute("data-identifier", pokemonIdentifier);
    cellElement.setAttribute(`data-identifier-${pokemonIdentifier}`, "true");

    cellElement.onclick = () => _onBuyerMouseDown(cellElement);
    cellElement.ondragstart = () => _onBuyerMouseDown(cellElement);
  };

  window.publishHighestLevel = async () => {
    const response = await fetch(
      `https://pokemerge-endpoint.vercel.app/api/highest-level/${window.sessionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          value: window.currentLevel,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "no-cors",
        next: { revalidate: 0 },
      }
    );
  };

  window.publishHighestBackpack = async () => {
    const allDiscoveredLocalStorageKeys = Object.keys({
      ...window.localStorage,
    }).filter((eachKey) => /^discovered-/.test(eachKey));

    const response = await fetch(
      `https://pokemerge-endpoint.vercel.app/api/highest-backpack/${window.sessionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          value: allDiscoveredLocalStorageKeys.length,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "no-cors",
        next: { revalidate: 0 },
      }
    );
  };

  window.publishHighestGold = async () => {
    if (window.highestGoldAttained > window.currentGold) {
      clearTimeout(window.highestGoldPublishTimeout);
      window.highestGoldPublishTimeout = setTimeout(
        window.postHighestGold,
        5000
      );
      return;
    }

    window.highestGoldAttained = window.currentGold;

    await window.postHighestGold();
  };

  window.postHighestGold = async () => {
    clearTimeout(window.highestGoldPublishTimeout);

    const response = await fetch(
      `https://pokemerge-endpoint.vercel.app/api/highest-gold/${window.sessionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          value: window.currentGold,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "no-cors",
        next: { revalidate: 0 },
      }
    );
  };

  window.publishFastestLevel = async () => {
    const response = await fetch(
      `https://pokemerge-endpoint.vercel.app/api/fastest-level/${window.sessionId}`,
      {
        method: "POST",
        body: JSON.stringify({
          value: Date.now() - window.levelStarted,
          level: window.currentLevel - 1,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "no-cors",
        next: { revalidate: 0 },
      }
    );
  };

  window.setContentAsLoaded = () => {
    document.querySelector(".content").classList.add("content-loaded");
  };

  window.initializeSessionFromCloud = async () => {
    const locationSearch = window.location.search;
    if ("string" !== typeof locationSearch || !locationSearch.trim().length) {
      return;
    }

    const urlSearchParams = new URLSearchParams(locationSearch.substring(1));

    if (!urlSearchParams.size) {
      return;
    }

    const sessionIdParamValue = urlSearchParams.get("session-id");

    if (null === sessionIdParamValue) {
      return;
    }

    window.setSessionId(sessionIdParamValue);

    window.history.replaceState({}, document.title, "/");

    await window.restoreSessionFromCloud();
  };

  window.saveSessionToCloud = async () => {
    let sessionMap = {
      level: window.currentLevel,
      gold: window.currentGold,
      expCountForNextLevel: window.expCountForNextLevel,
      levelStarted: window.levelStarted,
    };

    const allDiscoveredLocalStorageKeys = Object.entries({
      ...window.localStorage,
    }).filter(([k, v]) => /^discovered-/.test(k));

    sessionMap.discovered = {};

    allDiscoveredLocalStorageKeys.forEach(([k, v]) => {
      sessionMap.discovered[k] = v;
    });

    sessionMap.lastUpdated = Date.now();

    const jsonFileName = `${window.sessionId}.json`;

    let response;
    try {
      response = await window.uploadJsonToSupabase(
        jsonFileName,
        JSON.stringify(sessionMap)
      );
    } catch (reason) {
      throw reason;
    }

    return response;
  };

  window.restoreSessionFromCloud = async () => {
    let responseObject;
    try {
      responseObject = await window.fetchJsonFromSupabase(
        `${window.sessionId}.json`
      );
    } catch (reason) {
      throw reason;
    }

    const {
      level,
      expCountForNextLevel,
      levelStarted,
      gold,
      discovered,
      lastUpdated,
    } = responseObject;

    let deviceDataAndDateString = "No data";

    const localStorageLastUpdated = window.localStorage.getItem("last-updated");
    if (null !== localStorageLastUpdated) {
      deviceDataAndDateString = `${new Date(
        Number.parseInt(localStorageLastUpdated, 10)
      ).toLocaleString()} (Lv${window.localStorage.getItem(
        "current_lv"
      )}|${window.localStorage.getItem("current_gold")}G)`;
    }

    const lastUpdatedDateString = `${new Date(
      lastUpdated
    ).toLocaleString()} (Lv${level}|${gold}G)`;

    if (
      lastUpdatedDateString !== deviceDataAndDateString &&
      !confirm(
        `Do you want to overwrite this device with cloud data?\n` +
          `Cloud Data Date: ${lastUpdatedDateString}\n` +
          `Device Data Date: ${deviceDataAndDateString}\n\n` +
          `You can go to [Settings] > [Share Session] to upload this device data.`
      )
    ) {
      return;
    }

    window.updateLastUpdated(lastUpdated);

    if ("number" === typeof level) {
      window.setCurrentLevel(level);
      window.updateCurrentLevel();
    }

    if ("number" === typeof expCountForNextLevel) {
      window.setExpCountForNextLevel(expCountForNextLevel);
      window.updateExpCountForNextLevelElement();
    }

    if ("number" === typeof levelStarted) {
      window.setLevelStarted(levelStarted);
    }

    if ("number" === typeof gold) {
      window.setCurrentGold(gold);
      window.updateCurrentGold();
    }

    if (discovered && Object.keys(discovered).length) {
      const discoveredEntries = Object.entries(discovered);

      discoveredEntries.forEach(([localStorageKey, localStorageValue]) => {
        window.localStorage.setItem(localStorageKey, localStorageValue);
      });
    }

    console.info("Session synced.");
  };

  window.showQr = () => {
    document
      .querySelector("div.qr-code-container")
      .classList.remove("display-none");
  };

  window.hideQr = () => {
    document
      .querySelector("div.qr-code-container")
      .classList.add("display-none");
  };
})();
