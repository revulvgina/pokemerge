(async () => {
	const _SUPABASE_URL = 'https://lznnwinmjydhyenhcjry.supabase.co'
	const _SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bm53aW5tanlkaHllbmhjanJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk0MDY4NDYsImV4cCI6MjAwNDk4Mjg0Nn0.LGh0T2awuLeSAyI8TJhDQhDabo9mpMYpC3MlYp22Ddk'
	const _BUCKET_NAME = 'json';

	const _initializeSupabaseClient = async () => {
		const supabaseClient = supabase.createClient(_SUPABASE_URL, _SUPABASE_ANON_KEY);

		const { data, error } = await supabaseClient.auth.signInWithPassword({
			email: 'example@email.com',
			password: 'example-password',
		});

		window.supabaseClient = supabaseClient;
	};
	
	window.uploadJsonToSupabase = async (jsonFileName, jsonStringifiedContent) => {
		let response;
		try {
			response = await window.supabaseClient.storage
			.from(_BUCKET_NAME)
			.upload(jsonFileName, jsonStringifiedContent, {
				cacheControl: '3600',
				upsert: true,
				contentType: 'application/json'
			});
		} catch (reason) {
			console.error(reason);
			throw reason;
		}

		const { data, error } = response;

		if (error) {
			throw error;
		}

		const { path } = data;

		return `https://lznnwinmjydhyenhcjry.supabase.co/storage/v1/object/public/${_BUCKET_NAME}/${path}`;
	};

	window.fetchJsonFromSupabase = async (jsonFileName) => {
		let response;
		try {
			response = await fetch(`https://lznnwinmjydhyenhcjry.supabase.co/storage/v1/object/public/${_BUCKET_NAME}/${jsonFileName}?t=${Date.now()}`);
		} catch (reason) {
			console.error(reason);
			throw reason;
		}

		const jsonResponse = await response.json();

		return jsonResponse;
	};

	await _initializeSupabaseClient();
})();