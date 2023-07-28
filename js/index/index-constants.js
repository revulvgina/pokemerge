(() => {
  window.defaultPokeBallCell = `<img src="./images/poke-ball.png" onclick="onPokeBallCellClick(this)" ondragstart="onPokeBallCellClick(this)" />`;
  window.pokeBallRandomIndexList = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		1, 1, 1, 1, 1, 1, 1, 1,
		2, 2, 2, 2,
		3,
  ];
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
	
	window.BUYER_SHUFFLE_GOLD_DECREASE = 10;

	window.RANDOM_BUYER_UNRELATED_POKEMON_RATE = 10;

	window.MAXIMUM_POKEBALL_OPEN_PRICE = 10;

	window.MAXIMUM_POKEMON_EVOLUTION_NUMBER = 3;
})();