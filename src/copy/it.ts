import type { Difficulty } from "../utils/difficulties/utils.ts";
import type { Operation } from "../utils/operations/utils.ts";
import type { Copy } from "./copy.ts";

// Italian, with "tu". Neutral for the child (never "bravo/brava", "pronto/pronta"); Faísca is a boy: "Sono Faísca".

const operationNames: Record<Operation, string> = {
    addition: "Addizione",
    subtraction: "Sottrazione",
    multiplication: "Moltiplicazione",
    division: "Divisione"
};

// Inside a sentence: "Ora puoi provare l'addizione".
const operationNamesWithArticle: Record<Operation, string> = {
    addition: "l'addizione",
    subtraction: "la sottrazione",
    multiplication: "la moltiplicazione",
    division: "la divisione"
};

const operationPluralNames: Record<Operation, string> = {
    addition: "addizioni",
    subtraction: "sottrazioni",
    multiplication: "moltiplicazioni",
    division: "divisioni"
};

const difficultyNames: Record<Difficulty, string> = {
    easy: "Facile",
    medium: "Medio",
    hard: "Difficile"
};

const columnNames: string[] = ["unità", "decine", "centinaia", "migliaia"];

const countDirection = (isForward: boolean): string => (isForward ? "in avanti" : "all'indietro");

// The article before a number follows how the number is said: "il 7", but "l'1" (uno), "l'8" (otto), "l'11" (undici).
// Right for every digit and every times table, which are the numbers that get one.
const isSaidWithVowel = (value: number): boolean => value === 1 || value === 11 || String(value).startsWith("8");

// A digit at the start of a sentence: "Il 3", "L'8", "Lo 0".
const startWithDigit = (digit: number): string => {
    if (digit === 0) {
        return "Lo 0";
    }
    return isSaidWithVowel(digit) ? `L'${digit}` : `Il ${digit}`;
};

// "del 7", "dell'8": a times table by its number.
const ofTable = (table: number): string => (isSaidWithVowel(table) ? `dell'${table}` : `del ${table}`);

