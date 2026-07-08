<script lang="ts">
	let {
		title,
		description,
		canonical,
		ogImage = '/og-image.png',
		ogType = 'website',
		noindex = false,
		jsonLd,
	}: {
		title: string;
		description: string;
		canonical: string;
		ogImage?: string;
		ogType?: string;
		noindex?: boolean;
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
	} = $props();

	const BASE = 'https://playshinsei.fr';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:type" content={ogType} />
	<meta property="og:image" content="{BASE}{ogImage}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="Shinsei" />
	<meta property="og:locale" content="fr_FR" />

	<!-- Twitter / X Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{BASE}{ogImage}" />

	<!-- JSON-LD structuré -->
	{#if jsonLd}
		{#if Array.isArray(jsonLd)}
			{#each jsonLd as ld}
				{@html `<script type="application/ld+json">${JSON.stringify(ld)}<\/script>`}
			{/each}
		{:else}
			{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>`}
		{/if}
	{/if}
</svelte:head>
