(async () => {
	
	document.addEventListener("imports-loaded", async () => {
		await loadPokeCsv();
		await loadPokemonChainJson();
		await loadPokemonSpeciesNames();
		await loadPokemonTypes();
		await loadTypeNames();
		await loadPokemonSpeciesFlavorText();
		await loadPokemonSpecies();
	
		createCells();
		initializeIntersectionObserver();
		attachClickListenerToEveryCell();
	});

  async function createCells() {
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
  }

  function createCell(pokemonData, i) {
    const { id, identifier, height, weight } = pokemonData;
    const cellElement = document.createElement("div");

    const displayName = getCommonSpeciesName(id);

    cellElement.id = `cell-${i}`;
    cellElement.classList.add("cell");

    cellElement.setAttribute("data-display-name", displayName);
    cellElement.setAttribute("data-height", height);
    cellElement.setAttribute("data-weight", weight);
    cellElement.setAttribute("data-pokemon-id", id);
    cellElement.setAttribute("data-pokemon-identifier", identifier);

    const { evolution_chain_id } = window.getPokemonSpeciesRow(id);
    cellElement.setAttribute("data-evolution-chain-id", evolution_chain_id);

    const pokemonTypeNames = window.getPokemonTypeNames(id);
    if (Array.isArray(pokemonTypeNames)) {
      pokemonTypeNames.forEach((eachTypeName, i) => {
        cellElement.setAttribute(`data-type-${i}`, eachTypeName);
      });
    }

    const imageUrl = `./images/official-artwork/${id}.png`;
    cellElement.setAttribute("data-image-url", imageUrl);

    const divElement = document.createElement("div");
    divElement.classList.add("pokemon-name-container");
    const pokemonNameElement = document.createElement("div");
    pokemonNameElement.innerText = displayName;
    pokemonNameElement.classList.add("pokemon-name");
    divElement.appendChild(pokemonNameElement);
    cellElement.appendChild(divElement);

    const imageElement = document.createElement("img");
    imageElement.setAttribute("loading", "lazy");
    imageElement.classList.add("pokemon-image");
    if (isDiscovered(identifier)) {
      imageElement.classList.add("discovered");
    }

    cellElement.appendChild(imageElement);

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
    });

    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
  }

  function initializeIntersectionObserver() {
    const cells = document.querySelectorAll(".cell");

    const observer = new IntersectionObserver((entries) => {
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
    });

    cells.forEach((eachCell) => observer.observe(eachCell));
  }

  window.unFullScreen = (e) => {
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

    // Trigger browser reflow to start animation
    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = "";
    el.classList.add("shrink-down");
  };

  function toggleFullScreen(e) {
    // Get position values for element
    const { top, left } = e.target.getBoundingClientRect();
    const cellElement = e.target.parentElement;
    const imageElement = cellElement.children[1];

    const fullScreenDetailElement =
      document.getElementById("full-screen-detail");
    fullScreenDetailElement.classList.remove("full-screen");
    fullScreenDetailElement.classList.remove("shrink-down");
    fullScreenDetailElement.style.setProperty(
      "--inset",
      `${top}px auto auto ${left}px`
    );

		const pokemonIdentifier = cellElement.getAttribute("data-pokemon-identifier");
    if (isDiscovered(pokemonIdentifier)) {
      fullScreenDetailElement.style.backgroundColor =
        imageElement.style.backgroundColor;
    } else {
      fullScreenDetailElement.style.backgroundColor = "#292929";
    }

    const clonedImageElement = imageElement.cloneNode(true);

    if (!isDiscovered(pokemonIdentifier)) {
      clonedImageElement.style.backgroundColor = "#292929";
      clonedImageElement.style.filter = "grayscale(0)";
    }

    const imageContainerElement = document.getElementById("image-container");
    imageContainerElement.innerHTML = "";
    imageContainerElement.appendChild(clonedImageElement);

    const displayNameElement = document.getElementById("display-name");
    displayNameElement.innerHTML = `<span>${cellElement.getAttribute(
      "data-display-name"
    )}</span>`;

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

    const heightElement = document.getElementById("height-value");
    heightElement.innerText = `${
      Number.parseInt(cellElement.getAttribute("data-height"), 10) / 10
    } M`;

    const weightElement = document.getElementById("weight-value");
    weightElement.innerText = `${
      Number.parseInt(cellElement.getAttribute("data-weight"), 10) / 10
    } KG`;

    const flavorTextElement = document.getElementById("flavor-text");
    flavorTextElement.innerText = window.getRandomPokemonFlavorText(
      cellElement.getAttribute("data-pokemon-id")
		);
		
		
		const dateDiscoveredElement = document.getElementById("date-discovered");
		const lastDiscovered = getDiscovered(pokemonIdentifier);
		if (null !== lastDiscovered) {
			const dateDiscovered = window.getDateTimeFormat(Number.parseInt(lastDiscovered, 10));
			dateDiscoveredElement.innerText = `discovered last ${dateDiscovered}`;
		} else {
			dateDiscoveredElement.innerText = `not yet discovered.`;
		}

    const evolutionChainElement = document.getElementById("evolution-chain");
    const evolutionChainData = window.getPokemonChainData(
      cellElement.getAttribute("data-evolution-chain-id")
    );
    let evolutionChainString = "";
    evolutionChainData.list.map((firstEvolution) => {
			const firstDisplayName = getCommonSpeciesName(firstEvolution.id);
      evolutionChainString += `<img src="./images/official-artwork/${
        firstEvolution.id
      }.png" title="#${firstEvolution.id} ${firstDisplayName}" class="${
        isDiscovered(firstEvolution.identifier) ? "discovered" : ""
      }" />`;

      const secondEvolutionList = firstEvolution.list.map((secondEvolution) => {
				const secondDisplayName = getCommonSpeciesName(secondEvolution.id);
        let baseSecondEvolutionListString = `<img src="./images/official-artwork/${
          secondEvolution.id
        }.png" title="#${secondEvolution.id} ${secondDisplayName}" class="${
          isDiscovered(secondEvolution.identifier) ? "discovered" : ""
        }" />`;

        const thirdEvolutionList = secondEvolution.list.map(
					(thirdEvolution) => {
    				const thirdDisplayName = getCommonSpeciesName(thirdEvolution.id);
            return `<img src="./images/official-artwork/${
              thirdEvolution.id
            }.png" title="#${thirdEvolution.id} ${thirdDisplayName}" class="${
              isDiscovered(thirdEvolution.identifier) ? "discovered" : ""
            }" />`;
          }
        );

        if (thirdEvolutionList.length) {
          baseSecondEvolutionListString += `${thirdEvolutionList.join("")}`;
        }

        return baseSecondEvolutionListString;
      });

      if (secondEvolutionList.length) {
        evolutionChainString += `${secondEvolutionList.join("")}`;
      }
    });

    evolutionChainElement.innerHTML = "<div>" + evolutionChainString + "</div>";

    fullScreenDetailElement.classList.add("full-screen");
    window.lastFullScreenTimeout = Date.now() + 1000;
  }

  function isDiscovered(pokemonIdentifier) {
    return (
      "string" ===
      typeof window.localStorage.getItem(`discovered-${pokemonIdentifier}`)
    );
  }

  function getDiscovered(pokemonIdentifier) {
    return window.localStorage.getItem(`discovered-${pokemonIdentifier}`);
  }

  function attachClickListenerToEveryCell() {
    document.querySelectorAll(".cell").forEach((box) => {
      box.addEventListener("click", toggleFullScreen);
    });
  }
})();