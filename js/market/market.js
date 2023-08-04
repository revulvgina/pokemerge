import * as marketMethods from './market-methods.js';
import * as marketConstants from './market-constants.js';

(async () => {
	document.body.scrollTo(0, 0);
	
  document.addEventListener("imports-loaded", async () => {
    await window.loadPokemonNamesJson();

		window.initializeSessionId();
		
		window.initializeCurrentGold();

		marketMethods.updateGold();

		await marketMethods.expireCollectList();

    await window.onBuyClick();

    window.setContentAsLoaded();

		window.playPageBgm();
		window.muteAllAudioWhenAway();

    document.body.scrollTo(0, 0);
  });

  const _fetchListWithSessionId = async (partialEndpointUrl) => {
    let response;
    try {
      response = await fetch(
        `${window.DB_API_ENDPOINT}/market/${partialEndpointUrl}/${
          window.sessionId
        }/${Date.now()}`
      );
    } catch (reason) {
      console.error(reason);
      return;
    }

    return await response.json();
	};

  const _addToList = (items, label, actionName) => {
    const marketGrid = document.getElementById("market-grid");
    items.forEach((eachItem) => {
      const pokemonDisplayName =
        window.pokemonNames[`pokemon-id-${eachItem.pokemon_id}`];
      const imageContainerElement = document.createElement("div");
      imageContainerElement.classList.add(
        "market-grid-item",
        "market-grid-item-image-container",
        "first-grid-cell"
      );
      imageContainerElement.innerHTML = `<img src="${window.getOfficialArtworkImageUrl(
        eachItem.pokemon_id
      )}" />
			<span class="market-grid-item-display-name">${pokemonDisplayName}</span>`;
      marketGrid.appendChild(imageContainerElement);

      const goldContainerElement = document.createElement("div");
      goldContainerElement.classList.add(
        "market-grid-item",
        "market-grid-item-gold-container",
        "second-grid-cell"
      );
      goldContainerElement.innerHTML = `<span>${window.formatGoldDisplay(eachItem.price)}</span>`;
      goldContainerElement.title = `${new Intl.NumberFormat().format(eachItem.price)} gold`;
      marketGrid.appendChild(goldContainerElement);

      const actionContainerElement = document.createElement("div");
      actionContainerElement.classList.add(
        "market-grid-item",
        "market-grid-item-action-container",
        "third-grid-cell"
			);
			
			let actionInnerHTML;

			if (actionName) {
				actionInnerHTML = `<button onclick="${actionName}('${eachItem['market_key']}', '${eachItem['pokemon_id']}', ${eachItem.price})" id="market-item-${eachItem['market_key']}-${eachItem['pokemon_id']}">${label}</button>`
			} else {
				const lastUpdatedNumber = Number.parseInt(eachItem.last_updated, 10);
				actionInnerHTML = `<span class="market-item-last-updated" title="${new Date(lastUpdatedNumber).toLocaleString()}" data-last-updated="${lastUpdatedNumber}">${window.getRelativeTime(lastUpdatedNumber)}</span>`;
			}

      actionContainerElement.innerHTML = actionInnerHTML;

      marketGrid.appendChild(actionContainerElement);
    });
	};
	
	const _resetLastUpdatedInterval = () => {
		clearInterval(window._marketLastUpdatedInterval);
		window._marketLastUpdatedInterval = setInterval(() => {
			const allLastUpdatedSpanElement = Array.from(document.querySelectorAll('span[data-last-updated]'));

			allLastUpdatedSpanElement.forEach((eachElement) => {
				const lastUpdatedValue = Number.parseInt(eachElement.getAttribute('data-last-updated'), 10);

				eachElement.innerText = window.getRelativeTime(lastUpdatedValue);
			})
		}, 1000);
	}

	window.onBuyClick = async () => {
		window.toggleContentAsLoaded(false);

		marketMethods.toggleMarketTypeTabs(true);

		marketMethods.clearList();

    const buyList = await marketMethods.fetchBuyList();

		_addToList(buyList, "Buy", marketConstants.MARKET_ACTION.BUY_ITEM);
		
		window.toggleContentAsLoaded(true);
  };

	window.onSellClick = async () => {
		window.toggleContentAsLoaded(false);

		marketMethods.toggleMarketTypeTabs(false);
		
		marketMethods.clearList();
    
		const sellListCollect = await _fetchListWithSessionId("sell-list-collect");

		_addToList(sellListCollect, "Collect", marketConstants.MARKET_ACTION.COLLECT_ITEM);
		
    const sellList = await _fetchListWithSessionId("sell-list");

		_addToList(sellList, "Selling", undefined);

    const localStorageEntries = Object.entries({
      ...window.localStorage,
    });

    const allCollectedLocalStorageEntries = localStorageEntries.filter(
      ([k, v]) => /^collected-/.test(k)
    );

		let toSellList = [];

		for (let [k, v] of allCollectedLocalStorageEntries) {
			const currentCollectedCount = Number.parseInt(v);

			if (v < marketConstants.COLLECTED_AMOUNT_FOR_SELLING) {
				continue;
			}

			let amountLeftForSelling = Math.floor(v / marketConstants.COLLECTED_AMOUNT_FOR_SELLING);

			const collectedMatch = k.match(/^collected-(\d+)$/);

			if (null === collectedMatch) {
				continue;
			}

			const [_, pokemon_id] = collectedMatch;
			
			const amountForSelling = marketMethods.getCollectedAmountForSelling(pokemon_id);

			if (amountForSelling <= 0) {
				continue;
			}

			const pokemonPrice = await window.getPokemonPrice(pokemon_id);

			const sellPrice = pokemonPrice * marketConstants.MARKET_PRICE_MULTIPLIER;

			toSellList.push({ pokemon_id, price: sellPrice });
		}

		_addToList(toSellList, "Sell", marketConstants.MARKET_ACTION.REGISTER_ITEM);
		
		window.toggleContentAsLoaded(true);

		_resetLastUpdatedInterval();
  };

	window.buyItem = async (market_key, pokemon_id, price) => {
		if (window.currentGold < price) {
			window.alert('You do have enough gold for this purchase.');
			return;
		}

		if (!confirm(`Do you want to buy ${window.pokemonNames[`pokemon-id-${pokemon_id}`]} for ${price} gold?`)) {
			return;
		}
		
    let response;
    try {
      response = await fetch(
        `${window.DB_API_ENDPOINT}/market/buy/${
          window.sessionId
        }`, { method: 'POST', body: JSON.stringify({market_key})}
      );
    } catch (reason) {
      console.error(reason);
      return;
		}
		
		const jsonResponse = await response.json();
		
		const { pokemon_id: boughtPokemonId, price: boughtPrice } = jsonResponse;

		window.setCurrentGold(window.currentGold - boughtPrice);

		marketMethods.updateGold();

		const discoveredKey = `discovered-${boughtPokemonId}`;
		window.localStorage.setItem(discoveredKey, window.localStorage.getItem(discoveredKey) || Date.now());

		const collectedKey = `collected-${boughtPokemonId}`;
		window.localStorage.setItem(collectedKey, Number.parseInt(window.localStorage.getItem(collectedKey) || 0, 10) + 1);

		await window.onBuyClick();
	};

	window.registerItem = async (_, pokemon_id, price) => {
		const amountForSelling = marketMethods.getCollectedAmountForSelling(pokemon_id);

		if (amountForSelling <= 0) {
			return;
		}
			
		if (!confirm(`Do you want to sell ${
			window.pokemonNames[`pokemon-id-${pokemon_id}`]} for ${window.formatGoldDisplay(price)} gold?\n\nBackpack Count for Selling: ${amountForSelling}`)) {
			return;
		}

		const pokemonPrice = await window.getPokemonPrice(pokemon_id);
		const sellPrice = pokemonPrice * marketConstants.MARKET_PRICE_MULTIPLIER;

    let response;
    try {
      response = await fetch(
        `${window.DB_API_ENDPOINT}/market/register/${
          window.sessionId
				}`, {
					method: 'POST', body: JSON.stringify({
						pokemon_id: Number.parseInt(pokemon_id, 10),
						price: sellPrice
					})
			}
      );
    } catch (reason) {
      console.error(reason);
      return;
		}

		const localStorageKey = `sold-${pokemon_id}`;

		window.localStorage.setItem(localStorageKey, Number.parseInt(window.localStorage.getItem(localStorageKey) || 0, 10) + 1);
	
		await window.onSellClick();
	};

	window.collectItem = async (market_key) => {
    let response;
    try {
      response = await fetch(
        `${window.DB_API_ENDPOINT}/market/sell-collect/${
          window.sessionId
        }`, { method: 'POST', body: JSON.stringify({market_key})}
      );
    } catch (reason) {
      console.error(reason);
      return;
		}

		const jsonResponse = await response.json();

		const { pokemon_id, price } = jsonResponse;

		window.setCurrentGold(window.currentGold + Number.parseInt(price, 10));

		marketMethods.updateGold();

		await window.onSellClick();
	};
})();
