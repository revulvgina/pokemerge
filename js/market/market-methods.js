export function getCollectedAmountForSelling(pokemon_id) {
	const totalCollectedCount = Number.parseInt(window.localStorage.getItem(`collected-${pokemon_id}`) || 0, 10);

	if (0 === totalCollectedCount) {
		return 0;
	}

	let amountForSelling = Math.floor(totalCollectedCount / window.COLLECTED_AMOUNT_FOR_SELLING);
		
	if (amountForSelling <= 0) {
		return 0;
	}

	const soldPokemonCount = Number.parseInt(window.localStorage.getItem(`sold-${pokemon_id}`) || 0, 10);

	amountForSelling -= soldPokemonCount;
	
	return amountForSelling;
};

export function toggleMarketTypeTabs(isBuying) {
	document.getElementById('market-type-buy').classList.toggle('market-type-selected', isBuying);
	document.getElementById('market-type-sell').classList.toggle('market-type-selected', !isBuying);
};
	
export function clearList() {
	document.getElementById("market-grid").innerHTML = '';
};

export async function fetchBuyList(pokemonIds = undefined) {
	let idsQueryString = "";
	if (Array.isArray(pokemonIds)) {
		idsQueryString = `?id=${pokemonIds.join(",")}`;
	}

	let response;
	try {
		response = await fetch(
			`${window.DB_API_ENDPOINT}/market/list/${
				window.sessionId
			}/${Date.now()}${idsQueryString}`
		);
	} catch (e) {
		console.error(e);
	}

	return await response.json();
};
	
export function updateGold() {
	document.getElementById('gold-value').innerText = `${window.currentGold} Gold`;
};

export async function expireCollectList () {
	let response;
	try {
		response = await fetch(
			`${window.DB_API_ENDPOINT}/market/sell-list-expire/${Math.floor(Date.now() / 3600000)
			}`
		);
	} catch (reason) {
		console.error(reason);
		return;
	}
};