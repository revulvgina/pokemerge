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
})();
