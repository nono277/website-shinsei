// ─────────────────────────────────────────────────────────────────────────────
// Données du Wiki — extraites du plugin ShinseiCore (source de vérité serveur).
// Commandes, statistiques, compétences, failles, terrain, difficulté.
// ─────────────────────────────────────────────────────────────────────────────

export interface WikiCommand {
	cmd: string;
	desc: string;
	staff?: boolean;
}

export interface CommandCategory {
	id: string;
	label: string;
	icon: string;
	color: string;
	commands: WikiCommand[];
}

export const commandCategories: CommandCategory[] = [
	{
		id: 'profil', label: 'Progression & Profil', icon: '📊', color: '#7c3aed',
		commands: [
			{ cmd: '/stats', desc: "Afficher ses statistiques (Force, Agilité, Intelligence, Endurance, Chance, Perception)." },
			{ cmd: '/stats add <stat> [montant]', desc: "Dépenser des points dans une statistique." },
			{ cmd: '/skills', desc: "Ouvrir l'arbre de compétences de ta classe." },
			{ cmd: '/skills buy <id>', desc: "Débloquer un nœud de l'arbre avec des Shards." },
			{ cmd: '/skills toggle <id>', desc: "Activer / désactiver une compétence apprise." },
			{ cmd: '/skills <capacité>', desc: "Déclencher une capacité active (ex. dash, seisme, boule…)." },
			{ cmd: '/skills a1 · a2 · a3 · a4 · ult', desc: "Lancer la capacité assignée à un slot (ou l'ultime)." },
			{ cmd: '/difficulte', desc: "(R)ouvrir l'écran de choix de difficulté (Normal / Hardcore)." },
			{ cmd: '/shinsei stats', desc: "Résumé complet de ta progression." },
			{ cmd: '/shinsei classe', desc: "Voir / choisir ta classe." },
			{ cmd: '/shinsei faction', desc: "Voir / choisir ta faction." },
			{ cmd: '/shinsei grade', desc: "Consulter ton grade d'Éveillé." },
		],
	},
	{
		id: 'quetes', label: 'Quêtes & Découverte', icon: '📜', color: '#a78bfa',
		commands: [
			{ cmd: '/quest', desc: "Ouvrir le journal des quêtes (ou le bouton QUÊTES dans l'inventaire). Une quête principale + 9 secondaires, récompenses en éclats et en argent." },
			{ cmd: 'Suivre une quête', desc: "Clique une quête pour l'épingler dans ta barre latérale et suivre ta progression en direct." },
			{ cmd: '/guide', desc: "Recevoir le Manuel de l'Éveillé (livre d'accueil, remis à la première connexion)." },
			{ cmd: '/spawn [ville]', desc: "Voyager vers les hubs de villes du serveur." },
			{ cmd: 'Parler aux habitants', desc: "Clic droit sur les PNJ de Tokyo pour découvrir leurs histoires et faire progresser tes quêtes." },
		],
	},
	{
		id: 'guilde', label: 'Guildes', icon: '🛡️', color: '#06b6d4',
		commands: [
			{ cmd: '/guilde creer <nom> <tag>', desc: "Fonder une guilde." },
			{ cmd: '/guilde inviter <joueur>', desc: "Inviter un joueur." },
			{ cmd: '/guilde rejoindre <nom>', desc: "Rejoindre une guilde sur invitation." },
			{ cmd: '/guilde quitter', desc: "Quitter sa guilde." },
			{ cmd: '/guilde info [nom]', desc: "Informations sur une guilde." },
			{ cmd: '/guilde membres', desc: "Liste des membres." },
			{ cmd: '/guilde promouvoir <joueur>', desc: "Promouvoir un membre en Officier." },
			{ cmd: '/guilde revoquer <joueur>', desc: "Exclure un membre." },
			{ cmd: '/guilde dissoudre', desc: "Dissoudre la guilde (fondateur)." },
			{ cmd: '/guilde blason <id>', desc: "Changer le blason (fondateur)." },
			{ cmd: '/guilde contrats', desc: "Contrats de guilde actifs." },
			{ cmd: '/guilde top', desc: "Classement des 10 meilleures guildes." },
		],
	},
	{
		id: 'terrain', label: 'Terrain & Protection', icon: '🚧', color: '#22c55e',
		commands: [
			{ cmd: '/claim', desc: "Protéger le chunk où tu te trouves (privé)." },
			{ cmd: '/claim guilde', desc: "Claim au nom de ta guilde." },
			{ cmd: '/unclaim', desc: "Libérer le chunk courant." },
			{ cmd: '/claim info', desc: "Détails du claim courant." },
			{ cmd: '/claim list', desc: "Lister tes claims." },
			{ cmd: '/claim trust <joueur>', desc: "Autoriser un joueur sur tes claims." },
			{ cmd: '/claim untrust <joueur>', desc: "Retirer une autorisation." },
			{ cmd: '/claim gtrust / guntrust <joueur>', desc: "Autoriser / retirer sur les claims de guilde." },
			{ cmd: '/claim access <prive|faction|public>', desc: "Régler l'accès du claim." },
			{ cmd: '/claim gaccess <…>', desc: "Régler l'accès d'un claim de guilde." },
			{ cmd: '/claim buy · gbuy', desc: "Acheter un slot de claim supplémentaire." },
			{ cmd: '/claim aide', desc: "Aide des commandes de claim." },
		],
	},
	{
		id: 'marche', label: 'Économie & Marché', icon: '💰', color: '#f59e0b',
		commands: [
			{ cmd: '/market', desc: "Ouvrir le Marché des Chasseurs (place de marché joueur)." },
			{ cmd: '/market sell <prix>', desc: "Mettre en vente l'objet en main au prix indiqué." },
			{ cmd: '/market cancel <id>', desc: "Retirer une de tes annonces." },
			{ cmd: '/market list', desc: "Lister les annonces en chat." },
			{ cmd: 'Achat', desc: "L'achat se fait en cliquant une annonce dans l'interface du marché." },
		],
	},
	{
		id: 'faille', label: 'Failles', icon: '🌀', color: '#a855f7',
		commands: [
			{ cmd: '/faille info', desc: "Voir la ou les failles actuellement actives." },
			{ cmd: '/faille liste', desc: "Lister les failles configurées et leur emplacement." },
		],
	},
];

