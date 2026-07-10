# Mes Puzzles

Application de suivi de collection de puzzles : gérez votre collection, votre wishlist, et le détail de chaque puzzle (photos, note, temps passé, difficulté).

## Stack

- React + TypeScript
- Vite
- Aucune dépendance backend : les données (collection, wishlist, photos) sont persistées dans `localStorage`.

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

- **Collection** : recherche, filtres par genre, tri (récent / alphabétique / pièces / difficulté).
- **Wishlist** : liste d'envies avec priorité, bouton "Marquer comme acheté" qui transfère l'item vers la collection.
- **Détail** : notation, difficulté, galerie avant/pendant/après, note personnelle.
- **Ajout** : formulaire unique pour ajouter un puzzle à la collection ou à la wishlist.
- **Photos** : cliquez sur n'importe quel emplacement photo pour importer une image depuis votre appareil.
