(() => {
	window.isMobile = () => {
		return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
			navigator.userAgent.toLowerCase()
		);
	}

  window.loadPokeCsv = async () => {
    const response = await fetch(
      "https://raw.githubusercontent.com/revulvgina/pokemerge/master/csv/pokemon.csv"
    );
    const text = await response.text();

    window.pokeCsv = csvToArray(text, ",");
  };

  window.loadBasicEvolutionJson = async () => {
    const response = await fetch(
      `https://raw.githubusercontent.com/revulvgina/pokemerge/master/json/basic-evolutions.json`
    );
    const jsonResponse = await response.json();

    window.pokelist = jsonResponse.select;
  };

  window.formatDisplayNameAsIdentifierForCsv = (displayName) => {
    return displayName
      .replaceAll(".", "")
      .replaceAll(" ", "-")
      .replaceAll(":", "")
      .replaceAll("♀", "-m")
      .replaceAll("♂", "-f")
      .replaceAll(`'`, "")
      .replaceAll("é", "e")
      .toLowerCase();
  };

	window.findPokemonFromCsv = (identifierPrefix) => {
		const exactMatch = window.pokeCsv.find(
			(eachPokemon) => eachPokemon.identifier === identifierPrefix
		);
	
		if (exactMatch) {
			return exactMatch;
		}
	
		return window.pokeCsv.find((eachPokemon) =>
			eachPokemon.identifier.match(`^${identifierPrefix}`)
		);
	}
	
	window.getPokemonDataByDisplayName = (pokemonDisplayName) => {
		const csvIdentifier = formatDisplayNameAsIdentifierForCsv(pokemonDisplayName);
	
		return findPokemonFromCsv(csvIdentifier);
	};

	window.isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
})();