import type { Action } from 'svelte/action';

interface RevealOptions {
	delay?: number;
	duration?: number;
	y?: number;
	x?: number;
}

export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, opts = {}) => {
	const { delay = 0, duration = 600, y = 28, x = 0 } = opts;

	requestAnimationFrame(() => {
		const rect = node.getBoundingClientRect();
		const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;

		if (alreadyVisible) return; // Don't animate elements already in view

		node.style.opacity = '0';
		node.style.transform = `translate(${x}px, ${y}px)`;
		node.style.transition = `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					node.style.opacity = '1';
					node.style.transform = 'translate(0, 0)';
					observer.disconnect();
				}
			},
			{ threshold: 0.12 }
		);

		observer.observe(node);

		(node as any).__revealObserver = observer;
	});

	return {
		destroy() {
			(node as any).__revealObserver?.disconnect();
		}
	};
};
