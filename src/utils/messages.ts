import type { Copy, Labels } from "../copy/copy.ts";
import { de } from "../copy/de.ts";
import { en } from "../copy/en.ts";
import { es } from "../copy/es.ts";
import { fr } from "../copy/fr.ts";
import { it } from "../copy/it.ts";
import { pt } from "../copy/pt.ts";
import type { Skill } from "./arithmetic/utils.ts";
import { BalanceGameUtils, type BalancePan, type BalanceRound, type BalanceSide } from "./balanceGame/utils.ts";
import { ChallengeUtils, type ChallengeRun } from "./challenge/utils.ts";
import { ClockUtils, type ClockDirection, type ClockReference, type ClockSettings } from "./clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "./difficulties/utils.ts";
import { FactorGameUtils, type FactorPair, type FactorRound, type FactorRoundResult } from "./factorGame/utils.ts";
import { HelpsUtils, type ArithmeticHint, type HelpUnavailableReason, type Calculation, type VerticalHelpStep } from "./helps/utils.ts";
import { LocalesUtils, type Locale } from "./locales/utils.ts";
import { MahjongUtils, type MahjongEnding, type MahjongFace } from "./mahjong/utils.ts";
import type { MemoryCard, MemoryContent, MemoryFace } from "./memoryGame/utils.ts";
import { NumbersUtils } from "./numbers/utils.ts";
import { OperationsUtils, type Operation } from "./operations/utils.ts";
import type { ClockOutcome, Milestone, SessionOffer, UnlockRequirement, UnlockStep } from "./progression/utils.ts";
import { ProfilesUtils, type PlayProblem, type Practice, type ProfileNameProblem } from "./profiles/utils.ts";
import type { AnswerLayout, DisplayedQuestion, PracticeMode, Question } from "./questions/utils.ts";
import type { RecordCategory } from "./records/utils.ts";
import { RoundGameUtils, type GameRound, type RoundGameId, type RoundOption, type RoundResult } from "./roundGame/utils.ts";
import { SessionUtils, type AnswerRecord } from "./session/utils.ts";
import type { StorageStatus } from "./storage/utils.ts";
import { TimeUtils } from "./time/utils.ts";
import type { VerticalColumn } from "./vertical/utils.ts";
import { WalletUtils } from "./wallet/utils.ts";

export interface Feedback {
    title: string;
    lines: string[];
}

export interface FeedbackContext {
    variant: number;
    hasRetryAhead: boolean;
}

// What makes a game count for a record: every answer right at the first try, or no help.
export type ClockRecordRule = "perfect" | "no-help";

export interface OfferText {
    title: string;
    text: string;
    acceptLabel: string;
    declineLabel: string;
}

const COPIES: Record<Locale, Copy> = { pt, en, es, fr, de, it };

// Faísca's voice and every word of the app, in the language App sets before each render. Messages decides what to
// say; the copy of each language (src/copy) words it. Short, warm, and never about being wrong.
export class Messages {
    private static locale: Locale = "pt";

    public static setLocale(locale: Locale): void {
        this.locale = locale;
    }

    public static getLocale(): Locale {
        return this.locale;
    }

    // The fixed words of buttons, titles and screen-reader labels.
    public static getLabels(): Labels {
        return this.getCopy().labels;
    }

    public static getTagline(): string {
        return this.getCopy().tagline;
    }

    public static getWelcomeQuestion(): string {
        return this.getCopy().welcomeQuestion;
    }

    public static getGreeting(name: string): string {
        return this.getCopy().greeting(name);
    }

    // The first miss never shows the answer: it points at what to look at and gives the second chance.
    public static getTryAgain(question: Question, variant: number, wrongColumnCount: number): string {
        if (question.format === "vertical") {
            return this.getCopy().tryAgainColumns(wrongColumnCount);
        }
        const messages: string[] = this.getCopy().tryAgains;
        return messages[variant % messages.length];
    }

    // The games of rounds: a gentle word, rotating so two misses in a row read differently.
    public static getTryAgainText(variant: number): string {
        const messages: string[] = this.getCopy().tryAgains;
        return messages[variant % messages.length];
    }