export const it: Copy = {
    tagline: "Accendi il tuo talento!",
    welcomeQuestion: "Ciao! Sono Faísca. Come ti chiami?",
    greeting: (name) => `Ciao, ${name}! Su cosa ci alleniamo oggi?`,

    praises: ["Molto bene!", "Bene! È giusto!", "Esatto!", "Ottimo!", "Stai migliorando!"],
    tryAgains: ["Quasi! Riprova.", "Non ancora. Prova di nuovo!", "Mmm, quasi! Riproviamo?"],
    tryAgainColumns: (wrongColumnCount) =>
        wrongColumnCount === 1 ? "Quasi! Guarda la colonna evidenziata e riprova." : "Quasi! Guarda le colonne evidenziate e riprova.",
    rightAtRetry: "Bene! Questa volta ce l'hai fatta!",
    rightAtSecondTry: "Bene! Giusto al secondo tentativo!",
    almost: "Quasi!",
    rightAnswer: (answer) => `La risposta giusta è ${answer}.`,
    retryAhead: "Riproviamo più avanti.",
    retryNextTime: "Questa la ripassiamo la prossima volta.",
    coinMilestone: "Hai guadagnato una moneta!",
    levelUpMilestone: (level) => `Hai raggiunto il livello ${level}!`,

    operationNames,
    mixName: "Misto",
    difficultyNames,
    difficultyRange: (limit) => `fino a ${limit}`,
    difficultyTables: "tabelline",
    difficultyExample: (example) => `come ${example}`,
    layoutNames: { result: "Solo il risultato", vertical: "In colonna" },
    modeNames: { direct: "Solo dirette", mixed: "Dirette + inverse" },
    skillNames: {
        "no-carry": "Senza riporto",
        carry: "Riporto in una colonna",
        "chain-carry": "Riporto a catena",
        "no-borrow": "Senza prestito",
        borrow: "Con prestito",
        "borrow-across-zero": "Prestito dallo zero",
        "no-remainder": "Senza resti nei passaggi",
        remainder: "Con resti nei passaggi",
        "zero-in-quotient": "Zero nel risultato"
    },
    masteryNames: ["Da allenare", "Si comincia", "Si impara", "Si migliora", "Quasi fatto", "Imparato"],
    levelName: (level) => `Livello ${level}`,
    operationSummary: (difficultyName, level) => `${difficultyName} · livello ${level}`,
    playProblemMix: (minimumOperations) => `Scegli almeno ${minimumOperations} operazioni da mescolare.`,
    playProblemTables: "Scegli almeno una tabellina.",

    spokenAddition: (left, right) => `Quanto fa ${left} più ${right}?`,
    spokenSubtraction: (left, right) => `Quanto fa ${left} meno ${right}?`,
    spokenMultiplication: (left, right) => `Quanto fa ${left} per ${right}?`,
    spokenDivision: (left, right) => `Quanto fa ${left} diviso ${right}?`,
    spokenMissingLeft: (right, result) => `Quale numero per ${right} fa ${result}?`,
    spokenMissingRight: (left, result) => `${left} per quale numero fa ${result}?`,
    cellLabel: (column, digit) => `Casella delle ${columnNames[column]}${digit === null ? ", vuota" : `: ${digit}`}`,

    helpLimit: (maximumHelps) => `Hai già usato i ${maximumHelps} aiuti di questa partita.`,
    helpNoCoins: (answersPerCoin) => `Il salvadanaio è vuoto. Ogni ${answersPerCoin} risposte giuste guadagni una moneta!`,
    choiceHint: "Ho tolto due risposte. È una di queste!",
    hintSplit: (firstStep, nextStep) => `Indizio: ${firstStep}. Ora ${nextStep}.`,
    hintPartialSum: (firstStep, rest) => `Indizio: ${firstStep}. Ora aggiungi ${rest}.`,
    hintPartialDivision: (firstStep, rest) => `Indizio: ${firstStep}. Ora fai ${rest} e aggiungi.`,
    hintRound: (firstStep, zeros) => `Indizio: ${firstStep}. Ora aggiungi ${zeros === 1 ? "uno zero" : `${zeros} zeri`}.`,
    hintCount: (start, steps, isForward) => `Indizio: parti da ${start} e conta ${steps} ${countDirection(isForward)}.`,
    hintCountTens: (start, tens, isForward) => `Indizio: parti da ${start} e conta ${tens === 1 ? "1 decina" : `${tens} decine`} ${countDirection(isForward)}.`,
    hintNeighbour: (fact) => `Indizio: ${fact}`,
    verticalEmpty: "Questa casella resta vuota. Ora puoi confermare!",
    verticalDigit: (column, digit) => `Nelle ${columnNames[column]} scrivi ${digit}.`,
    verticalCarryOnly: "Qui scrivi solo il riporto di 1.",
    verticalCarry: (top, bottom) => `Non dimenticare il riporto di 1: ${top} + ${bottom} + 1.`,
    verticalColumn: (column, calculation) => `Ora le ${columnNames[column]}: ${calculation}.`,
    verticalBorrow: (top, workingTop, bottom) => `${startWithDigit(top)} diventa ${workingTop}. Ora fai ${workingTop} − ${bottom}.`,

    sessionEnd: "Bella partita! Alla prossima!",
    summaryPerfect: "Perfetto! Tutte giuste!",
    summaryGreat: "Ottimo! Stai migliorando!",
    summaryGood: "Bell'allenamento! Ogni partita aiuta a imparare.",
    nothingToReinforce: "Nessun calcolo è rimasto indietro. Fantastico!",
    helpedCount: (count) => `${count} con aiuto`,
    unlockTitle: "Sfida sbloccata!",
    unlockText: (operation, difficulty, detail) =>
        `Ora puoi provare ${operationNamesWithArticle[operation]} in ${difficultyNames[difficulty]}, con calcoli ${detail}.`,
    unlockAccept: (difficulty) => `Prova in ${difficultyNames[difficulty]}`,
    unlockDecline: "Non ora",
    safetyNetTitle: "Questa era tosta!",
    safetyNetText: (operation, difficulty) =>
        `Vuoi allenarti un po' con ${operationNamesWithArticle[operation]} in ${difficultyNames[difficulty]}? Non perdi né livello né monete.`,
    safetyNetAccept: (difficulty) => `Allenati in ${difficultyNames[difficulty]}`,
    safetyNetDecline: "Continua qui",
    unlockIntro: (nextDifficulty, playDifficulty) => `Per sbloccare ${difficultyNames[nextDifficulty]}, gioca in ${difficultyNames[playDifficulty]}:`,
    unlockIntroAfter: (lockedDifficulty, nextDifficulty, playDifficulty) =>
        `${difficultyNames[lockedDifficulty]} viene dopo ${difficultyNames[nextDifficulty]}. Per sbloccare ${difficultyNames[nextDifficulty]}, gioca in ${difficultyNames[playDifficulty]}:`,
    unlockAlmost: (nextDifficulty, playDifficulty) =>
        `Ci sei quasi! Finisci una partita in ${difficultyNames[playDifficulty]} e ${difficultyNames[nextDifficulty]} si sblocca.`,
    unlockLevelStep: (level) => `Raggiungi il livello ${level}`,
    unlockCorrectStep: (correct, outOf) => `Risolvi ${correct} calcoli scritti su ${outOf}`,
    unlockMissingAnswers: (count) => (count === 1 ? "Manca 1 calcolo." : `Mancano ${count} calcoli.`),
    unlockDistinctStep: (count) => `Fai ${count} calcoli diversi`,

    clockDirectionNames: { up: "In avanti", down: "All'indietro" },
    clockReferenceDefault: (minutes) => `${minutes} minuti`,
    clockReferenceRecord: "Il tuo record",
    clockOvertime: "tempo extra",
    clockCountdownFromRecord: (time) => `dal record ${time}`,
    clockCountdownFrom: (time) => `da ${time}`,
    clockRecord: (time) => `record ${time}`,
    clockGoal: (time) => `obiettivo ${time}`,
    clockFirstRecord: "Primo record in questa categoria!",
    clockNewRecord: (previousTime) => `Nuovo record! Prima era ${previousTime}.`,
    clockBeaten: "Hai battuto il cronometro!",
    clockBehindRecord: (extraTime, recordTime) => `Eri a ${extraTime} dal tuo record, ${recordTime}. Sarà per la prossima!`,
    clockBehindDefault: (extraTime, minutes) => `${extraTime} in più dei ${minutes} minuti. Sarà per la prossima!`,
    clockYourRecord: (time) => `Il tuo record: ${time}.`,
    clockRecordsNeedPerfect: "I record contano quando le fai tutte giuste al primo colpo.",
    recordVertical: "in colonna",
    recordResult: "solo il risultato",
    recordTable: (table) => `tabellina ${ofTable(table)}`,
    recordTables: (tables) => `tabelline ${tables}`,
    recordWithInverse: "con inverse",
    recordTyping: "scrivendo",

    challengeName: "Sfida senza fine",
    challengeAbout: "Per adulti: sempre più difficile e più veloce, finché non sbagli.",
    challengeGreeting: "Fin dove riesci ad arrivare?",
    challengeRules: (answersPerLevel, maxDigits) => [
        `Ogni ${answersPerLevel} risposte giuste sali di livello. Si comincia con le addizioni; poi arrivano le sottrazioni, le moltiplicazioni e le divisioni, e i numeri crescono fino a ${maxDigits} cifre.`,
        "Ogni domanda ha il suo tempo, e a ogni livello ce n'è meno.",
        "Una risposta sbagliata o il tempo che scade chiudono la sfida."
    ],
    challengeScore: (correctCount) => (correctCount === 1 ? "1 giusta" : `${correctCount} giuste`),
    challengeForAdults: "Per adulti",
    challengeRecordSummary: (score) => `Record: ${score}`,
    challengeNoRecord: "Ancora nessun record.",
    challengeYourRecord: (score) => `Il tuo record: ${score}.`,
    challengeLevelUpJoin: (level, operation) => `Livello ${level}! Ora ci sono anche le ${operationPluralNames[operation]}.`,
    challengeLevelUpGrow: (level) => `Livello ${level}! Numeri più grandi e meno tempo.`,
    challengeLevelUp: (level) => `Livello ${level}!`,
    challengeTimeUp: "Tempo scaduto!",
    challengeWrote: (answer) => `Hai scritto ${answer}.`,
    challengeStopped: "Sfida terminata.",
    challengeLevelReached: (level) => `Hai raggiunto il livello ${level}.`,

    factorGameName: "Trova la moltiplicazione",
    factorGameGreeting: "Ti mostro un numero. Trova una moltiplicazione che faccia quel numero!",
    factorGameAnyAnswer: "Tocca due numeri per fare la moltiplicazione. Molti numeri ne hanno più di una, e va bene qualsiasi!",
    factorGameNeedsTable: (fromTable, toTable) => `Scegli almeno una tabellina dal ${fromTable} al ${toTable}.`,
    factorGameQuestion: (target) => `Quale moltiplicazione fa ${target}?`,
    factorGameTryAgain: (first, second, product) => `Quasi! ${first} × ${second} fa ${product}. Riprova.`,
    factorGameHint: (factor) => `Parti dal numero ${factor}. Qual è l’altro?`,
    factorGameAlso: (multiplications) => `Va bene anche ${multiplications}.`,
    factorGameAnswers: (multiplications) => `Poteva essere ${multiplications}.`,

    coinsCount: (coins) => (coins === 1 ? "1 moneta" : `${coins} monete`),
    coinProgress: (answers, answersPerCoin) => `${answers} di ${answersPerCoin}`,
    piggyBankAbout: (answersPerCoin) => `Ogni aiuto costa 1 moneta. Ogni ${answersPerCoin} risposte giuste guadagni una moneta nuova.`,
    piggyBankFull: "Salvadanaio pieno!",
    storageNewerVersion: "Questi progressi sono stati salvati da una versione più recente di Faísca. Qui non si salva niente.",
    storageNotSaved: "Attenzione: in questo browser i tuoi progressi non vengono salvati.",
    progressCheerStart: "Ogni partita accende altri quadretti. Iniziamo?",
    progressCheerKnown: (masteredCount) =>
        masteredCount === 1 ? "Sai già 1 calcolo a memoria. Che orgoglio!" : `Sai già ${masteredCount} calcoli a memoria. Che orgoglio!`,
    nameTooLong: (maximumLength) => `Il nome può avere al massimo ${maximumLength} lettere.`,
    nameTaken: "Esiste già un profilo con questo nome.",
    nameEmpty: "Scrivi il tuo nome.",

    labels: {
        start: "Inizia",
        namePlaceholder: "Il tuo nome",
        cancel: "Annulla",
        profiles: "Profili",
        whoIsPlaying: "Chi gioca?",
        newProfile: "Nuovo",
        newProfileName: "Nome del nuovo profilo",
        createProfile: "Crea profilo",
        deleteProfile: (name) => `Elimina il profilo «${name}»`,
        deleteProfileQuestion: (name) => `Eliminare il profilo «${name}» e tutti i progressi?`,
        cannotUndo: "Non si può annullare.",
        confirmDelete: "Sì, elimina",
        language: "Lingua",
        settings: "Impostazioni",

        install: "Installa",
        installTitle: "Metti Faísca nella schermata Home",
        installAbout: "Si apre come un'app e funziona senza internet.",
        installShareTap: "Tocca",
        installShareName: "Condividi (se non lo vedi, è nel menu ⋯).",
        installShareAdd: "Scegli «Aggiungi alla schermata Home».",
        installBeforeStarting: "Fallo prima di iniziare:",
        installBeforeStartingWhy: "quello che fai qui non passa all'app.",
        installMenuTap: "Tocca il menu ⋮ del browser.",
        installMenuAdd: "Scegli «Installa app» o «Aggiungi a schermata Home».",
        addToHomeScreen: "Aggiungi alla schermata Home",

        home: "Inizio",
        play: "Gioca",
        playAgain: "Gioca ancora",
        seeProgress: "Vedi i progressi",
        advanced: "Avanzate",
        whatToPractise: "Su cosa ci alleniamo?",
        gamesTitle: "Giochi",
        seePiggyBank: "Vedi il salvadanaio",
        piggyBank: "Salvadanaio",
        outOf: (total) => `di ${total}`,
        nextCoin: (progress) => `Prossima moneta: ${progress}`,

        moreOptions: "Altre opzioni",
        difficultyQuestion: "Quale difficoltà?",
        layoutQuestion: "Come vuoi fare i calcoli?",
        verticalExample: "Un numero sotto l'altro",
        tablesQuestion: "Quali tabelline vuoi allenare?",
        tableName: (table) => `Tabellina ${ofTable(table)}`,
        modeQuestion: "Che domande vuoi?",
        alwaysTyped: "Scrivi sempre la risposta",
        alwaysTypedAbout: "Senza scelta multipla, anche nei calcoli nuovi.",
        mixQuestion: "Quali operazioni vuoi mescolare?",
        mixAbout: "Ogni operazione ha la difficoltà che hai scelto.",
        locked: "Da sbloccare",
        clock: "Cronometro",
        clockAbout: "Per chi ama misurare il tempo. Senza fretta!",
        clockDirectionQuestion: "Come conta?",
        clockReferenceQuestion: "Contro cosa?",
        noRecordYet: "Ancora nessuno",

        exit: "Esci",
        exitQuestion: "Vuoi uscire dalla partita?",
        challengeExitQuestion: "Vuoi terminare la sfida?",
        yes: "Sì",
        no: "No",
        gotIt: "Ho capito",
        again: "Di nuovo",
        questionPosition: (position, total) => `Domanda ${position} di ${total}`,
        gameProgress: "Avanzamento della partita",
        result: "Risultato",
        next: "Avanti",
        help: "Aiuto",
        moreHelp: "Altro aiuto",
        helpCost: "costa 1 moneta",
        keypad: "Tastierino numerico",
        erase: "Cancella",
        confirm: "Conferma",
        noAnswerYet: "Ancora nessuna risposta",
        yourAnswer: (answer) => `La tua risposta: ${answer}`,
        chooseAnswer: "Scegli la risposta",
        chooseTwoNumbers: "Scegli due numeri",

        correctAtFirstTry: "giuste al primo colpo",
        time: "Tempo",
        achievements: "Traguardi di questa partita",
        coinsEarned: (coins) => (coins === 1 ? "Hai guadagnato 1 moneta!" : `Hai guadagnato ${coins} monete!`),
        newRecord: "Nuovo record!",
        toPractiseMore: "Da allenare ancora",

        progressTitle: (name) => `I tuoi progressi, ${name}`,
        progressNumbers: "I numeri dei tuoi progressi",
        games: (count) => (count === 1 ? "partita" : "partite"),
        practiceDays: (count) => (count === 1 ? "giorno di pratica" : "giorni di pratica"),
        coins: (count) => (count === 1 ? "moneta" : "monete"),
        daysInARow: (count) => (count === 1 ? "giorno di fila" : "giorni di fila"),
        records: "Record",
        noRecords: "Attiva il cronometro e rispondi giusto a tutte al primo colpo per avere il tuo primo record.",
        divisionUsesMap: "Le divisioni allenano gli stessi calcoli della mappa della moltiplicazione.",
        factsKnown: (known, total) => `${known} di ${total} calcoli a memoria`,
        mapCaption: "Mappa delle tabelline: ogni quadretto mostra come va ogni calcolo.",
        legend: "Legenda",
        levelProgress: (level) => `Avanzamento nel livello ${level}`,

        lastQuestion: (equation) => `L'ultimo calcolo: ${equation}`,
        correctAnswers: (count) => (count === 1 ? "giusta" : "giuste")
    }
};
