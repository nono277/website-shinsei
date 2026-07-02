export interface Faction {
	id: string;
	name: string;
	philosophy: string;
	description: string;
	longDescription: string;
	leader: string;
	territory: string;
	reputation: string;
	colors: { primary: string; secondary: string };
	symbol: string;
	advantages: string[];
}

export interface TimelineEvent {
	year: string;
	title: string;
	description: string;
}

export interface Dungeon {
	id: string;
	name: string;
	rank: string;
	rankColor: string;
	players: string;
	duration: string;
	boss: string;
	lore: string;
	rewards: string;
}

export const factions: Faction[] = [
	{
		id: 'ordre',
		name: "L'Ordre",
		philosophy: 'Honneur et discipline, gardiens de la loi',
		description: "Hiérarchie stricte, discipline absolue. Le Bureau Shinsei dans sa forme la plus pure. Pour ceux qui croient en un monde meilleur.",
		longDescription: "Depuis la création du Bureau Shinsei, l'Ordre représente ce que les Éveillés devraient être : des protecteurs. Discipline, sacrifice, honneur. Les civils passent avant tout. Fondé par les survivants des Douze Premiers, l'Ordre croit fermement que les Éveillés ont reçu leurs pouvoirs pour servir l'humanité, non pour la dominer. Leur code est immuable : un Éveillé qui frappe un civil est une honte pour tous.",
		leader: 'Inconnu',
		territory: 'Europe occidentale',
		reputation: 'Respectés par les civils, vus comme des naïfs par les Fracturés',
		colors: { primary: '#ffffff', secondary: '#fbbf24' },
		symbol: '⚖️',
		advantages: [
			'Bonus de stats : +6 Endurance, +3 Force',
			'Bonus défensif +10% en territoire allié',
			'Accès aux quêtes de protection de convoi',
			'Zones sécurisées renforcées accessibles',
			'Réputation positive auprès des PNJ civils',
		]
	},
	{
		id: 'fractures',
		name: 'Les Fracturés',
		philosophy: "Chaos et liberté, contre l'ordre établi",
		description: "Pourquoi servir des faibles quand on peut les gouverner ? Pour ceux qui refusent les chaînes.",
		longDescription: "Née de la frustration des premiers Éveillés sacrifiés par les gouvernements, la faction des Fracturés prône la suprématie des Éveillés. Ils refusent d'être des outils au service des 'sans-pouvoirs'. Le monde leur appartient. Pourquoi protéger des humains ordinaires quand on pourrait les gouverner ? Les Éveillés sont l'évolution suivante. Le Bureau Shinsei enchaîne ce qui devrait régner. Les Fracturés se sont libérés — et ils entendent bien libérer les autres.",
		leader: 'Inconnu',
		territory: 'Asie du Sud-Est',
		reputation: 'Craints par les civils, haïs par l\'Ordre, respectés par les Nomades',
		colors: { primary: '#ef4444', secondary: '#f87171' },
		symbol: '💀',
		advantages: [
			'Bonus de stats : +6 Intelligence, +3 Chance',
			'Dégâts PvP +10% en territoire neutre',
			'Accès au marché noir dès le rang B',
			'Bonus attaque contre les membres de l\'Ordre',
			'Accès à des quêtes de domination de territoire',
		]
	},
	{
		id: 'nomades',
		name: 'Les Nomades',
		philosophy: 'Neutralité et survie, sans attaches',
		description: "Les zones abandonnées sont notre territoire. Pour ceux qui n'appartiennent à personne.",
		longDescription: "Ni alliés de l'Ordre, ni partisans des Fracturés. Les Nomades n'obéissent à personne. Ils errent entre les failles en solitaires ou en petits groupes, exploitant les zones que les autres ignorent. Leur force est leur indépendance : sans structure rigide, ils s'adaptent à tout. Les zones rurales abandonnées sont leur empire. Ils ne vous demanderont jamais de choisir un camp — mais ils n'oublieront pas si vous le faites.",
		leader: 'Personne — décision collective',
		territory: 'Zones rurales dispersées',
		reputation: 'Imprévisibles, libres, dangereux',
		colors: { primary: '#6b7280', secondary: '#22c55e' },
		symbol: '🧭',
		advantages: [
			'Bonus de stats : +6 Agilité, +3 Perception',
			'Vitesse de déplacement +15% hors zones sécurisées',
			'Accès aux waystones cachés exclusifs',
			'Meilleur taux de loot dans les zones abandonnées',
			'Accès à des quêtes d\'exploration exclusives',
		]
	}
];