    // Rotates through the praises so consecutive right answers do not repeat the same one.
    public static getFeedback(record: AnswerRecord, context: FeedbackContext): Feedback {
        const copy: Copy = this.getCopy();
        if (record.isCorrect && record.question.isRetry) {
            return { title: copy.rightAtRetry, lines: [] };
        }
        if (record.isCorrect && !SessionUtils.isFirstTryCorrect(record)) {
            return { title: copy.rightAtSecondTry, lines: [] };
        }
        if (record.isCorrect) {
            return { title: copy.praises[context.variant % copy.praises.length], lines: [] };
        }
        return {
            title: copy.almost,
            lines: [copy.rightAnswer(String(record.question.answer)), context.hasRetryAhead ? copy.retryAhead : copy.retryNextTime]
        };
    }

    public static getMilestone(milestone: Milestone): string {
        if (milestone.kind === "coin") {
            return this.getCopy().coinMilestone;
        }
        return this.getCopy().levelUpMilestone(milestone.level);
    }

    public static getOperationName(operation: Operation): string {
        return this.getCopy().operationNames[operation];
    }

    public static getMixName(): string {
        return this.getCopy().mixName;
    }

    public static getPracticeName(practice: Practice): string {
        return practice === "mix" ? this.getMixName() : this.getOperationName(practice);
    }

    public static getPlayProblem(problem: PlayProblem): string {
        if (problem === "too-few-operations") {
            return this.getCopy().playProblemMix(ProfilesUtils.getMinMixOperations());
        }
        return this.getCopy().playProblemTables;
    }

    public static getDifficultyName(difficulty: Difficulty): string {
        return this.getCopy().difficultyNames[difficulty];
    }

    // What a difficulty asks, in a few words: a range for + and −, an example for × and ÷.
    public static getDifficultyDetail(operation: Operation, difficulty: Difficulty): string {
        if (OperationsUtils.isAdditive(operation)) {
            return this.getCopy().difficultyRange(DifficultiesUtils.getLimit(difficulty));
        }
        if (OperationsUtils.usesTables(operation, difficulty)) {
            return this.getCopy().difficultyTables;
        }
        const examples: Record<"multiplication" | "division", Record<"medium" | "hard", string>> = {
            multiplication: { medium: "23 × 4", hard: "157 × 6" },
            division: { medium: "84 ÷ 4", hard: "936 ÷ 4" }
        };
        return this.getCopy().difficultyExample(examples[operation][difficulty === "medium" ? "medium" : "hard"]);
    }

    public static getLayoutLabel(layout: AnswerLayout): string {
        return this.getCopy().layoutNames[layout];
    }

    public static getSkillName(skill: Skill): string {
        return this.getCopy().skillNames[skill];
    }

    public static getLevelName(level: number): string {
        return this.getCopy().levelName(level);
    }

    // The home screen's one-line summary of an operation: where the child is, not every level.
    public static getOperationSummary(difficulty: Difficulty, level: number): string {
        return this.getCopy().operationSummary(this.getDifficultyName(difficulty), level);
    }

    public static getEquationText(question: DisplayedQuestion): string {
        const [left, right, result]: string[] = [question.left, question.right, question.result].map((value) => NumbersUtils.format(value));
        return `${left} ${OperationsUtils.getSymbol(question.operation)} ${right} = ${result}`;
    }

    public static getSpokenQuestion(question: DisplayedQuestion): string {
        const copy: Copy = this.getCopy();
        switch (question.operation) {
            case "addition":
                return copy.spokenAddition(question.left, question.right);
            case "subtraction":
                return copy.spokenSubtraction(question.left, question.right);
            case "division":
                return copy.spokenDivision(question.left, question.right);
            default:
                break;
        }
        switch (question.kind) {
            case "missing-left":
                return copy.spokenMissingLeft(question.right, question.result);
            case "missing-right":
                return copy.spokenMissingRight(question.left, question.result);
            default:
                return copy.spokenMultiplication(question.left, question.right);
        }
    }

    public static getCellLabel(column: number, digit: number | null): string {
        return this.getCopy().cellLabel(column, digit);
    }

    public static getHelpUnavailable(reason: HelpUnavailableReason): string {
        if (reason === "limit") {
            return this.getCopy().helpLimit(HelpsUtils.getMaxHelpsPerSession());
        }
        return this.getCopy().helpNoCoins(WalletUtils.getAnswersPerCoin());
    }

    public static getChoiceHint(): string {
        return this.getCopy().choiceHint;
    }

