import { afterEach, describe, expect, it } from "vitest";
import { LocalesUtils } from "./locales/utils.ts";
import type { FactorRound } from "./factorGame/utils.ts";
import type { MemoryCard } from "./memoryGame/utils.ts";
import { RoundGameUtils, type GameRound, type RoundResult } from "./roundGame/utils.ts";
import { Messages } from "./messages.ts";
import { RecordsUtils } from "./records/utils.ts";
import type { Question } from "./questions/utils.ts";

const question: Question = {
    id: "multiplication:7×8:direct",
    operation: "multiplication",
    left: 7,
    right: 8,
    result: 56,
    kind: "direct",
    answer: 56,
    format: "choice",
    allowsChoice: true,
    options: [48, 56, 63, 65],
    isRetry: false,
    boxType: "fact",
    boxKey: "7x8",
    trackId: "multiplication"
};

describe("Messages.getFeedback", () => {
    it("praises a right answer, varying the words", () => {
        const first = Messages.getFeedback({ question, givenAnswers: [56], isCorrect: true, isHelped: false }, { variant: 0, hasRetryAhead: false });
        const second = Messages.getFeedback({ question, givenAnswers: [56], isCorrect: true, isHelped: false }, { variant: 1, hasRetryAhead: false });
        expect(first.title).not.toBe(second.title);
        expect(first.lines).toEqual([]);
    });

    it("celebrates getting it at the second try", () => {
        const feedback = Messages.getFeedback({ question, givenAnswers: [54, 56], isCorrect: true, isHelped: false }, { variant: 0, hasRetryAhead: true });
        expect(feedback.title).toBe("Boa! À segunda acertaste!");
    });

    it("shows the right answer after two misses and says when it comes back", () => {
        const missed = { question, givenAnswers: [54, 55], isCorrect: false, isHelped: false };
        expect(Messages.getFeedback(missed, { variant: 0, hasRetryAhead: true })).toEqual({
            title: "Quase!",
            lines: ["A resposta certa é 56.", "Vamos tentar outra vez mais à frente."]
        });
        expect(Messages.getFeedback(missed, { variant: 0, hasRetryAhead: false }).lines[1]).toBe("Vamos treinar esta na próxima vez.");
    });
});

describe("Messages.getTryAgain", () => {
    it("never reveals the answer", () => {
        expect(Messages.getTryAgain(question, 0, 0)).not.toContain("56");
        expect(Messages.getTryAgain({ ...question, format: "vertical" }, 0, 2)).toBe("Quase! Vê as colunas realçadas e tenta outra vez.");
    });
});

describe("Messages.getSpokenQuestion", () => {
    it("reads each question shape as a sentence", () => {
        expect(Messages.getSpokenQuestion(question)).toBe("Quanto é 7 vezes 8?");
        expect(Messages.getSpokenQuestion({ ...question, kind: "missing-left", answer: 7 })).toBe("Que número vezes 8 dá 56?");
        expect(Messages.getSpokenQuestion({ ...question, kind: "missing-right", answer: 8 })).toBe("7 vezes que número dá 56?");
        expect(Messages.getSpokenQuestion({ ...question, operation: "division", left: 56, right: 7, result: 8, answer: 8 })).toBe(
            "Quanto é 56 a dividir por 7?"
        );
        expect(Messages.getSpokenQuestion({ ...question, operation: "subtraction", left: 52, right: 27, result: 25, answer: 25 })).toBe(
            "Quanto é 52 menos 27?"
        );
    });
});

describe("Messages.getCoinProgress", () => {
    it("shows halves from multiple choice", () => {
        expect(Messages.getCoinProgress(3)).toBe("3 de 5");
        expect(Messages.getCoinProgress(3.5)).toBe("3½ de 5");
        expect(Messages.getCoinProgress(0.5)).toBe("½ de 5");
    });
});

describe("Messages.getSummaryHeadline", () => {
    it("always finds something positive to say", () => {
        expect(Messages.getSummaryHeadline(10, 10)).toBe("Perfeito! Acertaste todas!");
        expect(Messages.getSummaryHeadline(7, 10)).toBe("Muito bem! Estás a melhorar!");
        expect(Messages.getSummaryHeadline(2, 10)).toBe("Boa prática! Cada jogo ajuda a aprender.");
    });
});

