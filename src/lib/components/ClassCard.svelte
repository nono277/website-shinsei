<script lang="ts">
	interface Props {
		name: string;
		color: string;
		description: string;
		icon: string;
		tagline: string;
	}

	let { name, color, description, icon, tagline }: Props = $props();
	let hovered = $state(false);
</script>

<div
	role="article"
	class="class-card"
	onmouseenter={() => hovered = true}
	onmouseleave={() => hovered = false}
	style="
		background: #0d0d15;
		border: 1px solid {hovered ? color : '#1e1530'};
		border-radius: 0.75rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		cursor: pointer;
		transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.25s ease;
		transform: translateY({hovered ? '-10px' : '0'}) scale({hovered ? '1.02' : '1'});
		box-shadow: {hovered ? `0 24px 50px ${color}30, 0 0 30px ${color}12` : 'none'};
		position: relative;
		overflow: hidden;
	"
>
	<!-- Scan line on hover -->
	{#if hovered}
		<div class="scan-line" style="background: linear-gradient(to bottom, transparent, {color}18, transparent);"></div>
	{/if}

	<!-- Corner glow -->
	<div style="
		position: absolute; top: 0; left: 0;
		width: 60px; height: 60px;
		background: radial-gradient(circle at top left, {color}{hovered ? '18' : '08'}, transparent 70%);
		transition: opacity 0.3s;
		pointer-events: none;
	"></div>

	<div style="display: flex; align-items: center; gap: 0.75rem; position: relative;">
		<span style="
			font-size: 2rem; line-height: 1;
			filter: drop-shadow(0 0 {hovered ? '12px' : '4px'} {color}80);
			transition: filter 0.3s;
			display: inline-block;
			animation: {hovered ? 'drift 4s ease-in-out infinite' : 'none'};
		">{icon}</span>
		<div>
			<h3 style="
				font-family:'Rajdhani',sans-serif;
				font-size: 1.2rem;
				font-weight: 900;
				color: {color};
				text-shadow: {hovered ? `0 0 16px ${color}90` : 'none'};
				transition: text-shadow 0.3s;
				line-height: 1.1;
			">{name}</h3>
			<p style="
				font-family:'Share Tech Mono',monospace;
				font-size: 0.65rem;
				letter-spacing: 0.15em;
				text-transform: uppercase;
				color: {color}90;
			">{tagline}</p>
		</div>
	</div>

	<p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.5; position: relative;">{description}</p>

	<div style="height: 1px; background: linear-gradient(90deg, {color}{hovered ? '80' : '40'}, transparent); transition: all 0.3s;"></div>

	<a href="/wiki" style="
		font-family:'Rajdhani',sans-serif;
		font-size: 0.75rem;
		font-weight: 700;
		color: {color};
		letter-spacing: 0.05em;
		transition: letter-spacing 0.2s, opacity 0.2s;
		letter-spacing: {hovered ? '0.12em' : '0.05em'};
		position: relative;
	">
		VOIR LES COMPÉTENCES →
	</a>
</div>

<style>
	.class-card .scan-line {
		position: absolute;
		left: 0; right: 0;
		top: 0;
		width: 100%;
		height: 40%;
		pointer-events: none;
		animation: card-scan 0.7s ease forwards;
	}

	@keyframes card-scan {
		from { transform: translateY(-100%) skewY(-2deg); opacity: 1; }
		to   { transform: translateY(300%) skewY(-2deg); opacity: 0; }
	}
</style>
