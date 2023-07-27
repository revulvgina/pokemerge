(async () => {
	document.body.scrollTo(0, 0);

  document.addEventListener("imports-loaded", async () => {
		await window.loadPokemonSpeciesChainJson();
		await window.loadPokemonNamesJson();
		await window.loadPokemonSpeciesJson();
		
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

    window.deleteAudioElementCriesInterval();

    window.addEventListeners();

    window.initializeBackpackBalls();

		window.initializeMouseMoveListener();
		
		window.setContentAsLoaded();

		window.initializeLevelStarted();
		
		document.body.scrollTo(0, 0);
  });
})();