export const timeline: TimelineEvent[] = [
	{
		year: '2031',
		title: 'Premier Éveil à Tokyo',
		description: 'Une faille de 300 mètres s\'ouvre au-dessus de Tokyo. Les Corrompus envahissent. 12 humains s\'éveillent et repoussent l\'invasion. On les appelle les Douze Premiers.'
	},
	{
		year: '2032',
		title: 'Création du Bureau Shinsei',
		description: 'L\'ONU fonde le Bureau Shinsei pour recruter, classer et déployer les Éveillés dans le monde entier. Première classification officielle des rangs D à S.'
	},
	{
		year: '2033',
		title: 'Première classification des rangs',
		description: 'Le système de progression D → S est établi. Des centaines de milliers d\'Éveillés émergent chaque mois à travers le monde. Les premières guildes se forment.'
	},
	{
		year: '2035',
		title: 'Apparition des guildes',
		description: 'Les premières guildes indépendantes se forment en marge du Bureau Shinsei. Certaines protègent les populations, d\'autres exploitent les failles à des fins mercantiles.'
	},
	{
		year: '2038',
		title: 'La Fracture',
		description: 'Un groupe d\'Éveillés menés par des dissidents du Bureau Shinsei se sépare de l\'Ordre. Les Fracturés naissent. La première guerre inter-Éveillés éclate.'
	},
	{
		year: '2040',
		title: 'Découverte de la Faille de l\'Abîme',
		description: 'Une faille permanente de taille incommensurable est découverte dans l\'Atlantique. Aucun Éveillé sous le rang S n\'en est revenu. Le Raid de l\'Abîme y prend place.'
	},
	{
		year: 'Aujourd\'hui',
		title: 'Toi. Rang 0. Dormant.',
		description: 'Tout commence maintenant. Tu arrives dans un monde en guerre, sans pouvoir, sans rang. 5 trônes Abyssal SS attendent d\'être réclamés. Lequel sera le tien ?'
	}
];

export const dungeons: Dungeon[] = [
	{
		id: 'ruines',
		name: "Les Ruines du Premier Éveil",
		rank: 'D', rankColor: '#6b7280',
		players: '1-2', duration: '10 min',
		boss: 'Corrompu Alpha',
		lore: "Ces ruines sont les vestiges du quartier de Tokyo détruit lors du Premier Éveil en 2031. Les Corrompus les plus faibles y ont établi leur nid.",
		rewards: "Équipement rang D, XP de base, Fragment de lore #1"
	},
	{
		id: 'egouts',
		name: "Les Égouts Infectés",
		rank: 'C', rankColor: '#22c55e',
		players: '1-3', duration: '20 min',
		boss: 'Rampant des Profondeurs',
		lore: "Sous les villes sécurisées se cachent des tunnels envahis de Corrompus. La mairie prétend que tout est sous contrôle.",
		rewards: "Équipement rang C, XP ×2, Recette d'artisanat"
	},
	{
		id: 'faille-souterraine',
		name: "La Faille Souterraine",
		rank: 'B', rankColor: '#3b82f6',
		players: '2-4', duration: '30 min',
		boss: 'Gardien de Faille',
		lore: "Une faille s'est ouverte sous terre. Le Gardien empêche quiconque d'en sortir. Des Éveillés de rang B y ont disparu.",
		rewards: "Équipement rang B, Cristaux d'énergie, Fragment de lore #3"
	},
	{
		id: 'dimension',
		name: "La Dimension Corrompue",
		rank: 'A', rankColor: '#a855f7',
		players: '3-5', duration: '45 min',
		boss: "L'Ancien Éveillé",
		lore: "Certains Éveillés, consumés par les failles, sont devenus des Corrompus. L'Ancien était un Souverain rang S avant sa chute.",
		rewards: "Équipement rang A, Essence corrompue, Titre 'Briseur de l'Abîme'"
	},
	{
		id: 'abime-exterieur',
		name: "L'Abîme Extérieur",
		rank: 'S', rankColor: '#f59e0b',
		players: '5 (obligatoire)', duration: '60 min',
		boss: 'Seigneur Corrompu',
		lore: "Aux frontières de notre dimension, une faille permanente relie deux mondes. Les Corrompus qui en émergent sont d'une puissance terrifiante.",
		rewards: "Équipement rang S légendaire, Titre 'Sentinelle de l'Abîme'"
	},
	{
		id: 'raid-abime',
		name: "Raid de l'Abîme — Le Cœur",
		rank: 'SS', rankColor: '#ef4444',
		players: '5 (obligatoire)', duration: '90 min',
		boss: 'Le Gardien de Classe (unique par classe)',
		lore: "Au cœur de la Faille de l'Abîme se trouve le Gardien. Le vaincre confère le rang Abyssal SS. Un seul peut le détenir par classe sur tout le serveur.",
		rewards: "Rang Abyssal SS, Ultime SS de classe, Titre mondial animé, Équipement légendaire unique"
	}
];

export const factionRelations: Record<string, Record<string, 'Alliés' | 'Ennemis' | 'Neutres'>> = {
	ordre:    { ordre: 'Alliés', fractures: 'Ennemis', nomades: 'Neutres' },
	fractures:{ ordre: 'Ennemis', fractures: 'Alliés', nomades: 'Neutres' },
	nomades:  { ordre: 'Neutres', fractures: 'Neutres', nomades: 'Alliés' },
};

