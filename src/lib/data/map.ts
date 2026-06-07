export type MarkerType = 'safe' | 'rift';
export type FactionId = 'ordre' | 'fractures' | 'nomades' | 'none';

export interface MapMarker {
	id: string;
	type: MarkerType;
	name: string;
	lat: number;
	lng: number;
	description: string;
	rank: string;
	faction: FactionId;
	lore: string;
	boss?: string;
	rewards?: string;
}

export interface FactionTerritory {
	id: FactionId;
	name: string;
	color: string;
	borderColor: string;
	path: string;
}

export const mapMarkers: MapMarker[] = [
	{
		id: 'tokyo',
		type: 'safe',
		name: 'Tokyo',
		lat: 35.6,
		lng: 139.7,
		description: 'Premier Éveil 2031 — QG Asie',
		rank: 'Tous rangs',
		faction: 'ordre',
		lore: 'Berceau du Premier Éveil, Tokyo est la ville la mieux défendue du monde. Le Bureau Shinsei y a établi son quartier général asiatique. Les Corrompus n\'ont jamais réussi à y pénétrer depuis la grande bataille de 2031. Des milliers d\'Éveillés en formation peuplent ses rues.',
	},
	{
		id: 'paris',
		type: 'safe',
		name: 'Paris',
		lat: 48.8,
		lng: 2.3,
		description: 'QG européen du Bureau Shinsei',
		rank: 'Tous rangs',
		faction: 'ordre',
		lore: 'Paris abrite le commandement européen du Bureau Shinsei depuis 2033. La Tour Eiffel, reconvertie en antenne de détection des failles, surveille un rayon de 500km. L\'Ordre y maintient une garnison permanente de Transcendants.',
	},
	{
		id: 'new-york',
		type: 'safe',
		name: 'New York',
		lat: 40.7,
		lng: -74.0,
		description: 'Forteresse de l\'Ordre — Rang A minimum',
		rank: 'Transcendant+',
		faction: 'ordre',
		lore: 'Manhattan est encerclé d\'un champ de force maintenu par 12 Éveillés en rotation permanente. Y accéder requiert le rang Transcendant minimum. C\'est ici que sont pris les décisions stratégiques mondiales de l\'Ordre.',
	},
	{
		id: 'seoul',
		type: 'safe',
		name: 'Séoul',
		lat: 37.5,
		lng: 127.0,
		description: 'Centre de recherche Failles',
		rank: 'Éveillé+',
		faction: 'ordre',
		lore: 'Le plus grand laboratoire de recherche sur les failles dimensionnelles. Des scientifiques Éveillés y étudient les énergies des Corrompus pour développer de nouvelles compétences. Les archives de Séoul contiennent les données de chaque faille jamais observée.',
	},
	{
		id: 'abime',
		type: 'rift',
		name: 'Faille de l\'Abîme',
		lat: 0,
		lng: -30,
		description: 'RANG SS — Raid requis',
		rank: 'Abyssal SS',
		faction: 'none',
		lore: 'La plus grande faille jamais recensée, ouverte en plein Atlantique en 2035. Aucun Éveillé sous le rang SS n\'en est revenu vivant. Les profondeurs de cette faille semblent mener vers une dimension entière peuplée de Corrompus Souverains.',
		boss: 'Le Roi de l\'Abîme — Corrompu Souverain de rang inconnu',
		rewards: 'Équipement légendaire de rang SS, titre "Conquérant de l\'Abîme", compétence secrète'
	},
	{
		id: 'pacifique',
		type: 'rift',
		name: 'Faille du Pacifique',
		lat: 30,
		lng: 170,
		description: 'RANG S — Zone de guerre',
		rank: 'Souverain+',
		faction: 'fractures',
		lore: 'Cette faille instable au cœur du Pacifique est une zone de guerre permanente entre l\'Ordre et les Fracturés, qui tentent d\'y extraire des cristaux de puissance. Les Nomades rôdent en périphérie pour voler les ressources des deux camps.',
		boss: 'Titanosire Pacifique — Corrompu de rang S',
		rewards: 'Cristaux d\'énergie Rang S, équipement Souverain, XP massive'
	},
	{
		id: 'alpes',
		type: 'rift',
		name: 'Faille des Alpes',
		lat: 46,
		lng: 8,
		description: 'RANG B — Territoire Nomades',
		rank: 'Briseur+',
		faction: 'nomades',
		lore: 'Nichée dans les Alpes suisses, cette faille de taille modeste est le territoire traditionnel des Nomades. Ils l\'exploitent méthodiquement, en échange d\'un accès contrôlé aux autres Éveillés. La beauté des montagnes contraste avec l\'horreur des Corrompus qui en émergent.',
		boss: 'Avalanche Corrompue — Boss élite Rang B',
		rewards: 'Équipement Fléau, recettes de craft Nomade, réputation faction'
	},
	{
		id: 'siberie',
		type: 'rift',
		name: 'Faille de Sibérie',
		lat: 65,
		lng: 105,
		description: 'RANG INCONNU — Inexplorée',
		rank: 'Inconnu',
		faction: 'none',
		lore: 'Découverte en 2036 par un satellite militaire, cette faille n\'a jamais été approchée. Les cinq équipes d\'exploration envoyées ont toutes disparu sans laisser de trace. Les capteurs indiquent une énergie d\'une magnitude sans précédent. Le Bureau Shinsei a classifié cette zone comme interdite.',
		boss: '???',
		rewards: '???'
	},
	{
		id: 'sahara',
		type: 'rift',
		name: 'Faille du Sahara',
		lat: 20,
		lng: 20,
		description: 'RANG A — Contrôlée Fracturés',
		rank: 'Transcendant+',
		faction: 'fractures',
		lore: 'Les Fracturés ont établi un camp permanent autour de cette faille saharienne. Ils y mènent des expériences interdites sur des Corrompus capturés vivants, cherchant à comprendre — et s\'approprier — la source de leurs pouvoirs. L\'Ordre surveille mais n\'a pas encore osé attaquer.',
		boss: 'Seigneur du Désert — Corrompu de rang A évoluant',
		rewards: 'Données d\'expérimentation Fracturés, équipement Transcendant, accès aux zones Fracturés'
	}
];