// ── Statistiques (formules réelles du config.yml) ────────────────────────────
export interface StatInfo {
	name: string;
	icon: string;
	color: string;
	tagline: string;
	effects: string[];
}

export const statInfos: StatInfo[] = [
	{
		name: 'Force', icon: '💪', color: '#ef4444', tagline: 'Puissance brute',
		effects: ['+2 points de vie par point', '+3 % de dégâts en mêlée par point (50 Force = ×2,5)'],
	},
	{
		name: 'Agilité', icon: '🏃', color: '#22c55e', tagline: 'Vitesse & esquive',
		effects: ['+0,2 % de vitesse de déplacement par point', "+0,3 % de chance d'esquive par point (max 30 %)"],
	},
	{
		name: 'Intelligence', icon: '🔮', color: '#3b82f6', tagline: 'Maîtrise magique',
		effects: ['Augmente le mana max (cap 150)', '+2 % de régénération de mana par point',
			'−0,5 % de recharge des sorts par point (max −30 %)', '+1 % de puissance des sorts par point (max +50 %)'],
	},
	{
		name: 'Endurance', icon: '🛡️', color: '#a78bfa', tagline: 'Résistance',
		effects: ['+1,5 point de vie par point', "+0,3 d'armure par point", '−0,5 % de dégâts subis par point (max −50 %)'],
	},
	{
		name: 'Chance', icon: '🍀', color: '#10b981', tagline: 'Coups critiques & éclats',
		effects: ['Chance de critique : 3 % de base +0,3 % par point (max 40 %)',
			'Critique = ×1,5 à ×2,5 dégâts',
			'Chance de doubler les éclats d\'un kill : 4 % +0,4 % par point (max 35 %)'],
	},
	{
		name: 'Perception', icon: '👁️', color: '#06b6d4', tagline: 'Portée & butin',
		effects: ['+2 blocs de portée de ciblage par point', 'Détection des ennemis proches',
			'+0,5 % de chance de butin par point (max +30 %)'],
	},
];

