import type { Priority, SortMode, Status } from './types';

export type Lang = 'fr' | 'en';

export interface Dict {
  common: {
    loading: string;
    unknownBrand: string;
    inProgressDefaultTime: string;
    close: string;
  };
  login: {
    tagline: string;
    checkEmailTitle: string;
    codeSentToPrefix: string;
    codeLabel: string;
    codePlaceholder: string;
    verifying: string;
    signIn: string;
    changeEmail: string;
    resendCode: string;
    emailLabel: string;
    emailPlaceholder: string;
    sending: string;
    receiveCode: string;
    noPassword: string;
  };
  nav: {
    collection: string;
    wishlist: string;
  };
  home: {
    menuExporting: string;
    menuExport: string;
    menuImport: string;
    menuSignOut: string;
    menuLanguage: string;
    statInProgress: string;
    statDone: string;
    statPieces: string;
    statHours: string;
    searchPlaceholder: string;
    filterAll: string;
    empty: string;
    pieces: (n: number) => string;
  };
  wishlist: {
    title: string;
    count: (n: number) => string;
    priorityBadge: (label: string) => string;
    empty: string;
    pieces: (n: number) => string;
  };
  detail: {
    deleteConfirm: (label: string, name: string) => string;
    thisPuzzle: string;
    thisWish: string;
    difficulty: string;
    finishedOn: string;
    timeSpent: string;
    personalNote: string;
    whyIWantIt: string;
    markAsBought: string;
    deleteAction: (label: string) => string;
    notRatedYet: string;
    pieces: (n: number) => string;
  };
  add: {
    editTitle: string;
    addTitle: string;
    tabCollection: string;
    tabWishlist: string;
    eanLabel: string;
    eanPlaceholder: string;
    search: string;
    eanNotFound: string;
    nameLabel: string;
    namePlaceholder: string;
    brandLabel: string;
    brandPlaceholder: string;
    piecesLabel: string;
    piecesPlaceholder: string;
    genreLabel: string;
    newGenrePlaceholder: string;
    newGenreButton: string;
    statusLabel: string;
    ratingLabel: string;
    finishedOnLabel: string;
    timeSpentLabel: string;
    timeSpentPlaceholder: string;
    priorityLabel: string;
    notesLabelCollection: string;
    notesLabelWishlist: string;
    notesPlaceholder: string;
    saveEdit: string;
    save: string;
  };
  legacyImport: {
    foundTitle: string;
    foundBody: string;
    importButton: string;
    skip: string;
    importing: string;
    doneTitle: string;
    doneBody: (p: number, w: number, ph: number) => string;
    continue: string;
  };
  imageSlot: {
    loading: string;
    saveError: string;
    readError: string;
    photoPlaceholder: string;
    puzzlePhotoPlaceholder: string;
    addPhotoPlaceholder: string;
  };
  app: {
    authLoading: string;
    confirmSignOut: string;
    confirmImportBackup: string;
    importBackupDone: (p: number, w: number, ph: number) => string;
    importBackupError: string;
  };
  status: Record<Status, string>;
  priority: Record<Priority, string>;
  sort: Record<SortMode, string>;
}

