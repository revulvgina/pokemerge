(async () => {
  document.addEventListener("imports-loaded", async () => {
    await loadBasicEvolutionJson();
    await loadPokeCsv();

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
  });
})();
