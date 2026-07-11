# Mes Puzzles

Application de suivi de collection de puzzles : gérez votre collection, votre wishlist, et le détail de chaque puzzle (photos, note, temps passé, difficulté).

## Stack

- React + TypeScript
- Vite
- [Supabase](https://supabase.com) : authentification (lien magique par email), base de données (Postgres) et stockage des photos. Le front-end reste 100% statique (déployable sur GitHub Pages) et parle directement à Supabase depuis le navigateur.

## Configuration Supabase (une seule fois)

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. Ouvre **SQL Editor** dans le dashboard du projet, colle le contenu de `supabase/schema.sql` et exécute-le. Ça crée les tables `puzzles` / `wishlist_items`, les policies de sécurité (chaque utilisateur ne voit que ses propres données), et le bucket de stockage `photos`.
3. Va dans **Authentication > URL Configuration** et ajoute l'URL de ton site (ex. `https://<user>.github.io/puzzle-tracker/` et `http://localhost:5173/` pour le dev local) dans **Redirect URLs**, pour que le lien magique reçu par email fonctionne.
4. Récupère l'URL et la clé publique (`anon` / `public`) du projet dans **Project Settings > API**.

## Variables d'environnement

Copie `.env.example` vers `.env.local` et renseigne les deux valeurs récupérées ci-dessus :

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta-clé-anon-publique
```

La clé `anon` est prévue pour être exposée côté client — la sécurité vient des policies (RLS) définies dans `supabase/schema.sql`, pas du secret de la clé.

Pour le déploiement GitHub Actions (`.github/workflows/deploy.yml`), ajoute les mêmes valeurs comme secrets du repo : **Settings > Secrets and variables > Actions > New repository secret**, avec exactement ces noms :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Développement

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Fonctionnalités

- **Connexion** : lien magique par email, pas de mot de passe. Chaque compte a sa propre collection privée.
- **Collection** : recherche, filtres par genre, tri (récent / alphabétique / pièces / difficulté).
- **Wishlist** : liste d'envies avec priorité, bouton "Marquer comme acheté" qui transfère l'item vers la collection.
- **Détail** : notation, difficulté, galerie avant/pendant/après, note personnelle, date de fin (calendrier).
- **Ajout / modification** : formulaire unique pour ajouter ou modifier un puzzle, dans la collection ou la wishlist.
- **Photos** : cliquez sur n'importe quel emplacement photo pour importer une image depuis votre appareil ; stockées dans Supabase Storage, synchronisées entre appareils.
- **Import des anciennes données** : si l'appli détecte des données enregistrées localement avant la mise en place des comptes, elle propose de les importer automatiquement après la première connexion.