    public static getArithmeticHint(question: Question, hint: ArithmeticHint): string {
        const copy: Copy = this.getCopy();
        const symbol: string = OperationsUtils.getSymbol(question.operation);
        switch (hint.kind) {
            case "split":
                return copy.hintSplit(this.writeCalculation(hint.firstStep, symbol), `${symbol} ${hint.remaining}`);
            case "partial": {
                const firstStep: string = this.writeCalculation(hint.firstStep, symbol);
                const rest: string = `${hint.rest.left} ${symbol} ${hint.rest.right}`;
                return question.operation === "division" ? copy.hintPartialDivision(firstStep, rest) : copy.hintPartialSum(firstStep, rest);
            }
            case "round":
                return copy.hintRound(this.writeCalculation(hint.base, symbol), hint.zeros);
            default: {
                const isForward: boolean = question.operation === "addition";
                if (hint.unit === 10) {
                    return copy.hintCountTens(hint.start, hint.steps, isForward);
                }
                return copy.hintCount(hint.start, hint.steps, isForward);
            }
        }
    }

    public static getNeighbourHint(fact: Calculation): string {
        return this.getCopy().hintNeighbour(this.writeCalculation(fact, "×"));
    }

    public static getVerticalHint(question: Question, column: VerticalColumn, columnIndex: number, step: VerticalHelpStep): string {
        const copy: Copy = this.getCopy();
        if (column.result === null) {
            return copy.verticalEmpty;
        }
        if (step === "digit") {
            return copy.verticalDigit(columnIndex, column.result);
        }
        if (column.top === null && column.bottom === null) {
            return copy.verticalCarryOnly;
        }
        // A number shorter than the other has nothing in this column, which is the same as 0.
        const top: number = column.top ?? 0;
        const bottom: number = column.bottom ?? 0;
        if (question.operation === "addition") {
            if (step === "marks") {
                return copy.verticalCarry(top, bottom);
            }
            return copy.verticalColumn(columnIndex, `${top} + ${bottom}`);
        }
        if (step === "marks") {
            return copy.verticalBorrow(top, column.workingTop ?? top, bottom);
        }
        return copy.verticalColumn(columnIndex, `${top} − ${bottom}`);
    }

    public static getSessionEnd(): string {
        return this.getCopy().sessionEnd;
    }

    public static getSummaryHeadline(correctAtFirstTry: number, total: number): string {
        const greatScoreRatio: number = 0.7;
        if (correctAtFirstTry === total) {
            return this.getCopy().summaryPerfect;
        }
        if (correctAtFirstTry >= total * greatScoreRatio) {
            return this.getCopy().summaryGreat;
        }
        return this.getCopy().summaryGood;
    }

    public static getNothingToReinforce(): string {
        return this.getCopy().nothingToReinforce;
    }

    public static getHelpedCount(helpedCount: number): string {
        return this.getCopy().helpedCount(helpedCount);
    }

    // Names the operation too, because the offer can come from a mix.
    public static getOfferText(offer: SessionOffer): OfferText {
        const copy: Copy = this.getCopy();
        if (offer.kind === "unlock") {
            return {
                title: copy.unlockTitle,
                text: copy.unlockText(offer.operation, offer.difficulty, this.getDifficultyDetail(offer.operation, offer.difficulty)),
                acceptLabel: copy.unlockAccept(offer.difficulty),
                declineLabel: copy.unlockDecline
            };
        }
        return {
            title: copy.safetyNetTitle,
            text: copy.safetyNetText(offer.operation, offer.difficulty),
            acceptLabel: copy.safetyNetAccept(offer.difficulty),
            declineLabel: copy.safetyNetDecline
        };
    }

    // Where to play to open a locked difficulty; when it is not the next to open, which one comes first.
    public static getUnlockIntro(lockedDifficulty: Difficulty, requirement: UnlockRequirement): string {
        const copy: Copy = this.getCopy();
        if (requirement.isReady) {
            return copy.unlockAlmost(requirement.nextDifficulty, requirement.playDifficulty);
        }
        if (lockedDifficulty !== requirement.nextDifficulty) {
            return copy.unlockIntroAfter(lockedDifficulty, requirement.nextDifficulty, requirement.playDifficulty);
        }
        return copy.unlockIntro(requirement.nextDifficulty, requirement.playDifficulty);
    }

    public static getUnlockStep(step: UnlockStep): string {
        switch (step.kind) {
            case "level":
                return this.getCopy().unlockLevelStep(step.needed);
            case "correct":
                return this.getCopy().unlockCorrectStep(step.needed, step.outOf);
            default:
                return this.getCopy().unlockDistinctStep(step.needed);
        }
    }

    public static getUnlockLevelMissing(count: number): string {
        return this.getCopy().unlockLevelMissing(count);
    }

    public static getUnlockMissingAnswers(count: number): string {
        return this.getCopy().unlockMissingAnswers(count);
    }

