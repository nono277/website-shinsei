# TODO — Onglet Analytics (panel admin)

L'onglet `/admin/analytics` est en place et fonctionnel, mais la majorité des sections
affichent des **0** car le plugin Minecraft n'expose pas encore ces événements.
Ce document liste, section par section, ce qu'il faut ajouter côté plugin (Java) pour
que les vrais chiffres remplacent les 0 — et ce qu'il faut ajouter côté site pour les recevoir.

Le code du site est déjà prêt à recevoir ces données : il suffira d'éditer les fonctions
marquées `TODO` dans `src/lib/server/analytics/mock.ts` et `src/lib/server/analytics/real.ts`,
sans toucher aux composants `.svelte`.

---

## Déjà branché sur de vraies données (rien à faire)

- **Rétention J+1/J+7/J+30** + entonnoir "Nouveaux joueurs / Revenus le lendemain / Revenus après 7 jours" → calculés depuis `login_events` (connexions site), déjà en base.
- **Classes — nombre de picks + XP moyenne** → agrégés depuis `GET /leaderboard` (déjà utilisé par `/classement`), champ `classe` par joueur.
- **Failles ouvertes** (compteur courant) → `GET /stats`, champ `failles` (déjà utilisé par le panel admin existant).
- **Fiche joueur — classe, faction, grade, niveau, XP, PvP kills, donjons/failles terminés, temps de jeu** → `GET /player/:username` (déjà utilisé par `/profil`).
- **Fiche joueur — timeline de connexions** → `login_events` (site) + `mc_join_events` (serveur), déjà en base.

---

## Reste à faire côté plugin

### 1. Durée de session (Section "Temps de session")

Le plugin ne remonte que les connexions (`/players/online`), jamais les déconnexions avec durée. Pour calculer un temps de session réel, il faut que le plugin pousse un événement à la déconnexion.

**Nouvel endpoint à créer côté site** (pas encore fait) : `POST /api/plugin/session`
```json
{
  "username": "NomDuJoueur",
  "uuid": "uuid-du-joueur",
  "connectedAt": 1730000000000,
  "disconnectedAt": 1730000900000
}
```
Le plugin appelle cette URL à chaque déconnexion de joueur (event `PlayerQuitEvent` côté Java), avec le timestamp de connexion et de déconnexion en millisecondes epoch.

**Côté site à créer :** table SQLite `session_events(username, uuid, connected_at, disconnected_at)` + remplacer `generateSessionStats()` dans `mock.ts` par un calcul réel (moyenne, répartition par tranche 0-5/5-15/15-30/30-60/1h+) sur cette table.

### 2. Classe — temps de jeu par classe, morts, suppressions/recréations

