(() => {
  window.isMobile = () => {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    );
  };

  window.getRandomItem = (listOfItems) => {
    const totalItems = listOfItems.length;

    return listOfItems[Math.floor(Math.random() * totalItems)];
  };

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
  };

  window.getPokemonDataByDisplayName = (pokemonDisplayName) => {
    const csvIdentifier =
      formatDisplayNameAsIdentifierForCsv(pokemonDisplayName);

    return findPokemonFromCsv(csvIdentifier);
  };

  window.isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
	};

	window.loadPokemonSpeciesNames = async () => {
    const response = await fetch(
      './csv/pokemon_species_names.csv'
    );
    const text = await response.text();

    window.pokemonSpeciesNames = csvToArray(text, ",");
	}
	
	window.getCommonSpeciesData = (pokemonId) => {
		return window.pokemonSpeciesNames.find(({ pokemon_species_id, local_language_id }) => pokemonId.toString() === pokemon_species_id && '9' === local_language_id);
	}
	
	window.getCommonSpeciesName = (pokemonId) => {
		return window.getCommonSpeciesData(pokemonId).name;
	}

	window.loadPokemonChainJson = async () => {
		const response = await fetch('./json/pokemon_chain.json');

		window.pokemonChain = await response.json();
	}

	window.loadPokemonTypes = async () => {
    const response = await fetch(
      './csv/pokemon_types.csv'
    );
    const text = await response.text();

    window.pokemonTypes = csvToArray(text, ",");
	}

	window.loadTypeNames = async () => {
		const response = await fetch(
			'./csv/type_names.csv'
		);
		const text = await response.text();

		window.typeNames = csvToArray(text, ",");
	};

	window.getPokemonTypeNames = (pokemonId) => {
		const pokemonTypes = window.pokemonTypes.filter((eachItem) => eachItem.pokemon_id === pokemonId.toString());

		return pokemonTypes.map((eachType) => window.typeNames.find((eachTypeName) => eachTypeName.type_id === eachType.type_id && '9' === eachTypeName.local_language_id).name );
	}

	window.loadPokemonSpeciesFlavorText = async () => {
		const response = await fetch(
			'./csv/pokemon_species_flavor_text.csv'
		);
		const text = await response.text();

		window.pokemonSpeciesFlavorText = csvToArray(text, ",");
	};

	window.pokemonFlavorTextCache = {};

	window.getPokemonFlavorText = (pokemonId) => {
		const cachedFlavorText = window.pokemonFlavorTextCache[pokemonId];
		if (cachedFlavorText) {
			return cachedFlavorText;
		}

		const assembledFlavorText = window.pokemonSpeciesFlavorText
			.filter(({ species_id, language_id }) => pokemonId === species_id && '9' === language_id)
			.map((eachFiltered) => eachFiltered.flavor_text);
		
		window.pokemonFlavorTextCache[pokemonId] = assembledFlavorText;

		return assembledFlavorText;
	};

	window.getRandomPokemonFlavorText = (pokemonId) => {
		const flavorTexts = window.getPokemonFlavorText(pokemonId);
		return getRandomItem(flavorTexts);
	}

	window.loadPokemonSpecies = async () => {
		const response = await fetch(
			'./csv/pokemon_species.csv'
		);
		const text = await response.text();

		window.pokemonSpecies = csvToArray(text, ",");
	};

	window.getPokemonSpeciesRow = (pokemonId) => {
		return window.pokemonSpecies.find(({ id }) => pokemonId.toString() === id);
	};

	window.getPokemonChainData = (evolutionChainId) => {
		return window.pokemonChain.find((eachPokemonChain) => evolutionChainId === eachPokemonChain.evolution_chain_id);
	};

	window.getNanoId = (length = 16) => {
		const _ID_CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return customAlphabet(_ID_CHARACTERS, length)();
	};

	window.setSessionId = (sessionIdValue) => {
		window.localStorage.setItem('session-id', sessionIdValue);
		window.sessionId = sessionIdValue;
	};

	window.initializeSessionId = () => {
		window.sessionId = window.localStorage.getItem('session-id');

		if (null !== window.sessionId) {
			return;
		}

		const newSessionId = window.getNanoId(16);
		window.setSessionId(newSessionId);
	};

	window.getDateTimeFormat = (thatTimestamp) => {
		return new Date(thatTimestamp).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
	};

	window.extraCacheBusterFetchUrl = (fetchUrl) => {
		return `${fetchUrl}/${Date.now()}${window.getNanoId(16)}`;
	}

  window.reanimateElement = (element) => {
    element.style.animation = "none";
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null;
	};
	
	window.backLocation = () => {
		if ('localhost' === window.location.hostname) {
			return '/';
		}

		return '/pokemerge';
	};
})();
