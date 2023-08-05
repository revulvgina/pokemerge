(() => {
	window.pokeBallRandomIndexList =
		Array(24).fill(0)
			.concat(Array(8).fill(1))
			.concat(Array(4).fill(2))
			.concat(Array(1).fill(3));
  window.pokeBallNames = [
    "poke-ball",
    "great-ball",
    "ultra-ball",
    "master-ball",
	];
	
  window._encounterDuration = -Infinity;
	window._encounterPokemonBallList = Array(4).fill(2).concat(Array(1).fill(3));
	
  window.cryMp3LinkMap = {
    ["nidoran-f"]: "nidoranf",
    ["nidoran-m"]: "nidoranm",
	};

	window.MAGIKARP_GYARADOS_IDS = Array(8).fill(129).concat(Array(2).fill(130));
	
	window.BUYER_SHUFFLE_GOLD_DECREASE = 10;

	window.MINIMUM_BACKPACK_OPENED_AMOUNT_BUYER_PICK = 12;

	window.MAXIMUM_POKEBALL_OPEN_PRICE = 10;

	window.MAXIMUM_POKEMON_EVOLUTION_NUMBER = 3;

	window.TYPE_BUFF_FILTER_RATE = 3;

	window.TOTAL_BUYERS = 4;

	window.ENCOUNTER_DURATION_MILLISECONDS = 30000;
})();