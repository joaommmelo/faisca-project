import type { Skill } from "../utils/arithmetic/utils.ts";
import type { BalanceSkill } from "../utils/balanceGame/utils.ts";
import type { ClockDirection } from "../utils/clock/utils.ts";
import type { CountingSkill } from "../utils/countingGame/utils.ts";
import type { Difficulty } from "../utils/difficulties/utils.ts";
import type { MemoryContent } from "../utils/memoryGame/utils.ts";
import type { MissingSignSkill } from "../utils/missingSignGame/utils.ts";
import type { NumberBondsSkill } from "../utils/numberBondsGame/utils.ts";
import type { Operation } from "../utils/operations/utils.ts";
import type { AnswerLayout, PracticeMode } from "../utils/questions/utils.ts";
import type { RoundGameId } from "../utils/roundGame/utils.ts";
import type { SkipCountingSkill } from "../utils/skipCountingGame/utils.ts";

// Everything the app says, in one language. Messages decides what to say and when; a copy only words it.
// Numbers that reach a copy are already formatted where they arrive as strings. Counts arrive as numbers, so each
// language words its own plurals.
// The columns of a sum are numbered from the right: 0 units, 1 tens, 2 hundreds, 3 thousands.
export interface Copy {
    tagline: string;
    welcomeQuestion: string;
    greeting: (name: string) => string;

    // Right and wrong
    praises: string[];
    tryAgains: string[];
    tryAgainColumns: (wrongColumnCount: number) => string;
    rightAtRetry: string;
    rightAtSecondTry: string;
    almost: string;
    rightAnswer: (answer: string) => string;
    retryAhead: string;
    retryNextTime: string;
    coinMilestone: string;
    levelUpMilestone: (level: number) => string;
    missionMilestone: string;
    missionWeekMilestone: string;
    missionToDo: string;
    missionDone: string;
    starMilestone: string;
    starsYouHave: (count: number) => string;
    starsHelpAnswers: (count: number) => string;
    starsHelpEverywhere: string;

    // Names
    operationNames: Record<Operation, string>;
    mixName: string;
    difficultyNames: Record<Difficulty, string>;
    // What a difficulty asks: a range for + and −, "the times tables", or an example for × and ÷.
    difficultyRange: (limit: number) => string;
    difficultyTables: string;
    difficultyExample: (example: string) => string;
    layoutNames: Record<AnswerLayout, string>;
    modeNames: Record<PracticeMode, string>;
    skillNames: Record<Skill, string>;
    // From 0 (not practised yet) to 5 (mastered).
    masteryNames: string[];
    levelName: (level: number) => string;
    // The home screen's line under an operation: "Fácil · nível 2".
    operationSummary: (difficultyName: string, level: number) => string;
    playProblemMix: (minimumOperations: number) => string;
    playProblemTables: string;

    // Questions read out by screen readers
    spokenAddition: (left: number, right: number) => string;
    spokenSubtraction: (left: number, right: number) => string;
    spokenMultiplication: (left: number, right: number) => string;
    spokenDivision: (left: number, right: number) => string;
    spokenMissingLeft: (right: number, result: number) => string;
    spokenMissingRight: (left: number, result: number) => string;
    // A cell of the answer in a column sum: which place it is and what it holds.
    cellLabel: (column: number, digit: number | null) => string;

    // Helps. A step such as "37 + 20 = 57" arrives written out.
    helpLimit: (maximumHelps: number) => string;
    helpNoCoins: (answersPerCoin: number) => string;
    choiceHint: string;
    hintSplit: (firstStep: string, nextStep: string) => string;
    hintPartialSum: (firstStep: string, rest: string) => string;
    hintPartialDivision: (firstStep: string, rest: string) => string;
    hintRound: (firstStep: string, zeros: number) => string;
    hintCount: (start: number, steps: number, isForward: boolean) => string;
    hintCountTens: (start: number, tens: number, isForward: boolean) => string;
    hintNeighbour: (fact: string) => string;
    verticalEmpty: string;
    verticalDigit: (column: number, digit: number) => string;
    verticalCarryOnly: string;
    verticalCarry: (top: number, bottom: number) => string;
    verticalColumn: (column: number, calculation: string) => string;
    verticalBorrow: (top: number, workingTop: number, bottom: number) => string;

