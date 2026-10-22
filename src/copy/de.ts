import type { Difficulty } from "../utils/difficulties/utils.ts";
import type { Operation } from "../utils/operations/utils.ts";
import type { Copy } from "./copy.ts";

// German with "du", for Germany, Austria and Switzerland. Neutral for the child; Faísca is a male dog ("Ich bin Faísca").
// Operations use the Grundschule words (Plus, Minus, Mal, Geteilt). Levels are "Level"; a difficulty goes by its own name ("auf Schwer").

const operationNames: Record<Operation, string> = {
    addition: "Plus",
    subtraction: "Minus",
    multiplication: "Mal",
    division: "Geteilt"
};

const operationPluralNames: Record<Operation, string> = {
    addition: "Plusaufgaben",
    subtraction: "Minusaufgaben",
    multiplication: "Malaufgaben",
    division: "Geteiltaufgaben"
};

const difficultyNames: Record<Difficulty, string> = {
    easy: "Leicht",
    medium: "Mittel",
    hard: "Schwer"
};

// "Einer" + "stelle" names the place ("Einerstelle"); "Einer" + "n" is the dative plural ("bei den Einern").
const columnNames: string[] = ["Einer", "Zehner", "Hunderter", "Tausender"];

const countDirection = (isForward: boolean): string => (isForward ? "vorwärts" : "rückwärts");