export interface GuildType {
	id: string;
	name: string;
	icon: string;
	description: string;
}

export const guildTypes: GuildType[] = [
	{
		id: 'officielle',
		name: 'Guilde Officielle',
		icon: '⚔️',
		description: "Créée par un fondateur affilié à une faction (L'Ordre, Les Fracturés ou Les Nomades). La guilde hérite automatiquement de la faction de son fondateur."
	},
	{
		id: 'clandestine',
		name: 'Guilde Clandestine',
		icon: '🕵️',
		description: "Créée par un fondateur hors faction. Elle opère indépendamment, sans bannière ni allégeance à l'une des trois factions."
	}
];

export interface GuildRank {
	num: number;
	name: string;
	rights: string;
}

export const guildRanks: GuildRank[] = [
	{ num: 1, name: 'Fondateur',  rights: 'Tout — dissoudre, promouvoir, blason, inviter, révoquer' },
	{ num: 2, name: 'Officier',   rights: 'Inviter, révoquer, claim / unclaim au nom de la guilde' },
	{ num: 3, name: 'Membre',     rights: 'Chat de guilde, construction sur le territoire, contribue à l\'XP & aux contrats' },
];

// Niveaux de guilde (1 → 7) : max membres et chunks de claim par niveau.
export const guildChunkLimits = [
	{ rank: 'Niveau 1 · 5 membres',  chunks: 8 },
	{ rank: 'Niveau 2 · 10 membres', chunks: 14 },
	{ rank: 'Niveau 3 · 15 membres', chunks: 20 },
	{ rank: 'Niveau 4 · 25 membres', chunks: 30 },
	{ rank: 'Niveau 5 · 35 membres', chunks: 45 },
	{ rank: 'Niveau 6 · 50 membres', chunks: 65 },
	{ rank: 'Niveau 7 · 50 membres', chunks: 100 },
];

export const guildCommands = [
	{ cmd: '/guilde creer <nom> <tag>',   desc: 'Fonder une guilde (grade Éveillé + 1 000 éclats)' },
	{ cmd: '/guilde inviter <joueur>',    desc: 'Inviter un joueur (Officier+)' },
	{ cmd: '/guilde rejoindre <nom>',     desc: 'Rejoindre sur invitation (expire après 5 min)' },
	{ cmd: '/guilde quitter',             desc: 'Quitter sa guilde' },
	{ cmd: '/guilde info [nom]',          desc: 'Informations sur une guilde' },
	{ cmd: '/guilde membres',             desc: 'Liste des membres' },
	{ cmd: '/guilde promouvoir <joueur>', desc: 'Promouvoir un Membre en Officier (fondateur)' },
	{ cmd: '/guilde revoquer <joueur>',   desc: 'Exclure un membre (Officier+)' },
	{ cmd: '/guilde dissoudre',           desc: 'Dissoudre la guilde (fondateur)' },
	{ cmd: '/guilde blason <id>',         desc: 'Changer le blason (fondateur)' },
	{ cmd: '/guilde contrats',            desc: 'Contrats hebdomadaires de la guilde' },
	{ cmd: '/guilde top',                 desc: 'Classement des 10 meilleures guildes' },
	{ cmd: '/claim guilde',               desc: 'Claim un chunk au nom de la guilde (Officier+)' },
];

export const loreText = {
	intro: `En 2031, des failles dimensionnelles ont déchiré notre monde. Des créatures inconnues ont envahi nos villes. 12 humains se sont éveillés avec des pouvoirs surhumains. Tu es le suivant.`,
	full: `En 2031, le Premier Éveil se produit à Tokyo. Une faille de 300 mètres s'ouvre au-dessus de la ville et des créatures inconnues — appelées Corrompus — en émergent. L'armée est impuissante. Puis, spontanément, 12 humains développent des pouvoirs surhumains et repoussent l'invasion. On les appelle les Douze Premiers.

Depuis, les failles se multiplient partout dans le monde. L'ONU crée le Bureau Shinsei — une organisation internationale qui recrute, classe et déploie les Éveillés pour contenir les failles. Le monde s'est réorganisé autour de cette réalité : les Éveillés sont des soldats, des célébrités, des armes.

Les Corrompus sont les créatures qui émergent des failles. Leur origine est inconnue. Leur seul objectif semble être la destruction. Il en existe des centaines d'espèces, classifiées du rang D au rang SS. Les scientifiques du Bureau Shinsei ont découvert que les Corrompus sont attirés par l'énergie des Éveillés — plus un Éveillé est puissant, plus les Corrompus qu'il attire sont dangereux.

Aujourd'hui, trois factions s'affrontent pour le contrôle du monde. L'Ordre maintient l'idéal du Bureau Shinsei. Les Fracturés rejettent l'autorité des non-Éveillés. Les Nomades refusent de choisir. Et au cœur de l'Atlantique, la Faille de l'Abîme attend — immense, permanente, inexpliquée.

Toi, tu arrives comme Dormant — sans pouvoir, sans rang. Tout reste à conquérir.`
};
