<script lang="ts">
	type Point = { label: string; value: number };

	let {
		points = [],
		color = '#8b5cf6',
		height = 130,
		unit = '',
		labelEvery = 2,
		smooth = true,
		ariaLabel = '',
	}: {
		points?: Point[];
		color?: string;
		height?: number;
		unit?: string;
		labelEvery?: number;
		smooth?: boolean;
		ariaLabel?: string;
	} = $props();

	const SURFACE = '#0d0d15';
	const GRID    = '#1e1530';
	const PAD     = { top: 10, right: 14, bottom: 20, left: 36 };

	let width = $state(0);
	let hover = $state<number | null>(null);

	// Borne haute « propre » (1/2/4/5/10 × 10^k) pour des ticks lisibles
	function niceMax(v: number): number {
		if (v <= 0) return 4;
		const pow = Math.pow(10, Math.floor(Math.log10(v)));
		const f = v / pow;
		for (const c of [1, 2, 4, 5, 10]) if (f <= c) return c * pow;
		return 10 * pow;
	}

	const yMax  = $derived(niceMax(Math.max(...points.map(p => p.value), 0)));
	const plotW = $derived(Math.max(0, width - PAD.left - PAD.right));
	const plotH = $derived(height - PAD.top - PAD.bottom);
	const baseY = $derived(PAD.top + plotH);

	const xy = $derived(points.map((p, i) => ({
		x: PAD.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2),
		y: PAD.top + plotH - (p.value / yMax) * plotH,
	})));

	// Courbe lissée (Catmull-Rom → Bézier), contrôles bornés au cadre pour éviter
	// les débordements sous la ligne de base sur les données en dents de scie.
	const lineD = $derived.by(() => {
		if (xy.length === 0) return '';
		if (xy.length === 1 || !smooth) {
			return 'M ' + xy.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ');
		}
		const clampY = (y: number) => Math.min(baseY, Math.max(PAD.top, y));
		let d = `M ${xy[0].x.toFixed(1)} ${xy[0].y.toFixed(1)}`;
		for (let i = 0; i < xy.length - 1; i++) {
			const p0 = xy[Math.max(0, i - 1)];
			const p1 = xy[i];
			const p2 = xy[i + 1];
			const p3 = xy[Math.min(xy.length - 1, i + 2)];
			const c1x = p1.x + (p2.x - p0.x) / 6;
			const c1y = clampY(p1.y + (p2.y - p0.y) / 6);
			const c2x = p2.x - (p3.x - p1.x) / 6;
			const c2y = clampY(p2.y - (p3.y - p1.y) / 6);
			d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
		}
		return d;
	});

	const areaD = $derived(
		xy.length > 1
			? `${lineD} L ${xy[xy.length - 1].x.toFixed(1)} ${baseY} L ${xy[0].x.toFixed(1)} ${baseY} Z`
			: ''
	);

	const yTicks = $derived([0, yMax / 2, yMax]);

	function fmtTick(v: number): string {
		return Number.isInteger(v) ? v.toLocaleString('fr-FR') : v.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
	}

	function plural(v: number): string {
		if (!unit) return '';
		return ' ' + unit + (Math.abs(v) > 1 && !unit.endsWith('s') ? 's' : '');
	}

	function onMove(e: PointerEvent) {
		if (xy.length === 0) return;
		const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		let best = 0;
		let bd = Infinity;
		for (let i = 0; i < xy.length; i++) {
			const d = Math.abs(xy[i].x - x);
			if (d < bd) { bd = d; best = i; }
		}
		hover = best;
	}

	// Tooltip clampé aux bords du cadre
	const tipLeft = $derived(hover === null || !xy[hover] ? 0 : Math.min(Math.max(xy[hover].x, 52), Math.max(width - 52, 52)));
</script>

<div class="lc-wrap" style="height: {height}px;" bind:clientWidth={width}>
	{#if width > 0}
		<svg
			{width}
			{height}
			role="img"
			aria-label={ariaLabel}
			onpointermove={onMove}
			onpointerleave={() => hover = null}
		>
			<!-- grille recessive -->
			{#each yTicks as t}
				{@const y = PAD.top + plotH - (t / yMax) * plotH}
				<line x1={PAD.left} y1={y} x2={width - PAD.right} y2={y} stroke={GRID} stroke-width="1" />
				<text x={PAD.left - 6} y={y + 3} text-anchor="end" class="lc-tick">{fmtTick(t)}</text>
			{/each}

			<!-- labels X, un sur labelEvery -->
			{#each points as p, i}
				{#if i % labelEvery === 0 && xy[i]}
					<text x={xy[i].x} y={height - 5} text-anchor="middle" class="lc-tick">{p.label}</text>
				{/if}
			{/each}

			{#if xy.length > 0}
				{#if areaD}
					<path d={areaD} fill={color} fill-opacity="0.1" />
				{/if}
				<path d={lineD} fill="none" stroke={color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

				<!-- point terminal, cerclé de la couleur de surface -->
				<circle cx={xy[xy.length - 1].x} cy={xy[xy.length - 1].y} r="4" fill={color} stroke={SURFACE} stroke-width="2" />

				<!-- crosshair + point survolé -->
				{#if hover !== null && xy[hover]}
					<line x1={xy[hover].x} y1={PAD.top} x2={xy[hover].x} y2={baseY} stroke="#94a3b8" stroke-opacity="0.25" stroke-width="1" />
					<circle cx={xy[hover].x} cy={xy[hover].y} r="4.5" fill={color} stroke={SURFACE} stroke-width="2" />
				{/if}
			{/if}
		</svg>

		{#if hover !== null && points[hover] && xy[hover]}
			<div class="lc-tip" style="left: {tipLeft}px; top: {Math.max(xy[hover].y - 12, 4)}px;">
				<span class="lc-tip-value">{points[hover].value.toLocaleString('fr-FR')}</span><span class="lc-tip-unit">{plural(points[hover].value)}</span>
				<span class="lc-tip-label">{points[hover].label}</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	.lc-wrap {
		position: relative;
		width: 100%;
	}
	svg {
		display: block;
		touch-action: none;
	}
	.lc-tick {
		font-family: 'Share Tech Mono', monospace;
		font-size: 9px;
		fill: #475569;
	}
	.lc-tip {
		position: absolute;
		transform: translate(-50%, -100%);
		background: #13131e;
		border: 1px solid #2a1f3d;
		border-radius: 0.4rem;
		padding: 0.3rem 0.55rem;
		pointer-events: none;
		white-space: nowrap;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
		z-index: 5;
		display: flex;
		align-items: baseline;
		gap: 0.35rem;
	}
	.lc-tip-value {
		font-family: 'Rajdhani', sans-serif;
		font-size: 0.95rem;
		font-weight: 700;
		color: #e2e8f0;
		line-height: 1;
	}
	.lc-tip-unit {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.6rem;
		color: #94a3b8;
	}
	.lc-tip-label {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.6rem;
		color: #64748b;
	}
</style>
