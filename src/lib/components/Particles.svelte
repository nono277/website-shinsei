<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let canvas = $state<HTMLCanvasElement>(null!);

	interface Particle {
		x: number; y: number;
		vx: number; vy: number;
		opacity: number; opacityDir: number;
		size: number; color: string;
		isOrb: boolean;
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		let W = window.innerWidth;
		let H = window.innerHeight;
		canvas.width = W;
		canvas.height = H;

		let mouseX = W / 2;
		let mouseY = H / 2;
		let targetX = W / 2;
		let targetY = H / 2;

		const colors = ['#7c3aed', '#7c3aed', '#7c3aed', '#06b6d4', '#06b6d4', '#a78bfa', '#f472b6'];

		const makeParticle = (): Particle => ({
			x: Math.random() * W,
			y: Math.random() * H,
			vx: (Math.random() - 0.5) * 0.35,
			vy: -Math.random() * 0.45 - 0.08,
			opacity: 0.2 + Math.random() * 0.6,
			opacityDir: (Math.random() - 0.5) * 0.004,
			size: 1 + Math.random() * 2.2,
			color: colors[Math.floor(Math.random() * colors.length)],
			isOrb: false,
		});

		const makeOrb = (): Particle => ({
			x: Math.random() * W,
			y: Math.random() * H,
			vx: (Math.random() - 0.5) * 0.12,
			vy: -Math.random() * 0.18 - 0.04,
			opacity: 0.08 + Math.random() * 0.2,
			opacityDir: (Math.random() - 0.5) * 0.002,
			size: 5 + Math.random() * 6,
			color: colors[Math.floor(Math.random() * colors.length)],
			isOrb: true,
		});

		const particles: Particle[] = [
			...Array.from({ length: 65 }, makeParticle),
			...Array.from({ length: 7 }, makeOrb),
		];

		const resize = () => {
			W = window.innerWidth;
			H = window.innerHeight;
			canvas.width = W;
			canvas.height = H;
		};

		const onMouse = (e: MouseEvent) => { targetX = e.clientX; targetY = e.clientY; };

		window.addEventListener('resize', resize);
		window.addEventListener('mousemove', onMouse);

		let animId: number;

		const loop = () => {
			// Smooth parallax
			mouseX += (targetX - mouseX) * 0.035;
			mouseY += (targetY - mouseY) * 0.035;
			const px = (mouseX - W / 2) / W * 12;
			const py = (mouseY - H / 2) / H * 12;

			ctx.clearRect(0, 0, W, H);
			ctx.save();
			ctx.translate(px, py);

			// Connection lines
			for (let i = 0; i < particles.length; i++) {
				const a = particles[i];
				if (a.isOrb) continue;
				for (let j = i + 1; j < particles.length; j++) {
					const b = particles[j];
					if (b.isOrb) continue;
					const dx = a.x - b.x;
					const dy = a.y - b.y;
					const d2 = dx * dx + dy * dy;
					if (d2 < 11236) { // 106px
						const alpha = (1 - Math.sqrt(d2) / 106) * 0.13;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
						ctx.lineWidth = 0.5;
						ctx.stroke();
					}
				}
			}

			// Draw particles
			for (const p of particles) {
				p.x += p.vx;
				p.y += p.vy;
				p.opacity += p.opacityDir;

				const minOp = p.isOrb ? 0.05 : 0.15;
				const maxOp = p.isOrb ? 0.3  : 0.85;
				if (p.opacity <= minOp || p.opacity >= maxOp) p.opacityDir *= -1;

				if (p.y < -15) { p.y = H + 15; p.x = Math.random() * W; }
				if (p.x < -15) p.x = W + 15;
				if (p.x > W + 15) p.x = -15;

				if (p.isOrb) {
					const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
					const h = Math.round(p.opacity * 255).toString(16).padStart(2, '0');
					grad.addColorStop(0, p.color + h);
					grad.addColorStop(0.5, p.color + Math.round(p.opacity * 0.4 * 255).toString(16).padStart(2, '0'));
					grad.addColorStop(1, p.color + '00');
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
					ctx.fillStyle = grad;
					ctx.fill();
				} else {
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
					ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
					ctx.fill();
				}
			}

			ctx.restore();
			animId = requestAnimationFrame(loop);
		};

		loop();

		return () => {
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', onMouse);
			cancelAnimationFrame(animId);
		};
	});
</script>

{#if browser}
	<canvas bind:this={canvas} style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;"></canvas>
{/if}