export const de: Copy = {
    tagline: "Lass dein Talent funkeln!",
    welcomeQuestion: "Hallo! Ich bin Faísca. Wie heißt du?",
    greeting: (name) => `Hallo, ${name}! Was üben wir heute?`,

    praises: ["Sehr gut!", "Super! Das stimmt!", "Genau!", "Klasse!", "Du wirst immer besser!"],
    tryAgains: ["Fast! Versuch es noch mal.", "Noch nicht. Probier es noch mal!", "Hmm, fast! Schauen wir noch mal?"],
    tryAgainColumns: (wrongColumnCount) =>
        wrongColumnCount === 1
            ? "Fast! Schau dir die markierte Spalte an und versuch es noch mal."
            : "Fast! Schau dir die markierten Spalten an und versuch es noch mal.",
    rightAtRetry: "Super! Diesmal hat es geklappt!",
    rightAtSecondTry: "Super! Beim zweiten Versuch richtig!",
    almost: "Fast!",
    rightAnswer: (answer) => `Die richtige Antwort ist ${answer}.`,
    retryAhead: "Wir probieren es später noch mal.",
    retryNextTime: "Die üben wir beim nächsten Mal.",
    coinMilestone: "Du hast eine Münze bekommen!",
    levelUpMilestone: (level) => `Du bist jetzt auf Level ${level}!`,

    operationNames,
    mixName: "Gemischt",
    difficultyNames,
    difficultyRange: (limit) => `bis ${limit}`,
    difficultyTables: "Einmaleins",
    difficultyExample: (example) => `wie ${example}`,
    layoutNames: { result: "Nur Ergebnis", vertical: "Schriftlich" },
    modeNames: { direct: "Ohne Lücken", mixed: "Auch mit Lücken" },
    skillNames: {
        "no-carry": "Ohne Übertrag",
        carry: "Ein Übertrag",
        "chain-carry": "Mehrere Überträge",
        "no-borrow": "Ohne Entbündeln",
        borrow: "Mit Entbündeln",
        "borrow-across-zero": "Entbündeln über die Null",
        "no-remainder": "Ohne Rest zwischendurch",
        remainder: "Mit Rest zwischendurch",
        "zero-in-quotient": "Null im Ergebnis"
    },
    masteryNames: ["Noch nicht geübt", "Angefangen", "Wird gelernt", "Wird besser", "Fast geschafft", "Gemeistert"],
    levelName: (level) => `Level ${level}`,
    operationSummary: (difficultyName, level) => `${difficultyName} · Level ${level}`,
    playProblemMix: (minimumOperations) => `Wähle mindestens ${minimumOperations} Rechenarten zum Mischen.`,
    playProblemTables: "Wähle mindestens eine Reihe.",

    spokenAddition: (left, right) => `Wie viel ist ${left} plus ${right}?`,
    spokenSubtraction: (left, right) => `Wie viel ist ${left} minus ${right}?`,
    spokenMultiplication: (left, right) => `Wie viel ist ${left} mal ${right}?`,
    spokenDivision: (left, right) => `Wie viel ist ${left} geteilt durch ${right}?`,
    spokenMissingLeft: (right, result) => `Welche Zahl mal ${right} ergibt ${result}?`,
    spokenMissingRight: (left, result) => `${left} mal welche Zahl ergibt ${result}?`,
    cellLabel: (column, digit) => `${columnNames[column]}stelle${digit === null ? ", leer" : `: ${digit}`}`,

    helpLimit: (maximumHelps) => `Du hast schon alle ${maximumHelps} Hilfen in diesem Spiel genutzt.`,
    helpNoCoins: (answersPerCoin) => `Das Sparschwein ist leer. Für ${answersPerCoin} richtige Antworten gibt es eine Münze!`,
    choiceHint: "Ich habe zwei Antworten weggenommen. Eine von diesen ist richtig!",
    hintSplit: (firstStep, nextStep) => `Tipp: ${firstStep}. Jetzt noch ${nextStep}.`,
    hintPartialSum: (firstStep, rest) => `Tipp: ${firstStep}. Jetzt rechne noch ${rest} dazu.`,
    hintPartialDivision: (firstStep, rest) => `Tipp: ${firstStep}. Jetzt rechne ${rest} und zähl beide Ergebnisse zusammen.`,
    hintRound: (firstStep, zeros) => `Tipp: ${firstStep}. Jetzt häng ${zeros === 1 ? "eine Null" : `${zeros} Nullen`} an.`,
    hintCount: (start, steps, isForward) => `Tipp: Fang bei ${start} an und zähl ${steps} ${countDirection(isForward)}.`,
    hintCountTens: (start, tens, isForward) =>
        `Tipp: Fang bei ${start} an und zähl ${tens === 1 ? "1 Zehnerschritt" : `${tens} Zehnerschritte`} ${countDirection(isForward)}.`,
    hintNeighbour: (fact) => `Tipp: ${fact}`,
    verticalEmpty: "Diese Stelle bleibt leer. Du bist schon fertig!",
    verticalDigit: (column, digit) => `Bei den ${columnNames[column]}n kommt die ${digit} hin.`,
    verticalCarryOnly: "Hier kommt nur die 1 vom Übertrag hin.",
    verticalCarry: (top, bottom) => `Vergiss den Übertrag nicht: ${top} + ${bottom} + 1.`,
    verticalColumn: (column, calculation) => `Jetzt die ${columnNames[column]}: ${calculation}.`,
    verticalBorrow: (top, workingTop, bottom) => `Aus der ${top} wird ${workingTop}. Jetzt rechne ${workingTop} − ${bottom}.`,

    sessionEnd: "Tolle Runde! Bis zum nächsten Mal!",
    summaryPerfect: "Perfekt! Alles richtig!",
    summaryGreat: "Sehr gut! Du wirst immer besser!",
    summaryGood: "Gut geübt! Jedes Spiel hilft beim Lernen.",
    nothingToReinforce: "Keine Aufgabe zum Nachüben. Fantastisch!",
    helpedCount: (count) => `${count} mit Hilfe`,
    unlockTitle: "Neue Herausforderung!",
    unlockText: (operation, difficulty, detail) => `Jetzt kannst du auf ${difficultyNames[difficulty]} spielen: ${operationPluralNames[operation]} ${detail}.`,
    unlockAccept: (difficulty) => `Auf ${difficultyNames[difficulty]} spielen`,
    unlockDecline: "Jetzt nicht",
    safetyNetTitle: "Das war knifflig!",
    safetyNetText: (operation, difficulty) =>
        `Möchtest du ein bisschen ${operationPluralNames[operation]} auf ${difficultyNames[difficulty]} üben? Du verlierst kein Level und keine Münzen.`,
    safetyNetAccept: (difficulty) => `Auf ${difficultyNames[difficulty]} üben`,
    safetyNetDecline: "Hier weitermachen",

    clockDirectionNames: { up: "Vorwärts", down: "Rückwärts" },
    clockReferenceDefault: (minutes) => `${minutes} Minuten`,
    clockReferenceRecord: "Dein Rekord",
    clockOvertime: "Extrazeit",
    clockCountdownFromRecord: (time) => `vom Rekord ${time}`,
    clockCountdownFrom: (time) => `von ${time}`,
    clockRecord: (time) => `Rekord ${time}`,
    clockGoal: (time) => `Ziel ${time}`,
    clockFirstRecord: "Erster Rekord in dieser Kategorie!",
    clockNewRecord: (previousTime) => `Neuer Rekord! Der alte war ${previousTime}.`,
    clockBeaten: "Du warst schneller als die Uhr!",
    clockBehindRecord: (extraTime, recordTime) =>
        `Du hast ${extraTime} länger gebraucht als bei deinem Rekord von ${recordTime}. Vielleicht klappt's nächstes Mal!`,
    clockBehindDefault: (extraTime, minutes) => `Du hast ${extraTime} länger gebraucht als die ${minutes} Minuten. Vielleicht klappt's nächstes Mal!`,
    clockYourRecord: (time) => `Dein Rekord: ${time}.`,
    clockRecordsNeedPerfect: "Rekorde zählen, wenn du alles beim ersten Versuch richtig hast.",
    recordVertical: "schriftlich",
    recordResult: "nur Ergebnis",
    recordTable: (table) => `${table}er-Reihe`,
    recordTables: (tables) => `Reihen ${tables}`,
    recordWithInverse: "mit Lücken",
    recordTyping: "getippt",

    challengeName: "Endlos-Challenge",
    challengeAbout: "Für Erwachsene: immer schwerer und schneller, bis zum ersten Fehler.",
    challengeGreeting: "Wie weit kommst du?",
    challengeRules: (answersPerLevel, maxDigits) => [
        `Nach je ${answersPerLevel} richtigen Antworten steigst du ein Level auf. Es beginnt mit Plusaufgaben; dann kommen Minus-, Mal- und Geteiltaufgaben dazu, und die Zahlen wachsen auf bis zu ${maxDigits} Stellen.`,
        "Jede Aufgabe hat ihre eigene Zeit, und mit jedem Level wird sie kürzer.",
        "Eine falsche Antwort oder das Ende der Zeit beendet die Challenge."
    ],
    challengeScore: (correctCount) => `${correctCount} Richtige`,
    challengeForAdults: "Für Erwachsene",
    challengeRecordSummary: (score) => `Rekord: ${score}`,
    challengeNoRecord: "Noch kein Rekord.",
    challengeYourRecord: (score) => `Dein Rekord: ${score}.`,
    challengeLevelUpJoin: (level, operation) => `Level ${level}! Jetzt gibt es auch ${operationPluralNames[operation]}.`,
    challengeLevelUpGrow: (level) => `Level ${level}! Größere Zahlen und weniger Zeit.`,
    challengeLevelUp: (level) => `Level ${level}!`,
    challengeTimeUp: "Die Zeit ist um!",
    challengeWrote: (answer) => `Du hast ${answer} eingegeben.`,
    challengeStopped: "Challenge beendet.",
    challengeLevelReached: (level) => `Du hast Level ${level} erreicht.`,

    coinsCount: (coins) => (coins === 1 ? "1 Münze" : `${coins} Münzen`),
    coinProgress: (answers, answersPerCoin) => `${answers} von ${answersPerCoin}`,
    piggyBankAbout: (answersPerCoin) => `Jede Hilfe kostet 1 Münze. Für ${answersPerCoin} richtige Antworten gibt es eine neue Münze.`,
    piggyBankFull: "Sparschwein voll!",
    storageNewerVersion: "Dieser Fortschritt wurde von einer neueren Version von Faísca gespeichert. Hier wird nichts gespeichert.",
    storageNotSaved: "Achtung: In diesem Browser wird dein Fortschritt nicht gespeichert.",
    progressCheerStart: "Mit jedem Spiel leuchten mehr Kästchen auf. Legen wir los?",
    progressCheerKnown: (masteredCount) =>
        masteredCount === 1
            ? "Du kannst schon 1 Aufgabe auswendig. Ich bin stolz auf dich!"
            : `Du kannst schon ${masteredCount} Aufgaben auswendig. Ich bin stolz auf dich!`,
    nameTooLong: (maximumLength) => `Der Name darf höchstens ${maximumLength} Buchstaben haben.`,
    nameTaken: "Es gibt schon ein Profil mit diesem Namen.",
    nameEmpty: "Schreib deinen Namen.",

    labels: {
        start: "Los geht's",
        namePlaceholder: "Dein Name",
        cancel: "Abbrechen",
        profiles: "Profile",
        whoIsPlaying: "Wer spielt?",
        newProfile: "Neu",
        newProfileName: "Name des neuen Profils",
        createProfile: "Profil erstellen",
        deleteProfile: (name) => `Profil „${name}“ löschen`,
        deleteProfileQuestion: (name) => `Profil „${name}“ und den ganzen Fortschritt löschen?`,
        cannotUndo: "Das lässt sich nicht rückgängig machen.",
        confirmDelete: "Ja, löschen",
        language: "Sprache",

        install: "Installieren",
        installTitle: "Hol Faísca auf den Startbildschirm",
        installAbout: "Öffnet sich wie eine App und funktioniert ohne Internet.",
        installShareTap: "Tippe auf",
        installShareName: "Teilen (wenn du es nicht siehst, ist es im Menü ⋯).",
        installShareAdd: "Wähle „Zum Home-Bildschirm“.",
        installBeforeStarting: "Mach das, bevor du anfängst:",
        installBeforeStartingWhy: "Was du hier machst, kommt nicht mit in die App.",
        installMenuTap: "Tippe auf das Menü ⋮ im Browser.",
        installMenuAdd: "Wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.",
        addToHomeScreen: "Zum Startbildschirm hinzufügen",

        home: "Startseite",
        play: "Spielen",
        playAgain: "Noch mal spielen",
        seeProgress: "Fortschritt ansehen",
        advanced: "Erweitert",
        whatToPractise: "Was üben wir?",
        seePiggyBank: "Sparschwein ansehen",
        piggyBank: "Sparschwein",
        outOf: (total) => `von ${total}`,
        nextCoin: (progress) => `Nächste Münze: ${progress}`,

        moreOptions: "Mehr Optionen",
        difficultyQuestion: "Wie schwer?",
        layoutQuestion: "Wie willst du rechnen?",
        verticalExample: "Zahlen untereinander",
        tablesQuestion: "Welche Reihen willst du üben?",
        tableName: (table) => `${table}er-Reihe`,
        modeQuestion: "Welche Aufgaben?",
        alwaysTyped: "Antwort immer eintippen",
        alwaysTypedAbout: "Ohne Antworten zum Auswählen, auch bei neuen Aufgaben.",
        mixQuestion: "Welche Rechenarten willst du mischen?",
        mixAbout: "Jede Rechenart nimmt die Schwierigkeit, die du dort gewählt hast.",
        locked: "Gesperrt",
        clock: "Uhr",
        clockAbout: "Für alle, die gern die Zeit stoppen. Ganz ohne Stress!",
        clockDirectionQuestion: "Wie läuft die Uhr?",
        clockReferenceQuestion: "Gegen welche Zeit?",
        noRecordYet: "Noch keiner",

        exit: "Aufhören",
        exitQuestion: "Willst du mit dem Spiel aufhören?",
        challengeExitQuestion: "Willst du die Challenge beenden?",
        yes: "Ja",
        no: "Nein",
        again: "Noch mal",
        questionPosition: (position, total) => `Aufgabe ${position} von ${total}`,
        gameProgress: "Spielfortschritt",
        result: "Ergebnis",
        next: "Weiter",
        help: "Hilfe",
        moreHelp: "Mehr Hilfe",
        helpCost: "kostet 1 Münze",
        keypad: "Zahlentastatur",
        erase: "Löschen",
        confirm: "Fertig",
        noAnswerYet: "Noch keine Antwort",
        yourAnswer: (answer) => `Deine Antwort: ${answer}`,
        chooseAnswer: "Wähle die Antwort",

        correctAtFirstTry: "beim ersten Versuch richtig",
        time: "Zeit",
        achievements: "Erfolge in diesem Spiel",
        coinsEarned: (coins) => (coins === 1 ? "Du hast 1 Münze bekommen!" : `Du hast ${coins} Münzen bekommen!`),
        newRecord: "Neuer Rekord!",
        toPractiseMore: "Zum Weiterüben",

        progressTitle: (name) => `Dein Fortschritt, ${name}`,
        progressNumbers: "Zahlen zu deinem Fortschritt",
        games: (count) => (count === 1 ? "Spiel" : "Spiele"),
        practiceDays: (count) => (count === 1 ? "Übungstag" : "Übungstage"),
        coins: (count) => (count === 1 ? "Münze" : "Münzen"),
        daysInARow: (count) => (count === 1 ? "Tag in Folge" : "Tage in Folge"),
        records: "Rekorde",
        noRecords: "Schalte die Uhr ein und löse alle Aufgaben gleich beim ersten Versuch, dann bekommst du deinen ersten Rekord.",
        divisionUsesMap: "Geteiltaufgaben üben dieselben Aufgaben wie die Einmaleins-Tafel.",
        factsKnown: (known, total) => `${known} von ${total} Aufgaben auswendig`,
        mapCaption: "Einmaleins-Tafel: Jedes Kästchen zeigt, wie weit du bei dieser Aufgabe bist.",
        legend: "Legende",
        levelProgress: (level) => `Fortschritt auf Level ${level}`,

        lastQuestion: (equation) => `Die letzte Aufgabe: ${equation}`,
        correctAnswers: () => "Richtige"
    }
};
