(async () => {
  document.addEventListener("imports-loaded", async () => {
    await loadBasicEvolutionJson();
		await loadPokeCsv();
		
		await window.initializeIdentity();
		// TODO
		// await window.restoreSession();
		window.initializeNickname();
    getSessionId();

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
  });
})();
