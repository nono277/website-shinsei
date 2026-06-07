export interface ShopGrade {
	id: string;
	name: string;
	price: number;
	color: string;
	tagline: string;
	perks: string[];
}

export interface GameRank {
	id: string;
	name: string;
	color: string;
	xpRequired: string;
	xpAmount: number;
	unlocks: string[];
}

export const shopGrades: ShopGrade[] = [
	{
		id: 'kaigen',
		name: 'Kaigen',
		price: 4.99,
		color: '#06b6d4',
		tagline: "L'initiation. Le premier pas dans l'univers SHINSEI.",
		perks: [
			'Titre [Kaigen] cyan dans le chat',
			'Particules de glace autour du joueur',
			'+1 home supplémentaire',
			'Accès salon Discord #kaigen',
			'Badge Kaigen sur le profil Discord',
			'3 skins de cape cosmétiques',
		]
	},
	{
		id: 'raijin',
		name: 'Raijin',
		price: 9.99,
		color: '#fbbf24',
		tagline: "La foudre. L'énergie brute des tempêtes.",
		perks: [
			'Tout Kaigen inclus',
			'Titre [Raijin] or dans le chat',
			'Aura de foudre animée au sol',
			'+2 homes supplémentaires',
			'Trail doré en déplacement',
			'Pet cosmétique Raijin (esprit de foudre)',
			'5 skins de cape cosmétiques',
		]
	},
	{
		id: 'oni',
		name: 'Oni',
		price: 19.99,
		color: '#ef4444',
		tagline: "Le démon. Une puissance qui consume tout sur son passage.",
		perks: [
			'Tout Raijin inclus',
			'Titre [Oni] rouge dans le chat',
			'Effets de flammes rouges permanents',
			'+3 homes supplémentaires',
			'Effet d\'entrée animé à la connexion',
			'Pet cosmétique Oni (démon miniature)',
			'Emotes exclusives : /rugir, /mediter',
			'Accès salon Discord #oni-lounge',
		]
	},
	{
		id: 'shogun',
		name: 'Shogun',
		price: 29.99,
		color: '#a855f7',
		tagline: "Le seigneur de guerre. Respect et crainte en une présence.",
		perks: [
			'Tout Oni inclus',
			'Titre [Shogun] violet dans le chat',
			'Aura violette permanente',
			'+5 homes supplémentaires',
			'Skin de classe alternatif',
			'Pet cosmétique Shogun (samouraï fantôme)',
			'Tag spécial dans le tablist',
			'1 item cosmétique gratuit par mois',
			'Accès Discord #shogun-lounge + Vocal VIP',
		]
	},
	{
		id: 'archon',
		name: 'Archon',
		price: 44.99,
		color: '#f59e0b',
		tagline: "L'origine. L'un des Douze Premiers. Une légende vivante.",
		perks: [
			'Tout Shogun inclus',
			'Titre [Archon] or animé dans le chat',
			'Aura divine + lumière pulsante permanente',
			'+8 homes supplémentaires',
			'2 skins de classe alternatifs',
			'Pet cosmétique Archon (être de lumière)',
			'Annonce de connexion cosmétique visible par tous',
			'Accès illimité boutique cosmétique mensuelle',
			'Accès anticipé aux nouvelles features',
			'Support prioritaire + Discord #archon-elite',
		]
	}
];

export const gameRanks: GameRank[] = [
	{
		id: 'dormant',
		name: 'Dormant',
		color: '#6b7280',
		xpRequired: '0 XP — Niv. 1–20',
		xpAmount: 0,
		unlocks: ['Zone de départ', 'Tutoriel']
	},
	{
		id: 'eveille',
		name: 'Éveillé',
		color: '#22c55e',
		xpRequired: '10 000 XP — Niv. 21–40',
		xpAmount: 10000,
		unlocks: ['Choix de classe', 'Rejoindre une faction', 'Créer ou rejoindre une guilde', 'Donjons accessibles']
	},
	{
		id: 'briseur',
		name: 'Briseur',
		color: '#3b82f6',
		xpRequired: '50 000 XP — Niv. 41–60',
		xpAmount: 50000,
		unlocks: ['Zones avancées', 'Commerce entre joueurs', 'Donjons rang supérieur']
	},
	{
		id: 'fleau',
		name: 'Fléau',
		color: '#f59e0b',
		xpRequired: '150 000 XP — Niv. 61–80',
		xpAmount: 150000,
		unlocks: ['Zones Rang B', 'Arènes PvP classées', 'Système Bounty']
	},
	{
		id: 'transcendant',
		name: 'Transcendant',
		color: '#a855f7',
		xpRequired: '400 000 XP — Niv. 81–100',
		xpAmount: 400000,
		unlocks: ['Zones Rang A', 'Donjons élite', 'Arènes 3v3']
	},
	{
		id: 'souverain',
		name: 'Souverain',
		color: '#f59e0b',
		xpRequired: '900 000 XP — Niv. 101–120',
		xpAmount: 900000,
		unlocks: ['Zones Rang S', 'Gouvernance de faction', 'Faille de l\'Abîme (accès)', 'Titre Souverain']
	},
	{
		id: 'abyssal',
		name: 'Abyssal',
		color: '#ef4444',
		xpRequired: '2 000 000 XP — Niv. 121–150',
		xpAmount: 2000000,
		unlocks: ['Grade ultime', 'Titre mondial animé', '1 seul par classe sur le serveur']
	}
];

export const xpSources = [
	{ source: 'Farm monstres open world', xpPerHour: 150 },
	{ source: 'Donjons Rang D', xpPerHour: 300 },
	{ source: 'Donjons Rang C', xpPerHour: 600 },
	{ source: 'Donjons Rang B', xpPerHour: 1200 },
	{ source: 'Donjons Rang A', xpPerHour: 2500 },
	{ source: 'Failles Rang S', xpPerHour: 5000 },
	{ source: 'PvP arène', xpPerHour: 400 },
	{ source: 'Quêtes de faction', xpPerHour: 200 },
];
