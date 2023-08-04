import * as marketConstants from './market-constants.js';

export function getCollectedAmountForSelling(pokemon_id) {
	const totalCollectedCount = Number.parseInt(window.localStorage.getItem(`collected-${pokemon_id}`) || 0, 10);

	if (0 === totalCollectedCount) {
		return 0;
	}

	let amountForSelling = Math.floor(totalCollectedCount / marketConstants.COLLECTED_AMOUNT_FOR_SELLING);
		
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
	if (Array.isArray(pokemonIds) && pokemonIds.length) {
		idsQueryString = `?ids=${pokemonIds.join(",")}`;
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
	document.getElementById('gold-value').innerText = `${window.formatGoldDisplay(window.currentGold)} Gold`;
	document.getElementById('gold-value').title = `${new Intl.NumberFormat().format(Number.parseInt(window.currentGold, 10))} Gold`;
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

export function getMatchingPokemonIds(pokemonPartialName) {
	if ('string' !== typeof pokemonPartialName || pokemonPartialName.trim().length <= 2) {
		return undefined;
	}

	window.pokemonNameEntries = window.pokemonNameEntries || Object.entries(pokemonNames);

	return window.pokemonNameEntries
		.filter(([pokemonIdKey, pokemonName]) => new RegExp(pokemonPartialName, 'ig').test(pokemonName))
		.map(([pokemonIdKey, pokemonName]) => pokemonIdKey.match(/^pokemon-id-(\d+)$/)[1]);
}

export function getSearchInputValue() {
	const inputElement = document.getElementById('pokemon-names-input');
	
	const inputValue = inputElement.value;

	if ('string' === typeof inputValue && inputValue.trim().length) {
		return inputValue.trim();
	}

	return undefined;
}

export function filterMarketGrid() {
	const searchInputValue = getSearchInputValue();

	const allMarketGridItem = Array.from(document.querySelectorAll('div.market-grid-item'));

	if ('string' !== typeof searchInputValue) {
		allMarketGridItem.forEach((eachMarketGridItem) => eachMarketGridItem.classList.remove('display-none'));
		return;
	}

	allMarketGridItem.forEach((eachMarketGridItem) => {
		const doesMatch = new RegExp(searchInputValue, 'ig').test(eachMarketGridItem.getAttribute('data-display-name'));
		eachMarketGridItem.classList.toggle('display-none', !doesMatch);
	});
}