(async () => {
	document.body.scrollTo(0, 0);

	document.addEventListener("imports-loaded", async () => {

		
		
		
		window.setContentAsLoaded();

		console.log("load")

		document.body.scrollTo(0, 0);
	});

	
})();