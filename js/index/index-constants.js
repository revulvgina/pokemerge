(() => {
  window.defaultPokeBallCell = `<img src="./images/poke-ball.png" onclick="onPokeBallCellClick(this)" ondragstart="onPokeBallCellClick(this)" />`;
  window.pokeBallRandomIndexList = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3,
  ];
  window.totalPokeBallRandomIndexList = window.pokeBallRandomIndexList.length;
  window.pokeBallNames = [
    "poke-ball",
    "great-ball",
    "ultra-ball",
    "master-ball",
	];
	
  window._encounterDuration = -Infinity;
	window._encounterPokemonBallList = [2, 2, 2, 2, 3];
	
  window.cryMp3LinkMap = {
    ["nidoran-f"]: "nidoranf",
    ["nidoran-m"]: "nidoranm",
  };
})();