import type { Skill } from "./arithmetic/utils.ts";
import { ClockUtils, type ClockDirection, type ClockReference, type ClockSettings } from "./clock/utils.ts";
import { DifficultiesUtils, type Difficulty } from "./difficulties/utils.ts";
import { HelpsUtils, type ArithmeticHint, type HelpUnavailableReason, type Calculation, type VerticalHelpStep } from "./helps/utils.ts";
import { OperationsUtils, type Operation } from "./operations/utils.ts";
import type { ClockOutcome, Milestone, SessionOffer } from "./progression/utils.ts";
import { ProfilesUtils, type PlayProblem, type Practice, type ProfileNameProblem } from "./profiles/utils.ts";
import type { AnswerLayout, PracticeMode, Question } from "./questions/utils.ts";
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

// Faísca's voice: the sentences that react to the child, in European Portuguese.
// Short, warm, and never about being wrong. Fixed button labels live with their component.
export class Messages {
    public static getTagline(): string {
        return "Acende o teu talento!";
    }

    public static getWelcomeQuestion(): string {
        return "Olá! Eu sou o Faísca. Como te chamas?";
    }

    public static getGreeting(name: string): string {
        return `Olá, ${name}! O que vamos praticar hoje?`;
    }

    public static getCorrectMessages(): string[] {
        return ["Muito bem!", "Boa! Acertaste!", "Isso mesmo!", "Excelente!", "Estás a melhorar!"];
    }

    public static getTryAgainMessages(): string[] {
        return ["Quase! Tenta outra vez.", "Ainda não. Experimenta outra vez!", "Hmm, quase! Vamos ver outra vez?"];
    }

    // The first miss never shows the answer: it points at what to look at and gives the second chance.
    public static getTryAgain(question: Question, variant: number, wrongColumnCount: number): string {
        if (question.format === "vertical") {
            return wrongColumnCount === 1 ? "Quase! Vê a coluna realçada e tenta outra vez." : "Quase! Vê as colunas realçadas e tenta outra vez.";
        }
        const messages: string[] = this.getTryAgainMessages();
        return messages[variant % messages.length];
    }

    // Rotates through the praises so consecutive right answers do not repeat the same one.
    public static getFeedback(record: AnswerRecord, context: FeedbackContext): Feedback {
        if (record.isCorrect && record.question.isRetry) {
            return { title: "Boa! Desta vez acertaste!", lines: [] };
        }
        if (record.isCorrect && !SessionUtils.isFirstTryCorrect(record)) {
            return { title: "Boa! À segunda acertaste!", lines: [] };
        }
        if (record.isCorrect) {
            const praises: string[] = this.getCorrectMessages();
            return { title: praises[context.variant % praises.length], lines: [] };
        }
        return {
            title: "Quase!",
            lines: [
                `A resposta certa é ${record.question.answer}.`,
                context.hasRetryAhead ? "Vamos tentar outra vez mais à frente." : "Vamos treinar esta na próxima vez."
            ]
        };
    }

    public static getMilestone(milestone: Milestone): string {
        if (milestone.kind === "coin") {
            return "Ganhaste uma moeda!";
        }
        return `Subiste para o nível ${milestone.level}!`;
    }

    public static getOperationName(operation: Operation): string {
        switch (operation) {
            case "addition":
                return "Soma";
            case "subtraction":
                return "Subtração";
            case "multiplication":
                return "Multiplicação";
            default:
                return "Divisão";
        }
    }

    public static getMixName(): string {
        return "Misturado";
    }

    public static getPracticeName(practice: Practice): string {
        return practice === "mix" ? this.getMixName() : this.getOperationName(practice);
    }

    public static getPlayProblem(problem: PlayProblem): string {
        if (problem === "too-few-operations") {
            return `Escolhe pelo menos ${ProfilesUtils.getMinMixOperations()} contas para misturar.`;
        }
        return "Escolhe pelo menos uma tabuada.";
    }

    public static getDifficultyName(difficulty: Difficulty): string {
        switch (difficulty) {
            case "easy":
                return "Fácil";
            case "medium":
                return "Médio";
            default:
                return "Difícil";
        }
    }

