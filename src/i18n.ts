import type { PieceBucket, Priority, SortMode, Status } from './types';

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
  onboarding: {
    skip: string;
    next: string;
    start: string;
    collectionTitle: string;
    collectionBody: string;
    wishlistTitle: string;
    wishlistBody: string;
    shareTitle: string;
    shareBody: string;
  };
  nav: {
    collection: string;
    wishlist: string;
  };
  home: {
    menuExporting: string;
    menuExport: string;
    menuImport: string;
    menuShare: string;
    menuStats: string;
    menuAchievements: string;
    menuChampionships: string;
    menuSettings: string;
    menuSignOut: string;
    menuLanguage: string;
    menuThemeAuto: string;
    menuThemeLight: string;
    menuThemeDark: string;
    menuGoPremium: string;
    statInProgress: string;
    statDone: string;
    statPieces: string;
    statHours: string;
    searchPlaceholder: string;
    filterAll: string;
    empty: string;
    pieces: (n: number) => string;
    ownerFilterMine: string;
    ownerFilterOf: (pseudo: string) => string;
  };
  wishlist: {
    title: string;
    count: (n: number) => string;
    priorityBadge: (label: string) => string;
    empty: string;
    pieces: (n: number) => string;
    ownerFilterMine: string;
    ownerFilterOf: (pseudo: string) => string;
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
    progressPhotos: string;
    markAsBought: string;
    addToMyWishlist: string;
    deleteAction: (label: string) => string;
    notRatedYet: string;
    pieces: (n: number) => string;
    illustratedBy: (artist: string) => string;
  };
  stats: {
    title: string;
    empty: string;
    recapTitle: string;
    scopeYear: string;
    scopeAll: string;
    finished: string;
    pieces: string;
    hours: string;
    trendTitle: string;
    monthDetailTitle: (month: string) => string;
    byBrandTitle: string;
    byDifficultyTitle: string;
    otherBrand: string;
    paceTitle: string;
    averageTimePerPuzzle: string;
    averageTimeByPieces: string;
    pieceViewExact: string;
    pieceViewBucket: string;
    premiumLockTitle: string;
    premiumLockBody: string;
  };
  add: {
    editTitle: string;
    addTitle: string;
    tabCollection: string;
    tabWishlist: string;
    eanLabel: string;
    eanPlaceholder: string;
    search: string;
    searching: string;
    scanButton: string;
    eanNotFound: string;
    nameLabel: string;
    nameRequired: string;
    namePlaceholder: string;
    brandLabel: string;
    brandPlaceholder: string;
    artistLabel: string;
    artistPlaceholder: string;
    newArtistOption: (name: string) => string;
    piecesLabel: string;
    piecesPlaceholder: string;
    genreLabel: string;
    genreRequired: string;
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
    exportDone: string;
    updateDownloaded: string;
    updateRestart: string;
  };
  status: Record<Status, string>;
  priority: Record<Priority, string>;
  sort: Record<SortMode, string>;
  pieceBucket: Record<PieceBucket, string>;
  filters: {
    button: string;
    reset: string;
    statusLabel: string;
    brandLabel: string;
    artistLabel: string;
    piecesLabel: string;
    ratingLabel: string;
    sortLabel: string;
    ratingAtLeast: (n: number) => string;
    seeResults: (n: number) => string;
  };
  share: {
    title: string;
    pseudoLabel: string;
    pseudoPlaceholder: string;
    pseudoSave: string;
    pseudoSaved: string;
    pseudoRequiredHint: string;
    inviteTitle: string;
    inviteEmailPlaceholder: string;
    shareCollectionLabel: string;
    shareWishlistLabel: string;
    atLeastOneRequiredHint: string;
    inviteButton: string;
    inviteError: string;
    invitedListTitle: string;
    invitedEmpty: string;
    removeConfirm: (email: string) => string;
    sharedWithMeTitle: string;
    sharedWithMeEmpty: string;
    sharedWithMeHint: string;
  };
  premium: {
    limitTitle: string;
    limitBodyCollection: (limit: number) => string;
    limitBodyWishlist: (limit: number) => string;
    limitClose: string;
    purchaseButton: (price: string) => string;
    purchaseButtonGeneric: string;
    purchasing: string;
    purchaseSuccess: string;
    purchaseError: string;
    restoreMenuLabel: string;
    restoreDone: string;
    restoreError: string;
    screenTitle: string;
    heroTagline: string;
    benefitCollectionTitle: string;
    benefitCollectionBody: (limit: number) => string;
    benefitWishlistTitle: string;
    benefitWishlistBody: (limit: number) => string;
    benefitStatsTitle: string;
    benefitStatsBody: string;
    alreadyPremiumTitle: string;
    alreadyPremiumBody: string;
    seeDetails: string;
  };
  settings: {
    title: string;
  };
  achievements: {
    title: string;
    subtitle: string;
    progress: (current: number | string, target: number | string) => string;
    tierBronze: string;
    tierSilver: string;
    tierGold: string;
    tierPlatinum: string;
    nextTier: (tierName: string) => string;
    maxedOut: string;
    notUnlocked: string;
    collectorTitle: string;
    collectorBody: string;
    marathonTitle: string;
    marathonBody: string;
    dedicatedTitle: string;
    dedicatedBody: string;
    superfanTitle: string;
    superfanBody: string;
    eclecticTitle: string;
    eclecticBody: string;
    demandingTitle: string;
    demandingBody: string;
    toastTitle: string;
    toastBody: (badgeTitle: string, tierName: string) => string;
  };
  championships: {
    title: string;
    subtitle: string;
    liveBanner: (title: string) => string;
    liveBadge: string;
    upcomingLabel: string;
    pastLabel: string;
    showPast: string;
    hidePast: string;
    empty: string;
    seeStream: string;
    moreInfo: string;
    daysUntil: (n: number) => string;
  };
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
  onboarding: {
    skip: 'Passer',
    next: 'Suivant',
    start: 'Commencer',
    collectionTitle: 'Ta collection en un clin d’œil',
    collectionBody:
      'Note tes puzzles terminés, en cours ou à faire, avec photo, note, difficulté et temps passé.',
    wishlistTitle: 'Ne perds plus tes envies',
    wishlistBody: 'Garde une liste de puzzles à acheter, classée par priorité.',
    shareTitle: 'Partage & statistiques',
    shareBody: 'Partage ta collection avec tes proches et suis tes stats de progression.',
  },
  nav: {
    collection: 'Collection',
    wishlist: 'Envies',
  },
  home: {
    menuExporting: 'Export en cours...',
    menuExport: 'Exporter mes données',
    menuImport: 'Importer une sauvegarde',
    menuShare: 'Partager ma collection',
    menuStats: 'Statistiques',
    menuAchievements: 'Succès',
    menuChampionships: 'Championnats',
    menuSettings: 'Réglages',
    menuSignOut: 'Se déconnecter',
    menuLanguage: '🌐 English',
    menuThemeAuto: 'Thème : Auto',
    menuThemeLight: 'Thème : Clair',
    menuThemeDark: 'Thème : Sombre',
    menuGoPremium: 'Passer premium',
    statInProgress: 'en cours',
    statDone: 'terminés',
    statPieces: 'pièces',
    statHours: 'heures',
    searchPlaceholder: 'Chercher un puzzle...',
    filterAll: 'Tous',
    empty: 'Aucun puzzle trouvé 🥲',
    pieces: (n) => `${n} pièces`,
    ownerFilterMine: 'Mes puzzles',
    ownerFilterOf: (pseudo) => `Puzzles de ${pseudo}`,
  },
  wishlist: {
    title: 'Ma Wishlist 💗',
    count: (n) => `${n} puzzle(s) à s'offrir`,
    priorityBadge: (label) => `Envie ${label}`,
    empty: "Ta liste d'envies est vide pour l'instant 💭",
    pieces: (n) => `${n} pièces`,
    ownerFilterMine: 'Mes envies',
    ownerFilterOf: (pseudo) => `Envies de ${pseudo}`,
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
    progressPhotos: 'Photos de progression',
    markAsBought: '🛒 Marquer comme acheté',
    addToMyWishlist: '💌 Ajouter à ma liste d\'envies',
    deleteAction: (label) => `🗑️ Supprimer ${label}`,
    notRatedYet: 'Pas encore noté',
    pieces: (n) => `${n} pièces`,
    illustratedBy: (artist) => `Illustration de ${artist}`,
  },
  stats: {
    title: 'Statistiques',
    empty: 'Ajoute des puzzles à ta collection pour voir tes statistiques.',
    recapTitle: 'Récapitulatif',
    scopeYear: 'Cette année',
    scopeAll: 'Tout',
    finished: 'terminés',
    pieces: 'pièces',
    hours: 'heures',
    trendTitle: 'Puzzles terminés par mois',
    monthDetailTitle: (month) => `Terminés en ${month}`,
    byBrandTitle: 'Par marque',
    byDifficultyTitle: 'Par difficulté',
    otherBrand: 'Autres',
    paceTitle: 'Rythme',
    averageTimePerPuzzle: 'Temps moyen par puzzle',
    averageTimeByPieces: 'Temps moyen par nombre de pièces',
    pieceViewExact: 'Exact',
    pieceViewBucket: 'Par tranche',
    premiumLockTitle: 'Statistique premium',
    premiumLockBody: 'Passe premium pour débloquer cette statistique.',
  },
  add: {
    editTitle: 'Modifier',
    addTitle: 'Ajouter un puzzle',
    tabCollection: '🧩 Collection',
    tabWishlist: '💗 Wishlist',
    eanLabel: 'Code-barre EAN',
    eanPlaceholder: 'ex. 4005556916539',
    search: 'Rechercher',
    searching: 'Recherche en cours...',
    scanButton: 'Scanner le code-barre',
    eanNotFound: 'Puzzle introuvable pour ce code. Vérifie-le ou remplis le formulaire à la main.',
    nameLabel: 'Nom du puzzle',
    nameRequired: 'Le nom est requis.',
    namePlaceholder: 'ex. Lavande en Provence',
    brandLabel: 'Éditeur',
    brandPlaceholder: 'Ravensburger...',
    artistLabel: 'Artiste (optionnel)',
    artistPlaceholder: 'ex. Thomas Kinkade',
    newArtistOption: (name) => `+ Ajouter « ${name} »`,
    piecesLabel: 'Pièces',
    piecesPlaceholder: '1000',
    genreLabel: 'Genre',
    genreRequired: 'Sélectionne au moins un genre.',
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
    exportDone: 'Fichier enregistré dans Documents.',
    updateDownloaded: 'Mise à jour téléchargée',
    updateRestart: 'Redémarrer',
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
  pieceBucket: {
    lt500: '< 500',
    '500-999': '500-999',
    '1000-1999': '1000-1999',
    gte2000: '2000+',
  },
  filters: {
    button: 'Filtres',
    reset: 'Réinitialiser',
    statusLabel: 'Statut',
    brandLabel: 'Marque',
    artistLabel: 'Artiste',
    piecesLabel: 'Pièces',
    ratingLabel: 'Note minimum',
    sortLabel: 'Trier par',
    ratingAtLeast: (n) => (n >= 5 ? '★ 5' : `★ ${n}+`),
    seeResults: (n) => `Voir ${n} puzzle${n === 1 ? '' : 's'}`,
  },
  share: {
    title: 'Partage',
    pseudoLabel: 'Ton pseudo',
    pseudoPlaceholder: 'Comment les autres te verront',
    pseudoSave: 'Enregistrer',
    pseudoSaved: 'Pseudo enregistré.',
    pseudoRequiredHint: "Choisis d'abord un pseudo pour pouvoir inviter quelqu'un.",
    inviteTitle: "Inviter quelqu'un (lecture seule)",
    inviteEmailPlaceholder: 'email@exemple.com',
    shareCollectionLabel: 'Ma collection',
    shareWishlistLabel: 'Ma wishlist',
    atLeastOneRequiredHint: 'Coche au moins une des deux.',
    inviteButton: 'Inviter',
    inviteError: "Impossible d'inviter cette adresse (déjà invitée ?).",
    invitedListTitle: 'Personnes invitées',
    invitedEmpty: "Tu n'as invité personne pour l'instant.",
    removeConfirm: (email) => `Retirer l'accès de ${email} ?`,
    sharedWithMeTitle: 'Partagé avec moi',
    sharedWithMeEmpty: "Personne n'a encore partagé sa collection ou sa wishlist avec toi.",
    sharedWithMeHint: "Utilise le filtre en haut de ta collection ou de ta wishlist pour voir ce que quelqu'un a partagé.",
  },
  premium: {
    limitTitle: 'Limite atteinte',
    limitBodyCollection: (limit) => `Ta collection gratuite est limitée à ${limit} puzzles. Passe premium pour la rendre illimitée.`,
    limitBodyWishlist: (limit) =>
      `Ta liste d'envies gratuite est limitée à ${limit} puzzles. Passe premium pour la rendre illimitée.`,
    limitClose: "Compris",
    purchaseButton: (price) => `Débloquer Premium — ${price}`,
    purchaseButtonGeneric: 'Débloquer Premium',
    purchasing: 'Achat en cours...',
    purchaseSuccess: 'Merci pour ton achat ! Premium sera actif dans quelques instants.',
    purchaseError: "L'achat n'a pas pu aboutir. Réessaie plus tard.",
    restoreMenuLabel: 'Restaurer mes achats',
    restoreDone: 'Achats restaurés. Si tu avais déjà Premium, ce sera actif sous peu.',
    restoreError: 'Impossible de restaurer les achats pour le moment.',
    screenTitle: 'Premium',
    heroTagline: 'Débloque tout le potentiel de Mes Puzzles.',
    benefitCollectionTitle: 'Collection illimitée',
    benefitCollectionBody: (limit) => `Ajoute autant de puzzles que tu veux (gratuit : ${limit} max).`,
    benefitWishlistTitle: "Liste d'envies illimitée",
    benefitWishlistBody: (limit) => `Note toutes tes envies sans limite (gratuit : ${limit} max).`,
    benefitStatsTitle: 'Statistiques avancées',
    benefitStatsBody: 'Répartition par marque, par difficulté, et ton rythme de montage.',
    alreadyPremiumTitle: 'Tu es déjà Premium !',
    alreadyPremiumBody: 'Merci pour ton soutien — profite de toutes les fonctionnalités sans limite.',
    seeDetails: 'Voir tous les avantages',
  },
  settings: {
    title: 'Réglages',
  },
  achievements: {
    title: 'Succès',
    subtitle: 'Débloque des paliers en avançant dans ta collection.',
    progress: (current, target) => `${current} / ${target}`,
    tierBronze: 'Bronze',
    tierSilver: 'Argent',
    tierGold: 'Or',
    tierPlatinum: 'Platine',
    nextTier: (tierName) => `Prochain palier : ${tierName}`,
    maxedOut: 'Palier maximum atteint !',
    notUnlocked: 'Pas encore débloqué',
    collectorTitle: 'Collectionneur',
    collectorBody: 'Termine des puzzles pour progresser.',
    marathonTitle: 'Marathon',
    marathonBody: 'Assemble des pièces au total.',
    dedicatedTitle: 'Assidu',
    dedicatedBody: 'Cumule du temps de montage.',
    superfanTitle: 'Fan absolu',
    superfanBody: 'Assemble plusieurs puzzles du même artiste.',
    eclecticTitle: 'Éclectique',
    eclecticBody: 'Termine un puzzle dans chaque catégorie.',
    demandingTitle: 'Exigeant',
    demandingBody: 'Note des puzzles 5 étoiles.',
    toastTitle: 'Succès débloqué !',
    toastBody: (badgeTitle, tierName) => `${badgeTitle} — ${tierName}`,
  },
  championships: {
    title: 'Championnats',
    subtitle: 'Les grands événements de puzzle à ne pas manquer.',
    liveBanner: (title) => `En direct : ${title}`,
    liveBadge: 'En direct',
    upcomingLabel: 'À venir',
    pastLabel: 'Événements passés',
    showPast: 'Voir les événements passés',
    hidePast: 'Masquer les événements passés',
    empty: 'Aucun championnat à venir pour le moment.',
    seeStream: 'Voir le stream',
    moreInfo: "Plus d'infos",
    daysUntil: (n) => (n === 0 ? "Aujourd'hui" : n === 1 ? 'Dans 1 jour' : `Dans ${n} jours`),
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
  onboarding: {
    skip: 'Skip',
    next: 'Next',
    start: 'Get started',
    collectionTitle: 'Your collection at a glance',
    collectionBody: 'Track finished, in-progress, and to-do puzzles, with a photo, rating, difficulty, and time spent.',
    wishlistTitle: "Never lose track of what you want",
    wishlistBody: 'Keep a wishlist of puzzles to buy, sorted by priority.',
    shareTitle: 'Share & track your stats',
    shareBody: 'Share your collection with friends and family, and follow your progress over time.',
  },
  nav: {
    collection: 'Collection',
    wishlist: 'Wishlist',
  },
  home: {
    menuExporting: 'Exporting...',
    menuExport: 'Export my data',
    menuImport: 'Import a backup',
    menuShare: 'Share my collection',
    menuStats: 'Statistics',
    menuAchievements: 'Achievements',
    menuChampionships: 'Championships',
    menuSettings: 'Settings',
    menuSignOut: 'Sign out',
    menuLanguage: '🌐 Français',
    menuThemeAuto: 'Theme: Auto',
    menuThemeLight: 'Theme: Light',
    menuThemeDark: 'Theme: Dark',
    menuGoPremium: 'Go Premium',
    statInProgress: 'in progress',
    statDone: 'done',
    statPieces: 'pieces',
    statHours: 'hours',
    searchPlaceholder: 'Search a puzzle...',
    filterAll: 'All',
    empty: 'No puzzle found 🥲',
    pieces: (n) => `${n} pieces`,
    ownerFilterMine: 'My puzzles',
    ownerFilterOf: (pseudo) => `${pseudo}'s puzzles`,
  },
  wishlist: {
    title: 'My Wishlist 💗',
    count: (n) => `${n} puzzle(s) to get`,
    priorityBadge: (label) => `${label} priority`,
    empty: 'Your wishlist is empty for now 💭',
    pieces: (n) => `${n} pieces`,
    ownerFilterMine: 'My wishlist',
    ownerFilterOf: (pseudo) => `${pseudo}'s wishlist`,
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
    progressPhotos: 'Progress photos',
    markAsBought: '🛒 Mark as bought',
    addToMyWishlist: '💌 Add to my wishlist',
    deleteAction: (label) => `🗑️ Delete ${label}`,
    notRatedYet: 'Not rated yet',
    pieces: (n) => `${n} pieces`,
    illustratedBy: (artist) => `Illustrated by ${artist}`,
  },
  stats: {
    title: 'Statistics',
    empty: 'Add puzzles to your collection to see your statistics.',
    recapTitle: 'Recap',
    scopeYear: 'This year',
    scopeAll: 'All time',
    finished: 'finished',
    pieces: 'pieces',
    hours: 'hours',
    trendTitle: 'Puzzles finished per month',
    monthDetailTitle: (month) => `Finished in ${month}`,
    byBrandTitle: 'By brand',
    byDifficultyTitle: 'By difficulty',
    otherBrand: 'Other',
    paceTitle: 'Pace',
    averageTimePerPuzzle: 'Average time per puzzle',
    averageTimeByPieces: 'Average time by piece count',
    pieceViewExact: 'Exact',
    pieceViewBucket: 'By range',
    premiumLockTitle: 'Premium stat',
    premiumLockBody: 'Go premium to unlock this stat.',
  },
  add: {
    editTitle: 'Edit',
    addTitle: 'Add a puzzle',
    tabCollection: '🧩 Collection',
    tabWishlist: '💗 Wishlist',
    eanLabel: 'EAN barcode',
    eanPlaceholder: 'e.g. 4005556916539',
    search: 'Search',
    searching: 'Searching...',
    scanButton: 'Scan barcode',
    eanNotFound: "No puzzle found for this code. Double-check it or fill in the form manually.",
    nameLabel: 'Puzzle name',
    nameRequired: 'Name is required.',
    namePlaceholder: 'e.g. Lavender Fields',
    brandLabel: 'Publisher',
    brandPlaceholder: 'Ravensburger...',
    artistLabel: 'Artist (optional)',
    artistPlaceholder: 'e.g. Thomas Kinkade',
    newArtistOption: (name) => `+ Add "${name}"`,
    piecesLabel: 'Pieces',
    piecesPlaceholder: '1000',
    genreLabel: 'Genre',
    genreRequired: 'Select at least one genre.',
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
    exportDone: 'File saved to Documents.',
    updateDownloaded: 'Update downloaded',
    updateRestart: 'Restart',
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
  pieceBucket: {
    lt500: '< 500',
    '500-999': '500-999',
    '1000-1999': '1000-1999',
    gte2000: '2000+',
  },
  filters: {
    button: 'Filters',
    reset: 'Reset',
    statusLabel: 'Status',
    brandLabel: 'Brand',
    artistLabel: 'Artist',
    piecesLabel: 'Pieces',
    ratingLabel: 'Minimum rating',
    sortLabel: 'Sort by',
    ratingAtLeast: (n) => (n >= 5 ? '★ 5' : `★ ${n}+`),
    seeResults: (n) => `See ${n} puzzle${n === 1 ? '' : 's'}`,
  },
  share: {
    title: 'Share',
    pseudoLabel: 'Your nickname',
    pseudoPlaceholder: 'How others will see you',
    pseudoSave: 'Save',
    pseudoSaved: 'Nickname saved.',
    pseudoRequiredHint: 'Pick a nickname first so you can invite someone.',
    inviteTitle: 'Invite someone (read-only)',
    inviteEmailPlaceholder: 'email@example.com',
    shareCollectionLabel: 'My collection',
    shareWishlistLabel: 'My wishlist',
    atLeastOneRequiredHint: 'Check at least one of the two.',
    inviteButton: 'Invite',
    inviteError: 'Could not invite this address (already invited?).',
    invitedListTitle: 'Invited people',
    invitedEmpty: "You haven't invited anyone yet.",
    removeConfirm: (email) => `Remove access for ${email}?`,
    sharedWithMeTitle: 'Shared with me',
    sharedWithMeEmpty: "No one has shared their collection or wishlist with you yet.",
    sharedWithMeHint: "Use the filter at the top of your collection or wishlist to see what someone has shared.",
  },
  premium: {
    limitTitle: 'Limit reached',
    limitBodyCollection: (limit) => `Your free collection is limited to ${limit} puzzles. Go premium to make it unlimited.`,
    limitBodyWishlist: (limit) => `Your free wishlist is limited to ${limit} puzzles. Go premium to make it unlimited.`,
    limitClose: 'Got it',
    purchaseButton: (price) => `Unlock Premium — ${price}`,
    purchaseButtonGeneric: 'Unlock Premium',
    purchasing: 'Purchasing...',
    purchaseSuccess: "Thanks for your purchase! Premium will be active in a moment.",
    purchaseError: 'The purchase could not go through. Please try again later.',
    restoreMenuLabel: 'Restore purchases',
    restoreDone: "Purchases restored. If you already had Premium, it'll be active shortly.",
    restoreError: 'Could not restore purchases right now.',
    screenTitle: 'Premium',
    heroTagline: 'Unlock the full potential of Mes Puzzles.',
    benefitCollectionTitle: 'Unlimited collection',
    benefitCollectionBody: (limit) => `Add as many puzzles as you want (free: ${limit} max).`,
    benefitWishlistTitle: 'Unlimited wishlist',
    benefitWishlistBody: (limit) => `Track every wish, no limit (free: ${limit} max).`,
    benefitStatsTitle: 'Advanced statistics',
    benefitStatsBody: 'Breakdown by brand, by difficulty, and your solving pace.',
    alreadyPremiumTitle: "You're already Premium!",
    alreadyPremiumBody: 'Thanks for your support — enjoy every feature with no limits.',
    seeDetails: 'See all benefits',
  },
  settings: {
    title: 'Settings',
  },
  achievements: {
    title: 'Achievements',
    subtitle: 'Unlock tiers as you grow your collection.',
    progress: (current, target) => `${current} / ${target}`,
    tierBronze: 'Bronze',
    tierSilver: 'Silver',
    tierGold: 'Gold',
    tierPlatinum: 'Platinum',
    nextTier: (tierName) => `Next tier: ${tierName}`,
    maxedOut: 'Top tier reached!',
    notUnlocked: 'Not unlocked yet',
    collectorTitle: 'Collector',
    collectorBody: 'Finish puzzles to progress.',
    marathonTitle: 'Marathon',
    marathonBody: 'Assemble pieces in total.',
    dedicatedTitle: 'Dedicated',
    dedicatedBody: 'Log solving time.',
    superfanTitle: 'Superfan',
    superfanBody: 'Finish several puzzles by the same artist.',
    eclecticTitle: 'Eclectic',
    eclecticBody: 'Finish a puzzle in every category.',
    demandingTitle: 'Demanding',
    demandingBody: 'Rate puzzles 5 stars.',
    toastTitle: 'Achievement unlocked!',
    toastBody: (badgeTitle, tierName) => `${badgeTitle} — ${tierName}`,
  },
  championships: {
    title: 'Championships',
    subtitle: "The big jigsaw puzzle events you shouldn't miss.",
    liveBanner: (title) => `Live now: ${title}`,
    liveBadge: 'Live',
    upcomingLabel: 'Upcoming',
    pastLabel: 'Past events',
    showPast: 'Show past events',
    hidePast: 'Hide past events',
    empty: 'No upcoming championships for now.',
    seeStream: 'Watch the stream',
    moreInfo: 'More info',
    daysUntil: (n) => (n === 0 ? 'Today' : n === 1 ? 'In 1 day' : `In ${n} days`),
  },
};

export const translations: Record<Lang, Dict> = { fr, en };

export function detectLang(): Lang {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'fr';
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
