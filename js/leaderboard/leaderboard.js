(async () => {
  document.addEventListener("imports-loaded", async () => {
    await fetchHighestLevel();
    // await loadPokeCsv();
    // await loadPokemonChainJson();
    // await loadPokemonSpeciesNames();
    // await loadPokemonTypes();
    // await loadTypeNames();
    // await loadPokemonSpeciesFlavorText();
    // await loadPokemonSpecies();

    // createCells();
    // initializeIntersectionObserver();
    // attachClickListenerToEveryCell();

    displayHighestLevel();
  });

  async function fetchHighestLevel() {
    let response;
    try {
      response = await fetch(
        `https://pokemerge-endpoint.vercel.app/api/highest-level?t=${Date.now()}`
      );
    } catch (e) {
      console.error(e);
      return;
		}
		
		window.highestLevelList = await response.json();
  }

	function displayHighestLevel() {
		const highestLevelGrid = document.getElementById('highest-level-grid')
		window.highestLevelList.forEach((eachHighestLevelRow) => {
			const nameGridItem = document.createElement('div');
			nameGridItem.classList.add('grid-item', 'grid-item-name');
			nameGridItem.innerText = eachHighestLevelRow.name;
			nameGridItem.title = window.getDateTimeFormat(Number.parseInt(eachHighestLevelRow.last_updated, 10));
			highestLevelGrid.appendChild(nameGridItem);

			const valueGridItem = document.createElement('div');
			valueGridItem.classList.add('grid-item', 'grid-item-value');
			valueGridItem.innerText = eachHighestLevelRow.value;
			highestLevelGrid.appendChild(valueGridItem);
		})
	}
})();