    // What a difficulty asks, in a few words: a range for + and −, an example for × and ÷.
    public static getDifficultyDetail(operation: Operation, difficulty: Difficulty): string {
        if (OperationsUtils.isAdditive(operation)) {
            return `até ${DifficultiesUtils.getLimit(difficulty)}`;
        }
        if (OperationsUtils.usesTables(operation, difficulty)) {
            return "tabuadas";
        }
        const examples: Record<"multiplication" | "division", Record<"medium" | "hard", string>> = {
            multiplication: { medium: "como 23 × 4", hard: "como 157 × 6" },
            division: { medium: "como 84 ÷ 4", hard: "como 936 ÷ 4" }
        };
        return examples[operation][difficulty === "medium" ? "medium" : "hard"];
    }

    public static getLayoutLabel(layout: AnswerLayout): string {
        return layout === "result" ? "Só o resultado" : "Na vertical";
    }

    public static getSkillName(skill: Skill): string {
        switch (skill) {
            case "no-carry":
                return "Sem transporte";
            case "carry":
                return "Transporte numa coluna";
            case "chain-carry":
                return "Transporte em cadeia";
            case "no-borrow":
                return "Sem empréstimo";
            case "borrow":
                return "Com empréstimo";
            case "borrow-across-zero":
                return "Empréstimo através do zero";
            case "no-remainder":
                return "Sem resto pelo caminho";
            case "remainder":
                return "Com resto pelo caminho";
            default:
                return "Zero no resultado";
        }
    }

    public static getLevelName(level: number): string {
        return `Nível ${level}`;
    }

    // The home screen's one-line summary of an operation: where the child is, not every level.
    public static getOperationSummary(difficulty: Difficulty, level: number): string {
        return `${this.getDifficultyName(difficulty)} · ${this.getLevelName(level).toLocaleLowerCase("pt-PT")}`;
    }

    public static getEquationText(question: Question): string {
        return `${question.left} ${OperationsUtils.getSymbol(question.operation)} ${question.right} = ${question.result}`;
    }

    public static getSpokenQuestion(question: Question): string {
        switch (question.operation) {
            case "addition":
                return `Quanto é ${question.left} mais ${question.right}?`;
            case "subtraction":
                return `Quanto é ${question.left} menos ${question.right}?`;
            case "division":
                return `Quanto é ${question.left} a dividir por ${question.right}?`;
            default:
                break;
        }
        switch (question.kind) {
            case "missing-left":
                return `Que número vezes ${question.right} dá ${question.result}?`;
            case "missing-right":
                return `${question.left} vezes que número dá ${question.result}?`;
            default:
                return `Quanto é ${question.left} vezes ${question.right}?`;
        }
    }

    public static getColumnName(column: number): string {
        const names: string[] = ["unidades", "dezenas", "centenas", "milhares"];
        return names[column];
    }

    public static getHelpUnavailable(reason: HelpUnavailableReason): string {
        if (reason === "limit") {
            return `Já usaste as ${HelpsUtils.getMaxHelpsPerSession()} ajudas deste jogo.`;
        }
        return "O mealheiro está vazio. Cada 5 certas dão uma moeda!";
    }

    public static getChoiceHint(): string {
        return "Tirei duas respostas. É uma destas!";
    }

    public static getArithmeticHint(question: Question, hint: ArithmeticHint): string {
        const symbol: string = OperationsUtils.getSymbol(question.operation);
        switch (hint.kind) {
            case "split":
                return `Pista: ${hint.firstStep.left} ${symbol} ${hint.firstStep.right} = ${hint.firstStep.result}. Agora ${symbol} ${hint.remaining}.`;
            case "partial": {
                const firstStep: string = `${hint.firstStep.left} ${symbol} ${hint.firstStep.right} = ${hint.firstStep.result}`;
                const rest: string = `${hint.rest.left} ${symbol} ${hint.rest.right}`;
                return question.operation === "division" ? `Pista: ${firstStep}. Agora faz ${rest} e junta.` : `Pista: ${firstStep}. Agora junta ${rest}.`;
            }
            case "round": {
                const zeros: string = hint.zeros === 1 ? "um zero" : `${hint.zeros} zeros`;
                return `Pista: ${hint.base.left} ${symbol} ${hint.base.right} = ${hint.base.result}. Agora junta ${zeros}.`;
            }
            default: {
                const direction: string = question.operation === "addition" ? "para a frente" : "para trás";
                if (hint.unit === 10) {
                    return `Pista: começa no ${hint.start} e conta ${hint.steps === 1 ? "1 dezena" : `${hint.steps} dezenas`} ${direction}.`;
                }
                return `Pista: começa no ${hint.start} e conta ${hint.steps} ${direction}.`;
            }
        }
    }

