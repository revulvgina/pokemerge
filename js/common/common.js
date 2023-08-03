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
    const response = await fetch("./csv/pokemon.csv");
    const text = await response.text();

    window.pokeCsv = csvToArray(text, ",");
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

  window.getNanoId = (length = 16) => {
    const _ID_CHARACTERS =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    return customAlphabet(_ID_CHARACTERS, length)();
  };

  window.setSessionId = (sessionIdValue) => {
    window.localStorage.setItem("session-id", sessionIdValue);
    window.sessionId = sessionIdValue;
  };

  window.initializeSessionId = () => {
    window.sessionId = window.localStorage.getItem("session-id");

    if (null !== window.sessionId) {
      return;
    }

    const newSessionId = window.getNanoId(16);
    window.setSessionId(newSessionId);
  };

  window.getDateTimeFormat = (thatTimestamp) => {
    return new Date(thatTimestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  window.extraCacheBusterFetchUrl = (fetchUrl) => {
    return `${fetchUrl}/${Date.now()}${window.getNanoId(16)}`;
  };

  window.reanimateElement = (element) => {
    element.style.animation = "none";
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null;
  };

  window.backLocation = () => {
    if ("localhost" === window.location.hostname) {
      return "/";
    }

    return "/pokemerge";
  };

  window.playSound = (audioId, volume = 1) => {
    const thisAudio = document.getElementById(audioId);

    if (!thisAudio) {
      return;
    }

    thisAudio.volume = volume;
    thisAudio.muted = false;

    // thisAudio.pause();
    thisAudio.currentTime = 0;
    thisAudio.play();
  };

  window.loadPokemonSpeciesChainJson = async () => {
    const response = await fetch("./json/pokemon-species-chain.json");

    window.pokemonSpeciesChain = await response.json();
  };

  window.loadPokemonNamesJson = async () => {
    const response = await fetch("./json/pokemon-names.json");

    window.pokemonNames = await response.json();
  };

  window.getEvolutionOrdinalByNumber = (evolutionNumber) => {
    if (1 === evolutionNumber) {
      return "1st evolution";
    }
    if (2 === evolutionNumber) {
      return "2nd evolution";
    }
    if (3 === evolutionNumber) {
      return "3rd evolution";
    }

    return "unknown evolution";
  };

  window.loadPokemonSpeciesJson = async () => {
    const response = await fetch("./json/pokemon-species.json");

    window.pokemonSpecies = await response.json();
  };

  window.loadPokemonSpeciesFlavorTextJson = async () => {
    const response = await fetch("./json/pokemon-species-flavor-text.json");

    window.pokemonSpeciesFlavorText = await response.json();
  };

  window.loadPokemonTypeNamesJson = async () => {
    const response = await fetch("./json/pokemon-type-names.json");

    window.pokemonTypeNames = await response.json();
  };

  window.loadPokemonTypesJson = async () => {
    const response = await fetch("./json/pokemon-types.json");

    window.pokemonTypes = await response.json();
  };

  window.isRandomSuccess = (randomNumberFrom) => {
    return 0 === Math.floor(Math.random() * randomNumberFrom);
  };

  window.muteAllAudioWhenAway = () => {
    document.addEventListener("visibilitychange", () => {
      const allElementsThatMakeSound =
        document.querySelectorAll("video, audio");
      allElementsThatMakeSound.forEach(
        (eachElement) => (eachElement.muted = !!document.hidden)
      );
    });
  };

  window.toggleFullScreen = () => {
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
    const isOnHomepage = window.matchMedia(
      "(display-mode: fullscreen)"
    ).matches;

    isInstalled || isOnHomepage
      ? document.exitFullscreen()
      : document.body.requestFullscreen();
  };

  window.setContentAsLoaded = () => {
    document.querySelector(".content").classList.add("content-loaded");
  };

  window.toggleContentAsLoaded = (booleanValue) => {
    document
      .querySelector(".content")
      .classList.toggle("content-loaded", booleanValue);
  };

  window.getOfficialArtworkImageUrl = (pokemonId) => {
    return `./images/official-artwork/${pokemonId}.png`;
  };

  window.playPageBgm = () => {
    window._isAddedMouseMoveListener = false;
    const _doPlayPageBgm = async () => {
      const bgmElement = document.getElementById("page-bgm");

      if (!bgmElement) {
        return;
      }

      if (!bgmElement.paused) {
        return;
      }

      bgmElement.volume = 0.2;

      const elementDataVolumeAttribute = bgmElement.getAttribute("data-volume");

      if (elementDataVolumeAttribute) {
        bgmElement.volume = Number.parseFloat(elementDataVolumeAttribute);
      }

      bgmElement.muted = false;

      try {
        bgmElement.play().catch((e) => {
          if (!window._isAddedMouseMoveListener) {
            window._isAddedMouseMoveListener = true;
            document.addEventListener("mousemove", _doPlayPageBgm);
          }
        });
      } catch (reason) {}
    };

    _doPlayPageBgm();
  };

  window.setCurrentGold = (numberValue) => {
    window.currentGold = Number.parseInt(numberValue, 10);
    window.localStorage.setItem("current_gold", numberValue);
  };

  window.initializeCurrentGold = () => {
    const savedCurrentGold = Number.parseInt(
      window.localStorage.getItem("current_gold"),
      10
    );

    if ("number" === typeof savedCurrentGold && savedCurrentGold >= 0) {
      window.currentGold = savedCurrentGold;
    } else {
      window.currentGold = 100;
    }

    window.setCurrentGold(window.currentGold);
  };

  window.getRelativeTime = (milliseconds) => {
    const seconds = Math.floor((Date.now() - milliseconds) / 1000);

    const cutoffs = [
      60,
      3600,
      86400,
      86400 * 7,
      86400 * 30,
      86400 * 365,
      Infinity,
    ];

    const units = ["second", "minute", "hour", "day", "week", "month", "year"];

    const unitIndex = cutoffs.findIndex((cutoff) => cutoff > Math.abs(seconds));

    const unit = units[unitIndex];

    const cutoff = cutoffs[unitIndex];

    const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    return rtf.format(Math.floor((seconds * -1) / divisor), unit);
  };

  window.getPokemonIdentifier = (pokemonId) => {
    return window.pokeCsv.find(({ id }) => id === pokemonId.toString())
      .identifier;
  };

  window.convertDiscoveredIdentifierToIds = async () => {
    if (window.localStorage.getItem("last-discovered-conversion")) {
      return;
    }

    if (!window.pokemonSpecies) {
      await window.loadPokemonSpeciesJson();
    }

    const discoveredLocalStorageEntries = Object.entries({
      ...window.localStorage,
    }).filter(([k, _]) => /^discovered-([a-zA-Z0-9\-]+)$/.test(k));

    const pokemonSpeciesEntries = Object.entries({ ...window.pokemonSpecies });

    for (let [k, v] of discoveredLocalStorageEntries) {
      const matchIdentifier = k.match(/^discovered-([a-zA-Z0-9\-]+)$/);

      if (null === matchIdentifier) {
        continue;
      }

      const [_, matchedIdentifier] = matchIdentifier;

      if (!/^[a-zA-Z].+$/.test(matchedIdentifier)) {
        continue;
      }

      const pokemonSpeciesObject = pokemonSpeciesEntries.find(
        ([k, v]) => v.identifier === matchedIdentifier
      );

      const [pokemonIdKey, pokemonSpeciesData] = pokemonSpeciesObject;

      const pokemonId = pokemonIdKey.split("-").at(-1);

			window.localStorage.setItem(`discovered-${pokemonId}`, v);
			
      window.localStorage.removeItem(k);
    }

    window.localStorage.setItem("last-discovered-conversion", Date.now());
  };

  window.getPokemonPrice = async (pokemonId) => {
    if (!window.pokemonSpecies) {
      await window.loadPokemonSpeciesJson();
    }

    const pokemonSpeciesObject =
      window.pokemonSpecies[`pokemon-id-${pokemonId}`];

    let basePrice = Number.parseInt(
      pokemonSpeciesObject.evolution_chain_id,
      10
		);
		
		const baseEvolutionNumber = pokemonSpeciesObject.evolution_number;

    if (1 === baseEvolutionNumber) {
      return basePrice;
		}
		
		let variationsPrice = basePrice;

    const pokemonSpeciesEntries = Object.entries({ ...window.pokemonSpecies });

    let devolvingSpeciesObject = pokemonSpeciesObject;
    for (let i = devolvingSpeciesObject.evolution_number; i >= 2; i -= 1) {
			const evolvesFromSpeciesId = devolvingSpeciesObject.evolves_from_species_id;
			
      const totalVariations = pokemonSpeciesEntries.reduce(
        (total, [k, v]) =>
          evolvesFromSpeciesId === v.evolves_from_species_id
            ? total + 1
            : total,
        0
			);
			
			variationsPrice *= totalVariations;

			devolvingSpeciesObject = pokemonSpeciesEntries
				.find(([k, v]) => `pokemon-id-${evolvesFromSpeciesId}` === k)[1];
		}
		
		return variationsPrice * baseEvolutionNumber;
  };
})();