// ── Bonus de classe (config classes.*) + capacités actives (/skills) ─────────
export interface ClassMechanic {
	id: string;
	name: string;
	icon: string;
	color: string;
	passive: string;
	abilities: { cmd: string; effect: string }[];
}

export const classMechanics: ClassMechanic[] = [
	{
		id: 'hunter', name: 'Hunter', icon: '🗡️', color: '#8b5cf6',
		passive: 'Assassinat : +50 % de dégâts en frappant un ennemi dans le dos.',
		abilities: [
			{ cmd: '/skills dash', effect: 'Dash silencieux dans la direction visée (CD 8 s).' },
			{ cmd: '/skills frappeabime', effect: 'Téléportation derrière la cible + critique garanti (CD 60 s).' },
			{ cmd: '/skills volee', effect: 'Volée de 5 couteaux en éventail (CD 12 s).' },
			{ cmd: '/skills pasombre', effect: 'Téléportation vers la cible visée (CD 10 s).' },
			{ cmd: '/skills souverain', effect: 'Ultime — forme d\'ombre 8 s : +50 % dégâts, +40 % vitesse (CD 120 s).' },
		],
	},
	{
		id: 'titan', name: 'Titan', icon: '🛡️', color: '#f59e0b',
		passive: 'Cœur de Pierre : +5 % de PV max, riposte 25 % des dégâts subis et forte résistance au recul (jusqu\'à l\'immunité).',
		abilities: [
			{ cmd: '/skills seisme', effect: 'Onde de choc au sol (7 blocs) : 8 dégâts + Lenteur II (CD 10 s).' },
			{ cmd: '/skills regen', effect: 'Régénération : +6 PV immédiats, Régénération III et Absorption (CD 18 s).' },
			{ cmd: '/skills provoc', effect: 'Force les mobs proches (12 blocs) à te cibler + Résistance II (CD 12 s).' },
			{ cmd: '/skills colosse', effect: 'Éveil du Colosse : Résistance III + Force II, et 30 dégâts de zone (6 blocs) (CD 45 s).' },
			{ cmd: '/skills eternel', effect: 'Ultime — Colosse Éternel : −50 % de dégâts subis 8 s (Force + Absorption III) et onde de recul autour de toi (CD 120 s).' },
		],
	},
	{
		id: 'arcane', name: 'Arcane', icon: '🔮', color: '#3b82f6',
		passive: 'Éveil Arcanique : régénération de mana accrue et bouclier d\'Absorption réappliqué en continu (Barrière).',
		abilities: [
			{ cmd: '/skills boule', effect: 'Boule de feu incendiaire à distance (CD 6 s).' },
			{ cmd: '/skills nova', effect: 'Nova de givre (7 blocs) : 8 dégâts + Lenteur IV (CD 14 s).' },
			{ cmd: '/skills singularite', effect: 'Singularité : aspire les ennemis (9 blocs) vers toi + 6 dégâts (CD 20 s).' },
			{ cmd: '/skills novaabsolue', effect: 'Nova absolue : explosion de zone (8 blocs) — 55 dégâts + projection (CD 60 s).' },
			{ cmd: '/skills archimage', effect: 'Ultime — Archimage : mana restauré + −20 % de recharge des sorts pendant 10 s (CD 40 s).' },
		],
	},
	{
		id: 'shinigami', name: 'Shinigami', icon: '💀', color: '#ec4899',
		passive: 'Tempo : combo +5 %/coup (max +45 %), saignement, exécution ×2,5 sous 20 % PV.',
		abilities: [
			{ cmd: '/skills moisson', effect: 'Moisson : dégâts de zone (6 blocs) — 10 dégâts + Flétrissement II (CD 10 s).' },
			{ cmd: '/skills spectre', effect: 'Pas du Spectre : ruée fantomatique — invisibilité + vitesse 3 s (CD 12 s).' },
			{ cmd: '/skills forme', effect: 'Ultime — Forme Faucheuse : Force II + Vitesse II 10 s, tous tes coups infligent un saignement (CD 45 s).' },
		],
	},
	{
		id: 'beast', name: 'Beast', icon: '🐺', color: '#f97316',
		passive: 'Rage : +dégâts selon les PV manquants (max +100 %), vol de vie 15 %, cuir épais (−40 % dégâts à bas PV).',
		abilities: [
			{ cmd: '/skills bond', effect: 'Bond Prédateur : bond bestial vers l\'avant (CD 8 s).' },
			{ cmd: '/skills rugissement', effect: 'Rugissement : Faiblesse II + Lenteur aux ennemis proches (8 blocs) et te donne Force II (CD 12 s).' },
			{ cmd: '/skills metamorphose', effect: 'Ultime — Métamorphose : Force II + Résistance II + Vitesse pendant 10 s (CD 45 s).' },
		],
	},
];