const fr: Dict = {
  common: {
    loading: 'Chargement...',
    unknownBrand: 'Éditeur inconnu',
    inProgressDefaultTime: 'en cours',
    close: 'Fermer',
  },
  login: {
    tagline: 'Ta collection, synchronisée partout',
    checkEmailTitle: 'Vérifie ta boîte mail',
    codeSentToPrefix: 'On a envoyé un code à ',
    codeLabel: 'Code de connexion',
    codePlaceholder: 'Code reçu par email',
    verifying: 'Vérification...',
    signIn: 'Se connecter',
    changeEmail: "Modifier l'adresse email",
    resendCode: 'Renvoyer le code',
    emailLabel: 'Ton adresse email',
    emailPlaceholder: 'toi@exemple.com',
    sending: 'Envoi...',
    receiveCode: 'Recevoir le code',
    noPassword: 'Pas de mot de passe : tu reçois un code par email pour te connecter.',
  },
  nav: {
    collection: 'Collection',
    wishlist: 'Envies',
  },
  home: {
    menuExporting: 'Export en cours...',
    menuExport: 'Exporter mes données',
    menuImport: 'Importer une sauvegarde',
    menuSignOut: 'Se déconnecter',
    menuLanguage: '🌐 English',
    statInProgress: 'en cours',
    statDone: 'terminés',
    statPieces: 'pièces',
    statHours: 'heures',
    searchPlaceholder: 'Chercher un puzzle...',
    filterAll: 'Tous',
    empty: 'Aucun puzzle trouvé 🥲',
    pieces: (n) => `${n} pièces`,
  },
  wishlist: {
    title: 'Ma Wishlist 💗',
    count: (n) => `${n} puzzle(s) à s'offrir`,
    priorityBadge: (label) => `Envie ${label}`,
    empty: "Ta liste d'envies est vide pour l'instant 💭",
    pieces: (n) => `${n} pièces`,
  },
  detail: {
    deleteConfirm: (label, name) => `Supprimer ${label} "${name}" ? Cette action est définitive.`,
    thisPuzzle: 'ce puzzle',
    thisWish: 'cette envie',
    difficulty: 'Difficulté',
    finishedOn: 'Terminé le',
    timeSpent: 'Temps passé',
    personalNote: 'Note perso',
    whyIWantIt: 'Pourquoi je le veux',
    markAsBought: '🛒 Marquer comme acheté',
    deleteAction: (label) => `🗑️ Supprimer ${label}`,
    notRatedYet: 'Pas encore noté',
    pieces: (n) => `${n} pièces`,
  },
  add: {
    editTitle: 'Modifier',
    addTitle: 'Ajouter un puzzle',
    tabCollection: '🧩 Collection',
    tabWishlist: '💗 Wishlist',
    eanLabel: 'Code-barre EAN',
    eanPlaceholder: 'ex. 4005556916539',
    search: 'Rechercher',
    eanNotFound: 'Puzzle introuvable pour ce code. Vérifie-le ou remplis le formulaire à la main.',
    nameLabel: 'Nom du puzzle',
    namePlaceholder: 'ex. Lavande en Provence',
    brandLabel: 'Éditeur',
    brandPlaceholder: 'Ravensburger...',
    piecesLabel: 'Pièces',
    piecesPlaceholder: '1000',
    genreLabel: 'Genre',
    newGenrePlaceholder: 'Nom du genre',
    newGenreButton: '+ Nouveau',
    statusLabel: 'Statut',
    ratingLabel: 'Évaluation',
    finishedOnLabel: 'Terminé le',
    timeSpentLabel: 'Temps passé',
    timeSpentPlaceholder: 'ex. 18h30',
    priorityLabel: "Priorité d'envie",
    notesLabelCollection: 'Note perso',
    notesLabelWishlist: 'Pourquoi je le veux',
    notesPlaceholder: 'Un petit mot sur ce puzzle...',
    saveEdit: 'Enregistrer les modifications',
    save: 'Enregistrer',
  },
  legacyImport: {
    foundTitle: 'Données trouvées sur cet appareil',
    foundBody:
      "On a trouvé des puzzles enregistrés localement avant la synchronisation. Tu veux les importer dans ton compte ?",
    importButton: 'Importer mes données',
    skip: 'Ignorer',
    importing: 'Import en cours...',
    doneTitle: 'Import terminé',
    doneBody: (p, w, ph) => `${p} puzzle(s), ${w} envie(s) et ${ph} photo(s) importés.`,
    continue: 'Continuer',
  },
  imageSlot: {
    loading: 'Chargement...',
    saveError: "Impossible d'enregistrer cette photo : le stockage de l'appareil est plein.",
    readError: 'Impossible de lire cette photo.',
    photoPlaceholder: 'photo',
    puzzlePhotoPlaceholder: 'photo du puzzle',
    addPhotoPlaceholder: 'ajouter une photo',
  },
  app: {
    authLoading: 'Chargement...',
    confirmSignOut: 'Se déconnecter ?',
    confirmImportBackup:
      "Importer ce fichier de sauvegarde ? Les puzzles et envies qu'il contient seront ajoutés à ta collection actuelle (rien n'est supprimé ni remplacé).",
    importBackupDone: (p, w, ph) => `Import terminé : ${p} puzzle(s), ${w} envie(s) et ${ph} photo(s) ajouté(s).`,
    importBackupError: "Impossible de lire ce fichier. Vérifie que c'est bien un export JSON de l'application.",
  },
  status: {
    todo: 'À faire',
    in_progress: 'En cours',
    done: 'Terminé',
  },
  priority: {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
  },
  sort: {
    recent: 'Récent',
    alphabetical: 'Alphabétique',
    pieces: 'Pièces',
    difficulty: 'Difficulté',
  },
};

