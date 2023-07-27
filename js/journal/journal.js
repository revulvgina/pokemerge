(async () => {
	document.body.scrollTo(0, 0);

  document.addEventListener("imports-loaded", async () => {
    await loadPokeCsv();
    await window.loadPokemonTypesJson();
    await window.loadPokemonTypeNamesJson();
    await window.loadPokemonSpeciesFlavorTextJson();
		await window.loadPokemonSpeciesChainJson();
		await window.loadPokemonNamesJson();
		await window.loadPokemonSpeciesJson();

    initializeCommonVars();
    initializeImageUrlLoadedListener();
		createCells();
		initializeDiscoveredTexts();
    initializeIntersectionObserver();
		initializeDatalistListener();

		window.playSound('pokemon-theme-bgm', 0.1);
		
		document.body.scrollTo(0, 0);
  });

	async function createCells() {
		
		window.totalDiscovered = 0;

    const pokemonList =
      window.pokeCsv; /* [window.pokeCsv.slice(0, 1), window.pokeCsv.slice(264, 265), window.pokeCsv.slice(132, 133)].flat(); */
    // .slice(0, 100)
    const poolLength = pokemonList.length;

    for (let i = 0; i < poolLength; i += 1) {
      const pokemonData = pokemonList[i];

      const { id, is_default } = pokemonData;

      if ("0" === is_default) {
        continue;
      }

      const cellElement = createCell(pokemonData, i);

      document.getElementById("pokemon-grid").appendChild(cellElement);
    }

		document.getElementById("pokemon-grid").classList.remove("display-none");
	}
	
	function initializeDiscoveredTexts() {
		document.getElementById('discovered-text').innerText = `${window.totalDiscovered} / ${window.pokeCsv.length}`;
		document.getElementById('discovered-percent').innerText = `(${((window.totalDiscovered / window.pokeCsv.length) * 100).toFixed(1)}%)`;
	}

  function createCell(pokemonData, i) {
    const { id, identifier, height, weight } = pokemonData;
    const cellElement = document.createElement("div");

		const displayName = window.pokemonNames[`pokemon-id-${id}`];

    cellElement.id = `cell-${i}`;
    cellElement.classList.add("cell");

    cellElement.setAttribute("data-display-name", displayName);
    cellElement.setAttribute("data-height", height);
    cellElement.setAttribute("data-weight", weight);
    cellElement.setAttribute("data-pokemon-id", id);
    cellElement.setAttribute("data-pokemon-identifier", identifier);

    const { evolution_chain_id } = window.pokemonSpecies[`pokemon-id-${id}`];
    cellElement.setAttribute("data-evolution-chain-id", evolution_chain_id);

		const thisPokemonTypes = window.pokemonTypes[`pokemon-id-${id}`];
		if (Array.isArray(thisPokemonTypes)) {
			thisPokemonTypes.forEach(({ type_id }, thatPokemonTypeIndex) => {
				cellElement.setAttribute(`data-type-${thatPokemonTypeIndex}`, window.pokemonTypeNames[`type-id-${type_id}`]);
			});
		}

    const imageUrl = `./images/official-artwork/${id}.png`;
    cellElement.setAttribute("data-image-url", imageUrl);

    const divElement = document.createElement("div");
    divElement.classList.add("pokemon-name-container");
    const pokemonNameElement = document.createElement("div");
    pokemonNameElement.innerText = displayName;
    addNameToDatalist(id, displayName);
    pokemonNameElement.classList.add("pokemon-name");
    divElement.appendChild(pokemonNameElement);
    cellElement.appendChild(divElement);

    const imageElement = document.createElement("img");
    imageElement.setAttribute("loading", "lazy");
    imageElement.setAttribute("data-image-url", imageUrl);
    imageElement.classList.add("pokemon-image");
    if (isDiscovered(identifier)) {
      imageElement.classList.add("discovered");
			window.totalDiscovered += 1;
		}
		
		cellElement.appendChild(imageElement);
		
		cellElement.onclick = () => toggleCellFullScreen(imageElement);

    return cellElement;
  }

  function addBackgroundColor(imageElement, imageUrl) {
    imageElement.setAttribute("src", imageUrl);
    if (imageElement.style.backgroundColor) {
      return;
    }

    const colorThief = new ColorThief();
    const img = new Image();

		img.addEventListener("load", function () {
      const colorThiefed = colorThief.getColor(img);
      imageElement.style.backgroundColor = `rgb(${colorThiefed.join(",")})`;
      imageElement.parentElement.classList.add("image-is-loaded");
      imageElement.removeAttribute("loading");
      window.containerElement.dispatchEvent(
        new CustomEvent("image-url-loaded", { detail: { imageUrl } })
      );
    });

    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
  }

  function addNameToDatalist(id, displayName) {
		const divElement = document.createElement("div");
		divElement.classList.add('search-result-item');
    divElement.innerText = displayName;
    document.getElementById("pokemon-names").appendChild(divElement);
  }

  function initializeCommonVars() {
    window.containerElement = document.querySelector(".container");
    window.searchPokemonInputElement = document.getElementById(
      "pokemon-names-input"
		);
		window.searchBoxElement = document.querySelector('.search-box');
		window.pokemonNamesElement = document.querySelector('#pokemon-names');
  }

  function requestImageLoadedImmediately(imageElement) {
    imageElement.removeAttribute("loading");
    window.requestedImageUrl = imageElement.getAttribute("data-image-url");
  }

  function initializeImageUrlLoadedListener() {
    window.containerElement.addEventListener(
      "image-url-loaded",
      ({ detail: { imageUrl } }) => {
        if (imageUrl === window.requestedImageUrl) {
          const imageElement = window.containerElement.querySelector(
            `img[data-image-url="${imageUrl}"]`
          );

          toggleCellFullScreen(imageElement);

          window.requestedImageUrl = null;
          imageElement.setAttribute("loading", "lazy");
        }
      }
    );
  }

	function initializeDatalistListener() {
		window.searchPokemonInputElement.addEventListener('keyup', (evt) => {
			const inputValue = evt.target.value;
			if (!inputValue || 'string' !== typeof inputValue || !inputValue.trim().length) {
				resetAllSearchItem();
				window.pokemonNamesElement.classList.add('initial-list');
				return;
			}

			if (inputValue.trim().length <= 1) {
				resetAllSearchItem();
				window.pokemonNamesElement.classList.add('initial-list');
				return;
			}

			let resultsShown = 0;

			window.pokemonNamesElement.classList.remove('initial-list');
			document.querySelector('#pokemon-names').classList.remove('has-selected');

			window.pokemonNamesElement.querySelectorAll('.search-result-item').forEach((eachChildDiv) => {
				eachChildDiv.classList.add('hide-result');
				eachChildDiv.classList.remove('show-result');

				if (resultsShown < 5 && new RegExp(inputValue, 'ig').test(eachChildDiv.innerText)) {
					eachChildDiv.classList.add('show-result');
					eachChildDiv.classList.remove('hide-result');
					resultsShown += 1;
				}
			});
		});

		window.pokemonNamesElement.addEventListener('click', (evt) => {
			window.searchPokemonInputElement.value = evt.target.innerText;
			document.querySelector('#pokemon-names').classList.add('has-selected');
			scrollCellIntoView(evt.target.innerText);
		})
	}

	function resetAllSearchItem() {
		window.pokemonNamesElement.querySelectorAll('.search-result-item').forEach((eachChildDiv) => {
			eachChildDiv.classList.remove('show-result');
			eachChildDiv.classList.remove('hide-result');
		});

	}
	
  function scrollCellIntoView(inputValue) {
    if ("string" !== typeof inputValue || 0 === inputValue.trim().length) {
      return;
    }

    const cellMatched = document.querySelector(
      `div.cell[data-display-name="${inputValue}"]`
    );

    if (!cellMatched) {
      return;
		}
		
		cellMatched.scrollIntoView();
		
    const imageElement = cellMatched.querySelector("img");

    if (imageElement.complete && imageElement.src) {
      toggleCellFullScreen(imageElement);
      return;
    }

    requestImageLoadedImmediately(imageElement);
  }

  function initializeIntersectionObserver() {
    const cells = document.querySelectorAll(".cell");

    window.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((eachEntry) => {
          const targetCell = eachEntry.target;
          targetCell.classList.toggle("show-image", eachEntry.isIntersecting);
          if (eachEntry.isIntersecting) {
            addBackgroundColor(
              targetCell.children[1],
              targetCell.getAttribute("data-image-url")
            );
          }
        });
      },
      { threshold: 0 }
    );

    cells.forEach((eachCell) => window.observer.observe(eachCell));
  }

  window.unFullScreen = (e) => {
		document.querySelector('.header').scrollIntoView();
		
    if (window.lastUnFullScreenTimeout > Date.now()) {
      return;
    }

    window.lastUnFullScreenTimeout = Date.now() + 1000;
    window.lastFullScreenTimeout = Date.now() - 1;

    const el = document.getElementById("full-screen-detail");

    // Remove cloned element from DOM after animation is over
    el.addEventListener("animationend", (e) => {
      if (window.lastFullScreenTimeout > Date.now()) {
        return;
      }
      e.target.classList.remove("full-screen");
      e.target.classList.remove("shrink-down");
      document.getElementById("image-container").innerHTML = "";
    });

    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = "";
    el.classList.add("shrink-down");
  };

	function toggleCellFullScreen(target) {
    const { top, left } = target.getBoundingClientRect();
    const cellElement = target.parentElement;
    const imageElement = cellElement.children[1];

    const fullScreenDetailElement =
      document.getElementById("full-screen-detail");
    fullScreenDetailElement.classList.remove("full-screen");
    fullScreenDetailElement.classList.remove("shrink-down");
    fullScreenDetailElement.style.setProperty(
      "--inset",
      `${top}px auto auto ${left}px`
    );

    const pokemonIdentifier = cellElement.getAttribute(
      "data-pokemon-identifier"
    );

		const isPokemonDiscovered = isDiscovered(pokemonIdentifier);
		
    if (isPokemonDiscovered) {
      fullScreenDetailElement.style.backgroundColor =
        imageElement.style.backgroundColor;
    } else {
      fullScreenDetailElement.style.backgroundColor = "#292929";
    }

    const clonedImageElement = imageElement.cloneNode(true);

    if (isPokemonDiscovered) {
      clonedImageElement.style.filter = "grayscale(0)";
    } else {
      clonedImageElement.style.backgroundColor = "#292929";
    }

    const imageContainerElement = document.getElementById("image-container");
    imageContainerElement.innerHTML = "";
    imageContainerElement.appendChild(clonedImageElement);

    const displayNameElement = document.getElementById("display-name");
    displayNameElement.innerHTML = `<span>${cellElement.getAttribute(
      "data-display-name"
		)}</span>`;
		
		setPokemonTypes(cellElement);

    if (isPokemonDiscovered) {
      const heightElement = document.getElementById("height-value");
      heightElement.innerText = `${
        Number.parseInt(cellElement.getAttribute("data-height"), 10) / 10
      } M`;

      const weightElement = document.getElementById("weight-value");
      weightElement.innerText = `${
        Number.parseInt(cellElement.getAttribute("data-weight"), 10) / 10
      } KG`;

			const { flavor_text } = window.getRandomItem(window.pokemonSpeciesFlavorText[`pokemon-id-${cellElement.getAttribute("data-pokemon-id")}`]);
			const flavorTextElement = document.getElementById("flavor-text");
      flavorTextElement.innerText = flavor_text;

			fullScreenDetailElement.classList.remove("not-yet-discovered");
    } else {
      fullScreenDetailElement.classList.add("not-yet-discovered");
    }

    const dateDiscoveredElement = document.getElementById("date-discovered");
    const lastDiscovered = getDiscovered(pokemonIdentifier);
    if (null !== lastDiscovered) {
      const dateDiscovered = window.getDateTimeFormat(
        Number.parseInt(lastDiscovered, 10)
      );
      dateDiscoveredElement.innerText = `discovered last ${dateDiscovered}`;
    } else {
      dateDiscoveredElement.innerText = `can be discovered at Lv ${cellElement.getAttribute(
        "data-evolution-chain-id"
      )}.`;
    }

		const evolutionChainElement = document.getElementById("evolution-chain");
		evolutionChainElement.innerHTML = '';

		const speciesChainList = window.pokemonSpeciesChain[`evolution_chain_id-${cellElement.getAttribute("data-evolution-chain-id")}`]
		speciesChainList.forEach((eachSpecies) => {
			const speciesDisplayName = window.pokemonNames[`pokemon-id-${eachSpecies.id}`];
			const eachEvolutionChainSpeciesElement = document.createElement('img');
			const speciesImageUrl = `./images/official-artwork/${eachSpecies.id}.png`;
			eachEvolutionChainSpeciesElement.setAttribute('src', speciesImageUrl);
			eachEvolutionChainSpeciesElement.setAttribute('title', `#${eachSpecies.id} ${speciesDisplayName} (${window.getEvolutionOrdinalByNumber(eachSpecies.evolution_number)})`);
			eachEvolutionChainSpeciesElement.classList.toggle('discovered', isDiscovered(eachSpecies.identifier));
			
			evolutionChainElement.appendChild(eachEvolutionChainSpeciesElement);

			if (cellElement.getAttribute('data-pokemon-id') === eachSpecies.id.toString()) {
				return;
			}

			eachEvolutionChainSpeciesElement.classList.add('cursor-pointer');

			eachEvolutionChainSpeciesElement.onclick = () => {
				const el = document.getElementById("full-screen-detail");

			// Remove cloned element from DOM after animation is over
				el.classList.remove("full-screen");
				el.classList.remove("shrink-down");
				document.getElementById("image-container").innerHTML = '';

				scrollCellIntoView(speciesDisplayName);
			}
		});

    fullScreenDetailElement.classList.add("full-screen");
    window.lastFullScreenTimeout = Date.now() + 1000;
  }

  function toggleFullScreen(e) {
    toggleCellFullScreen(e.target);
  }

  function isDiscovered(pokemonIdentifier) {
    return (
      "string" ===
      typeof window.localStorage.getItem(`discovered-${pokemonIdentifier}`)
    );
	}
	
	function setPokemonTypes(cellElement) {
		const typesElement = document.getElementById("types");
		let typesInnerHTML = "";
		for (let i = 0; i < 10; i += 1) {
			const typeName = cellElement.getAttribute(`data-type-${i}`);

			if (null === typeName) {
				break;
			}

			typesInnerHTML += `<div class="pokemon-type-box" style="background-color: ${
				window.POKEMON_TYPE_COLORS[typeName.toLowerCase()]
			}">${typeName}</div>`;
		}

		typesElement.innerHTML = typesInnerHTML;
	}

  function getDiscovered(pokemonIdentifier) {
    return window.localStorage.getItem(`discovered-${pokemonIdentifier}`);
  }
})();
