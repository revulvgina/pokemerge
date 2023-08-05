(() => {
  window.loadCommonElements = () => {
    window.pokemonBuffChanceContainerElement = document.getElementById(
      "pokemon-buff-chance-container"
    );
  };

  window.createBuyerCells = () => {
    const buyersGrid = document.getElementById("buyers-grid");

    for (let i = 0; i < window.TOTAL_BUYERS; i += 1) {
      const eachBuyerCell = document.createElement("div");
      eachBuyerCell.id = `buyer-${i}`;
      eachBuyerCell.classList.add("no-highlight", "grid-cell");
      eachBuyerCell.innerHTML = `<img src="./images/transparent-picture.png" />`;
      buyersGrid.appendChild(eachBuyerCell);
    }
  };

  window.createBackpackCells = () => {
    const backpackGrid = document.getElementById("backpack-grid");

    for (let i = 0; i < 16; i += 1) {
      const eachBackpackCell = document.createElement("div");
      eachBackpackCell.id = `backpack-cell-${i}`;
      eachBackpackCell.classList.add("backpack-0", "no-highlight", "grid-cell");
      eachBackpackCell.innerHTML = `<img src="./images/transparent-picture.png" />`;
      backpackGrid.appendChild(eachBackpackCell);
    }

    window.temporaryTypeBuffs = [];
  };

  const _adjustEncounterDisplay = () => {
    const { offsetWidth, offsetHeight } =
      document.querySelector("div.backpack-grid");
    document.querySelector("#spinning-box").style.width = `${offsetWidth}px`;
    document.querySelector("#spinning-box").style.height = `${offsetHeight}px`;
  };

  const _createRandomPokeBallImage = () => {
    const imgTag = document.createElement("img");
    const randomPokeBallIndex = _getRandomPokeBallIndex();
    const pokeBallName = window.pokeBallNames[randomPokeBallIndex];
    imgTag.setAttribute("src", `./images/${pokeBallName}.png`);
    imgTag.onclick = () => _onPokeBallCellClick(imgTag, randomPokeBallIndex);
    imgTag.ondragstart = () => _onPokeBallCellClick(imgTag, randomPokeBallIndex);
    imgTag.setAttribute("data-pokeball-index", randomPokeBallIndex);
    imgTag.setAttribute("data-click-price", _getClickPrice(randomPokeBallIndex));
    imgTag.setAttribute(
      "title",
      `Open for ${_getClickPrice(randomPokeBallIndex)} gold`
    );

    return imgTag;
  };

  const _attachCellWithPokeBallImage = (cellElement) => {
    cellElement.innerHTML = "";
    cellElement.appendChild(_createRandomPokeBallImage());
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
      _attachCellWithPokeBallImage(eachCell);
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

  const _getBasePrice = (evolution_number) => {
    return Math.pow(evolution_number, evolution_number);
  };

	const _getRandomBuyerPrice = async (pokemonId) => {
		const pokemonPrice = await window.getPokemonPrice(pokemonId);

		const minimumPrice = Math.floor(Math.max(pokemonPrice / 2, 1));

		const maximumPrice = pokemonPrice * 2;

		const priceDifference = maximumPrice - minimumPrice;

		return minimumPrice + Math.floor(Math.random() * priceDifference);
  };

  const _getClickPrice = (pokeBallIndex) => {
    return Math.min(
      window.MAXIMUM_POKEBALL_OPEN_PRICE,
      (pokeBallIndex + 1) * 3
    );
  };

  const _getRandomPokeBallIndex = () => {
    if (window._encounterDuration > Date.now()) {
      return window.getRandomItem(window._encounterPokemonBallList);
		}

    return window.getRandomItem(window.pokeBallRandomIndexList);
  };

  window.addEventListeners = () => {
    document.addEventListener("keydown", (event) => {
      if (event.code === "KeyP") {
        _onPokeBallClick();
      }
    });
  };

  window.attachContextMenus = () => {
    const backpackCells = _getAllBackpackCells();

    backpackCells.forEach((eachBackpackCell) => {
      _attachBackpackContextMenu(eachBackpackCell);
    });

    const buyerCells = Array.from(document.querySelectorAll("[id^=buyer-]"));

    buyerCells.forEach((eachBuyerCell) => {
      _attachBuyerContextMenu(eachBuyerCell);
    });
  };

  window.setCurrentLevel = (numberValue) => {
    window.currentLevel = numberValue;
    window.localStorage.setItem("current_lv", numberValue);
  };

  const _updateLastUpdated = (lastUpdatedValue = Date.now()) => {
    window.localStorage.setItem("last-updated", lastUpdatedValue);
  };

  window.initializeCurrentLevel = () => {
    window.currentLevel =
      Number.parseInt(window.localStorage.getItem("current_lv"), 10) || 1;

    window.setCurrentLevel(window.currentLevel);
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

  const _getPoolByLevel = () => {
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

	const _getIncreasingChanceByLevel = (maxIncrease = 15) => {
		return Math.min(maxIncrease, Math.floor(window.currentLevel / 1.5));
	};

	const _canStartMagikarpMode = () => {
		const magikarpModeTimeout = window.localStorage.getItem('magikarp-mode-timeout');

		if (null === magikarpModeTimeout) {
			return true;
		}

		const magikarpModeTimeoutTimestamp = Number.parseInt(magikarpModeTimeout, 10);

		return Date.now() > magikarpModeTimeoutTimestamp;
	};

	const _isOnMagikarpMode = () => _isMagikarpSongPlaying() && window.enableMagikarpGyaradosOnly;

	const _getBackpackRandomPokemonId = (pokeBallIndex) => {
		if (_isOnMagikarpMode()) {
			return {
				pokemonId: window.getRandomItem(window.MAGIKARP_GYARADOS_IDS)
			};
		}

		let pool = _getPoolByLevel();

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
      0 === Math.floor(Math.random() * (20 - _getIncreasingChanceByLevel(15)))
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
      0 === Math.floor(Math.random() * (20 - _getIncreasingChanceByLevel(15)))
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
	
	const _recordCollectedPokemonId = (pokemonId) => {
		const localStorageCollectedPokemonKey = `collected-${pokemonId}`;

		window.localStorage.setItem(localStorageCollectedPokemonKey, Number.parseInt((window.localStorage.getItem(localStorageCollectedPokemonKey)?.toString() || 0), 10) + 1);
	};

  const _randomizeBackpackCell = (cellElement, pokeBallIndex) => {
		let { pokemonId } = _getBackpackRandomPokemonId(pokeBallIndex);

		_recordCollectedPokemonId(pokemonId);

    const pokemonSpeciesObject =
      window.pokemonSpecies[`pokemon-id-${pokemonId}`];

    cellElement.setAttribute("data-pokemon-id", pokemonId);
    cellElement.setAttribute(
      "data-evolution-chain-id",
      pokemonSpeciesObject.evolution_chain_id
    );

    _setEvolutionChainIdsAndNames(cellElement);

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
    currentGoldElement.innerText = window.formatGoldDisplay(window.currentGold);
    currentGoldElement.title = `${new Intl.NumberFormat().format(window.currentGold)} gold`;
  };

  const _increaseCurrentGold = (goldIncrease) => {
    window.setCurrentGold(window.currentGold + goldIncrease);

    updateCurrentGold();

    _updateLastUpdated();

    if (goldIncrease > 0) {
      _publishHighestGold();
    }
  };

  const _updateExpForNextLevelCount = (increaseValue) => {
    window.setExpCountForNextLevel(
      (window.expCountForNextLevel || 0) +
        Math.floor(increaseValue * Math.max(1, window.currentLevel / 40))
    );

    _updateLastUpdated();

    if (window.expCountForNextLevel < window.currentLevel) {
      updateExpCountForNextLevelElement();
      return;
    }

    _increaseCurrentGold(window.currentLevel * 5);

    let excessValue = window.expCountForNextLevel - window.currentLevel;

    if (excessValue >= window.currentLevel + 1) {
      window.setCurrentLevel(window.currentLevel + 2);
      excessValue = Math.max(0, excessValue - (window.currentLevel - 1));
    } else {
      window.setCurrentLevel(window.currentLevel + 1);
    }

    window.setExpCountForNextLevel(excessValue);

    _updateLastUpdated();

    updateExpCountForNextLevelElement();
    updateCurrentLevel();

    _playIndexSound("level-up-sound");

    window.levelUpSoundPriorityTimeout = Date.now() + 2000;

    _publishHighestLevel();
    _publishFastestLevel();

    window.setLevelStarted(Date.now());

    if (0 === window.currentLevel % 5 && !_isMagikarpSongPlaying()) {
			_startEncounter();
    }
	};
	
	const _startEncounter = () => {
		_adjustEncounterDisplay();

		_playEncounter();
		
		window._encounterDuration = Date.now() + window.ENCOUNTER_DURATION_MILLISECONDS;

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
		}, window.ENCOUNTER_DURATION_MILLISECONDS);
	};

  window.setExpCountForNextLevel = (thatValue, isRestored = false) => {
    window.expCountForNextLevel = thatValue;
    window.localStorage.setItem("exp-count-for-next-level", thatValue);
  };

  window.setLevelStarted = (timestamp) => {
    window.levelStarted = timestamp;
    window.localStorage.setItem("level-started", timestamp);
  };

  const _clearElementAttributesByPrefix = (cellElement, attributePrefix) => {
    const attributeNames = Array.from(cellElement.attributes).map(
      ({ name }) => name
    );

    attributeNames.forEach((eachAttributeName) => {
      if (new RegExp(`^${attributePrefix}`).test(eachAttributeName)) {
        cellElement.removeAttribute(eachAttributeName);
      }
    });
  };

  const _getNextEvolutions = (evolutionChainId, pokemonId) => {
    const evolutionChainList =
      window.pokemonSpeciesChain[`evolution_chain_id-${evolutionChainId}`];

    return evolutionChainList.filter(
      ({ evolves_from_species_id }) =>
        evolves_from_species_id.toString() === pokemonId.toString()
    );
	};
	
	const _countNextEvolutions = (evolutionChainId, pokemonId) => {
		return _getNextEvolutions(evolutionChainId, pokemonId).length;
	};

	const _hasMultipleEvolutions = (evolutionChainId, pokemonId) => {
		return _getNextEvolutions(evolutionChainId, pokemonId).length > 1;
	};

  const _hasNextEvolutions = (evolutionChainId, pokemonId) => {
    return !!_countNextEvolutions(evolutionChainId, pokemonId);
	};

  const _upgradeBackpackCell = (cellElement) => {
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
      _setSelectedCell(window.selectedCellElement);
      return;
    }
		
		_resetBorderColor(cellElement);

    const nextRandomEvolutionSpeciesObject =
      window.getRandomItem(nextEvolutions);

    cellElement.setAttribute(
      "data-evolution-number",
      nextRandomEvolutionSpeciesObject.evolution_number
		);
		
		_recordCollectedPokemonId(nextRandomEvolutionSpeciesObject.id);

    _decorateBackpackCell(cellElement, nextRandomEvolutionSpeciesObject.id);

    _clearBackpackCellAndCreateRandomPokeball(window.selectedCellElement);

		_resetBorderColor(window.selectedCellElement);

    _clearSelectedCell();

    _setSelectedCell(cellElement);

    _updateExpForNextLevelCount(currentEvolutionNumber);

    _playIndexSound("plus-sound");
  };

  const _getPokemonImageUrl = (pokemonId) => {
    return `.	/images/bit/${pokemonId}.png`;
  };

  const _updateDisplayCell = (
    cellElement,
    pokemonId,
    pokemonDisplayName,
    isBuyer
  ) => {
    cellElement.innerHTML = "";

    const imageUrl = _getPokemonImageUrl(pokemonId);
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

  const _setFloatingImageCoordinates = ({ clientX, clientY }) => {
    const floatingImageElement = document.getElementById("floating-image");
    floatingImageElement.style.left = `${
      window._recordedMouseMoveEvent.clientX - 10
    }px`;
    floatingImageElement.style.top = `${window._recordedMouseMoveEvent.clientY}px`;
  };

  window.initializeMouseMoveListener = () => {
    if (window.isMobile()) {
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
        _setFloatingImageCoordinates(window._recordedMouseMoveEvent);
    });
  };

  const _setFloatingImage = (pokemonIdString) => {
    const floatingImage = document.getElementById("floating-image");
    floatingImage.setAttribute("src", `./images/bit/${pokemonIdString}.png`);

    const mouseMoveEvent = window._recordedMouseMoveEvent;

    _setFloatingImageCoordinates(mouseMoveEvent);
  };

  const _getSelectedCellBorderStyle = (displayNameInCell, displayName) => {
    if (displayNameInCell !== displayName) {
      return "";
    }

    return ` evolution-chain-border-current`;
  };

  const _setEvolutionChain = (cellElement) => {
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
        `<div title="${eachDisplayName}" class="evolution-chain-image-container${_getSelectedCellBorderStyle(
          displayNameInCell,
          eachDisplayName
        )}"><img src="./images/bit/${eachEvolutionSpeciesId}.png" /></div>`
      );
    });

    document.getElementById("evolution-chain").innerHTML = collectEach.join("");
  };

  const _setSelectedCell = (cellElement) => {
    _clearSelectedCell();

    window.selectedCellElement = cellElement;
    cellElement.classList.add("selected-cell");

    _setEvolutionChain(cellElement);

    document
      .getElementById("left-box-evolution-chain")
      .setAttribute("data-show-that", "show");

    if (!window.isMobile()) {
      _setFloatingImage(cellElement.getAttribute("data-pokemon-id"));
    }

    if (
      _hasNextEvolutions(
        cellElement.getAttribute("data-evolution-chain-id"),
        cellElement.getAttribute("data-pokemon-id")
      )
    ) {
      _highlightBackpackAndBuyerSamePokemonId(
				cellElement.getAttribute("data-pokemon-id"),
				cellElement.id
      );
    } else {
      _highlightBuyerSamePokemonId(
        cellElement.getAttribute("data-pokemon-id")
      );
    }

		_playIndexSound("click-sound");
		
		if (document.getElementById('magikarp-song').paused) {
			window.playPageBgm();
		}
  };

  const _sellBackpackCell = (cellElement) => {
    const evolutionNumber = Number.parseInt(
      cellElement.getAttribute("data-evolution-number"),
      10
    );

		_addTypeBuff(cellElement);
		_resetBorderColor(cellElement);

    cellElement.classList.remove("selected-cell");
    _clearSelectedCell();

    _increaseCurrentGold(_getBasePrice(evolutionNumber));

    _playIndexSound("coin-sound");
	};
	
	const _willAddBuff = (evolutionChainId, pokemonId) => {
		const pokemonHasNextEvolutions = _hasNextEvolutions(
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

  const _attachBackpackContextMenu = (cellElement) => {
    const onBackpackContextMenu = (event) => {
      event.preventDefault();

      if (null === cellElement.getAttribute("data-pokemon-id")) {
        return;
      }

      _sellBackpackCell(cellElement);
      _clearBackpackCellAndCreateRandomPokeball(cellElement);
    };

    cellElement.addEventListener("contextmenu", onBackpackContextMenu);
	};
	
	const _setBackpackCellBorder = (cellElement, thisPokemonTypeNames) => {
		const gridCellBaseBorderColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-a76f47');
		for (let eachTypeIndex = 0; eachTypeIndex < 2; eachTypeIndex += 1) {
			const eachTypeName = thisPokemonTypeNames[eachTypeIndex];

			const typeColor = !eachTypeName ? 'transparent' : window.POKEMON_TYPE_COLORS[eachTypeName.toLowerCase()];

			if (0 === eachTypeIndex) {
				cellElement.style.borderTopColor = typeColor;
				cellElement.style.borderLeftColor = typeColor;
				cellElement.style.setProperty('--cell-border-top-left-color', cellElement.style.borderTopColor.match(/^rgb\((.+)\)$/)[1]);
				continue;
			}

			if (1 === eachTypeIndex) {
				cellElement.style.borderBottomColor = typeColor;
				cellElement.style.borderRightColor = typeColor;
				cellElement.style.setProperty('--cell-border-bottom-right-color', 'transparent' === cellElement.style.borderBottomColor ? gridCellBaseBorderColor : cellElement.style.borderBottomColor.match(/^rgb\((.+)\)$/)[1]);
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

		const sellValue = _getBasePrice(pokemonSpeciesObject.evolution_number);
		
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

		cellElement.setAttribute('data-generated-date', Date.now());

		const discoveredKey = `discovered-${pokemonId}`;
		if (!window.localStorage.getItem(discoveredKey)) {
			window.localStorage.setItem(discoveredKey, Date.now());
		}

		_updateDisplayCell(cellElement, pokemonId, pokemonDisplayName);
		
		_setBackpackCellBorder(cellElement, thisPokemonTypeNames);

		cellElement.setAttribute("data-sell-value", sellValue);
		cellElement.setAttribute(
			"data-evolution-number",
			pokemonSpeciesObject.evolution_number
		);

		cellElement.onclick = () => _onBackpackMouseDown(cellElement);
		cellElement.ondragstart = () => _onBackpackMouseDown(cellElement);
	};

	const _decorateBackpackCell = (cellElement, pokemonId) => {
		_updateBackpackCell(cellElement, pokemonId);

		_publishHighestBackpack();
	};
	
	const _isSummoningMagikarpMode = () => {
		return window.selectedCellElement && window.temporaryTypeBuffs.includes('11') && "129" === window.selectedCellElement.getAttribute('data-pokemon-id');
	};

	const _isMagikarpSongPlaying = () => {
		return !!!document.getElementById('magikarp-song').paused;
	}

  const _onBackpackMouseDown = (cellElement) => {
    const targetPokemonId = cellElement.getAttribute("data-pokemon-id");
    if (null === targetPokemonId) {
      return;
    }

    if (window.selectedCellElement) {
			window.selectedCellElement.classList.remove("selected-cell");
			
			if (window.selectedCellElement.id === cellElement.id && _isSummoningMagikarpMode() && _canStartMagikarpMode()) {
				cellElement.querySelector('img').classList.toggle('flip-image', !cellElement.querySelector('img').classList.contains('flip-image'));
				_playCry(129);

				if (!_isMagikarpSongPlaying()) {
					document.getElementById('magikarp-song').currentTime = 220;
					window.playSound('magikarp-song', 0.1);
					document.getElementById('page-bgm').pause();
					document.getElementById('page-bgm').currentTime = 0;
				}

				if (window.isRandomSuccess(50)) {
					window.enableMagikarpGyaradosOnly = true;

					window.localStorage.setItem('magikarp-mode-timeout', Date.now() + 64_800_000); // 18 hours timeout
		
					document
						.getElementById("backpack-icon")
						.setAttribute("src", "./images/bit/129.png");
				}
				return;
			}

      if (
        targetPokemonId ===
          window.selectedCellElement.getAttribute("data-pokemon-id") &&
        cellElement.getAttribute("id") !==
          window.selectedCellElement.getAttribute("id")
      ) {
        _upgradeBackpackCell(cellElement);
        return;
      }
    }

    _setSelectedCell(cellElement);
  };

  const _getEmptyBackpackCell = () => {
    const everyCells = _getAllBackpackCells();

    return everyCells.findIndex(
      (eachCell) => null === eachCell.getAttribute("data-display-name")
    );
  };

  const _getAllBackpackCells = () => {
    return Array.from(document.querySelectorAll("[id^=backpack-cell-]"));
  };

  const _playIndexSound = (audioId) => {
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
		
		if (_isSummoningMagikarpMode()) {
			volume = 0.1;
		}

    window.playSound(audioId, volume);
  };

  const _onPokeBallClick = () => {
    let indexWithoutDisplayName = _getEmptyBackpackCell();

    if (
      "number" === typeof indexWithoutDisplayName &&
      indexWithoutDisplayName >= 0
    ) {
      const cellElement = document.getElementById(
        `backpack-cell-${indexWithoutDisplayName}`
      );

      _randomizeBackpackCell(
        cellElement,
        Number.parseInt(cellElement.getAttribute("data-evolution-number"), 10) -
          1
      );

      _playIndexSound("pokeball-open-sound");
    }

    _clearSelectedCell();
  };
  const _onPokeBallCellClick = (imgElement, pokeBallIndex) => {
    _clearSelectedCell();

    const dataClickPrice = Number.parseInt(
      imgElement.getAttribute("data-click-price"),
      10
    );

    reanimateElement(imgElement);

    if (window.currentGold < dataClickPrice) {
      return;
    }

    _increaseCurrentGold(-dataClickPrice);

    const parentElement = imgElement.parentElement;
    _randomizeBackpackCell(parentElement, pokeBallIndex);
    // setSelectedCell(parentElement);
    _playIndexSound("pokeball-open-sound");
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
		const nowDate = Date.now();

    const allBackpackPokemonIds = Array.from(
      document.querySelectorAll("[id^=backpack-cell-][data-pokemon-id][data-generated-date]")
		)
			.filter((eachBackpackCell) => {
				const generatedDate = Number.parseInt(eachBackpackCell.getAttribute('data-generated-date'), 10);

				return nowDate > (generatedDate + 3000);
			})
			.map((eachBackpackCell) =>
				eachBackpackCell.getAttribute("data-pokemon-id")
		);
		
		if (!allBackpackPokemonIds.length) {
			return undefined;
		}

    const duplicateCountOfEachBackpackPokemonIds = {};
    allBackpackPokemonIds.forEach((eachPokemonId) => {
      duplicateCountOfEachBackpackPokemonIds[eachPokemonId] =
        (duplicateCountOfEachBackpackPokemonIds[eachPokemonId] || 0) + 1;
    });

    const randomDuplicateCount = Math.floor(Math.random() * 2);

    const backpackPokemonIdsWithGreaterThanDuplicateNumber = Object.entries(
      duplicateCountOfEachBackpackPokemonIds
    )
      .filter(
        ([_, backPokemonIdDuplicateCount]) =>
          backPokemonIdDuplicateCount > randomDuplicateCount
      )
      .map(([backpackPokemonId, _]) => backpackPokemonId);

    const backpackPokemonIdsToFilter =
      backpackPokemonIdsWithGreaterThanDuplicateNumber.length
        ? backpackPokemonIdsWithGreaterThanDuplicateNumber
        : Object.keys(duplicateCountOfEachBackpackPokemonIds);

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
      return undefined;
    }

    let tentativeRandomPokemonId = window.getRandomItem(
      filteredBackpackPokemonIdsWithBuyerDuplicatePokemonIds
    );

    const numberOfDuplicates =
      duplicateCountOfEachBackpackPokemonIds[tentativeRandomPokemonId];

    let tentativePokemonDisplayName =
      window.pokemonNames[`pokemon-id-${tentativeRandomPokemonId}`];

    const randomBackpackCellElement = document.querySelector(
      `[id^=backpack-cell-][data-pokemon-id="${tentativeRandomPokemonId}"]`
    );

    const pokemonNextEvolutions = _getNextEvolutions(
      randomBackpackCellElement.getAttribute("data-evolution-chain-id"),
      tentativeRandomPokemonId
    );

    if (numberOfDuplicates > 1 && pokemonNextEvolutions.length) {
			const { id: nextRandomEvolutionPokemonId } = window.getRandomItem(
        pokemonNextEvolutions
			);
			
      if (
        allBuyersPokemonId.filter(
          (eachBuyerPokemonId) =>
            nextRandomEvolutionPokemonId === eachBuyerPokemonId
        ).length <= Math.floor(Math.random() * 2)
      ) {
        tentativeRandomPokemonId = nextRandomEvolutionPokemonId;
      }
    }

    return tentativeRandomPokemonId;
  };

	const _getRandomPokemonIdFromPool = () => {
    const poolByLevel = _getPoolByLevel();

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

  const _randomizeBuyerCell = async (cellElement) => {
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

    const { evolution_chain_id, evolution_number} =
      window.pokemonSpecies[`pokemon-id-${randomPokemonId}`];

		let buyerSellValue = await _getRandomBuyerPrice(randomPokemonId);
		
    cellElement.setAttribute(
      "data-evolution-chain-id", evolution_chain_id
		);

    cellElement.setAttribute("data-buyer-sell-value", buyerSellValue);

    _setEvolutionChainIdsAndNames(cellElement);

    cellElement.setAttribute(
			"data-evolution-number",
			evolution_number
    );

    _decorateBuyerCell(cellElement, randomPokemonId);

    _attachBuyerRefreshElement(cellElement);

    _restartBuyerRandomizeTimeout(cellElement);

    if (
      window.selectedCellElement &&
      null !== window.selectedCellElement.getAttribute("data-pokemon-id")
    ) {
      _highlightBackpackAndBuyerSamePokemonId(
        window.selectedCellElement.getAttribute("data-pokemon-id")
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
    window._buyerInterval = setInterval(async () => {
      for (let i = 0; i < window.TOTAL_BUYERS; i += 1) {
        const cellElement = document.getElementById(`buyer-${i}`);

        if (null !== cellElement.getAttribute("data-pokemon-id")) {
          continue;
        }

        if (cellElement._nextRandomForThisCell > Date.now()) {
          continue;
        }

				await _randomizeBuyerCell(cellElement);
				
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

  const _highlightBackpackAndBuyerSamePokemonId = (pokemonId, excludeId) => {
		Array.from(
			document.querySelectorAll(`[data-pokemon-id="${pokemonId}"]`)
		).forEach((eachGridCell) => {
			if (excludeId && eachGridCell.id === excludeId) { return; }

			eachGridCell.classList.add("highlight-border");
		});
  };

  const _highlightBuyerSamePokemonId = (pokemonId) => {
    Array.from(
      document.querySelectorAll(
        `[id^=buyer-][data-pokemon-id="${pokemonId}"]`
      )
    ).forEach((eachItem) => eachItem.classList.add("highlight-border"));
  };

  const _clearBackpackCellAndCreateRandomPokeball = (cellElement) => {
    cellElement.classList.remove("selected-cell");
    cellElement.removeAttribute("title");
    _clearElementAttributesByPrefix(cellElement, "data-");

    cellElement.innerHTML = "";

    _attachCellWithPokeBallImage(cellElement);
  };

  window.initializeAudioElementCriesDeleteInterval = () => {
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

  const _formatCryMp3Link = (pokemonId) => {
		const { identifier } = window.pokemonSpecies[`pokemon-id-${pokemonId}`];

    return window.cryMp3LinkMap[identifier] || identifier;
  };

  const _createOrUpdateCryElement = (pokemonId) => {
    const audioElementId = `pokemon-cry-${pokemonId}`;
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
        pokemonId
      )}.mp3`
    );
    audioElement.setAttribute("data-delete-element-after", Date.now() + 3000);

    document.getElementById("audio-cries").appendChild(audioElement);

    audioElement.volume = 0.1;

    return audioElement;
  };

	const _playCry = (pokemonId) => {
    const audioElement = _createOrUpdateCryElement(pokemonId);

    _playIndexSound(audioElement.id);
  };

  const _attachBuyerContextMenu = (cellElement) => {
    const onBuyerContextMenu = (event) => {
      event.preventDefault();

      if (window.currentGold < window.BUYER_SHUFFLE_GOLD_DECREASE) {
        return;
      }

      if (null === cellElement.getAttribute("data-pokemon-id")) {
        return;
      }

      if (cellElement._nextRandomForThisCell > Date.now()) {
        return;
      }

      // randomizeBuyerCell(cellElement);
      // cellElement.removeAttribute("data-display-buyer-randomize-button");
			_clearElementAttributesByPrefix(cellElement, "data-");
			
			cellElement.removeAttribute("title");
			
			_resetBorderColor(cellElement);

      cellElement.innerHTML = '<img src="./images/transparent-picture.png" />';

			_increaseCurrentGold(-window.BUYER_SHUFFLE_GOLD_DECREASE);

      cellElement._nextRandomForThisCell = Date.now() + 6000;

      _restartBuyerRandomizeTimeout(cellElement);

      _playIndexSound("shuffle-sound");
    };

    cellElement.addEventListener("contextmenu", onBuyerContextMenu, true);
  };

  const _onBuyerMouseDown = (cellElement) => {
    if (!window.selectedCellElement) {
      return;
    }

    const selectedPokemonId =
      window.selectedCellElement.getAttribute("data-pokemon-id");

    const targetPokemonId = "" + cellElement.getAttribute("data-pokemon-id");

    if (selectedPokemonId !== targetPokemonId) {
      return;
    }

    resetBuyers();

    const goldIncreaseValue = Number.parseInt(
      cellElement.getAttribute("data-buyer-sell-value"),
      10
    );

    cellElement.removeAttribute("title");

		_clearElementAttributesByPrefix(cellElement, "data-");
		_resetBorderColor(cellElement);

    _increaseCurrentGold(goldIncreaseValue);

    reanimateElement(cellElement);

    reanimateElement(document.getElementById("pokemerge-brand"));
    reanimateElement(document.querySelector(".header-text > h1"));
    reanimateElement(document.querySelector("#exp-bar"));

    const evolutionNumber = Number.parseInt(
      window.selectedCellElement.getAttribute("data-evolution-number"),
      10
    );

    _updateExpForNextLevelCount(evolutionNumber);

    _doVibrate();

    cellElement.innerHTML = '<img src="./images/transparent-picture.png" />';

    _clearBackpackCellAndCreateRandomPokeball(window.selectedCellElement);

		_resetBorderColor(window.selectedCellElement);
    _clearSelectedCell();

    _playIndexSound("gold-sound");

    _playCry(targetPokemonId);
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

  const _playEncounter = () => {
    _playIndexSound("pokemon-encounter");

    clearTimeout(window._showStreakAnimation);
    document.getElementById("spinning-box").classList.remove("display-none");
    window._showStreakAnimation = setTimeout(() => {
      document.getElementById("spinning-box").classList.add("display-none");
    }, 4000);
  };

  const _setEvolutionChainIdsAndNames = (cellElement) => {
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
    const pokemonDisplayName = window.pokemonNames[`pokemon-id-${pokemonId}`];

		const thisPokemonTypeNames = _getPokemonTypeNames(pokemonId);
		
		_setBackpackCellBorder(cellElement, thisPokemonTypeNames);

    _updateDisplayCell(cellElement, pokemonId, pokemonDisplayName, true);

    cellElement.setAttribute(
      "title",
			`${cellElement.getAttribute('data-display-name')}#${pokemonId}\nType(s): ${thisPokemonTypeNames.join(', ')}\n${cellElement.getAttribute(
        "data-evolution-chain-names"
      )}\nRight click to shuffle for 10 gold.`
    );

    cellElement.onclick = () => _onBuyerMouseDown(cellElement);
    cellElement.ondragstart = () => _onBuyerMouseDown(cellElement);
  };

  const _publishHighestLevel = async () => {
    const response = await fetch(
      `${window.DB_API_ENDPOINT}/highest-level/${window.sessionId}`,
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

  const _publishHighestBackpack = async () => {
    const allDiscoveredLocalStorageKeys = Object.keys({
      ...window.localStorage,
    }).filter((eachKey) => /^discovered-/.test(eachKey));

    const response = await fetch(
      `${window.DB_API_ENDPOINT}/highest-backpack/${window.sessionId}`,
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

  const _publishHighestGold = async () => {
    if (window.highestGoldAttained > window.currentGold) {
      clearTimeout(window.highestGoldPublishTimeout);
      window.highestGoldPublishTimeout = setTimeout(
        _postHighestGold,
        5000
      );
      return;
    }

    window.highestGoldAttained = window.currentGold;

    await _postHighestGold();
  };

  const _postHighestGold = async () => {
    clearTimeout(window.highestGoldPublishTimeout);

    const response = await fetch(
      `${window.DB_API_ENDPOINT}/highest-gold/${window.sessionId}`,
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

  const _publishFastestLevel = async () => {
    const response = await fetch(
      `${window.DB_API_ENDPOINT}/fastest-level/${window.sessionId}`,
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
		
		sessionMap.collected = {};
		const allCollectedLocalStorageEntries = Object.entries({ ...window.localStorage })
			.filter(([k, v]) => /^collected-/.test(k))
			.forEach(([k, v]) => {
				sessionMap.collected[k] = v;
			});
		
		sessionMap.magikarpModeTimeout = window.localStorage.getItem('magikarp-mode-timeout');

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
			collected,
			magikarpModeTimeout,
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

    _updateLastUpdated(lastUpdated);

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

    if (collected && Object.keys(collected).length) {
      const collectedEntries = Object.entries(collected);

      collectedEntries.forEach(([localStorageKey, localStorageValue]) => {
        window.localStorage.setItem(localStorageKey, localStorageValue);
      });
		}
		
		if (magikarpModeTimeout) {
			window.localStorage.setItem('magikarp-mode-timeout', magikarpModeTimeout);
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

	window.registerMagikarpSongListener = () => {
		document.getElementById('magikarp-song').addEventListener("ended", () => {
			document
				.getElementById("backpack-icon")
				.setAttribute("src", "./images/backpack.png");
	 });
	};
})();