    // The end of a session
    sessionEnd: string;
    summaryPerfect: string;
    summaryGreat: string;
    summaryGood: string;
    nothingToReinforce: string;
    helpedCount: (count: number) => string;
    unlockTitle: string;
    unlockText: (operation: Operation, difficulty: Difficulty, detail: string) => string;
    unlockAccept: (difficulty: Difficulty) => string;
    unlockDecline: string;
    safetyNetTitle: string;
    safetyNetText: (operation: Operation, difficulty: Difficulty) => string;
    safetyNetAccept: (difficulty: Difficulty) => string;
    safetyNetDecline: string;
    // A locked difficulty: where to play to open the next one (the locked one itself, or the one before it), and each
    // step still missing.
    unlockIntro: (nextDifficulty: Difficulty, playDifficulty: Difficulty) => string;
    unlockIntroAfter: (lockedDifficulty: Difficulty, nextDifficulty: Difficulty, playDifficulty: Difficulty) => string;
    unlockAlmost: (nextDifficulty: Difficulty, playDifficulty: Difficulty) => string;
    unlockLevelStep: (level: number) => string;
    // The typed right answers left to reach the level; multiple-choice answers count half.
    unlockLevelMissing: (count: number) => string;
    // What is left to the next level: the right answers (or Memória's pairs), what does not count, and what opens.
    levelHelpAnswers: (count: number, level: number) => string;
    levelHelpPairs: (count: number, level: number) => string;
    levelHelpChoiceHalf: string;
    levelHelpWithHelp: string;
    levelHelpOpens: (level: number, name: string) => string;
    unlockCorrectStep: (correct: number, outOf: number) => string;
    unlockMissingAnswers: (count: number) => string;
    unlockDistinctStep: (count: number) => string;

    // The clock. Times arrive written out ("3:00").
    clockDirectionNames: Record<ClockDirection, string>;
    clockReferenceDefault: (minutes: number) => string;
    clockReferenceRecord: string;
    clockOvertime: string;
    clockCountdownFromRecord: (time: string) => string;
    clockCountdownFrom: (time: string) => string;
    clockRecord: (time: string) => string;
    clockGoal: (time: string) => string;
    clockFirstRecord: string;
    clockNewRecord: (previousTime: string) => string;
    clockBeaten: string;
    clockBehindRecord: (extraTime: string, recordTime: string) => string;
    clockBehindDefault: (extraTime: string, minutes: number) => string;
    clockYourRecord: (time: string) => string;
    clockRecordsNeedPerfect: string;
    clockRecordsNeedNoHelp: string;
    // The parts of a record's name: "Soma · Fácil · na vertical", "Multiplicação · Fácil · tabuadas 2, 5 · com inversas".
    recordVertical: string;
    recordResult: string;
    recordTable: (table: number) => string;
    recordTables: (tables: string) => string;
    recordWithInverse: string;
    recordTyping: string;

    // The endless challenge, for adults
    challengeName: string;
    challengeAbout: string;
    challengeGreeting: string;
    challengeRules: (answersPerLevel: number, maxDigits: number) => string[];
    challengeScore: (correctCount: number) => string;
    challengeForAdults: string;
    challengeRecordSummary: (score: string) => string;
    challengeNoRecord: string;
    challengeYourRecord: (score: string) => string;
    challengeLevelUpJoin: (level: number, operation: Operation) => string;
    challengeLevelUpGrow: (level: number) => string;
    challengeLevelUp: (level: number) => string;
    challengeTimeUp: string;
    challengeWrote: (answer: string) => string;
    challengeStopped: string;
    challengeLevelReached: (level: number) => string;

    // "Descobre a conta": a number, and a multiplication that makes it. Lists of multiplications ("2 × 12, 3 × 8 e
    // 4 × 6") arrive joined in the language's own way, with "or".
    factorGameName: string;
    factorGameGreeting: string;
    factorGameAnyAnswer: string;
    factorGameNeedsTable: (fromTable: number, toTable: number) => string;
    factorGameQuestion: (target: number) => string;
    factorGameTryAgain: (first: number, second: number, product: number) => string;
    // The help: one factor of the answer, already in the first slot.
    factorGameHint: (factor: number) => string;
    factorGameAlso: (multiplications: string) => string;
    factorGameAnswers: (multiplications: string) => string;

    // The games of rounds. Calculations arrive written out ("7 × 8"); spoken ones arrive in words ("7 vezes 8").
    roundGameNames: Record<RoundGameId, string>;
    roundGameGreetings: Record<RoundGameId, string>;
    countingSkillNames: Record<CountingSkill, string>;
    numberBondsSkillNames: Record<NumberBondsSkill, string>;
    skipCountingSkillNames: Record<SkipCountingSkill, string>;
    missingSignSkillNames: Record<MissingSignSkill, string>;
    balanceSkillNames: Record<BalanceSkill, string>;
    // The words between two numbers when a calculation is read out: "mais", "menos", "vezes", "a dividir por".
    operationWords: Record<Operation, string>;
    // The help took options away: how many, out of the options of the round.
    roundChoiceHint: (removedCount: number) => string;
    bones: (count: number) => string;
    spokenCounting: (isTwoGroups: boolean) => string;
    spokenNumberBonds: (part: number, whole: number) => string;
    // The five numbers with the hidden one in words: "3, 6, um número escondido, 12, 15".
    spokenSkipCounting: (sequence: string) => string;
    skipCountingGap: string;
    skipCountingStep: (step: number) => string;
    spokenMissingSign: (left: number, right: number, result: number) => string;
    missingSignAnswer: (calculation: string) => string;
    spokenBalance: (leftPan: string, rightPan: string) => string;
    balanceHeavier: (pan: string) => string;
    balanceEqual: string;
    balanceWeights: (heavierValue: number, lighterValue: number) => string;
    balanceSameWeight: (value: number) => string;

