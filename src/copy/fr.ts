import type { Difficulty } from "../utils/difficulties/utils.ts";
import type { Operation } from "../utils/operations/utils.ts";
import type { Copy } from "./copy.ts";

// French (France), with "tu". Neutral for the child (never "prêt/prête", "fort/forte"); Faísca is "Faísca", a he.
// French typography: a no-break space (U+00A0) before ! ? : ; and inside « », and the apostrophe ’.

const operationNames: Record<Operation, string> = {
    addition: "Addition",
    subtraction: "Soustraction",
    multiplication: "Multiplication",
    division: "Division"
};

// Inside a sentence, with the article: "essayer l’addition", "s’entraîner à la soustraction".
const operationNamesWithArticle: Record<Operation, string> = {
    addition: "l’addition",
    subtraction: "la soustraction",
    multiplication: "la multiplication",
    division: "la division"
};

const operationPluralNames: Record<Operation, string> = {
    addition: "additions",
    subtraction: "soustractions",
    multiplication: "multiplications",
    division: "divisions"
};

const difficultyNames: Record<Difficulty, string> = {
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile"
};

const columnNames: string[] = ["unités", "dizaines", "centaines", "milliers"];

const countDirection = (isForward: boolean): string => (isForward ? "en avançant" : "en reculant");