    public static getClockDirectionLabel(direction: ClockDirection): string {
        return this.getCopy().clockDirectionNames[direction];
    }

    public static getClockReferenceLabel(reference: ClockReference): string {
        return reference === "default" ? this.getCopy().clockReferenceDefault(ClockUtils.getDefaultMinutes()) : this.getCopy().clockReferenceRecord;
    }

    // Under the running clock: what it is measured against. Never a warning.
    public static getClockNote(settings: ClockSettings, referenceMilliseconds: number, hasRecord: boolean, isOvertime: boolean): string {
        const copy: Copy = this.getCopy();
        if (isOvertime) {
            return copy.clockOvertime;
        }
        const reference: string = TimeUtils.formatElapsed(referenceMilliseconds);
        const isRecord: boolean = settings.reference === "record" && hasRecord;
        if (settings.direction === "down") {
            return isRecord ? copy.clockCountdownFromRecord(reference) : copy.clockCountdownFrom(reference);
        }
        return isRecord ? copy.clockRecord(reference) : copy.clockGoal(reference);
    }

    // The end of a timed session: always something kind, and the record only when it was perfect. Memória has no
    // wrong answers, so there a perfect game is one without help.
    public static getClockOutcomeLines(outcome: ClockOutcome, recordRule: ClockRecordRule = "perfect"): string[] {
        const copy: Copy = this.getCopy();
        const lines: string[] = [];
        if (outcome.isNewRecord) {
            lines.push(
                outcome.previousRecordMilliseconds === null
                    ? copy.clockFirstRecord
                    : copy.clockNewRecord(TimeUtils.formatElapsed(outcome.previousRecordMilliseconds))
            );
        } else if (outcome.isWithinReference) {
            lines.push(copy.clockBeaten);
        } else {
            const extra: string = TimeUtils.formatElapsed(outcome.elapsedMilliseconds - outcome.referenceMilliseconds);
            lines.push(
                outcome.isAgainstRecord
                    ? copy.clockBehindRecord(extra, TimeUtils.formatElapsed(outcome.referenceMilliseconds))
                    : copy.clockBehindDefault(extra, ClockUtils.getDefaultMinutes())
            );
        }
        if (!outcome.isNewRecord && !outcome.isAgainstRecord && outcome.previousRecordMilliseconds !== null) {
            lines.push(copy.clockYourRecord(TimeUtils.formatElapsed(outcome.previousRecordMilliseconds)));
        }
        if (!outcome.isPerfect) {
            lines.push(recordRule === "perfect" ? copy.clockRecordsNeedPerfect : copy.clockRecordsNeedNoHelp);
        }
        return lines;
    }

    public static getRecordCategoryName(category: RecordCategory): string {
        const copy: Copy = this.getCopy();
        if (category.kind === "factor-game") {
            return `${this.getFactorGameName()} · ${this.getTablesName(category.tables)}`;
        }
        if (category.kind === "round-game") {
            return `${this.getRoundGameName(category.game)} · ${this.getLevelName(category.level)}`;
        }
        if (category.kind === "memory-game") {
            const parts: string[] = [this.getMemoryGameName(), this.getMemoryContentName(category.content), copy.labels.pairCount(category.pairCount)];
            return [...parts, ...(category.tables === null ? [] : [this.getTablesName(category.tables)])].join(" · ");
        }
        if (category.kind === "mix") {
            const operations: string = category.parts
                .map((part) => `${this.getOperationName(part.operation)} ${this.getDifficultyName(part.difficulty)}`)
                .join(", ");
            return `${this.getMixName()} · ${operations}`;
        }
        const parts: string[] = [this.getOperationName(category.operation), this.getDifficultyName(category.difficulty)];
        if (category.layout !== null) {
            parts.push(category.layout === "vertical" ? copy.recordVertical : copy.recordResult);
        }
        if (category.tables !== null) {
            parts.push(this.getTablesName(category.tables));
        }
        if (category.mode === "mixed") {
            parts.push(copy.recordWithInverse);
        }
        if (category.isAlwaysTyped) {
            parts.push(copy.recordTyping);
        }
        return parts.join(" · ");
    }

    public static getChallengeName(): string {
        return this.getCopy().challengeName;
    }

    // Next to the switch that shows it on the home screen: who it is for, and how it ends.
    public static getChallengeAbout(): string {
        return this.getCopy().challengeAbout;
    }

    public static getChallengeGreeting(): string {
        return this.getCopy().challengeGreeting;
    }

