import { ProfilesUtils, type ProfileNameProblem } from "./profiles/utils.ts";
import type { PracticeMode, Question } from "./questions/utils.ts";
import type { AnswerRecord } from "./session/utils.ts";

export interface Feedback {
    title: string;
    lines: string[];
}

// Faísca's voice: the sentences that react to the child, in European Portuguese.
// Short, warm, and never about being wrong. Fixed button labels live with their component.
export class Messages {
    public static getTagline(): string {
        return "Acende o teu talento!";
    }

    public static getWelcomeQuestion(): string {
        return "Olá! Eu sou a Faísca. Como te chamas?";
    }

    public static getGreeting(name: string): string {
        return `Olá, ${name}! Vamos praticar?`;
    }

    public static getCorrectMessages(): string[] {
        return ["Muito bem!", "Boa! Acertaste!", "Isso mesmo!", "Excelente!", "Estás a melhorar!"];
    }

    // Rotates through the praises so consecutive right answers do not repeat the same one.
    public static getFeedback(record: AnswerRecord, variant: number): Feedback {
        if (record.isCorrect && record.question.isRetry) {
            return { title: "Boa! Desta vez acertaste!", lines: [] };
        }
        if (record.isCorrect) {
            const praises: string[] = this.getCorrectMessages();
            return { title: praises[variant % praises.length], lines: [] };
        }
        return {
            title: "Quase!",
            lines: [
                `A resposta certa é ${record.question.answer}.`,
                record.question.isRetry ? "Vamos treinar esta na próxima vez." : "Vamos tentar outra vez mais à frente."
            ]
        };
    }

    public static getSpokenQuestion(question: Question): string {
        switch (question.kind) {
            case "missing-left":
                return `Que número vezes ${question.rightFactor} dá ${question.product}?`;
            case "missing-right":
                return `${question.leftFactor} vezes que número dá ${question.product}?`;
            default:
                return `Quanto é ${question.leftFactor} vezes ${question.rightFactor}?`;
        }
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

    public static getProgressCheer(masteredCount: number): string {
        if (masteredCount === 0) {
            return "Cada jogo acende mais quadrados. Vamos a isso?";
        }
        if (masteredCount === 1) {
            return "Já sabes 1 conta de cor. Que orgulho!";
        }
        return `Já sabes ${masteredCount} contas de cor. Que orgulho!`;
    }

    public static getLevelLabel(level: number): string {
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
