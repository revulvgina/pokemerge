(async () => {
	document.body.scrollTo(0, 0);

  document.addEventListener("imports-loaded", async () => {
		await window.loadPokemonSpeciesChainJson();
		await window.loadPokemonNamesJson();
		await window.loadPokemonSpeciesJson();
		await window.loadPokemonTypesJson();
		await window.loadPokemonTypeNamesJson();

		window.loadCommonElements();
		
		await window.initializeSessionFromCloud();
    window.initializeSessionId();
		await window.initializeNickname();

    window.createBuyerCells();
    window.createBackpackCells();

    window.attachContextMenus();

    window.initializeCurrentLevel();
		window.initializeCurrentGold();
		window.initializeExpCountForNextLevel();

    window.updateCurrentLevel();
    window.updateCurrentGold();
    window.updateExpCountForNextLevelElement();

    window.resetBuyers();

    window.initializeAudioElementCriesDeleteInterval();

    window.addEventListeners();

    window.initializeBackpackBalls();

		window.initializeMouseMoveListener();
		
		window.setContentAsLoaded();

		window.initializeLevelStarted();

		window.muteAllAudioWhenAway();
		window.initializeVibration();
		
		document.body.scrollTo(0, 0);
  });
})();
