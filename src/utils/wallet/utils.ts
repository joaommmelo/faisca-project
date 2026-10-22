import { LevelsUtils } from "../levels/utils.ts";

// The piggy bank: coins pay for helps; points are the progress towards the next coin.
export interface Wallet {
    coins: number;
    points: number;
}

export interface AddWalletPointsResult {
    wallet: Wallet;
    coinsEarned: number;
}

export class WalletUtils {
    public static getInitialCoins(): number {
        return 3;
    }

    public static getMaxCoins(): number {
        return 5;
    }

    public static getAnswersPerCoin(): number {
        return 5;
    }

    // Same scale as the levels: a typed answer is 2 points, a multiple-choice one is 1.
    public static getPointsPerCoin(): number {
        return this.getAnswersPerCoin() * LevelsUtils.getPointsForAnswer("keypad");
    }

    public static createInitial(): Wallet {
        return { coins: this.getInitialCoins(), points: 0 };
    }

    // Progress never goes down: with the piggy bank full it waits, complete, for the next coin to be spent.
    public static addPoints(wallet: Wallet, points: number): AddWalletPointsResult {
        let coins: number = wallet.coins;
        let pendingPoints: number = wallet.points + points;
        while (pendingPoints >= this.getPointsPerCoin() && coins < this.getMaxCoins()) {
            coins += 1;
            pendingPoints -= this.getPointsPerCoin();
        }
        return {
            wallet: { coins, points: Math.min(pendingPoints, this.getPointsPerCoin()) },
            coinsEarned: coins - wallet.coins
        };
    }

    public static canSpend(wallet: Wallet): boolean {
        return wallet.coins > 0;
    }

    // A coin waiting in a full piggy bank drops in as soon as there is room.
    public static spend(wallet: Wallet): Wallet {
        if (!this.canSpend(wallet)) {
            throw new Error("There are no coins to spend.");
        }
        return this.addPoints({ coins: wallet.coins - 1, points: 0 }, wallet.points).wallet;
    }

    public static isFull(wallet: Wallet): boolean {
        return wallet.coins === this.getMaxCoins();
    }

    // Right answers counted towards the next coin; halves come from multiple choice ("3½ de 5").
    public static getAnswersTowardsNextCoin(wallet: Wallet): number {
        return wallet.points / LevelsUtils.getPointsForAnswer("keypad");
    }
}