    public static getChallengeRules(): string[] {
        return this.getCopy().challengeRules(ChallengeUtils.getAnswersPerLevel(), ChallengeUtils.getMaxDigits());
    }

    public static getChallengeScore(correctCount: number): string {
        return this.getCopy().challengeScore(correctCount);
    }

    // Under the challenge's name on the home screen.
    public static getChallengeSummary(record: number | null): string {
        return record === null ? this.getCopy().challengeForAdults : this.getCopy().challengeRecordSummary(this.getChallengeScore(record));
    }

    public static getChallengeRecord(record: number | null): string {
        return record === null ? this.getCopy().challengeNoRecord : this.getCopy().challengeYourRecord(this.getChallengeScore(record));
    }

    // What changes at the new level: an operation joins, or the numbers grow and the time shrinks. Past the top
    // level nothing changes any more.
    public static getChallengeLevelUp(level: number): string {
        const joiningOperation: Operation | null = ChallengeUtils.getJoiningOperation(level);
        if (joiningOperation !== null) {
            return this.getCopy().challengeLevelUpJoin(level, joiningOperation);
        }
        if (level <= ChallengeUtils.getTopLevel()) {
            return this.getCopy().challengeLevelUpGrow(level);
        }
        return this.getCopy().challengeLevelUp(level);
    }

    // The last question shows next to it, with the right answer.
    public static getChallengeEnding(run: ChallengeRun): Feedback {
        const copy: Copy = this.getCopy();
        switch (run.ending) {
            case "time":
                return { title: copy.challengeTimeUp, lines: [] };
            case "wrong":
                return { title: copy.almost, lines: run.givenAnswer === null ? [] : [copy.challengeWrote(NumbersUtils.format(run.givenAnswer))] };
            default:
                return { title: copy.challengeStopped, lines: [] };
        }
    }

    public static getChallengeLevelReached(correctCount: number): string {
        return this.getCopy().challengeLevelReached(ChallengeUtils.getLevel(correctCount));
    }

    public static getFactorGameName(): string {
        return this.getCopy().factorGameName;
    }

    public static getFactorGameGreeting(): string {
        return this.getCopy().factorGameGreeting;
    }

    public static getFactorGameAnyAnswer(): string {
        return this.getCopy().factorGameAnyAnswer;
    }

    public static getFactorGameNeedsTable(): string {
        const factors: number[] = FactorGameUtils.getFactors();
        return this.getCopy().factorGameNeedsTable(factors[0], factors[factors.length - 1]);
    }

    public static getFactorGameQuestion(target: number): string {
        return this.getCopy().factorGameQuestion(target);
    }

    // The first miss says what the child's multiplication makes, never the answer.
    public static getFactorGameTryAgain(pair: FactorPair): string {
        return this.getCopy().factorGameTryAgain(pair.first, pair.second, pair.first * pair.second);
    }

    public static getFactorGameHint(round: FactorRound): string {
        return this.getCopy().factorGameHint(FactorGameUtils.getHintFactor(round));
    }

    // Once answered, the other multiplications that make the same number: when right, as a bonus; after two misses,
    // all of them.
    public static getFactorGameFeedback(result: FactorRoundResult, variant: number): Feedback {
        const copy: Copy = this.getCopy();
        if (result.isCorrect) {
            const title: string = FactorGameUtils.isFirstTryCorrect(result) ? copy.praises[variant % copy.praises.length] : copy.rightAtSecondTry;
            const otherPairs: FactorPair[] = FactorGameUtils.getOtherPairs(result);
            return { title, lines: otherPairs.length === 0 ? [] : [copy.factorGameAlso(this.writeFactorPairs(otherPairs))] };
        }
        const pairs: FactorPair[] = result.round.pairs;
        const answer: string = pairs.length === 1 ? copy.rightAnswer(this.getFactorPairText(pairs[0])) : copy.factorGameAnswers(this.writeFactorPairs(pairs));
        return { title: copy.almost, lines: [answer] };
    }

    public static getFactorPairText(pair: FactorPair): string {
        return `${pair.first} × ${pair.second}`;
    }

    // Every multiplication that makes the number: "24 = 2 × 12 = 3 × 8 = 4 × 6".
    public static getFactorRoundText(round: FactorRound): string {
        return [String(round.target), ...round.pairs.map((pair) => this.getFactorPairText(pair))].join(" = ");
    }

    public static getRoundGameName(game: RoundGameId): string {
        return this.getCopy().roundGameNames[game];
    }

