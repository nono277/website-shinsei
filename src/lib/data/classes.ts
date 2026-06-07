export interface ClassAbility {
	name: string;
	description: string;
	rank: string;
	isSS?: boolean;
}

export interface GameClass {
	id: string;
	name: string;
	color: string;
	tagline: string;
	description: string;
	icon: string;
	lore: string;
	playstyle: string;
	stats: string[];
	strengths: string[];
	weaknesses: string[];
	abilities: ClassAbility[];
}

export const classes: GameClass[] = [
	{
		id: 'hunter',
		name: 'Hunter',
		color: '#a78bfa',
		tagline: 'Assassin agile et furtif',
		description: "Techniques d'araignée, attaques rapides, mobilité accrue",
		icon: '🗡️',
		lore: "Les Hunters sont des Éveillés dont le pouvoir s'est développé dans l'obscurité. Leur énergie vitale, l'Ombre-Essence, leur permet de se fondre dans les ténèbres et de frapper avec une précision mortelle. On dit que les meilleurs Hunters peuvent traverser une faille entière sans être vus.",
		playstyle: "Assassin agile, furtif et rapide. Tu frappes vite, tu esquives, tu élimines. Idéal pour le PvP et les donjons rapides.",
		stats: ['Agilité', 'Précision'],
		strengths: ['DPS élevé', 'Mobilité', 'Furtivité'],
		weaknesses: ['Fragile', 'Aucune défense'],
		abilities: [
			{ name: "Techniques d'araignée", rank: 'Compétence', description: "" },
			{ name: "Attaques rapides", rank: 'Compétence', description: "" },
			{ name: "Mobilité accrue", rank: 'Compétence', description: "" },
		]
	},
	{
		id: 'titan',
		name: 'Titan',
		color: '#60a5fa',
		tagline: 'Tank implacable, résistance extrême',
		description: "Résistance adaptative, enchaînement de coups de hache lourds",
		icon: '🛡️',
		lore: "Les Titans sont des Éveillés dont le corps a muté pour absorber l'énergie des Corrompus. Leur peau durcit progressivement à chaque combat. Ils sont les premiers à entrer dans les failles et les derniers à en sortir.",
		playstyle: "Tank implacable. Tu absorbes tout, tu tiens la ligne, tu écrases au corps à corps.",
		stats: ['Endurance', 'Force'],
		strengths: ['Survie', 'Protection équipe', 'Résistance extrême'],
		weaknesses: ['Lent', 'Dégâts faibles à distance'],
		abilities: [
			{ name: "Résistance adaptative", rank: 'Compétence', description: "" },
			{ name: "Enchaînement de coups de hache lourds", rank: 'Compétence', description: "" },
		]
	},
	{
		id: 'arcane',
		name: 'Arcane',
		color: '#f472b6',
		tagline: 'Mage dévastateur',
		description: "Résistance augmentée, sorts de feu, grimoire 5 emplacements",
		icon: '✨',
		lore: "Les Arcanes perçoivent le monde comme un réseau d'énergies invisibles. Là où les autres voient une faille, eux voient une déchirure dans le tissu de la réalité qu'ils peuvent manipuler.",
		playstyle: "Mage dévastateur à distance. Sorts de feu, résistance accrue, grimoire avec 5 emplacements de sorts.",
		stats: ['Puissance Arcanique', 'Intelligence'],
		strengths: ['Dégâts de feu', 'Polyvalence', 'Résistance'],
		weaknesses: ['Fragile sans grimoire', 'Gestion des emplacements'],
		abilities: [
			{ name: "Résistance augmentée", rank: 'Compétence', description: "" },
			{ name: "Sorts de feu", rank: 'Compétence', description: "" },
			{ name: "Grimoire 5 emplacements", rank: 'Compétence', description: "" },
		]
	},
	{
		id: 'shinigami',
		name: 'Shinigami',
		color: '#fbbf24',
		tagline: "DPS rapide, maître du katana et de l'esquive",
		description: "Dash rapide, enchaînement katana, attaque chargée dévastatrice",
		icon: '⚔️',
		lore: "Les Shinigami développent une maîtrise absolue du katana. Vitesse, précision et timing sont leurs armes. L'attaque chargée après rengainement est leur coup signature — dévastateur et imparable.",
		playstyle: "DPS rapide basé sur le katana. Dash, enchaînements, et attaque chargée après rengainement.",
		stats: ['Vitesse', 'Précision'],
		strengths: ['Vitesse', 'DPS constant', 'Mobilité'],
		weaknesses: ['Défense faible', 'Nécessite du timing'],
		abilities: [
			{ name: "Dash rapide", rank: 'Compétence', description: "" },
			{ name: "Enchaînement katana", rank: 'Compétence', description: "" },
			{ name: "Attaque chargée dévastatrice", rank: 'Compétence', description: "" },
		]
	},
	{
		id: 'bete',
		name: 'Bête',
		color: '#fb923c',
		tagline: 'Berserker brutal',
		description: "Mode berserker, force décuplée, roulade d'esquive",
		icon: '🐺',
		lore: "Les Bêtes sont des Éveillés dont le pouvoir a réveillé quelque chose de primitif. Leur corps se transforme au combat. Plus le combat dure, plus ils deviennent dangereux.",
		playstyle: "Berserker brutal. Mode berserker avec force décuplée, roulade d'esquive pour survivre.",
		stats: ['Force brute', 'Régénération'],
		strengths: ['Puissance brute', 'Mobilité défensive', 'Sustain'],
		weaknesses: ['Lent hors berserker', 'Exposé pendant la roulade'],
		abilities: [
			{ name: "Mode berserker", rank: 'Compétence', description: "" },
			{ name: "Force décuplée", rank: 'Compétence', description: "" },
			{ name: "Roulade d'esquive", rank: 'Compétence', description: "" },
		]
	}
];