export const fr: Copy = {
    tagline: "Fais briller ton talent !",
    welcomeQuestion: "Salut ! Je suis Faísca. Comment tu t’appelles ?",
    greeting: (name) => `Salut, ${name} ! On s’entraîne à quoi aujourd’hui ?`,

    praises: ["Très bien !", "Bravo ! Tu as trouvé !", "C’est ça !", "Excellent !", "Tu progresses !"],
    tryAgains: ["Presque ! Essaie encore.", "Pas encore. Réessaie !", "Hmm, presque ! On regarde encore une fois ?"],
    tryAgainColumns: (wrongColumnCount) =>
        wrongColumnCount === 1 ? "Presque ! Regarde la colonne en couleur et essaie encore." : "Presque ! Regarde les colonnes en couleur et essaie encore.",
    rightAtRetry: "Bravo ! Cette fois, tu as trouvé !",
    rightAtSecondTry: "Bravo ! Trouvé au deuxième essai !",
    almost: "Presque !",
    rightAnswer: (answer) => `La bonne réponse est ${answer}.`,
    retryAhead: "On la refera un peu plus tard.",
    retryNextTime: "On la refera la prochaine fois.",
    coinMilestone: "Tu as gagné une pièce !",
    levelUpMilestone: (level) => `Tu passes au niveau ${level} !`,

    operationNames,
    mixName: "Mélange",
    difficultyNames,
    difficultyRange: (limit) => `jusqu’à ${limit}`,
    difficultyTables: "tables",
    difficultyExample: (example) => `comme ${example}`,
    layoutNames: { result: "Juste le résultat", vertical: "En colonnes" },
    modeNames: { direct: "Directes seules", mixed: "Directes + inverses" },
    skillNames: {
        "no-carry": "Sans retenue",
        carry: "Une retenue",
        "chain-carry": "Plusieurs retenues",
        "no-borrow": "Sans retenue",
        borrow: "Avec retenue",
        "borrow-across-zero": "Retenue à travers un zéro",
        "no-remainder": "Sans reste en chemin",
        remainder: "Avec reste en chemin",
        "zero-in-quotient": "Zéro dans le résultat"
    },
    masteryNames: ["À découvrir", "Ça commence", "On apprend", "Ça progresse", "Presque maîtrisé", "Maîtrisé"],
    levelName: (level) => `Niveau ${level}`,
    operationSummary: (difficultyName, level) => `${difficultyName} · niveau ${level}`,
    playProblemMix: (minimumOperations) => `Choisis au moins ${minimumOperations} opérations à mélanger.`,
    playProblemTables: "Choisis au moins une table.",

    spokenAddition: (left, right) => `Combien font ${left} plus ${right} ?`,
    spokenSubtraction: (left, right) => `Combien font ${left} moins ${right} ?`,
    spokenMultiplication: (left, right) => `Combien font ${left} fois ${right} ?`,
    spokenDivision: (left, right) => `Combien font ${left} divisé par ${right} ?`,
    spokenMissingLeft: (right, result) => `Quel nombre fois ${right} donne ${result} ?`,
    spokenMissingRight: (left, result) => `${left} fois quel nombre donne ${result} ?`,
    cellLabel: (column, digit) => `Case des ${columnNames[column]}${digit === null ? ", vide" : ` : ${digit}`}`,

    helpLimit: (maximumHelps) => `Tu as déjà utilisé les ${maximumHelps} aides de cette partie.`,
    helpNoCoins: (answersPerCoin) => `La tirelire est vide. Toutes les ${answersPerCoin} bonnes réponses, tu gagnes une pièce !`,
    choiceHint: "J’ai enlevé deux réponses. C’est l’une de celles-ci !",
    hintSplit: (firstStep, nextStep) => `Indice : ${firstStep}. Maintenant ${nextStep}.`,
    hintPartialSum: (firstStep, rest) => `Indice : ${firstStep}. Maintenant ajoute ${rest}.`,
    hintPartialDivision: (firstStep, rest) => `Indice : ${firstStep}. Maintenant fais ${rest} et ajoute.`,
    hintRound: (firstStep, zeros) => `Indice : ${firstStep}. Maintenant ajoute ${zeros === 1 ? "un zéro" : `${zeros} zéros`}.`,
    hintCount: (start, steps, isForward) => `Indice : commence à ${start} et compte ${steps} ${countDirection(isForward)}.`,
    hintCountTens: (start, tens, isForward) =>
        `Indice : commence à ${start} et compte ${tens === 1 ? "1 dizaine" : `${tens} dizaines`} ${countDirection(isForward)}.`,
    hintNeighbour: (fact) => `Indice : ${fact}`,
    verticalEmpty: "Cette case reste vide. Tu peux déjà valider !",
    verticalDigit: (column, digit) => `Aux ${columnNames[column]}, écris ${digit}.`,
    verticalCarryOnly: "Ici, il n’y a que la retenue de 1.",
    verticalCarry: (top, bottom) => `N’oublie pas la retenue de 1 : ${top} + ${bottom} + 1.`,
    verticalColumn: (column, calculation) => `Maintenant, les ${columnNames[column]} : ${calculation}.`,
    verticalBorrow: (top, workingTop, bottom) => `Le ${top} devient ${workingTop}. Maintenant fais ${workingTop} − ${bottom}.`,

    sessionEnd: "Belle partie ! À la prochaine !",
    summaryPerfect: "Parfait ! Tu as tout trouvé !",
    summaryGreat: "Très bien ! Tu progresses !",
    summaryGood: "Bel entraînement ! Chaque partie aide à apprendre.",
    nothingToReinforce: "Aucun calcul à revoir. Fantastique !",
    helpedCount: (count) => `${count} avec aide`,
    unlockTitle: "Défi débloqué !",
    unlockText: (operation, difficulty, detail) =>
        `Tu peux maintenant essayer ${operationNamesWithArticle[operation]} en ${difficultyNames[difficulty]}, avec des calculs ${detail}.`,
    unlockAccept: (difficulty) => `Essayer en ${difficultyNames[difficulty]}`,
    unlockDecline: "Pas maintenant",
    safetyNetTitle: "Pas facile, celle-là !",
    safetyNetText: (operation, difficulty) =>
        `Tu veux t’entraîner un peu à ${operationNamesWithArticle[operation]} en ${difficultyNames[difficulty]} ? Tu ne perds ni niveau ni pièces.`,
    safetyNetAccept: (difficulty) => `S’entraîner en ${difficultyNames[difficulty]}`,
    safetyNetDecline: "Continuer ici",
    unlockIntro: (nextDifficulty, playDifficulty) => `Pour débloquer ${difficultyNames[nextDifficulty]}, joue en ${difficultyNames[playDifficulty]} :`,
    unlockIntroAfter: (lockedDifficulty, nextDifficulty, playDifficulty) =>
        `${difficultyNames[lockedDifficulty]} vient après ${difficultyNames[nextDifficulty]}. Pour débloquer ${difficultyNames[nextDifficulty]}, joue en ${difficultyNames[playDifficulty]} :`,
    unlockAlmost: (nextDifficulty, playDifficulty) =>
        `Presque ! Termine une partie en ${difficultyNames[playDifficulty]} et ${difficultyNames[nextDifficulty]} se débloque.`,
    unlockLevelStep: (level) => `Atteins le niveau ${level}`,
    unlockCorrectStep: (correct, outOf) => `Réussis ${correct} calculs écrits sur ${outOf}`,
    unlockMissingAnswers: (count) => (count < 2 ? `Encore ${count} calcul.` : `Encore ${count} calculs.`),
    unlockDistinctStep: (count) => `Fais ${count} calculs différents`,

    clockDirectionNames: { up: "En avançant", down: "À rebours" },
    clockReferenceDefault: (minutes) => `${minutes} minutes`,
    clockReferenceRecord: "Ton record",
    clockOvertime: "temps en plus",
    clockCountdownFromRecord: (time) => `sur ton record ${time}`,
    clockCountdownFrom: (time) => `sur ${time}`,
    clockRecord: (time) => `record ${time}`,
    clockGoal: (time) => `objectif ${time}`,
    clockFirstRecord: "Premier record dans cette catégorie !",
    clockNewRecord: (previousTime) => `Nouveau record ! Avant, c’était ${previousTime}.`,
    clockBeaten: "Tu as battu le chrono !",
    clockBehindRecord: (extraTime, recordTime) => `Tu étais à ${extraTime} de ton record, ${recordTime}. Ce sera pour la prochaine fois !`,
    clockBehindDefault: (extraTime, minutes) => `${extraTime} de plus que les ${minutes} minutes. Ce sera pour la prochaine fois !`,
    clockYourRecord: (time) => `Ton record : ${time}.`,
    clockRecordsNeedPerfect: "Les records comptent quand tu trouves tout du premier coup.",
    recordVertical: "en colonnes",
    recordResult: "juste le résultat",
    recordTable: (table) => `table de ${table}`,
    recordTables: (tables) => `tables ${tables}`,
    recordWithInverse: "avec inverses",
    recordTyping: "en écrivant",

    challengeName: "Défi sans fin",
    challengeAbout: "Pour les adultes : toujours plus difficile et plus rapide, jusqu’à la première erreur.",
    challengeGreeting: "Jusqu’où peux-tu aller ?",
    challengeRules: (answersPerLevel, maxDigits) => [
        `Toutes les ${answersPerLevel} bonnes réponses, tu montes d’un niveau. On commence par des additions ; puis arrivent les soustractions, les multiplications et les divisions, et les nombres grandissent jusqu’à ${maxDigits} chiffres.`,
        "Chaque question a son propre temps, qui diminue à chaque niveau.",
        "Une mauvaise réponse ou le temps écoulé mettent fin au défi."
    ],
    challengeScore: (correctCount) => (correctCount < 2 ? `${correctCount} bonne réponse` : `${correctCount} bonnes réponses`),
    challengeForAdults: "Pour les adultes",
    challengeRecordSummary: (score) => `Record : ${score}`,
    challengeNoRecord: "Pas encore de record.",
    challengeYourRecord: (score) => `Ton record : ${score}.`,
    challengeLevelUpJoin: (level, operation) => `Niveau ${level} ! Maintenant, il y a aussi des ${operationPluralNames[operation]}.`,
    challengeLevelUpGrow: (level) => `Niveau ${level} ! Des nombres plus grands et moins de temps.`,
    challengeLevelUp: (level) => `Niveau ${level} !`,
    challengeTimeUp: "Le temps est écoulé !",
    challengeWrote: (answer) => `Tu as écrit ${answer}.`,
    challengeStopped: "Défi terminé.",
    challengeLevelReached: (level) => `Tu as atteint le niveau ${level}.`,

    factorGameName: "Trouve la multiplication",
    factorGameGreeting: "Je montre un nombre. Trouve une multiplication qui donne ce nombre !",
    factorGameAnyAnswer: "Touche deux nombres pour faire la multiplication. Beaucoup de nombres en ont plusieurs, et n’importe laquelle compte !",
    factorGameNeedsTable: (fromTable, toTable) => `Choisis au moins une table de ${fromTable} à ${toTable}.`,
    factorGameQuestion: (target) => `Quelle multiplication donne ${target} ?`,
    factorGameTryAgain: (first, second, product) => `Presque ! ${first} × ${second} font ${product}. Essaie encore.`,
    factorGameHint: (factor) => `Commence par ${factor}. Quel est l’autre nombre ?`,
    factorGameAlso: (multiplications) => `Ça marche aussi avec ${multiplications}.`,
    factorGameAnswers: (multiplications) => `Ça pouvait être ${multiplications}.`,

    coinsCount: (coins) => (coins < 2 ? `${coins} pièce` : `${coins} pièces`),
    coinProgress: (answers, answersPerCoin) => `${answers} sur ${answersPerCoin}`,
    piggyBankAbout: (answersPerCoin) => `Chaque aide coûte 1 pièce. Toutes les ${answersPerCoin} bonnes réponses, tu gagnes une nouvelle pièce.`,
    piggyBankFull: "Tirelire pleine !",
    storageNewerVersion: "Cette progression a été enregistrée par une version plus récente de Faísca. Ici, rien n’est enregistré.",
    storageNotSaved: "Attention : sur ce navigateur, ta progression n’est pas enregistrée.",
    progressCheerStart: "Chaque partie allume plus de cases. On y va ?",
    progressCheerKnown: (masteredCount) =>
        masteredCount < 2
            ? `Tu connais déjà ${masteredCount} calcul par cœur. Quelle fierté !`
            : `Tu connais déjà ${masteredCount} calculs par cœur. Quelle fierté !`,
    nameTooLong: (maximumLength) => `Le prénom peut avoir jusqu’à ${maximumLength} lettres.`,
    nameTaken: "Il y a déjà un profil avec ce prénom.",
    nameEmpty: "Écris ton prénom.",

    labels: {
        start: "Commencer",
        namePlaceholder: "Ton prénom",
        cancel: "Annuler",
        profiles: "Profils",
        whoIsPlaying: "Qui va jouer ?",
        newProfile: "Nouveau",
        newProfileName: "Prénom du nouveau profil",
        createProfile: "Créer le profil",
        deleteProfile: (name) => `Supprimer le profil « ${name} »`,
        deleteProfileQuestion: (name) => `Supprimer le profil « ${name} » et toute sa progression ?`,
        cannotUndo: "C’est définitif.",
        confirmDelete: "Oui, supprimer",
        language: "Langue",
        settings: "Réglages",

        install: "Installer",
        installTitle: "Mets Faísca sur l’écran d’accueil",
        installAbout: "Il s’ouvre comme une appli et marche sans Internet.",
        installShareTap: "Appuie sur",
        installShareName: "Partager (si tu ne le vois pas, il est dans le menu ⋯).",
        installShareAdd: "Choisis « Sur l’écran d’accueil ».",
        installBeforeStarting: "Fais-le avant de commencer :",
        installBeforeStartingWhy: "ce que tu fais ici ne passe pas dans l’appli.",
        installMenuTap: "Appuie sur le menu ⋮ du navigateur.",
        installMenuAdd: "Choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».",
        addToHomeScreen: "Mettre sur l’écran d’accueil",

        home: "Accueil",
        play: "Jouer",
        playAgain: "Rejouer",
        seeProgress: "Voir les progrès",
        advanced: "Avancé",
        whatToPractise: "On s’entraîne à quoi ?",
        seePiggyBank: "Voir la tirelire",
        piggyBank: "Tirelire",
        outOf: (total) => `sur ${total}`,
        nextCoin: (progress) => `Prochaine pièce : ${progress}`,

        moreOptions: "Plus d’options",
        difficultyQuestion: "Quelle difficulté ?",
        layoutQuestion: "Comment veux-tu faire les calculs ?",
        verticalExample: "Un nombre sous l’autre",
        tablesQuestion: "Quelles tables veux-tu travailler ?",
        tableName: (table) => `Table de ${table}`,
        modeQuestion: "Quels calculs veux-tu ?",
        alwaysTyped: "Toujours écrire la réponse",
        alwaysTypedAbout: "Sans choix multiple, même pour les nouveaux calculs.",
        mixQuestion: "Quelles opérations veux-tu mélanger ?",
        mixAbout: "Chaque opération garde la difficulté que tu as choisie pour elle.",
        locked: "À débloquer",
        clock: "Chrono",
        clockAbout: "Pour qui aime compter le temps. Rien ne presse !",
        clockDirectionQuestion: "Il compte comment ?",
        clockReferenceQuestion: "Contre quoi ?",
        noRecordYet: "Pas encore",

        exit: "Quitter",
        exitQuestion: "Tu veux quitter la partie ?",
        challengeExitQuestion: "Tu veux arrêter le défi ?",
        yes: "Oui",
        no: "Non",
        gotIt: "Compris",
        again: "Encore une fois",
        questionPosition: (position, total) => `Question ${position} sur ${total}`,
        gameProgress: "Progression de la partie",
        result: "Résultat",
        next: "Suivant",
        help: "Aide",
        moreHelp: "Plus d’aide",
        helpCost: "coûte 1 pièce",
        keypad: "Pavé numérique",
        erase: "Effacer",
        confirm: "Valider",
        noAnswerYet: "Pas encore de réponse",
        yourAnswer: (answer) => `Ta réponse : ${answer}`,
        chooseAnswer: "Choisis la réponse",
        chooseTwoNumbers: "Choisis deux nombres",

        correctAtFirstTry: "justes du premier coup",
        time: "Temps",
        achievements: "Réussites de la partie",
        coinsEarned: (coins) => (coins < 2 ? `Tu as gagné ${coins} pièce !` : `Tu as gagné ${coins} pièces !`),
        newRecord: "Nouveau record !",
        toPractiseMore: "À travailler encore",

        progressTitle: (name) => `Tes progrès, ${name}`,
        progressNumbers: "Tes progrès en chiffres",
        games: (count) => (count < 2 ? "partie" : "parties"),
        practiceDays: (count) => (count < 2 ? "jour d’entraînement" : "jours d’entraînement"),
        coins: (count) => (count < 2 ? "pièce" : "pièces"),
        daysInARow: (count) => (count < 2 ? "jour d’affilée" : "jours d’affilée"),
        records: "Records",
        noRecords: "Active le chrono et trouve tout du premier coup pour avoir ton premier record.",
        divisionUsesMap: "Les divisions travaillent les mêmes calculs que la grille de la multiplication.",
        factsKnown: (known, total) => `${known} sur ${total} calculs connus par cœur`,
        mapCaption: "Grille des tables : chaque case montre où tu en es pour chaque calcul.",
        legend: "Légende",
        levelProgress: (level) => `Progression du niveau ${level}`,

        lastQuestion: (equation) => `Le dernier calcul : ${equation}`,
        correctAnswers: (count) => (count < 2 ? "bonne réponse" : "bonnes réponses")
    }
};