const en: Dict = {
  common: {
    loading: 'Loading...',
    unknownBrand: 'Unknown publisher',
    inProgressDefaultTime: 'in progress',
    close: 'Close',
  },
  login: {
    tagline: 'Your collection, synced everywhere',
    checkEmailTitle: 'Check your inbox',
    codeSentToPrefix: 'We sent a code to ',
    codeLabel: 'Sign-in code',
    codePlaceholder: 'Code received by email',
    verifying: 'Verifying...',
    signIn: 'Sign in',
    changeEmail: 'Change email address',
    resendCode: 'Resend code',
    emailLabel: 'Your email address',
    emailPlaceholder: 'you@example.com',
    sending: 'Sending...',
    receiveCode: 'Get the code',
    noPassword: "No password: you'll get a code by email to sign in.",
  },
  nav: {
    collection: 'Collection',
    wishlist: 'Wishlist',
  },
  home: {
    menuExporting: 'Exporting...',
    menuExport: 'Export my data',
    menuImport: 'Import a backup',
    menuSignOut: 'Sign out',
    menuLanguage: '🌐 Français',
    statInProgress: 'in progress',
    statDone: 'done',
    statPieces: 'pieces',
    statHours: 'hours',
    searchPlaceholder: 'Search a puzzle...',
    filterAll: 'All',
    empty: 'No puzzle found 🥲',
    pieces: (n) => `${n} pieces`,
  },
  wishlist: {
    title: 'My Wishlist 💗',
    count: (n) => `${n} puzzle(s) to get`,
    priorityBadge: (label) => `${label} priority`,
    empty: 'Your wishlist is empty for now 💭',
    pieces: (n) => `${n} pieces`,
  },
  detail: {
    deleteConfirm: (label, name) => `Delete ${label} "${name}"? This action is permanent.`,
    thisPuzzle: 'this puzzle',
    thisWish: 'this wish',
    difficulty: 'Difficulty',
    finishedOn: 'Finished on',
    timeSpent: 'Time spent',
    personalNote: 'Personal note',
    whyIWantIt: 'Why I want it',
    markAsBought: '🛒 Mark as bought',
    deleteAction: (label) => `🗑️ Delete ${label}`,
    notRatedYet: 'Not rated yet',
    pieces: (n) => `${n} pieces`,
  },
  add: {
    editTitle: 'Edit',
    addTitle: 'Add a puzzle',
    tabCollection: '🧩 Collection',
    tabWishlist: '💗 Wishlist',
    eanLabel: 'EAN barcode',
    eanPlaceholder: 'e.g. 4005556916539',
    search: 'Search',
    eanNotFound: "No puzzle found for this code. Double-check it or fill in the form manually.",
    nameLabel: 'Puzzle name',
    namePlaceholder: 'e.g. Lavender Fields',
    brandLabel: 'Publisher',
    brandPlaceholder: 'Ravensburger...',
    piecesLabel: 'Pieces',
    piecesPlaceholder: '1000',
    genreLabel: 'Genre',
    newGenrePlaceholder: 'Genre name',
    newGenreButton: '+ New',
    statusLabel: 'Status',
    ratingLabel: 'Rating',
    finishedOnLabel: 'Finished on',
    timeSpentLabel: 'Time spent',
    timeSpentPlaceholder: 'e.g. 18h30',
    priorityLabel: 'Wish priority',
    notesLabelCollection: 'Personal note',
    notesLabelWishlist: 'Why I want it',
    notesPlaceholder: 'A quick note about this puzzle...',
    saveEdit: 'Save changes',
    save: 'Save',
  },
  legacyImport: {
    foundTitle: 'Data found on this device',
    foundBody: 'We found puzzles saved locally before sync was set up. Want to import them into your account?',
    importButton: 'Import my data',
    skip: 'Skip',
    importing: 'Importing...',
    doneTitle: 'Import complete',
    doneBody: (p, w, ph) => `${p} puzzle(s), ${w} wish(es) and ${ph} photo(s) imported.`,
    continue: 'Continue',
  },
  imageSlot: {
    loading: 'Loading...',
    saveError: "Couldn't save this photo: the device storage is full.",
    readError: "Couldn't read this photo.",
    photoPlaceholder: 'photo',
    puzzlePhotoPlaceholder: 'puzzle photo',
    addPhotoPlaceholder: 'add a photo',
  },
  app: {
    authLoading: 'Loading...',
    confirmSignOut: 'Sign out?',
    confirmImportBackup:
      "Import this backup file? The puzzles and wishes it contains will be added to your current collection (nothing is deleted or replaced).",
    importBackupDone: (p, w, ph) => `Import complete: ${p} puzzle(s), ${w} wish(es) and ${ph} photo(s) added.`,
    importBackupError: "Couldn't read this file. Make sure it's a JSON export from the app.",
  },
  status: {
    todo: 'To do',
    in_progress: 'In progress',
    done: 'Done',
  },
  priority: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  },
  sort: {
    recent: 'Recent',
    alphabetical: 'Alphabetical',
    pieces: 'Pieces',
    difficulty: 'Difficulty',
  },
};

export const translations: Record<Lang, Dict> = { fr, en };

export function detectLang(): Lang {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'fr';
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
