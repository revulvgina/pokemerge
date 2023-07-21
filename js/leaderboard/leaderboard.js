(async () => {
  document.addEventListener("imports-loaded", async () => {
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

		await populateGrid('highest-level');
    await populateGrid('highest-gold');
    await populateGrid('highest-backpack');
  });

	async function fetchCategory(destinationUrl) {
    let response;
    try {
			response = await fetch(
				// extraCacheBusterFetchUrl(`https://pokemerge-endpoint.vercel.app/api/${destinationUrl}`)
				`https://pokemerge-endpoint.vercel.app/api/${destinationUrl}/cached`
      );
    } catch (e) {
      console.error(e);
      return;
    }

		window[destinationUrl] = await response.json();
		
		return window[destinationUrl];
  }

	async function populateGrid(gridCategoryId) {
		const categoryData = await fetchCategory(gridCategoryId);

		const gridCategory = document.getElementById(gridCategoryId);
		
    categoryData.forEach((eachHighestLevelRow, index) => {
      const positionGridItem = document.createElement("div");
      positionGridItem.classList.add("grid-item", "grid-item-position");
      positionGridItem.innerText = `#${index + 1}`;
			gridCategory.appendChild(positionGridItem);
			
      const nameGridItem = document.createElement("div");
      nameGridItem.classList.add("grid-item", "grid-item-name");
      nameGridItem.innerText = eachHighestLevelRow.name;
      nameGridItem.title = window.getDateTimeFormat(
        Number.parseInt(eachHighestLevelRow.last_updated, 10)
      );
      gridCategory.appendChild(nameGridItem);

      const valueGridItem = document.createElement("div");
      valueGridItem.classList.add("grid-item", "grid-item-value");
      valueGridItem.innerText = eachHighestLevelRow.value;
			gridCategory.appendChild(valueGridItem);
		});
		
		gridCategory.parentElement.classList.add('has-content');
  }
})();
