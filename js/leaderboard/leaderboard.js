(async () => {
  document.addEventListener("imports-loaded", async () => {
		await populateGrid('highest-level');
    await populateGrid('highest-gold');
		await populateGrid('highest-backpack');
		await populateFastestLevelGrid('fastest-level');
		window.playSound('trainer-battle', 0.1);
		window.muteAllAudioWhenAway();
  });

	async function fetchCategory(destinationUrl) {
    let response;
    try {
			response = await fetch(
				extraCacheBusterFetchUrl(`${window.DB_API_ENDPOINT}/${destinationUrl}`)
				// `${window.DB_API_ENDPOINT}/${destinationUrl}/cached`
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
      nameGridItem.title = new Date(
        Number.parseInt(eachHighestLevelRow.last_updated, 10)
      ).toLocaleString();
      gridCategory.appendChild(nameGridItem);

      const valueGridItem = document.createElement("div");
      valueGridItem.classList.add("grid-item", "grid-item-value");
      valueGridItem.innerText = eachHighestLevelRow.value;
			gridCategory.appendChild(valueGridItem);
		});
		
		gridCategory.parentElement.classList.add('has-content');
  }

	async function populateFastestLevelGrid(gridCategoryId) {
		const categoryData = await fetchCategory(gridCategoryId);

		const gridCategory = document.getElementById(gridCategoryId);
		
    categoryData.forEach((eachHighestLevelRow, index) => {
      const positionGridItem = document.createElement("div");
      positionGridItem.classList.add("grid-item", "grid-item-position");
      positionGridItem.innerHTML = `<span>Lv${eachHighestLevelRow.level}</span>`;
			gridCategory.appendChild(positionGridItem);
			
      const nameGridItem = document.createElement("div");
      nameGridItem.classList.add("grid-item", "grid-item-name");
      nameGridItem.innerHTML = `<span>${eachHighestLevelRow.name}</span>`;
      nameGridItem.title = new Date(
        Number.parseInt(eachHighestLevelRow.last_updated, 10)
      ).toLocaleString();
      gridCategory.appendChild(nameGridItem);

      const valueGridItem = document.createElement("div");
      valueGridItem.classList.add("grid-item", "grid-item-value");
      valueGridItem.innerHTML = `<span>${getFormattedTime( eachHighestLevelRow.value)}</span>`;
			gridCategory.appendChild(valueGridItem);
		});
		
		gridCategory.parentElement.classList.add('has-content');
	}
	
	function getFormattedTime(timeValue) {
		if (timeValue < 60000) {
			return `${(timeValue / 1000).toFixed(2)}s`
		}

		if (timeValue < 3600000) {
			return `${(timeValue/1000 / 60).toFixed(2)}m`
		}

		if (timeValue < 86400000) {
			return `${(timeValue/1000 / 60 / 60).toFixed(2)}h`
		}

		return `${(timeValue / 1000 / 60 / 60 / 24).toFixed(2)}d`
	}
})();