    public static getRoundGameGreeting(game: RoundGameId): string {
        return this.getCopy().roundGameGreetings[game];
    }

    public static getRoundSkillName(game: RoundGameId, skill: string): string {
        const copy: Copy = this.getCopy();
        const names: Record<string, string> = (() => {
            switch (game) {
                case "counting":
                    return copy.countingSkillNames;
                case "number-bonds":
                    return copy.numberBondsSkillNames;
                case "skip-counting":
                    return copy.skipCountingSkillNames;
                case "missing-sign":
                    return copy.missingSignSkillNames;
                default:
                    return copy.balanceSkillNames;
            }
        })();
        return names[skill];
    }

    public static getSpokenRound(round: GameRound): string {
        const copy: Copy = this.getCopy();
        switch (round.game) {
            case "counting":
                return copy.spokenCounting(round.groups.length > 1);
            case "number-bonds":
                return copy.spokenNumberBonds(round.part, round.whole);
            case "skip-counting":
                return copy.spokenSkipCounting(
                    round.numbers.map((number, index) => (index === round.missingIndex ? copy.skipCountingGap : String(number))).join(", ")
                );
            case "missing-sign":
                return copy.spokenMissingSign(round.left, round.right, round.result);
            default:
                return copy.spokenBalance(this.getSpokenPan(round.leftPan), this.getSpokenPan(round.rightPan));
        }
    }

    // What a screen reader says for an option: the number, the sign in words, or which pan is heavier.
    public static getRoundOptionLabel(round: GameRound, option: RoundOption): string {
        const copy: Copy = this.getCopy();
        if (round.game === "missing-sign") {
            return copy.operationWords[option as Operation];
        }
        if (round.game !== "balance") {
            return String(option);
        }
        switch (option) {
            case "left":
                return copy.balanceHeavier(this.getSpokenPan(round.leftPan));
            case "right":
                return copy.balanceHeavier(this.getSpokenPan(round.rightPan));
            default:
                return copy.balanceEqual;
        }
    }

    public static getRoundChoiceHint(removedCount: number): string {
        return this.getCopy().roundChoiceHint(removedCount);
    }

    // The help on a balance: one of its calculations, worked out.
    public static getBalanceHint(round: BalanceRound): string {
        const side: "left" | "right" | null = BalanceGameUtils.getHintSide(round);
        if (side === null) {
            throw new Error(`The balance ${round.id} has no calculation to work out.`);
        }
        const pan: BalancePan = side === "left" ? round.leftPan : round.rightPan;
        return this.getCopy().hintNeighbour(`${this.getPanText(pan)} = ${BalanceGameUtils.getValue(pan)}`);
    }

    // Right: a praise, and what else was right or what the round shows. Wrong after two tries: the answer, and why.
    public static getRoundFeedback(result: RoundResult, variant: number): Feedback {
        const copy: Copy = this.getCopy();
        const { round } = result;
        const title: string = (() => {
            if (!result.isCorrect) {
                return copy.almost;
            }
            return RoundGameUtils.isFirstTryCorrect(result) ? copy.praises[variant % copy.praises.length] : copy.rightAtSecondTry;
        })();
        switch (round.game) {
            case "counting":
            case "number-bonds":
                return { title, lines: result.isCorrect ? [] : [copy.rightAnswer(String(round.answer))] };
            case "skip-counting": {
                const step: string = copy.skipCountingStep(round.step);
                return { title, lines: result.isCorrect ? [step] : [copy.rightAnswer(String(round.answer)), step] };
            }
            case "missing-sign": {
                const writeSign = (operation: Operation): string => `${round.left} ${OperationsUtils.getSymbol(operation)} ${round.right} = ${round.result}`;
                const shown: Operation = RoundGameUtils.getShownOption(result) as Operation;
                const others: Operation[] = round.answers.filter((operation) => operation !== shown);
                if (result.isCorrect) {
                    return { title, lines: others.length === 0 ? [] : [copy.factorGameAlso(others.map(writeSign).join(", "))] };
                }
                if (others.length === 0) {
                    return { title, lines: [copy.missingSignAnswer(writeSign(shown))] };
                }
                return { title, lines: [copy.factorGameAnswers(this.writeAlternatives([shown, ...others].map(writeSign)))] };
            }
            default:
                return { title, lines: [this.getBalanceWeights(round)] };
        }
    }