    public static getNeighbourHint(fact: Calculation): string {
        return `Pista: ${fact.left} × ${fact.right} = ${fact.result}`;
    }

    public static getVerticalHint(question: Question, column: VerticalColumn, columnIndex: number, step: VerticalHelpStep): string {
        const columnName: string = this.getColumnName(columnIndex);
        if (column.result === null) {
            return "Esta casa fica vazia. Já podes confirmar!";
        }
        if (step === "digit") {
            return `Nas ${columnName} fica ${column.result}.`;
        }
        if (column.top === null && column.bottom === null) {
            return "Aqui só desce o 1 que veio de trás.";
        }
        // A number shorter than the other has nothing in this column, which is the same as 0.
        const top: number = column.top ?? 0;
        const bottom: number = column.bottom ?? 0;
        if (question.operation === "addition") {
            if (step === "marks") {
                return `Não te esqueças do 1 que veio de trás: ${top} + ${bottom} + 1.`;
            }
            return `Agora as ${columnName}: ${top} + ${bottom}.`;
        }
        if (step === "marks") {
            return `O ${top} passa a ${column.workingTop ?? top}. Agora faz ${column.workingTop ?? top} − ${bottom}.`;
        }
        return `Agora as ${columnName}: ${top} − ${bottom}.`;
    }

    public static getSessionEnd(): string {
        return "Boa sessão! Até à próxima!";
    }

    public static getSummaryHeadline(correctAtFirstTry: number, total: number): string {
        const greatScoreRatio: number = 0.7;
        if (correctAtFirstTry === total) {
            return "Perfeito! Acertaste todas!";
        }
        if (correctAtFirstTry >= total * greatScoreRatio) {
            return "Muito bem! Estás a melhorar!";
        }
        return "Boa prática! Cada jogo ajuda a aprender.";
    }

    public static getNothingToReinforce(): string {
        return "Não ficou nenhuma conta para trás. Fantástico!";
    }

    public static getHelpedCount(helpedCount: number): string {
        return helpedCount === 1 ? "1 com ajuda" : `${helpedCount} com ajuda`;
    }

    // Names the operation too, because the offer can come from a mix.
    public static getOfferText(offer: SessionOffer): OfferText {
        const difficultyName: string = this.getDifficultyName(offer.difficulty);
        const operationName: string = this.getOperationName(offer.operation);
        if (offer.kind === "unlock") {
            return {
                title: "Desafio desbloqueado!",
                text: `Já podes experimentar a ${operationName} no ${difficultyName}, com contas ${this.getDifficultyDetail(offer.operation, offer.difficulty)}.`,
                acceptLabel: `Experimentar o ${difficultyName}`,
                declineLabel: "Agora não"
            };
        }
        return {
            title: "Esta foi puxada!",
            text: `Queres praticar um bocadinho a ${operationName} no ${difficultyName}? Não perdes nível nem moedas.`,
            acceptLabel: `Praticar no ${difficultyName}`,
            declineLabel: "Continuar aqui"
        };
    }

    public static getClockDirectionLabel(direction: ClockDirection): string {
        return direction === "up" ? "Para a frente" : "Para trás";
    }

    public static getClockReferenceLabel(reference: ClockReference): string {
        return reference === "default" ? `${ClockUtils.getDefaultMinutes()} minutos` : "O teu recorde";
    }

    // Under the running clock: what it is measured against. Never a warning.
    public static getClockNote(settings: ClockSettings, referenceMilliseconds: number, hasRecord: boolean, isOvertime: boolean): string {
        if (isOvertime) {
            return "tempo extra";
        }
        const reference: string = TimeUtils.formatElapsed(referenceMilliseconds);
        const isRecord: boolean = settings.reference === "record" && hasRecord;
        if (settings.direction === "down") {
            return isRecord ? `do recorde ${reference}` : `de ${reference}`;
        }
        return isRecord ? `recorde ${reference}` : `meta ${reference}`;
    }

