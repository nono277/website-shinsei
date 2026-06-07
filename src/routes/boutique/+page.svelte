<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import GradeCard from '$lib/components/GradeCard.svelte';
	import { shopGrades, gameRanks } from '$lib/data/grades';

	import imgKaigen from '$lib/img/grade boutique/kaigen.png';
	import imgRaijin from '$lib/img/grade boutique/raijin.png';
	import imgOni    from '$lib/img/grade boutique/oni.png';
	import imgShogun from '$lib/img/grade boutique/shogun.png';
	import imgArchon from '$lib/img/grade boutique/archon.png';

	const gradeAssets: Record<string, string> = {
		kaigen: imgKaigen,
		raijin: imgRaijin,
		oni:    imgOni,
		shogun: imgShogun,
		archon: imgArchon,
	};

	interface BuyDetail { id: string; name: string; price: number; }
	let buyModal = $state<BuyDetail | null>(null);
	let openFaq  = $state<number | null>(null);

	const faq = [
		{ q:'Est-ce du pay-to-win ?',
		  a:'Non. Les grades boutique sont 100% cosmétiques. Ils n\'améliorent aucune stat, ne donnent aucune compétence, n\'accélèrent pas la progression. Le rang Abyssal SS ne peut pas s\'acheter.' },
		{ q:'Le grade est-il permanent ?',
		  a:'Oui. Paiement unique, grade à vie. Aucun abonnement, aucune expiration.' },
		{ q:'Puis-je upgrader mon grade ?',
		  a:'Oui. Si tu achètes Oni après avoir Kaigen, on déduit le prix de Kaigen automatiquement.' },
		{ q:'Comment recevoir mon grade en jeu ?',
		  a:'Le grade est attribué automatiquement dans les minutes suivant l\'achat. Reconnecte-toi si nécessaire.' },
		{ q:'Puis-je offrir un grade à quelqu\'un ?',
		  a:'Oui, via la fonction "Offrir" sur la page de paiement Tebex.' },
		{ q:'Remboursement possible ?',
		  a:'Les achats sont définitifs conformément aux CGV. Contacte le support en cas de problème technique.' },
	];

	const rankColors = ['#6b7280','#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#f59e0b'];
</script>

<svelte:head><title>Boutique — SHINSEI 新世</title></svelte:head>