describe("Messages.getClockOutcomeLines", () => {
    const base = {
        elapsedMilliseconds: 72_000,
        referenceMilliseconds: 180_000,
        isAgainstRecord: false,
        isWithinReference: true,
        isPerfect: true,
        isNewRecord: false,
        previousRecordMilliseconds: null
    };

    it("celebrates a first or a new record", () => {
        expect(Messages.getClockOutcomeLines({ ...base, isNewRecord: true })).toEqual(["Primeiro recorde nesta categoria!"]);
        expect(Messages.getClockOutcomeLines({ ...base, isNewRecord: true, previousRecordMilliseconds: 80_000 })).toEqual(["Novo recorde! Antes era 1:20."]);
    });

    it("compares with the record or the default time without blame", () => {
        const slowerThanRecord = {
            ...base,
            elapsedMilliseconds: 75_000,
            referenceMilliseconds: 72_000,
            isAgainstRecord: true,
            isWithinReference: false,
            previousRecordMilliseconds: 72_000
        };
        expect(Messages.getClockOutcomeLines(slowerThanRecord)).toEqual(["Ficaste a 0:03 do teu recorde, 1:12. Para a próxima!"]);
        expect(Messages.getClockOutcomeLines({ ...base, elapsedMilliseconds: 190_000, isWithinReference: false, isPerfect: false })).toEqual([
            "Mais 0:10 do que os 3 minutos. Para a próxima!",
            "Os recordes contam quando acertas todas à primeira."
        ]);
    });
});

describe("Messages for bigger numbers and mixes", () => {
    it("describes each difficulty in a few words", () => {
        expect(Messages.getDifficultyDetail("addition", "medium")).toBe("até 100");
        expect(Messages.getDifficultyDetail("multiplication", "easy")).toBe("tabuadas");
        expect(Messages.getDifficultyDetail("multiplication", "medium")).toBe("como 23 × 4");
        expect(Messages.getDifficultyDetail("division", "hard")).toBe("como 936 ÷ 4");
    });

    it("names the operation in an offer, because it can come from a mix", () => {
        expect(Messages.getOfferText({ kind: "unlock", operation: "division", difficulty: "medium" }).text).toBe(
            "Já podes experimentar a Divisão no Médio, com contas como 84 ÷ 4."
        );
    });

    it("words the first-step hints", () => {
        const multiplication: Question = { ...question, left: 23, right: 4, result: 92, answer: 92, boxType: "skill" };
        const division: Question = { ...question, operation: "division", left: 72, right: 4, result: 18, answer: 18, boxType: "skill" };
        expect(
            Messages.getArithmeticHint(multiplication, { kind: "partial", firstStep: { left: 20, right: 4, result: 80 }, rest: { left: 3, right: 4 } })
        ).toBe("Pista: 20 × 4 = 80. Agora junta 3 × 4.");
        expect(Messages.getArithmeticHint(division, { kind: "partial", firstStep: { left: 40, right: 4, result: 10 }, rest: { left: 32, right: 4 } })).toBe(
            "Pista: 40 ÷ 4 = 10. Agora faz 32 ÷ 4 e junta."
        );
        expect(Messages.getArithmeticHint(multiplication, { kind: "round", base: { left: 2, right: 4, result: 8 }, zeros: 1 })).toBe(
            "Pista: 2 × 4 = 8. Agora junta um zero."
        );
    });

    it("says why Jogar is off", () => {
        expect(Messages.getPlayProblem("too-few-operations")).toBe("Escolhe pelo menos 2 contas para misturar.");
        expect(Messages.getPlayProblem("no-tables")).toBe("Escolhe pelo menos uma tabuada.");
    });
});

const round24: FactorRound = {
    target: 24,
    pairs: [
        { first: 2, second: 12 },
        { first: 3, second: 8 },
        { first: 4, second: 6 }
    ],
    answer: { first: 4, second: 6 }
};

describe("Messages for Descobre a conta", () => {
    it("says what a missed multiplication makes, never the answer", () => {
        expect(Messages.getFactorGameTryAgain({ first: 4, second: 7 })).toBe("Quase! 4 × 7 dá 28. Tenta outra vez.");
    });

    it("shows the other multiplications of the number after a right answer", () => {
        const feedback = Messages.getFactorGameFeedback({ round: round24, givenPairs: [{ first: 6, second: 4 }], isCorrect: true, isHelped: false }, 0);
        expect(feedback.lines).toEqual(["Também podia ser 2 × 12 ou 3 × 8."]);
    });

    it("shows every multiplication after two misses, or the only one", () => {
        const missed = {
            givenPairs: [
                { first: 4, second: 7 },
                { first: 5, second: 5 }
            ],
            isCorrect: false,
            isHelped: false
        };
        expect(Messages.getFactorGameFeedback({ ...missed, round: round24 }, 0)).toEqual({ title: "Quase!", lines: ["Podia ser 2 × 12, 3 × 8 ou 4 × 6."] });
        const round144: FactorRound = { target: 144, pairs: [{ first: 12, second: 12 }], answer: { first: 12, second: 12 } };
        expect(Messages.getFactorGameFeedback({ ...missed, round: round144 }, 0).lines).toEqual(["A resposta certa é 12 × 12."]);
    });

    it("writes every multiplication of a number in one line", () => {
        expect(Messages.getFactorRoundText(round24)).toBe("24 = 2 × 12 = 3 × 8 = 4 × 6");
    });

    it("gives the bigger factor of the answer as the help", () => {
        expect(Messages.getFactorGameHint(round24)).toBe("Começa pelo 6. Qual é o outro número?");
    });

    it("names a record by its tables", () => {
        expect(Messages.getRecordCategoryName(RecordsUtils.getFactorGameCategory([5, 2]))).toBe("Descobre a conta · tabuadas 2, 5");
        expect(Messages.getRecordCategoryName(RecordsUtils.getFactorGameCategory([7]))).toBe("Descobre a conta · tabuada do 7");
    });
});