    // What the pans weigh, once answered: "56 pesa mais do que 54."
    public static getBalanceWeights(round: BalanceRound): string {
        const leftValue: number = BalanceGameUtils.getValue(round.leftPan);
        const rightValue: number = BalanceGameUtils.getValue(round.rightPan);
        if (leftValue === rightValue) {
            return this.getCopy().balanceSameWeight(leftValue);
        }
        return this.getCopy().balanceWeights(Math.max(leftValue, rightValue), Math.min(leftValue, rightValue));
    }

    // A round written out, to train it again: "3 + 4 = 7", "3, 6, 9, 12, 15", "7 × 8 > 6 × 9".
    public static getRoundText(round: GameRound): string {
        switch (round.game) {
            case "counting":
                return round.groups.length > 1 ? `${round.groups.join(" + ")} = ${round.answer}` : this.getCopy().bones(round.answer);
            case "number-bonds":
                return `${round.part} + ${round.answer} = ${round.whole}`;
            case "skip-counting":
                return round.numbers.join(", ");
            case "missing-sign":
                return `${round.left} ${OperationsUtils.getSymbol(round.answer)} ${round.right} = ${round.result}`;
            default: {
                const signs: Record<BalanceSide, string> = { left: ">", equal: "=", right: "<" };
                return `${this.getPanText(round.leftPan)} ${signs[round.answer]} ${this.getPanText(round.rightPan)}`;
            }
        }
    }

    public static getPanText(pan: BalancePan): string {
        return pan.operation === null ? String(pan.left) : `${pan.left} ${OperationsUtils.getSymbol(pan.operation)} ${pan.right}`;
    }

    public static getSpokenCalculation(operation: Operation, left: number, right: number): string {
        return `${left} ${this.getCopy().operationWords[operation]} ${right}`;
    }

    public static getBones(count: number): string {
        return this.getCopy().bones(count);
    }

    public static getMemoryGameName(): string {
        return this.getCopy().memoryGameName;
    }

    public static getMemoryGameGreeting(): string {
        return this.getCopy().memoryGameGreeting;
    }

    public static getMemoryContentName(content: MemoryContent): string {
        return this.getCopy().memoryContentNames[content];
    }

    // A match is praised like a right answer; a miss is part of the game.
    public static getMemoryFlipText(isMatch: boolean, variant: number): string {
        const copy: Copy = this.getCopy();
        return isMatch ? copy.praises[variant % copy.praises.length] : copy.memoryMiss;
    }

    public static getMemoryHint(): string {
        return this.getCopy().memoryHint;
    }

    public static getMemoryHelpNeedsCard(): string {
        return this.getCopy().memoryHelpNeedsCard;
    }

    public static getMemoryTurns(turns: number): string {
        return this.getCopy().memoryTurns(turns);
    }

    public static getMemoryDone(): string {
        return this.getCopy().memoryDone;
    }

    public static getMemoryPairsTitle(): string {
        return this.getCopy().memoryPairsTitle;
    }

    // Cards are numbered from 1, in reading order.
    public static getMemoryCardLabel(position: number, card: MemoryCard | null): string {
        if (card === null) {
            return this.getCopy().memoryCardDown(position);
        }
        return this.getCopy().memoryCardUp(position, this.getSpokenMemoryFace(card.face));
    }

    public static getMemoryFaceText(face: MemoryFace): string {
        switch (face.kind) {
            case "quantity":
                return this.getBones(face.count);
            case "number":
                return String(face.value);
            default:
                return `${face.left} ${OperationsUtils.getSymbol(face.operation)} ${face.right}`;
        }
    }

    // "3 + 4 = 7", "7 ossos = 7".
    public static getMemoryPairText(pair: MemoryCard[]): string {
        return pair.map((card) => this.getMemoryFaceText(card.face)).join(" = ");
    }

    public static getMahjongName(): string {
        return this.getCopy().mahjongName;
    }

    public static getMahjongAbout(): string {
        return this.getCopy().mahjongAbout;
    }

    public static getMahjongGreeting(): string {
        return this.getCopy().mahjongGreeting;
    }

    public static getMahjongRules(): string[] {
        return this.getCopy().mahjongRules;
    }

    public static getMahjongTilesLeft(count: number): string {
        return this.getCopy().mahjongTilesLeft(count);
    }

    public static getMahjongStuck(): string {
        return this.getCopy().mahjongStuck;
    }

    public static getMahjongEnding(ending: MahjongEnding): string {
        switch (ending) {
            case "cleared":
                return this.getCopy().mahjongCleared;
            case "stuck":
                return this.getCopy().mahjongNoMoves;
            default:
                return this.getCopy().mahjongStopped;
        }
    }

