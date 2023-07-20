(async () => {
  await loadBasicEvolutionJson();
  await loadPokeCsv();
  createCells();
  initializeIntersectionObserver();

  async function createCells() {
		const pool = window.pokelist
			// .slice(0, 100)
		const poolLength = pool.length;

		for (let i = 0; i < poolLength; i+=1) {
			const eachChain = pool[i];
      const firstDisplayName = eachChain.list[0];
      const pokemonData = getPokemonDataByDisplayName(firstDisplayName);
      const cellElement = createCell(pokemonData.id, firstDisplayName, i);
      document.getElementById("pokemon-grid").appendChild(cellElement);
    }
  }

  function createCell(pokemonId, displayName, i) {
		const cellElement = document.createElement("div");
		cellElement.id = `cell-${i}`;
    cellElement.classList.add("cell");

    const imageUrl = `./images/official-artwork/${pokemonId}.png`;
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

    cellElement.appendChild(imageElement);

    return cellElement;
  }

	function addBackgroundColor(imageElement, imageUrl) {
		imageElement.setAttribute('src', imageUrl);
		if (imageElement.style.backgroundColor) {
			return;
		}

    const colorThief = new ColorThief();
    const img = new Image();

    img.addEventListener("load", function () {
      const colorThiefed = colorThief.getColor(img);
      imageElement.style.backgroundColor = `rgb(${colorThiefed.join(',')})`;
    });

    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
	}
	
	function initializeIntersectionObserver() {
		const cells = document.querySelectorAll('.cell');

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((eachEntry) => {
				const targetCell = eachEntry.target;
				targetCell.classList.toggle('show-image', eachEntry.isIntersecting);
				if (eachEntry.isIntersecting) {
					addBackgroundColor(targetCell.children[1], targetCell.getAttribute('data-image-url'));
				}
			})
		});

		cells.forEach((eachCell) => observer.observe(eachCell));
	}
})();
