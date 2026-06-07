<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { mapMarkers, type MapMarker, type FactionId } from '$lib/data/map';

	interface Props { interactive?: boolean; }
	let { interactive = true }: Props = $props();

	let selectedMarker = $state<MapMarker | null>(null);
	let hoveredMarker  = $state<MapMarker | null>(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Pan/zoom via DOM direct — pas de $state pour éviter le lag Svelte
	let zoom  = 1;
	let panX  = 0;
	let panY  = 0;
	let isPanning = false;
	let lastMX = 0;
	let lastMY = 0;
	let rafId  = 0;

	let mapContainer: HTMLDivElement;
	let mapInner: HTMLDivElement;

	function applyTransform() {
		if (mapInner) {
			mapInner.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
		}
	}

	function onMouseDown(e: MouseEvent) {
		if (!interactive || e.button !== 0) return;
		isPanning = true;
		lastMX = e.clientX;
		lastMY = e.clientY;
		mapContainer.style.cursor = 'grabbing';
	}

	function onMouseMove(e: MouseEvent) {
		// Tooltip position
		if (hoveredMarker) {
			const rect = mapContainer.getBoundingClientRect();
			tooltipX = e.clientX - rect.left;
			tooltipY = e.clientY - rect.top;
		}

		if (!isPanning || !interactive) return;
		cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			panX += e.clientX - lastMX;
			panY += e.clientY - lastMY;
			lastMX = e.clientX;
			lastMY = e.clientY;
			applyTransform();
		});
	}

	function onMouseUp() {
		isPanning = false;
		if (mapContainer) mapContainer.style.cursor = interactive ? 'grab' : 'default';
	}

	function onWheel(e: WheelEvent) {
		if (!interactive) return;
		e.preventDefault();
		const rect   = mapContainer.getBoundingClientRect();
		const cx     = e.clientX - rect.left;
		const cy     = e.clientY - rect.top;
		const factor = e.deltaY < 0 ? 1.12 : 0.9;
		const newZoom = Math.max(0.7, Math.min(5, zoom * factor));
		// Zoom centré sur la souris
		panX = cx - (cx - panX) * (newZoom / zoom);
		panY = cy - (cy - panY) * (newZoom / zoom);
		zoom = newZoom;
		applyTransform();
	}

	// Filtrage
	let filteredMarkers = $derived(mapMarkers.filter(m =>
		selectedFilter === 'all' || m.faction === selectedFilter
	));
	let selectedFilter = $state<FactionId | 'all'>('all');

	function lngToX(lng: number) { return ((lng + 180) / 360) * 1000; }
	function latToY(lat: number) { return ((90 - lat) / 180) * 500; }
</script>

<!-- Conteneur principal -->
<div
	bind:this={mapContainer}
	onmousedown={onMouseDown}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={() => { hoveredMarker = null; onMouseUp(); }}
	onwheel={onWheel}
	role="img"
	aria-label="Carte mondiale des failles SHINSEI"
	style="
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #050508;
		cursor: {interactive ? 'grab' : 'default'};
		user-select: none;
	"
