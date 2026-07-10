// Structures d'analytics sans source de donnée réelle pour l'instant.
// Chaque fonction retourne la forme exacte définie dans $lib/types/analytics.ts,
// avec des valeurs à 0 tant que le plugin Minecraft n'expose pas ces événements.
// TODO: brancher sur l'API du plugin Minecraft dès qu'elle exposera ces données
// (session start/end, quêtes, morts par zone, coordonnées de mort/sortie).

import type { SessionAnalytics, ChurnAnalytics, QuestAnalytics, HeatmapAnalytics } from '$lib/types/analytics';

export function generateSessionStats(): SessionAnalytics {
	const labels = ['0-5 min', '5-15 min', '15-30 min', '30-60 min', '1h+'];
	return {
		avgFirstSessionMinutes: 0,
		avgLoyalSessionMinutes: 0,
		avgBeforeDisconnectMinutes: 0,
		distribution: labels.map((label) => ({ label, count: 0 })),
	};
}

export function generateChurn(): ChurnAnalytics {
	const locations = ['Spawn', 'Tutoriel', 'Quête 1', 'Quête 2', 'Première faille', 'Premier boss', 'Niveau 10'];
	return {
		points: locations.map((location) => ({ location, count: 0, percent: 0, previousPercent: 0 })),
	};
}

export function generateQuests(): QuestAnalytics {
	const names = [
		'Réveil à Tokyo',
		"L'appel de la faille",
		'Le Corrompu errant',
		'Écho du passé',
		'Chasse aux ombres',
		'Le Gardien scellé',
		"Vestiges d'Arcane",
		'La dernière lueur',
	];
	return {
		quests: names.map((name) => ({
			name,
			startedCount: 0,
			abandonedCount: 0,
			avgCompletionMinutes: 0,
			avgProgressPercent: 0,
		})),
	};
}

export function generateHeatmap(): HeatmapAnalytics {
	const gridWidth = 10;
	const gridHeight = 6;
	const zones = [
		'Tokyo — Spawn',
		'District Est',
		'Zone Industrielle',
		'Souterrains',
		'Ruines Corrompues',
		'Faille Abyssale',
	];

	const grid = [];
	for (let y = 0; y < gridHeight; y++) {
		for (let x = 0; x < gridWidth; x++) {
			const zoneIndex = Math.min(zones.length - 1, Math.floor((x / gridWidth) * zones.length));
			grid.push({ x, y, zoneName: zones[zoneIndex], visits: 0, deaths: 0, exits: 0 });
		}
	}

	return { grid, gridWidth, gridHeight };
}
