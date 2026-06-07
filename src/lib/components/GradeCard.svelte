<script lang="ts">
	interface Props {
		id: string;
		name: string;
		price: number;
		color: string;
		perks: string[];
		image: string;
		owned?: boolean;
		onbuy?: (detail: { id: string; name: string; price: number }) => void;
	}

	let { id, name, price, color, perks, image, owned = false, onbuy }: Props = $props();
	let hovered = $state(false);
</script>

<div
	role="article"
	onmouseenter={() => hovered = true}
	onmouseleave={() => hovered = false}
	style="
		display: flex;
		flex-direction: column;
		border-radius: 0.75rem;
		overflow: hidden;
		background: #0a0a0f;
		border: 1px solid {hovered ? color : color + '40'};
		box-shadow: {hovered ? `0 28px 56px ${color}38, 0 0 28px ${color}18` : `0 4px 20px #00000055, 0 0 0 0 ${color}00`};
		transform: translateY({hovered ? '-8px' : '0'});
		transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.25s ease;
		position: relative;
	"
>
	<!-- ── Image artwork ── -->
	<div class="img-wrap" style="position: relative; background: #000; overflow: hidden; height: 180px;">
		<img
			src={image}
			alt={name}
			style="
				width: 100%;
				height: 100%;
				object-fit: contain;
				object-position: center;
				display: block;
				transition: transform 0.55s ease;
				transform: scale({hovered ? '1.07' : '1'});
			"
		/>

		<!-- Shimmer sweep on hover -->
		{#if hovered}
			<div class="shimmer-sweep" style="background: linear-gradient(105deg, transparent 30%, {color}25 50%, transparent 70%);"></div>
		{/if}

		<!-- Fondu bas -->
		<div style="
			position: absolute; bottom: 0; left: 0; right: 0; height: 50%;
			background: linear-gradient(to top, #0a0a0f 0%, transparent 100%);
			pointer-events: none;
		"></div>

		<!-- Gradient top tint on hover -->
		<div style="
			position: absolute; top: 0; left: 0; right: 0; height: 30%;
			background: linear-gradient(to bottom, {color}{hovered ? '15' : '00'}, transparent);
			transition: all 0.4s;
			pointer-events: none;
		"></div>

		{#if owned}
			<div style="position: absolute; top: 0.6rem; right: 0.6rem;">
				<span style="
					font-family:'Share Tech Mono',monospace; font-size: 0.6rem; font-weight: 700;
					padding: 0.2rem 0.45rem; border-radius: 0.25rem;
					background: {color}30; color: {color}; border: 1px solid {color};
					backdrop-filter: blur(6px);
				">POSSÉDÉ</span>
			</div>
		{/if}
	</div>

	<!-- ── Infos ── -->
	<div style="
		padding: 1rem 1.1rem 1.1rem;
		display: flex; flex-direction: column; gap: 0.85rem;
		flex: 1;
	">
		<div>
			<h3 style="
				font-family:'Rajdhani',sans-serif; font-size: 1.6rem; font-weight: 900;
				color: {color}; line-height: 1;
				text-shadow: {hovered ? `0 0 20px ${color}80` : `0 0 10px ${color}30`};
				transition: text-shadow 0.3s;
			">{name}</h3>
			<p style="font-family:'Rajdhani',sans-serif; font-size: 1.9rem; font-weight: 900; color: white; line-height: 1.1;">
				{price.toFixed(2)}<span style="font-size: 1.1rem;">€</span>
			</p>
		</div>

		<ul style="display: flex; flex-direction: column; gap: 0.35rem; flex: 1;">
			{#each perks as perk, i}
				<li style="
					display: flex; align-items: flex-start; gap: 0.4rem;
					font-size: 0.75rem; color: #94a3b8; line-height: 1.4;
					transition: color 0.2s;
					color: {hovered ? '#cbd5e1' : '#94a3b8'};
				">
					<span style="color: {color}; flex-shrink: 0; margin-top: 1px; font-size: 0.65rem;">▸</span>
					{perk}
				</li>
			{/each}
		</ul>

		{#if !owned}
			<p style="
				font-family:'Share Tech Mono',monospace; font-size: 0.6rem;
				color: #475569; text-align: center; letter-spacing: 0.1em;
			">PAIEMENT UNIQUE · À VIE</p>
		{/if}

		<button
			disabled={owned}
			onclick={() => !owned && onbuy?.({ id, name, price })}
			style="
				width: 100%;
				padding: 0.7rem;
				font-family:'Rajdhani',sans-serif; font-weight: 900; font-size: 0.8rem;
				letter-spacing: 0.1em; border-radius: 0.375rem;
				background: {owned ? color + '18' : color};
				color: {owned ? color : 'white'};
				border: 1px solid {color};
				cursor: {owned ? 'default' : 'pointer'};
				box-shadow: {hovered && !owned ? `0 0 26px ${color}70` : 'none'};
				transition: box-shadow 0.3s, letter-spacing 0.2s;
				letter-spacing: {hovered && !owned ? '0.15em' : '0.1em'};
			"
		>
			{owned ? 'DÉJÀ POSSÉDÉ' : 'ACHETER'}
		</button>
	</div>

	<!-- Ligne colorée bas animée -->
	<div style="
		height: 2px;
		background: linear-gradient(90deg, transparent, {color}, transparent);
		opacity: {hovered ? 1 : 0.5};
		transition: opacity 0.3s;
		box-shadow: {hovered ? `0 0 10px ${color}80` : 'none'};
		transition: all 0.3s;
	"></div>
</div>

<style>
	.img-wrap .shimmer-sweep {
		position: absolute;
		inset: 0;
		width: 60%;
		pointer-events: none;
		animation: shimmer-sweep 0.7s ease forwards;
	}
</style>