`/leaderboard` et `/player/:username` donnent la classe **actuelle** d'un joueur, mais pas :
- le temps de jeu cumulé *dans cette classe précise* (playTime est global, pas par classe),
- le nombre de morts (aucun champ mort n'existe côté plugin),
- les changements/suppressions de personnage (aucun historique).

**Endpoints à ajouter côté plugin :**
```
GET /classes/stats
[
  { "classe": "hunter", "avgPlaytimeMinutes": 340, "deaths": 12 },
  { "classe": "titan", "avgPlaytimeMinutes": 512, "deaths": 40 },
  ...
]
```
```
GET /classes/deletions-count?since=<timestamp>
{ "count": 7 }
```
(ou un simple événement `POST /analytics/class-reset` à chaque suppression de perso, agrégé côté site).

**Côté site :** compléter `fetchClassStats()` dans `real.ts` pour appeler `/classes/stats`, et une nouvelle fonction pour `deletionsRecreations`.

### 3. Quêtes (Section 6) — aucune donnée aujourd'hui

Il faut que le plugin logge, pour chaque quête et chaque joueur : début, abandon (déconnexion/reset sans complétion), et fin.

**Endpoint proposé :**
```
GET /quests/stats
[
  {
    "name": "Réveil à Tokyo",
    "startedCount": 128,
    "abandonedCount": 40,
    "avgCompletionMinutes": 22,
    "avgProgressPercent": 65
  },
  ...
]
```
Le plus simple côté plugin : un événement à chaque changement d'état de quête (`start`, `abandon`, `complete`) poussé vers `POST /analytics/quest-event` sur le site, qui fait l'agrégation lui-même. Évite de recalculer des moyennes côté Java à chaque requête.

**Côté site :** nouvelle table `quest_events(quest_name, username, event_type, ts)`, remplacer `generateQuests()` par une vraie agrégation SQL.

### 4. Failles / donjons — détail des runs (Section 7)

Aujourd'hui seul le compteur courant "failles ouvertes" est réel (`/stats`). Il manque un historique par run pour calculer :
- temps moyen avant ouverture,
- temps moyen de complétion,
- taux de réussite,
- nombre moyen de joueurs par run.

**Endpoint proposé :**
```
POST /analytics/dungeon-run
{
  "dungeonId": "faille-42",
  "openedAt": 1730000000000,
  "closedAt": 1730001800000,
  "success": true,
  "playerCount": 4
}
```
Envoyé par le plugin à la fermeture de chaque faille/donjon. Le site agrège lui-même moyenne, taux de réussite, etc.

**Côté site :** table `dungeon_runs(id, opened_at, closed_at, success, player_count)`, remplacer `fetchDungeonStats()` (le champ `totalOpened` restera basé sur `/stats`, les 4 autres champs viendront de cette nouvelle table).

### 5. Points d'abandon (Section 4 — Churn) et Heatmap (Section 8)

Les deux nécessitent la même chose : que le plugin sache situer un joueur dans le monde (zone logique ou coordonnées) au moment où il quitte / meurt / visite.

**Pour le churn (par étape du parcours, pas de coordonnées) :**
```
POST /analytics/checkpoint-exit
{ "username": "...", "checkpoint": "premiere_faille", "leftAt": 1730000000000 }
```
Le plugin envoie ceci quand un joueur se déconnecte sans avoir dépassé une étape clé (spawn, tutoriel, quête 1, quête 2, première faille, premier boss, niveau 10).

**Pour la heatmap (coordonnées) :**
```
POST /analytics/world-event
{ "type": "death" | "exit" | "visit", "x": 123, "y": 64, "z": -45, "zone": "faille_abyssale", "ts": 1730000000000 }
```
Envoyé à chaque mort, déconnexion, ou passage dans une zone. Peut être throttlé côté plugin (ex: 1 event "visit" par joueur par zone toutes les 60s max) pour ne pas spammer.

**Côté site :** deux tables (`churn_events`, `world_events`), remplacer `generateChurn()` et `generateHeatmap()` par de vraies agrégations. Le découpage `x/y` en grille (actuellement 10×6 fictif dans `HeatmapAnalytics.gridWidth/gridHeight`) devra correspondre au système de coordonnées réel du monde (à définir ensemble selon la taille de la carte).

---

## Résumé — priorité suggérée

1. **Rétention/session_events (déconnexion)** — le plus simple à mettre en place (un seul événement, gain immédiat sur la section 2).
2. **Quêtes** — impact direct sur la rétention (permet de voir où les joueurs bloquent).
3. **Failles/donjons détaillés** — bon indicateur d'équilibrage.
4. **Classes (morts, temps par classe, suppressions)** — utile mais moins urgent.
5. **Heatmap/coordonnées** — le plus lourd à instrumenter, à faire en dernier.

---

## Ce qui est terminé

- [x] Page `/admin/analytics` avec les 14 sections demandées, design identique au panel existant
- [x] Rétention J+1/J+7/J+30 réelle (login_events)
- [x] Entonnoir : nouveaux joueurs + retours J+1/J+7 réels
- [x] Classes : picks + XP moyenne réels (`/leaderboard`)
- [x] Failles ouvertes (compteur courant) réel (`/stats`)
- [x] Fiche joueur avec vraies stats (`/player/:username`) + vraie timeline de connexions
- [x] Alertes automatiques (seuils rétention/quêtes/classes/session)
- [x] Export CSV / JSON / Excel
- [x] Comparaison de périodes (aujourd'hui/hier/7j/30j/90j)
- [ ] Durée de session réelle
- [ ] Quêtes réelles
- [ ] Détail des runs de failles/donjons
- [ ] Morts/temps de jeu par classe, suppressions de perso
- [ ] Churn par checkpoint réel
- [ ] Heatmap avec vraies coordonnées
