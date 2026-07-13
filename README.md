# Mes Puzzles

Application de suivi de collection de puzzles : gérez votre collection, votre wishlist, et le détail de chaque puzzle (photos, note, temps passé, difficulté).

## Stack

- React + TypeScript
- Vite
- [Supabase](https://supabase.com) : authentification (code à 6 chiffres par email), base de données (Postgres) et stockage des photos. Le front-end reste 100% statique (déployable sur GitHub Pages) et parle directement à Supabase depuis le navigateur.

## Configuration Supabase (une seule fois)

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. Ouvre **SQL Editor** dans le dashboard du projet, colle le contenu de `supabase/schema.sql` et exécute-le. Ça crée les tables `puzzles` / `wishlist_items`, les policies de sécurité (chaque utilisateur ne voit que ses propres données), et le bucket de stockage `photos`.
3. Va dans **Authentication > URL Configuration** et ajoute l'URL de ton site (ex. `https://<user>.github.io/puzzle-tracker/` et `http://localhost:5173/` pour le dev local) dans **Redirect URLs**.
4. Récupère l'URL et la clé publique (`anon` / `public`) du projet dans **Project Settings > API**.
5. La connexion se fait avec un code à 6 chiffres reçu par email (plus fiable qu'un lien magique — notamment dans l'app Android, où cliquer un lien depuis l'email ouvre le navigateur au lieu de l'appli). Pour que le code apparaisse dans l'email, va dans **Authentication > Email Templates > Magic Link** et ajoute `{{ .Token }}` dans le template, par exemple :
   ```html
   <h2>Ton code de connexion</h2>
   <p>Entre ce code dans l'application : <strong>{{ .Token }}</strong></p>
   ```

Si tu avais déjà exécuté `schema.sql` avant l'ajout des genres personnalisés, exécute aussi `supabase/migrations/0002_free_genre.sql` pour lever la contrainte qui limitait les genres à une liste fixe.

Si tu avais déjà exécuté `schema.sql` avant le support multi-genres, exécute aussi `supabase/migrations/0003_multi_genre.sql` pour passer d'un genre unique à plusieurs genres par puzzle (les données existantes sont conservées).

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

- **Connexion** : code à 6 chiffres par email, pas de mot de passe. Chaque compte a sa propre collection privée.
- **Collection** : recherche, filtres par genre, tri (récent / alphabétique / pièces / difficulté).
- **Wishlist** : liste d'envies avec priorité, bouton "Marquer comme acheté" qui transfère l'item vers la collection.
- **Détail** : notation, difficulté, galerie avant/pendant/après, note personnelle, date de fin (calendrier).
- **Ajout / modification** : formulaire unique pour ajouter ou modifier un puzzle, dans la collection ou la wishlist.
- **Photos** : cliquez sur n'importe quel emplacement photo pour importer une image depuis votre appareil ; stockées dans Supabase Storage, synchronisées entre appareils.
- **Import des anciennes données** : si l'appli détecte des données enregistrées localement avant la mise en place des comptes, elle propose de les importer automatiquement après la première connexion.
- **Installable (PWA)** : sur Android/Chrome, menu ⋮ > "Ajouter à l'écran d'accueil" (ou bannière d'installation automatique) pour avoir une icône et une appli plein écran, sans passer par le Play Store.

## APK Android (sideload, sans Play Store)

Le dossier `android/` (généré par [Capacitor](https://capacitorjs.com)) enveloppe l'appli dans une coquille native Android, avec l'appli web bundlée en local (l'appareil n'a donc pas besoin d'internet pour charger l'interface, seulement pour parler à Supabase). Il produit un vrai `.apk` à installer directement sur un téléphone (sideload), sans jamais publier sur le Play Store.

Le build se fait via GitHub Actions (`.github/workflows/build-android.yml`), pas en local, car il nécessite le SDK Android + Gradle.

**Configuration (une seule fois)** — ajoute ces secrets dans **Settings > Secrets and variables > Actions** du repo :

- `ANDROID_KEYSTORE_BASE64` — le contenu encodé en base64 du fichier de clé de signature
- `ANDROID_KEYSTORE_PASSWORD` — son mot de passe

(les valeurs t'ont été fournies séparément — garde le fichier `.keystore` original en lieu sûr : sans lui, impossible de publier une mise à jour sous la même identité d'appli)

**Pour builder l'APK** : onglet **Actions** du repo > workflow **"Build Android APK"** > **Run workflow**. Une fois terminé, télécharge l'artifact `mes-puzzles-apk` depuis la page du run, transfère l'APK sur ton téléphone et installe-le (Android demandera d'autoriser l'installation depuis cette source la première fois).

Pour rebuilder l'APK avec le contenu web à jour (nouvelles fonctionnalités), relance simplement le workflow — il reconstruit l'appli web et la re-bundle à chaque run.