    // Memória
    memoryGameName: string;
    memoryGameGreeting: string;
    memoryContentNames: Record<MemoryContent, string>;
    memoryMiss: string;
    memoryHint: string;
    memoryHelpNeedsCard: string;
    memoryCardDown: (position: number) => string;
    memoryCardUp: (position: number, content: string) => string;
    memoryTurns: (turns: number) => string;
    memoryDone: string;
    memoryPairsTitle: string;

    // Mahjong, for adults
    mahjongName: string;
    mahjongAbout: string;
    mahjongGreeting: string;
    mahjongRules: string[];
    mahjongTilesLeft: (count: number) => string;
    mahjongStuck: string;
    mahjongCleared: string;
    mahjongStopped: string;
    mahjongNoMoves: string;
    mahjongRecordSummary: (time: string) => string;
    mahjongNoRecord: string;
    mahjongYourRecord: (time: string) => string;
    mahjongRecordsNeedNoHints: string;
    mahjongTile: (calculation: string, isFree: boolean) => string;

    // Coins, storage, progress and profiles
    coinsCount: (coins: number) => string;
    // "3½ de 5": the answers arrive written out, with a half for multiple choice.
    coinProgress: (answers: string, answersPerCoin: number) => string;
    piggyBankAbout: (answersPerCoin: number) => string;
    piggyBankFull: string;
    storageNewerVersion: string;
    storageNotSaved: string;
    progressCheerStart: string;
    progressCheerKnown: (masteredCount: number) => string;
    nameTooLong: (maximumLength: number) => string;
    nameTaken: string;
    nameEmpty: string;

    labels: Labels;
}

// The fixed words of buttons, titles and screen-reader labels.
export interface Labels {
    start: string;
    namePlaceholder: string;
    cancel: string;
    profiles: string;
    whoIsPlaying: string;
    newProfile: string;
    newProfileName: string;
    createProfile: string;
    deleteProfile: (name: string) => string;
    deleteProfileQuestion: (name: string) => string;
    cannotUndo: string;
    confirmDelete: string;
    language: string;
    settings: string;

    install: string;
    installTitle: string;
    installAbout: string;
    // "Toca em [share icon] Partilhar (…)": the words before the icon, then after it.
    installShareTap: string;
    installShareName: string;
    installShareAdd: string;
    installBeforeStarting: string;
    installBeforeStartingWhy: string;
    installMenuTap: string;
    installMenuAdd: string;
    addToHomeScreen: string;

    home: string;
    play: string;
    playAgain: string;
    seeProgress: string;
    advanced: string;
    whatToPractise: string;
    gamesTitle: string;
    missionTitle: string;
    missionWeek: (done: number, total: number) => string;
    // Monday first.
    weekdayInitials: string[];
    starsCount: (count: number) => string;
    seeStars: string;
    starsProgress: string;
    seePiggyBank: string;
    piggyBank: string;
    outOf: (total: number) => string;
    nextCoin: (progress: string) => string;

    moreOptions: string;
    difficultyQuestion: string;
    layoutQuestion: string;
    verticalExample: string;
    tablesQuestion: string;
    tableName: (table: number) => string;
    modeQuestion: string;
    alwaysTyped: string;
    alwaysTypedAbout: string;
    mixQuestion: string;
    mixAbout: string;
    locked: string;
    clock: string;
    clockAbout: string;
    clockDirectionQuestion: string;
    clockReferenceQuestion: string;
    noRecordYet: string;

    exit: string;
    exitQuestion: string;
    challengeExitQuestion: string;
    yes: string;
    no: string;
    gotIt: string;
    again: string;
    questionPosition: (position: number, total: number) => string;
    gameProgress: string;
    result: string;
    next: string;
    help: string;
    moreHelp: string;
    helpCost: string;
    keypad: string;
    erase: string;
    confirm: string;
    noAnswerYet: string;
    yourAnswer: (answer: string) => string;
    chooseAnswer: string;
    chooseTwoNumbers: string;
    chooseSign: string;
    balance: string;
    cards: string;
    board: string;
    hint: string;
    shuffle: string;
    contentQuestion: string;
    pairCountQuestion: string;
    pairCount: (count: number) => string;
    turns: (count: number) => string;

    correctAtFirstTry: string;
    time: string;
    achievements: string;
    coinsEarned: (coins: number) => string;
    newRecord: string;
    starsEarned: (count: number) => string;
    toPractiseMore: string;

    progressTitle: (name: string) => string;
    progressNumbers: string;
    games: (count: number) => string;
    practiceDays: (count: number) => string;
    coins: (count: number) => string;
    daysInARow: (count: number) => string;
    missionsDone: (count: number) => string;
    records: string;
    noRecords: string;
    divisionUsesMap: string;
    factsKnown: (known: number, total: number) => string;
    mapCaption: string;
    legend: string;
    levelProgress: (level: number) => string;
    levelHelp: (level: number) => string;

    lastQuestion: (equation: string) => string;
    correctAnswers: (count: number) => string;
}