<div style="min-height:100vh;background:#0a0a0f;padding:5rem 1.5rem 4rem;">
	<div style="max-width:80rem;margin:0 auto;">

		<!-- En-tête -->
		<div style="text-align:center;margin-bottom:3.5rem;">
			<p class="label-mono" style="color:#7c3aed;margin-bottom:0.5rem;">GRADES EXCLUSIFS</p>
			<h1 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:900;color:white;margin-bottom:0.5rem;text-shadow:0 0 30px #7c3aed20;">
				CHOISISSEZ VOTRE GRADE
			</h1>
			<p class="label-mono" style="color:#64748b;">Paiement unique · À vie · 100% cosmétique</p>
		</div>

		<!-- Grades en ligne -->
		<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:1rem;margin-bottom:5rem;overflow-x:auto;">
			{#each shopGrades as grade}
				<GradeCard
					id={grade.id} name={grade.name} price={grade.price}
					color={grade.color} perks={grade.perks}
					image={gradeAssets[grade.id]}
					onbuy={(d) => buyModal = d}
				/>
			{/each}
		</div>

		<!-- Progression gameplay -->
		<div style="margin-bottom:5rem;">
			<h2 style="font-family:'Rajdhani',sans-serif;font-size:clamp(1.5rem,3vw,2.2rem);font-weight:900;color:white;text-align:center;margin-bottom:0.5rem;">
				PROGRESSION EN JEU
			</h2>
			<p class="label-mono" style="color:#64748b;text-align:center;margin-bottom:2.5rem;">
				Les rangs gameplay s'obtiennent uniquement par l'expérience — aucun paiement requis
			</p>

			<!-- Timeline rangs -->
			<div style="position:relative;padding-bottom:1rem;">
				<!-- Ligne de connexion desktop -->
				<div style="position:absolute;top:1.5rem;left:calc(100%/14);right:calc(100%/14);height:2px;background:linear-gradient(90deg,#7c3aed,#06b6d4,#f59e0b);border-radius:1px;display:none;" class="md:block"></div>

				<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;" class="md:grid-cols-7">
					{#each gameRanks as rank, i}
						<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;text-align:center;">
							<div style="
								position:relative;z-index:1;
								width:3rem;height:3rem;border-radius:50%;
								display:flex;align-items:center;justify-content:center;
								font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.9rem;
								background:{rank.color}18;border:2px solid {rank.color};
								box-shadow:0 0 12px {rank.color}35;color:{rank.color};
							">{i+1}</div>
							<div style="font-family:'Rajdhani',sans-serif;font-weight:800;font-size:0.85rem;color:{rank.color};">{rank.name}</div>
							<div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:#374151;">{rank.xpRequired}</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- FAQ -->
		<div style="max-width:42rem;margin:0 auto;">
			<h2 style="font-family:'Rajdhani',sans-serif;font-size:clamp(1.5rem,3vw,2.2rem);font-weight:900;color:white;text-align:center;margin-bottom:2rem;">
				QUESTIONS FRÉQUENTES
			</h2>
			<div style="display:flex;flex-direction:column;gap:0.5rem;">
				{#each faq as item, i}
					<div style="border:1px solid #1e1530;border-radius:0.625rem;overflow:hidden;">
						<button
							onclick={() => openFaq = openFaq===i ? null : i}
							style="
								width:100%;display:flex;align-items:center;justify-content:space-between;
								padding:1rem 1.25rem;background:#0d0d15;cursor:pointer;
								transition:background 0.2s;
							"
							onmouseenter={(e)=>(e.currentTarget as HTMLElement).style.background='#12121f'}
							onmouseleave={(e)=>(e.currentTarget as HTMLElement).style.background='#0d0d15'}
						>
							<span style="font-family:'Rajdhani',sans-serif;font-weight:800;font-size:1rem;color:white;text-align:left;">{item.q}</span>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5"
								style="flex-shrink:0;margin-left:0.75rem;transform:rotate({openFaq===i?'180deg':'0deg'});transition:transform 0.2s;">
								<path d="M6 9l6 6 6-6"/>
							</svg>
						</button>
						{#if openFaq === i}
							<div transition:slide={{ duration:200 }} style="padding:0.85rem 1.25rem;background:#0a0a0f;border-top:1px solid #1e1530;">
								<p style="font-size:0.875rem;color:#94a3b8;line-height:1.65;">{item.a}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Section Discord -->
		<div style="margin-top:4rem;padding:2rem;border-radius:0.875rem;background:linear-gradient(135deg,#5865f220,#7c3aed15);border:1px solid #5865f240;text-align:center;">
			<p style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#5865f2;margin-bottom:0.5rem;">AVANTAGES DISCORD</p>
			<h3 style="font-family:'Rajdhani',sans-serif;font-size:clamp(1.4rem,3vw,1.9rem);font-weight:900;color:white;margin-bottom:0.75rem;">
				REJOINS LA COMMUNAUTÉ
			</h3>
			<p style="font-size:0.875rem;color:#94a3b8;line-height:1.65;max-width:32rem;margin:0 auto 1.5rem;">
				Chaque grade boutique inclut des avantages Discord exclusifs : salons privés, rôles colorés, vocaux VIP, annonces prioritaires.
			</p>
			<a href="https://discord.gg/shinsei" style="
				display:inline-block;
				font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.875rem;letter-spacing:0.1em;
				padding:0.75rem 2rem;border-radius:0.375rem;
				background:#5865f2;color:white;border:1px solid #7289da;
				box-shadow:0 0 20px #5865f240;
				transition:box-shadow 0.25s,background 0.25s;
			"
				onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 35px #5865f270'; el.style.background='#4752c4'; }}
				onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 20px #5865f240'; el.style.background='#5865f2'; }}>
				REJOINDRE LE DISCORD
			</a>
		</div>

	</div>
</div>

<!-- Modal achat -->
{#if buyModal}
	<div
		transition:fade={{ duration:140 }}
		role="presentation"
		onclick={() => buyModal = null}
		onkeydown={(e) => e.key==='Escape' && (buyModal=null)}
		style="position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:rgba(0,0,0,0.82);"
	>
		<div
			role="dialog" aria-modal="true"
			onclick={(e)=>e.stopPropagation()}
			onkeydown={(e)=>e.key==='Escape'&&(buyModal=null)}
			style="background:#0d0d15;border:1px solid #7c3aed55;border-radius:1rem;overflow:hidden;max-width:26rem;width:100%;box-shadow:0 0 50px #7c3aed28;"
		>
			<!-- Image header -->
			<div style="position:relative;height:120px;overflow:hidden;">
				<img src={gradeAssets[buyModal.id]} alt="" style="width:100%;height:100%;object-fit:cover;object-position:top;" />
				<div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent,#0d0d15);"></div>
			</div>
			<div style="padding:1.5rem;">
				<h3 style="font-family:'Rajdhani',sans-serif;font-size:1.6rem;font-weight:900;color:#7c3aed;margin-bottom:0.25rem;">GRADE {buyModal.name.toUpperCase()}</h3>
				<p style="font-family:'Rajdhani',sans-serif;font-size:2rem;font-weight:900;color:white;margin-bottom:1rem;">{buyModal.price.toFixed(2)}€</p>
				<p style="font-size:0.85rem;color:#94a3b8;line-height:1.6;margin-bottom:1.25rem;">
					Le système de paiement sera bientôt disponible. Rejoignez notre Discord pour être notifié du lancement officiel.
				</p>
				<div style="display:flex;gap:0.75rem;">
					<span style="flex:1;padding:0.75rem;background:#7c3aed;color:white;border-radius:0.375rem;font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.8rem;letter-spacing:0.08em;text-align:center;cursor:pointer;">
						REJOINDRE LE DISCORD
					</span>
					<button onclick={() => buyModal=null}
						style="padding:0.75rem 1rem;border:1px solid #1e1530;border-radius:0.375rem;font-size:0.8rem;color:#64748b;cursor:pointer;transition:color 0.2s;background:none;"
						onmouseenter={(e)=>(e.currentTarget as HTMLElement).style.color='white'}
						onmouseleave={(e)=>(e.currentTarget as HTMLElement).style.color='#64748b'}>
						Fermer
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
