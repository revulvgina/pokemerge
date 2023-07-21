(async () => {
  document.addEventListener("imports-loaded", async () => {
    await loadBasicEvolutionJson();
    await loadPokeCsv();
    getSessionId();

    createBuyerCells();
    createBackpackCells();

    attachContextMenus();

    initializeCurrentLevel();
    updateCurrentLevel();
    initializeCurrentGold();
    updateCurrentGold();
    updateExpForNextLevelElement();

    resetBuyers();

    deleteAudioElementCriesInterval();

    addEventListeners();

    initializeBackpackBalls();

    initializeMouseMoveListener();

    // fetch("http://ip-api.com/json")
    //   .then((response) => response.json())
    //   .then((data) => console.log(data));
  });
})();