    // The end of a timed session: always something kind, and the record only when it was perfect.
    public static getClockOutcomeLines(outcome: ClockOutcome): string[] {
        const lines: string[] = [];
        if (outcome.isNewRecord) {
            lines.push(
                outcome.previousRecordMilliseconds === null
                    ? "Primeiro recorde nesta categoria!"
                    : `Novo recorde! Antes era ${TimeUtils.formatElapsed(outcome.previousRecordMilliseconds)}.`
            );
        } else if (outcome.isWithinReference) {
            lines.push("Ganhaste ao relógio!");
        } else {
            const extra: string = TimeUtils.formatElapsed(outcome.elapsedMilliseconds - outcome.referenceMilliseconds);
            lines.push(
                outcome.isAgainstRecord
                    ? `Ficaste a ${extra} do teu recorde, ${TimeUtils.formatElapsed(outcome.referenceMilliseconds)}. Para a próxima!`
                    : `Mais ${extra} do que os ${ClockUtils.getDefaultMinutes()} minutos. Para a próxima!`
            );
        }
        if (!outcome.isNewRecord && !outcome.isAgainstRecord && outcome.previousRecordMilliseconds !== null) {
            lines.push(`O teu recorde: ${TimeUtils.formatElapsed(outcome.previousRecordMilliseconds)}.`);
        }
        if (!outcome.isPerfect) {
            lines.push("Os recordes contam quando acertas todas à primeira.");
        }
        return lines;
    }

    public static getRecordCategoryName(category: RecordCategory): string {
        if (category.kind === "mix") {
            const operations: string = category.parts
                .map((part) => `${this.getOperationName(part.operation)} ${this.getDifficultyName(part.difficulty)}`)
                .join(", ");
            return `${this.getMixName()} · ${operations}`;
        }
        const parts: string[] = [this.getOperationName(category.operation), this.getDifficultyName(category.difficulty)];
        if (category.layout !== null) {
            parts.push(category.layout === "vertical" ? "na vertical" : "só o resultado");
        }
        if (category.tables !== null) {
            parts.push(category.tables.length === 1 ? `tabuada do ${category.tables[0]}` : `tabuadas ${category.tables.join(", ")}`);
        }
        if (category.mode === "mixed") {
            parts.push("com inversas");
        }
        if (category.isAlwaysTyped) {
            parts.push("a escrever");
        }
        return parts.join(" · ");
    }

    public static getCoinsCount(coins: number): string {
        return coins === 1 ? "1 moeda" : `${coins} moedas`;
    }

    // Multiple choice counts half, so the progress can be "3½ de 5".
    public static getCoinProgress(answers: number): string {
        const wholeAnswers: number = Math.floor(answers);
        const half: string = answers > wholeAnswers ? "½" : "";
        return `${wholeAnswers === 0 && half !== "" ? "" : wholeAnswers}${half} de ${WalletUtils.getAnswersPerCoin()}`;
    }

    public static getPiggyBankAbout(): string {
        return `Cada ajuda custa 1 moeda. Cada ${WalletUtils.getAnswersPerCoin()} certas dão uma moeda nova.`;
    }

    public static getPiggyBankFull(): string {
        return "Mealheiro cheio!";
    }

    public static getStorageWarning(status: StorageStatus): string {
        if (status === "newer-version") {
            return "Este progresso foi guardado por uma versão mais nova do Faísca. Aqui nada fica guardado.";
        }
        return "Atenção: neste browser o teu progresso não fica guardado.";
    }

    public static getProgressCheer(masteredCount: number): string {
        if (masteredCount === 0) {
            return "Cada jogo acende mais quadrados. Vamos a isso?";
        }
        if (masteredCount === 1) {
            return "Já sabes 1 conta de cor. Que orgulho!";
        }
        return `Já sabes ${masteredCount} contas de cor. Que orgulho!`;
    }

    public static getMasteryLabel(level: number): string {
        const labels: string[] = ["Por praticar", "A começar", "A aprender", "A melhorar", "Quase lá", "Dominado"];
        return labels[level];
    }

    public static getModeLabel(mode: PracticeMode): string {
        return mode === "direct" ? "Só directas" : "Directas + inversas";
    }

    public static getModeExample(mode: PracticeMode): string {
        return mode === "direct" ? "7 × 8 = ?" : "? × 8 = 56";
    }

    public static getNameProblem(problem: ProfileNameProblem): string {
        switch (problem) {
            case "too-long":
                return `O nome pode ter até ${ProfilesUtils.getMaxNameLength()} letras.`;
            case "taken":
                return "Já existe um perfil com esse nome.";
            default:
                return "Escreve o teu nome.";
        }
    }
}
