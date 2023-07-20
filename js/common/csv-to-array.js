function csvToArray(str, delimiter = ",") {
	// slice from start of text to the first \n index
	// use split to create an array from string by delimiter
	const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

	// slice from \n index + 1 to the end of the text
	// use split to create an array of each csv value row
	const rows = str.slice(str.indexOf("\n") + 1).split("\n");

	const formattedRows = rows.map((eachRow) => {
		const match = /"(.+)"/.exec(eachRow);

		if (!match) {
			return eachRow;
		}

		const [, matchingText] = match;

		const replaceWithCommaTag = matchingText.replaceAll(',', '<comma>')

		return `${eachRow.substring(0, match.index)}${replaceWithCommaTag}${eachRow.substring(matchingText.length + match.index + 2, eachRow.length)}`;
	})

	// Map the rows
	// split values from each row into an array
	// use headers.reduce to create an object
	// object properties derived from headers:values
	// the object passed as an element of the array
	const arr = formattedRows
		.filter((eachLine) => 'string' === typeof eachLine && eachLine.trim().length)
		.map(function (row) {
		const values = row.split(delimiter);
		const el = headers.reduce(function (object, header, index) {
			const replaceCommaTag = 'undefined' === typeof values[index] ? undefined : values[index].replaceAll('<comma>', ',');
			object[header] = replaceCommaTag;
			return object;
		}, {});
		return el;
	});

	// return the array
	return arr;
}