// ── Failles dimensionnelles (enum FailleRang) ────────────────────────────────
export interface FailleRankRow {
	rang: string;
	color: string;
	minLevel: number;
	maxLevel: number;
	mobs: number;
	shards: number;
	xp: number;
}

export const failleRanks: FailleRankRow[] = [
	{ rang: 'F', color: '#aaaaaa', minLevel: 1,  maxLevel: 20,  mobs: 25, shards: 200,  xp: 300 },
	{ rang: 'E', color: '#22cc44', minLevel: 20, maxLevel: 30,  mobs: 30, shards: 400,  xp: 800 },
	{ rang: 'D', color: '#4488ff', minLevel: 30, maxLevel: 40,  mobs: 35, shards: 600,  xp: 2000 },
	{ rang: 'C', color: '#8844ff', minLevel: 40, maxLevel: 50,  mobs: 40, shards: 800,  xp: 5000 },
	{ rang: 'B', color: '#ff8800', minLevel: 50, maxLevel: 60,  mobs: 45, shards: 1200, xp: 12000 },
	{ rang: 'A', color: '#ff4444', minLevel: 60, maxLevel: 70,  mobs: 50, shards: 1800, xp: 30000 },
	{ rang: 'S', color: '#ffcc00', minLevel: 70, maxLevel: 150, mobs: 60, shards: 3000, xp: 80000 },
];

export const failleRules: string[] = [
	'Une faille s\'ouvre automatiquement toutes les 2 heures (une seule active à la fois).',
	'Déroulement : 3 vagues de mobs, puis une Élite finale.',
	'Le combat démarre quand le premier joueur qualifié entre dans l\'arène.',
	'Impossible d\'en sortir avant la fin — et un niveau minimum est requis selon le rang.',
	'Récompenses (éclats + XP + butin) uniquement à la fermeture, distribuées aux présents.',
	'Rapidité : ×1 si nettoyée en moins de 30 min, ×0,5 sous 60 min, ×0,25 au-delà.',
	'Durée de vie 2 h : la faille se ferme d\'elle-même si personne ne la termine.',
	'Aucun bloc ne peut être cassé ou posé dans la zone d\'une faille active.',
];

// ── Difficulté (DeathPenaltyListener) ────────────────────────────────────────
export interface DifficultyMode {
	name: string;
	icon: string;
	color: string;
	desc: string;
	penalties: string[];
}

export const difficultyModes: DifficultyMode[] = [
	{
		name: 'Normal', icon: '🟢', color: '#22c55e',
		desc: 'Mode équilibré, recommandé pour découvrir le serveur.',
		penalties: ['Équipement conservé à la mort', '−50 % de la progression du niveau courant', '−5 % des éclats'],
	},
	{
		name: 'Hardcore', icon: '🔴', color: '#ef4444',
		desc: 'Haut risque, haute récompense. Le passage Hardcore → Normal est réservé au staff.',
		penalties: ['Équipement lâché au sol à la mort', '−100 % de la progression du niveau courant', '−25 % des éclats'],
	},
];
