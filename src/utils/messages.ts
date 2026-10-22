import type { Copy, Labels } from "../copy/copy.ts";
import { de } from "../copy/de.ts";
import { en } from "../copy/en.ts";
import { es } from "../copy/es.ts";
import { fr } from "../copy/fr.ts";
import { it } from "../copy/it.ts";
import { pt } from "../copy/pt.ts";
import type { Skill } from "./arithmetic/utils.ts";
import { ChallengeUtils, type ChallengeRun } from "./challenge/utils.ts";
import { ClockUtils, type ClockDirection, type ClockReference, type ClockSettings } from "./clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "./difficulties/utils.ts";
import { FactorGameUtils, type FactorPair, type FactorRound, type FactorRoundResult } from "./factorGame/utils.ts";
import { HelpsUtils, type ArithmeticHint, type HelpUnavailableReason, type Calculation, type VerticalHelpStep } from "./helps/utils.ts";
import { LocalesUtils, type Locale } from "./locales/utils.ts";
import { NumbersUtils } from "./numbers/utils.ts";
import { OperationsUtils, type Operation } from "./operations/utils.ts";
import type { ClockOutcome, Milestone, SessionOffer, UnlockRequirement, UnlockStep } from "./progression/utils.ts";
import { ProfilesUtils, type PlayProblem, type Practice, type ProfileNameProblem } from "./profiles/utils.ts";
import type { AnswerLayout, DisplayedQuestion, PracticeMode, Question } from "./questions/utils.ts";
import type { RecordCategory } from "./records/utils.ts";
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

    // The end of a timed session: always something kind, and the record only when it was perfect.
    public static getClockOutcomeLines(outcome: ClockOutcome): string[] {
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
            lines.push(copy.clockRecordsNeedPerfect);
        }
        return lines;
    }

    public static getRecordCategoryName(category: RecordCategory): string {
        const copy: Copy = this.getCopy();
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
            parts.push(category.tables.length === 1 ? copy.recordTable(category.tables[0]) : copy.recordTables(category.tables.join(", ")));
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

    public static getFactorGameAbout(): string {
        return this.getCopy().factorGameAbout;
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

    // "2 × 12, 3 × 8 ou 4 × 6", with the words and commas of the language.
    private static writeFactorPairs(pairs: FactorPair[]): string {
        const list: Intl.ListFormat = new Intl.ListFormat(LocalesUtils.getLanguageTag(this.locale), { type: "disjunction" });
        return list.format(pairs.map((pair) => this.getFactorPairText(pair)));
    }

    private static writeCalculation(calculation: Calculation, symbol: string): string {
        return `${calculation.left} ${symbol} ${calculation.right} = ${calculation.result}`;
    }
}
