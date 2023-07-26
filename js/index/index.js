(async () => {
	document.body.scrollTo(0, 0);

  document.addEventListener("imports-loaded", async () => {
    await loadBasicEvolutionJson();
		await loadPokeCsv();
		
		await window.initializeSessionFromCloud();
    window.initializeSessionId();
		await window.initializeNickname();

    createBuyerCells();
    createBackpackCells();

    attachContextMenus();

    initializeCurrentLevel();
		window.initializeCurrentGold();
		window.initializeExpCountForNextLevel();

    updateCurrentLevel();
    updateCurrentGold();
    updateExpCountForNextLevelElement();

    resetBuyers();

    deleteAudioElementCriesInterval();

    addEventListeners();

    initializeBackpackBalls();

		initializeMouseMoveListener();
		
		window.setContentAsLoaded();

    // fetch("http://ip-api.com/json")
    //   .then((response) => response.json())
    //   .then((data) => console.log(data));
		document.body.scrollTo(0, 0);
  });
})();