    // Under its name on the home screen.
    public static getMahjongSummary(recordMilliseconds: number | null): string {
        if (recordMilliseconds === null) {
            return this.getCopy().challengeForAdults;
        }
        return this.getCopy().mahjongRecordSummary(TimeUtils.formatElapsed(recordMilliseconds));
    }

    public static getMahjongRecord(recordMilliseconds: number | null): string {
        if (recordMilliseconds === null) {
            return this.getCopy().mahjongNoRecord;
        }
        return this.getCopy().mahjongYourRecord(TimeUtils.formatElapsed(recordMilliseconds));
    }

    public static getMahjongRecordsNeedNoHints(): string {
        return this.getCopy().mahjongRecordsNeedNoHints;
    }

    public static getMahjongFaceText(face: MahjongFace): string {
        return MahjongUtils.getFaceText(face);
    }

    public static getMahjongTileLabel(face: MahjongFace, isFree: boolean): string {
        return this.getCopy().mahjongTile(this.getSpokenCalculation(face.operation, face.left, face.right), isFree);
    }

    public static getCoinsCount(coins: number): string {
        return this.getCopy().coinsCount(coins);
    }

    // Multiple choice counts half, so the progress can be "3½ de 5".
    public static getCoinProgress(answers: number): string {
        const wholeAnswers: number = Math.floor(answers);
        const half: string = answers > wholeAnswers ? "½" : "";
        return this.getCopy().coinProgress(`${wholeAnswers === 0 && half !== "" ? "" : wholeAnswers}${half}`, WalletUtils.getAnswersPerCoin());
    }

    public static getPiggyBankAbout(): string {
        return this.getCopy().piggyBankAbout(WalletUtils.getAnswersPerCoin());
    }

    public static getPiggyBankFull(): string {
        return this.getCopy().piggyBankFull;
    }

    public static getStorageWarning(status: StorageStatus): string {
        return status === "newer-version" ? this.getCopy().storageNewerVersion : this.getCopy().storageNotSaved;
    }

    public static getProgressCheer(masteredCount: number): string {
        return masteredCount === 0 ? this.getCopy().progressCheerStart : this.getCopy().progressCheerKnown(masteredCount);
    }

    public static getMasteryLabel(level: number): string {
        return this.getCopy().masteryNames[level];
    }

    public static getModeLabel(mode: PracticeMode): string {
        return this.getCopy().modeNames[mode];
    }

    public static getModeExample(mode: PracticeMode): string {
        return mode === "direct" ? "7 × 8 = ?" : "? × 8 = 56";
    }

    public static getNameProblem(problem: ProfileNameProblem): string {
        switch (problem) {
            case "too-long":
                return this.getCopy().nameTooLong(ProfilesUtils.getMaxNameLength());
            case "taken":
                return this.getCopy().nameTaken;
            default:
                return this.getCopy().nameEmpty;
        }
    }

    private static getCopy(): Copy {
        return COPIES[this.locale];
    }

    private static getTablesName(tables: number[]): string {
        const copy: Copy = this.getCopy();
        return tables.length === 1 ? copy.recordTable(tables[0]) : copy.recordTables(tables.join(", "));
    }

    // A pan read out: "7 vezes 8", or the number alone.
    private static getSpokenPan(pan: BalancePan): string {
        return pan.operation === null ? String(pan.left) : this.getSpokenCalculation(pan.operation, pan.left, pan.right);
    }

    private static getSpokenMemoryFace(face: MemoryFace): string {
        switch (face.kind) {
            case "quantity":
                return this.getBones(face.count);
            case "number":
                return String(face.value);
            default:
                return this.getSpokenCalculation(face.operation, face.left, face.right);
        }
    }

    // "2 + 2 = 4 ou 2 × 2 = 4", with the words of the language.
    private static writeAlternatives(items: string[]): string {
        const list: Intl.ListFormat = new Intl.ListFormat(LocalesUtils.getLanguageTag(this.locale), { type: "disjunction" });
        return list.format(items);
    }

    // "2 × 12, 3 × 8 ou 4 × 6", with the words and commas of the language.
    private static writeFactorPairs(pairs: FactorPair[]): string {
        return this.writeAlternatives(pairs.map((pair) => this.getFactorPairText(pair)));
    }

    private static writeCalculation(calculation: Calculation, symbol: string): string {
        return `${calculation.left} ${symbol} ${calculation.right} = ${calculation.result}`;
    }
}