>
	<!-- Couche SVG (transform via DOM direct) -->
	<div
		bind:this={mapInner}
		style="
			position: absolute;
			inset: 0;
			transform-origin: 0 0;
			will-change: transform;
		"
	>
		<svg viewBox="0 0 1000 500" style="width:100%;height:100%;" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="3" result="blur"/>
					<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
				</filter>
				<radialGradient id="rift-bg" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stop-color="#ef4444" stop-opacity="0.25"/>
					<stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
				</radialGradient>
				<radialGradient id="safe-bg" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stop-color="#22c55e" stop-opacity="0.18"/>
					<stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
				</radialGradient>
			</defs>

			<rect width="1000" height="500" fill="#050508"/>

			<!-- Grille légère -->
			{#each {length:18} as _, i}
				<line x1={i*55.5} y1="0" x2={i*55.5} y2="500" stroke="#1e153018" stroke-width="0.5"/>
			{/each}
			{#each {length:9} as _, i}
				<line x1="0" y1={i*55.5} x2="1000" y2={i*55.5} stroke="#1e153018" stroke-width="0.5"/>
			{/each}

			<!-- Continents (Natural Earth simplifié) -->
			<!-- Amérique du Nord -->
			<path d="M95,60 L160,55 L195,70 L220,65 L240,80 L250,100 L245,130 L235,150 L220,170 L210,200 L195,220 L180,240 L160,250 L145,245 L130,235 L120,215 L110,195 L100,175 L85,155 L75,135 L70,110 L75,85Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="1"/>
			<path d="M195,220 L210,230 L205,245 L195,260 L185,255 L180,240Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="0.5"/>
			<!-- Amérique du Sud -->
			<path d="M200,260 L230,255 L260,270 L280,295 L290,330 L285,365 L270,395 L250,415 L230,420 L210,405 L195,380 L185,350 L185,320 L190,290Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="1"/>
			<!-- Groenland -->
			<path d="M155,30 L185,25 L200,35 L195,50 L175,55 L160,50Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="0.5"/>
			<!-- Europe -->
			<path d="M445,55 L480,50 L510,55 L530,65 L540,80 L535,100 L520,115 L510,130 L495,140 L480,145 L465,140 L450,130 L440,115 L435,95 L438,75Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="1"/>
			<path d="M445,120 L465,115 L470,135 L460,155 L445,155 L438,140Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="0.5"/>
			<path d="M480,40 L500,35 L515,45 L520,60 L510,70 L495,65 L485,55Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="0.5"/>
			<path d="M445,68 L455,62 L462,70 L458,82 L448,85 L443,77Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="0.5"/>
			<!-- Afrique -->
			<path d="M455,165 L495,160 L535,170 L560,195 L570,230 L565,270 L550,310 L525,345 L500,365 L478,360 L460,340 L445,310 L440,275 L440,240 L445,205 L450,185Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="1"/>
			<!-- Asie -->
			<path d="M530,55 L600,45 L680,50 L740,60 L790,65 L830,60 L870,65 L900,75 L910,95 L900,120 L880,140 L850,155 L820,160 L790,155 L760,150 L730,160 L710,175 L690,180 L665,175 L640,165 L615,160 L590,165 L570,175 L550,165 L535,145 L525,125 L520,105 L525,80Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="1"/>
			<path d="M615,165 L645,170 L660,200 L655,235 L640,255 L620,260 L605,245 L600,220 L605,195Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="0.5"/>
			<path d="M710,175 L755,185 L770,205 L760,225 L740,230 L720,220 L705,205 L700,190Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="0.5"/>
			<path d="M845,115 L855,108 L865,115 L862,130 L850,135 L842,128Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="0.5"/>
			<!-- Australie -->
			<path d="M745,295 L810,280 L860,285 L895,305 L905,340 L895,375 L860,395 L815,400 L770,390 L745,365 L740,335 L740,310Z" fill="#1a0a2e" stroke="#2d1b4e" stroke-width="1"/>

			<!-- Territoires factions -->
			<ellipse cx="480" cy="110" rx="55" ry="45" fill="#ffffff06" stroke="#fbbf2435" stroke-width="1" stroke-dasharray="4 2"/>
			<ellipse cx="735" cy="205" rx="45" ry="35" fill="#ef444406" stroke="#ef444430" stroke-width="1" stroke-dasharray="4 2"/>
			<ellipse cx="490" cy="250" rx="35" ry="25" fill="#22c55e06" stroke="#22c55e25" stroke-width="1" stroke-dasharray="4 2"/>

			<!-- Marqueurs -->
			{#each filteredMarkers as marker}
				{@const mx = lngToX(marker.lng)}
				{@const my = latToY(marker.lat)}
				{@const isRift = marker.type === 'rift'}
				{@const isSelected = selectedMarker?.id === marker.id}

				<!-- Halo de fond -->
				<circle cx={mx} cy={my} r="22" fill={isRift ? 'url(#rift-bg)' : 'url(#safe-bg)'}/>

				<!-- Point pulsant -->
				<circle cx={mx} cy={my} r="6" fill={isRift ? '#ef4444' : '#22c55e'}
					filter={isRift ? 'url(#glow-red)' : ''} opacity="0.9">
					<animate attributeName="r"       values={isRift ? '5;9;5' : '4;7;4'}       dur={isRift ? '1.8s' : '2.8s'} repeatCount="indefinite"/>
					<animate attributeName="opacity" values="0.9;0.4;0.9" dur={isRift ? '1.8s' : '2.8s'} repeatCount="indefinite"/>
				</circle>

				<!-- Icône faille éclair -->
				{#if isRift}
					<path d="M{mx},{my-8} L{mx+3},{my-1} L{mx+5},{my-1} L{mx},{my+6} L{mx-1},{my+1} L{mx-4},{my+1}Z"
						fill="#ef4444" opacity="0.75"/>
				{:else}
					<!-- Icône bouclier -->
					<path d="M{mx},{my-8} L{mx+5},{my-4} L{mx+5},{my+2} L{mx},{my+6} L{mx-5},{my+2} L{mx-5},{my-4}Z"
						fill="#22c55e" opacity="0.6"/>
				{/if}

				<!-- Ring sélection -->
				{#if isSelected}
					<circle cx={mx} cy={my} r="14" fill="none"
						stroke={isRift ? '#ef4444' : '#22c55e'} stroke-width="1.5">
						<animate attributeName="r"       values="12;20;12" dur="1.5s" repeatCount="indefinite"/>
						<animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/>
					</circle>
				{/if}

				<!-- Zone cliquable transparente -->
				{#if interactive}
					<circle cx={mx} cy={my} r="16" fill="transparent" style="cursor:pointer;"
						onmouseenter={(e) => { hoveredMarker = marker; const r=mapContainer.getBoundingClientRect(); tooltipX=e.clientX-r.left; tooltipY=e.clientY-r.top; }}
						onmouseleave={() => hoveredMarker = null}
						onclick={() => selectedMarker = selectedMarker?.id === marker.id ? null : marker}
						role="button" tabindex="0" aria-label={marker.name}
						onkeydown={(e) => e.key==='Enter' && (selectedMarker = selectedMarker?.id===marker.id ? null : marker)}
					/>
				{/if}
			{/each}

			<text x="500" y="492" text-anchor="middle" fill="#1e153045"
				style="font-family:'Share Tech Mono',monospace; font-size:7px;">
				CARTE DES FAILLES — MONDE SHINSEI 新世
			</text>
		</svg>
	</div>

	<!-- Tooltip hover -->
	{#if hoveredMarker && interactive}
		<div
			transition:fade={{ duration: 80 }}
			style="
				position: absolute;
				pointer-events: none;
				z-index: 20;
				left: {Math.min(tooltipX + 14, (mapContainer?.clientWidth ?? 600) - 200)}px;
				top: {tooltipY - 70}px;
				background: rgba(13,13,21,0.96);
				border: 1px solid {hoveredMarker.type === 'rift' ? '#ef4444' : '#22c55e'};
				border-radius: 0.5rem;
				padding: 0.5rem 0.75rem;
				max-width: 210px;
				backdrop-filter: blur(8px);
			"
		>
			<div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.95rem;color:{hoveredMarker.type==='rift'?'#ef4444':'#22c55e'};margin-bottom:2px;">
				{hoveredMarker.name}
			</div>
			<div style="font-size:0.75rem;color:#94a3b8;">{hoveredMarker.description}</div>
			<div style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#64748b;margin-top:2px;">{hoveredMarker.rank}</div>
		</div>
	{/if}

	<!-- Panel latéral détail -->
	{#if selectedMarker && interactive}
		<div
			transition:fly={{ x: 320, duration: 220 }}
			style="
				position: absolute;
				top: 0; right: 0;
				height: 100%;
				width: 300px;
				background: rgba(10,10,15,0.97);
				border-left: 1px solid {selectedMarker.type==='rift' ? '#ef444440' : '#22c55e40'};
				backdrop-filter: blur(12px);
				overflow-y: auto;
				z-index: 25;
			"
		>
			<div style="padding:1.25rem;">
				<!-- Header panel -->
				<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
					<span style="
						font-family:'Share Tech Mono',monospace;font-size:0.65rem;font-weight:700;
						letter-spacing:0.1em;text-transform:uppercase;
						padding:0.2rem 0.5rem;border-radius:0.25rem;
						background:{selectedMarker.type==='rift'?'#ef444418':'#22c55e18'};
						color:{selectedMarker.type==='rift'?'#ef4444':'#22c55e'};
						border:1px solid {selectedMarker.type==='rift'?'#ef444435':'#22c55e35'};
					">
						{selectedMarker.type==='rift' ? '⚡ FAILLE ACTIVE' : '🛡 ZONE SÉCURISÉE'}
					</span>
					<button onclick={() => selectedMarker = null} style="
						font-size:1.25rem;color:#64748b;line-height:1;
						background:none;border:none;cursor:pointer;
						transition:color 0.2s;
					" onmouseenter={(e)=>(e.currentTarget as HTMLElement).style.color='#e2e8f0'}
					  onmouseleave={(e)=>(e.currentTarget as HTMLElement).style.color='#64748b'}>×</button>
				</div>

				<h2 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:900;color:{selectedMarker.type==='rift'?'#ef4444':'#22c55e'};margin-bottom:0.25rem;">
					{selectedMarker.name}
				</h2>
				<p style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:#64748b;margin-bottom:1rem;">{selectedMarker.description}</p>

				<div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">
					<div style="display:flex;gap:0.75rem;align-items:center;">
						<span style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#475569;width:5rem;flex-shrink:0;">RANG REQ.</span>
						<span style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.85rem;color:#a78bfa;">{selectedMarker.rank}</span>
					</div>
					{#if selectedMarker.faction !== 'none'}
						<div style="display:flex;gap:0.75rem;align-items:center;">
							<span style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#475569;width:5rem;flex-shrink:0;">FACTION</span>
							<span style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.85rem;color:#06b6d4;">
								{selectedMarker.faction==='ordre'?"L'Ordre":selectedMarker.faction==='fractures'?'Les Fracturés':'Les Nomades'}
							</span>
						</div>
					{/if}
				</div>

				<div style="height:1px;background:#1e1530;margin-bottom:1rem;"></div>

				<p style="font-size:0.8rem;color:#94a3b8;line-height:1.6;margin-bottom:0.75rem;">{selectedMarker.lore}</p>

				{#if selectedMarker.boss}
					<div style="padding:0.75rem;border-radius:0.5rem;background:#ef444410;border:1px solid #ef444428;margin-bottom:0.5rem;">
						<p style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#ef4444;font-weight:700;margin-bottom:0.25rem;">BOSS</p>
						<p style="font-size:0.8rem;color:#e2e8f0;">{selectedMarker.boss}</p>
					</div>
				{/if}
				{#if selectedMarker.rewards}
					<div style="padding:0.75rem;border-radius:0.5rem;background:#fbbf2410;border:1px solid #fbbf2428;">
						<p style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#fbbf24;font-weight:700;margin-bottom:0.25rem;">RÉCOMPENSES</p>
						<p style="font-size:0.8rem;color:#e2e8f0;">{selectedMarker.rewards}</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
