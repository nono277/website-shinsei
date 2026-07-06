# TODO — Système de vote

## Reste à faire

### Endpoint récompenses côté backend Minecraft

Le bouton "Réclamer" sur le site fonctionne et est sécurisé, mais les récompenses ne sont pas encore délivrées en jeu.

**Ce qu'il faut ajouter côté Java / plugin :**

Créer un endpoint HTTP sur le backend Minecraft :
```
POST http://play.playshinsei.fr:8080/vote/reward
Content-Type: application/json

{
  "username": "NomDuJoueur",
  "rewardId": "uuid-unique"
}
```

Quand cet endpoint reçoit la requête, exécuter les commandes en jeu :
- `+500 XP` par vote (×3 sites)
- `+250 Dollars` par vote (×3 sites)
- `+3 Éclats` par vote (×3 sites)
- `+1000 XP` bonus (all 3 voted)
- `+500 Dollars` bonus
- `+10 Éclats` bonus
- `+1 Clé de Vote` bonus

**Côté site web (déjà prêt) :**

Décommenter le bloc dans `src/routes/api/vote/claim/+server.ts` :

```typescript
// await fetch(`http://play.playshinsei.fr:8080/vote/reward`, {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ username: locals.user.username, rewardId }),
//   signal: AbortSignal.timeout(4000),
// });
```

---

## Ce qui est terminé

- [x] Page `/vote` avec les 3 sites
- [x] Vérification des votes via APIs officielles (minecraft-mp par username, top-serveurs par username, serveurs-minecraft.org par IP)
- [x] Countdown en temps réel (polling toutes les 5s après clic)
- [x] Barre de progression 3/3
- [x] Bouton Réclamer sécurisé (apparaît uniquement après confirmation des 3 sites)
- [x] Lien "Vote" dans la navbar
- [x] Backlink serveurs-minecraft.org dans le footer
- [x] Zéro configuration à faire sur les sites de vote