const twoTwo: GameRound = {
    game: "missing-sign",
    id: "missing-sign:2?2=4",
    skill: "add-subtract",
    left: 2,
    right: 2,
    result: 4,
    options: ["addition", "subtraction", "multiplication", "division"],
    answers: ["addition", "multiplication"],
    answer: "addition"
};

const balance: GameRound = {
    game: "balance",
    id: "balance:7×8|6×9",
    skill: "products",
    leftPan: { operation: "multiplication", left: 7, right: 8 },
    rightPan: { operation: "multiplication", left: 6, right: 9 },
    options: ["left", "equal", "right"],
    answers: ["left"],
    answer: "left"
};

const answer = (round: GameRound, givenOptions: RoundResult["givenOptions"], isCorrect: boolean): RoundResult => ({
    round,
    givenOptions,
    isCorrect,
    isHelped: false
});

const memoryPair: MemoryCard[] = [
    { id: 0, pairId: 0, value: 7, face: { kind: "calculation", operation: "addition", left: 3, right: 4 } },
    { id: 1, pairId: 0, value: 7, face: { kind: "number", value: 7 } }
];

describe("Messages for the games of rounds, Memória and Mahjong", () => {
    it("says the other sign that also works, or both after two misses", () => {
        expect(Messages.getRoundFeedback(answer(twoTwo, ["multiplication"], true), 0).lines).toEqual(["Também podia ser 2 + 2 = 4."]);
        expect(Messages.getRoundFeedback(answer(twoTwo, ["division", "subtraction"], false), 0)).toEqual({
            title: "Quase!",
            lines: ["Podia ser 2 + 2 = 4 ou 2 × 2 = 4."]
        });
    });

    it("tells what each pan weighs, and works one out as the help", () => {
        expect(Messages.getRoundFeedback(answer(balance, ["left"], true), 0).lines).toEqual(["56 pesa mais do que 54."]);
        expect(Messages.getBalanceHint(balance as Extract<GameRound, { game: "balance" }>)).toBe("Pista: 7 × 8 = 56");
        expect(Messages.getSpokenRound(balance)).toBe("Qual pesa mais: 7 vezes 8 ou 6 vezes 9? Ou pesam o mesmo?");
        expect(Messages.getRoundText(balance)).toBe("7 × 8 > 6 × 9");
    });

    it("reads every round out, and writes it to train again", () => {
        for (const game of RoundGameUtils.getValidGames()) {
            const example: GameRound = RoundGameUtils.getExampleRound(game);
            expect(Messages.getSpokenRound(example)).not.toMatch(/undefined|NaN/);
            expect(Messages.getRoundText(example)).not.toMatch(/undefined|NaN/);
        }
        expect(Messages.getSpokenRound(RoundGameUtils.getExampleRound("skip-counting"))).toBe("Que número falta? 3, 6, um número escondido, 12, 15.");
        expect(Messages.getRoundText(RoundGameUtils.getExampleRound("number-bonds"))).toBe("7 + 3 = 10");
        expect(Messages.getRoundOptionLabel(twoTwo, "division")).toBe("a dividir por");
    });

    it("names the cards, the pairs and the records", () => {
        expect(Messages.getMemoryCardLabel(3, null)).toBe("Carta 3, virada para baixo");
        expect(Messages.getMemoryCardLabel(3, memoryPair[0])).toBe("Carta 3: 3 mais 4");
        expect(Messages.getMemoryPairText(memoryPair)).toBe("3 + 4 = 7");
        expect(Messages.getRecordCategoryName(RecordsUtils.getRoundGameCategory("counting", 2))).toBe("Quantos são? · Nível 2");
        expect(Messages.getRecordCategoryName(RecordsUtils.getMemoryGameCategory("tables", 6, [7]))).toBe("Memória · Tabuadas · 6 pares · tabuada do 7");
        expect(Messages.getMahjongTileLabel({ operation: "subtraction", left: 63, right: 7 }, false)).toBe("63 menos 7, presa");
    });
});

