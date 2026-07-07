# Système de vote — état & fonctionnement

_Remplace `VOTE_TODO.md` (l'endpoint récompenses backend est désormais fait)._
_Dernière mise à jour : 2026-07-07._

## Vue d'ensemble

Le joueur vote sur 4 sites partenaires → le site vérifie le vote → il peut **réclamer** ses récompenses,
créditées **en jeu** par le plugin `shinsei-core`. Un **classement des voteurs** est affiché sur `/vote`.

```
Navigateur ──vote──▶ site de vote officiel
    │
    │ (page /vote : polling /api/vote/status vérifie le vote via l'API du site)
    ▼
Site SvelteKit ──POST /vote/reward {username, rewardId, kind}──▶ shinsei-core (HTTP :8080)
    ▲                                                                   │ crédite XP/argent/éclats/clé
    └────────────── GET /vote/top (classement) ◀───────────────────────┘ + compteur de votes persistant
```

## Récompenses (calibrées anti-inflation)

Les votes sont **quotidiens et répétables** ; l'**argent** est la seule monnaie de **marché** → gardé bas
pour ne pas déséquilibrer l'économie.

| | Par vote confirmé (`kind=vote`) | Bonus 4/4 sites (`kind=bonus`) |
|---|---|---|
| ⚡ XP | 200 | +400 |
| 💰 Argent | 50 $ | +100 $ |
| 💎 Éclats | 3 | +8 |
| 🗝️ Clé de vote | — | +1 |

**Total si les 4 sites sont votés + réclamés : 1200 XP · 300 $ · 20 éclats · 1 clé.**
Réglable côté plugin dans `config.yml → vote-reward.per-vote` / `bonus` (relu au démarrage).
Affichage sur le site : `src/lib/data/vote-sites.ts → VOTE_REWARDS` (doit rester cohérent avec le plugin).

## Réclamation « dès un vote »

- Chaque vote confirmé sur un site compté crée **une récompense réclamable immédiatement** (plus besoin
  d'attendre les 4). Le **bonus** n'est ajouté qu'à la **transition** vers « les 4 sites votés »
  (pas à chaque re-vote d'un site déjà pris).
- Le bouton **Réclamer** apparaît dès qu'il y a ≥ 1 récompense en attente et crédite **toutes** les
  récompenses en attente ; chaque récompense a un `rewardId` **idempotent** côté plugin (aucun double crédit
  même en cas de retry). Les récompenses non livrées (backend injoignable) restent réclamables.

## Top voteurs

- Persisté côté plugin (`plugins/ShinseiCore/vote_rewards.yml → counts`) : **+1 par vote réclamé**.
- Exposé par `GET /vote/top?limit=N` → `[{username, votes}]` trié décroissant.
- Le site le proxifie via `/api/vote/top` et l'affiche en bas de `/vote` (podium 🥇🥈🥉, surlignage du joueur).

## Fichiers

**Site (`website shinsei`)**
- `src/routes/vote/+page.svelte` — page (cartes, progression, réclamation, **top voteurs**).
- `src/routes/api/vote/status/+server.ts` — vérifie les 4 sites (polling).
- `src/routes/api/vote/claim/+server.ts` — crédite chaque récompense en attente via le backend.
- `src/routes/api/vote/top/+server.ts` — proxy du classement.
- `src/lib/server/votes.ts` — état des votes + file de récompenses (`{id, kind}`).
- `src/lib/data/vote-sites.ts` — sites + montants affichés.
- `docker-compose.yml` — `ADDRESS_HEADER=x-forwarded-for` + `XFF_DEPTH=1` (voir « IP » ci-dessous).
- `.env` — `VOTE_REWARD_URL`, `VOTE_REWARD_TOKEN` (= `vote-reward.token` du plugin).

**Plugin (`shinsei-core`)**
- `manager/VoteRewardManager.java` — crédit, idempotence, file offline, compteur.
- `http/StatsHttpServer.java` — `POST /vote/reward`, `GET /vote/top`.
- `config.yml → vote-reward` — token, montants `per-vote`/`bonus`, `key-command`, `message`.

## ⚠️ Détection par IP (2 sites sur 4)

`minecraft-mp` et `top-serveurs` sont vérifiés par **pseudo** (fiable).
`serveurs-minecraft.org` et `serveursminecraft.org` sont vérifiés par **IP** (`getClientAddress()`).
Derrière un reverse-proxy, il faut que le site lise la **vraie IP** du client, sinon tous les joueurs
partagent l'IP du proxy → faux positifs / jamais mis à jour. D'où, dans `docker-compose.yml` :
`ADDRESS_HEADER=x-forwarded-for` + `XFF_DEPTH=1` (le proxy doit renvoyer l'en-tête).
**Cloudflare en tête → préférer `ADDRESS_HEADER=cf-connecting-ip`** (et retirer `XFF_DEPTH`).
En dev : `OVERRIDE_CLIENT_IP` dans `.env` pour tester.

## Déploiement

1. **Plugin** : `shinsei-core-1.0.0.jar` dans `plugins/` + **redémarrer** le serveur (code + config vote-reward).
2. **Site** : `docker compose up -d --build` (ou `npm run build`) pour appliquer la page /vote, les endpoints,
   les nouveaux montants et le fix IP. Vérifier que `.env` (token) est bien injecté dans le conteneur
   (`env_file: .env` dans le compose).
3. Le **token** doit être identique des deux côtés (`vote-reward.token` == `VOTE_REWARD_TOKEN`).
