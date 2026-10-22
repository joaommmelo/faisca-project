import { describe, expect, it } from "vitest";
import { WalletUtils, type Wallet } from "./utils.ts";

describe("WalletUtils", () => {
    it("starts with 3 coins", () => {
        expect(WalletUtils.createInitial()).toEqual({ coins: 3, points: 0 });
    });

    it("gives a coin every 5 right typed answers, or 10 multiple-choice ones", () => {
        const typed = WalletUtils.addPoints({ coins: 0, points: 8 }, 2);
        expect(typed).toEqual({ wallet: { coins: 1, points: 0 }, coinsEarned: 1 });

        const choice = WalletUtils.addPoints({ coins: 0, points: 8 }, 1);
        expect(choice).toEqual({ wallet: { coins: 0, points: 9 }, coinsEarned: 0 });
        expect(WalletUtils.getAnswersTowardsNextCoin(choice.wallet)).toBe(4.5);
    });

    it("never lets the progress go down: spending keeps it and a full piggy bank holds it", () => {
        const spent: Wallet = WalletUtils.spend({ coins: 2, points: 6 });
        expect(spent).toEqual({ coins: 1, points: 6 });

        const full = WalletUtils.addPoints({ coins: 5, points: 8 }, 6);
        expect(full).toEqual({ wallet: { coins: 5, points: 10 }, coinsEarned: 0 });
        expect(WalletUtils.isFull(full.wallet)).toBe(true);
    });

    it("drops the waiting coin in as soon as one is spent from a full piggy bank", () => {
        expect(WalletUtils.spend({ coins: 5, points: 10 })).toEqual({ coins: 5, points: 0 });
    });

    it("refuses to spend from an empty piggy bank", () => {
        expect(WalletUtils.canSpend({ coins: 0, points: 9 })).toBe(false);
        expect(() => WalletUtils.spend({ coins: 0, points: 9 })).toThrow();
    });
});