describe("Messages in every language", () => {
    afterEach(() => Messages.setLocale("pt"));

    // A sample of what each screen says, wordings built from the most pieces included.
    const sayEverything = (): string[] => [
        Messages.getGreeting("Rita"),
        ...[0, 1, 2, 3, 4, 5].map((level) => Messages.getMasteryLabel(level)),
        ...[0, 1, 2, 3].flatMap((column) => [Messages.getCellLabel(column, null), Messages.getCellLabel(column, 6)]),
        ...[0, 1, 2, 3, 4].map(
            (variant) => Messages.getFeedback({ question, givenAnswers: [56], isCorrect: true, isHelped: false }, { variant, hasRetryAhead: false }).title
        ),
        ...[0, 1, 2].map((variant) => Messages.getTryAgain(question, variant, 0)),
        ...Messages.getChallengeRules(),
        Messages.getOfferText({ kind: "unlock", operation: "addition", difficulty: "medium" }).text,
        Messages.getOfferText({ kind: "safety-net", operation: "division", difficulty: "easy" }).text,
        Messages.getOperationSummary("hard", 3),
        Messages.getCoinProgress(3.5),
        Messages.getChallengeLevelUp(3),
        Messages.getLabels().questionPosition(3, 10),
        Messages.getLabels().deleteProfileQuestion("Rita"),
        Messages.getFactorGameNeedsTable(),
        Messages.getFactorGameQuestion(24),
        Messages.getFactorGameTryAgain({ first: 4, second: 7 }),
        Messages.getFactorGameHint(round24),
        Messages.getRecordCategoryName(RecordsUtils.getFactorGameCategory([2, 5])),
        ...Messages.getFactorGameFeedback({ round: round24, givenPairs: [{ first: 4, second: 6 }], isCorrect: true, isHelped: false }, 0).lines,
        ...Messages.getFactorGameFeedback({ round: round24, givenPairs: [], isCorrect: false, isHelped: false }, 0).lines,
        ...RoundGameUtils.getValidGames().flatMap((game) => {
            const example: GameRound = RoundGameUtils.getExampleRound(game);
            return [
                Messages.getRoundGameName(game),
                Messages.getRoundGameGreeting(game),
                Messages.getSpokenRound(example),
                Messages.getRoundText(example),
                ...RoundGameUtils.getSkills(game).map((skill) => Messages.getRoundSkillName(game, skill)),
                ...example.options.map((option) => Messages.getRoundOptionLabel(example, option)),
                ...Messages.getRoundFeedback(answer(example, [example.answer], true), 0).lines,
                ...Messages.getRoundFeedback(answer(example, [], false), 0).lines
            ];
        }),
        ...Messages.getRoundFeedback(answer(twoTwo, ["division", "subtraction"], false), 0).lines,
        Messages.getRoundChoiceHint(1),
        Messages.getRoundChoiceHint(2),
        Messages.getMemoryCardLabel(1, memoryPair[0]),
        Messages.getMemoryCardLabel(1, null),
        Messages.getMemoryTurns(1),
        Messages.getMemoryTurns(12),
        Messages.getBones(1),
        Messages.getBones(7),
        Messages.getRecordCategoryName(RecordsUtils.getMemoryGameCategory("tables", 8, [2, 5])),
        ...Messages.getMahjongRules(),
        Messages.getMahjongSummary(95000),
        Messages.getMahjongRecord(null),
        Messages.getMahjongTileLabel({ operation: "division", left: 72, right: 8 }, false),
        Messages.getMahjongTilesLeft(1),
        Messages.getMahjongTilesLeft(36)
    ];

    it("words every message, with nothing missing", () => {
        for (const locale of LocalesUtils.getValidLocales()) {
            Messages.setLocale(locale);
            for (const sentence of sayEverything()) {
                expect(sentence.trim(), `${locale}: ${sentence}`).not.toBe("");
                expect(sentence, locale).not.toMatch(/undefined|NaN|\[object/);
            }
            expect(Messages.getChallengeRules(), locale).toHaveLength(3);
        }
    });

    it("speaks the language it is set to", () => {
        Messages.setLocale("en");
        const english: string = Messages.getLabels().play;
        Messages.setLocale("pt");
        expect(Messages.getLabels().play).toBe("Jogar");
        expect(english).not.toBe("Jogar");
    });
});
