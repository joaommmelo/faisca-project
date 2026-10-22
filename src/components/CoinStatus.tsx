import { Messages } from "../utils/messages.ts";
import { WalletUtils, type Wallet } from "../utils/wallet/utils.ts";
import { CoinIcon } from "./Icons.tsx";

interface CoinStatusProps {
    wallet: Wallet;
    // Changes every time a coin is earned, so the flying coin plays again.
    flightKey: number | null;
}

// Always in view during a session: the coins for helps and the answers towards the next one.
export function CoinStatus({ wallet, flightKey }: CoinStatusProps) {
    const answers: number = WalletUtils.getAnswersTowardsNextCoin(wallet);
    const label: string = `${Messages.getCoinsCount(wallet.coins)}. ${
        WalletUtils.isFull(wallet) ? Messages.getPiggyBankFull() : Messages.getLabels().nextCoin(Messages.getCoinProgress(answers))
    }`;

    return (
        <p className="coin-status" aria-label={label}>
            <span className="coin-status__coins" aria-hidden="true">
                <CoinIcon />
                {wallet.coins}
                {flightKey !== null && (
                    <span key={flightKey} className="coin-flight">
                        <CoinIcon />
                    </span>
                )}
            </span>
            <span className="coin-status__dots" aria-hidden="true">
                {Array.from({ length: WalletUtils.getAnswersPerCoin() }, (_, dot) => (
                    <span key={dot} className={getDotClassName(Math.min(Math.max(answers - dot, 0), 1))} />
                ))}
            </span>
        </p>
    );
}

// A multiple-choice answer fills half a dot.
function getDotClassName(fill: number): string {
    if (fill === 1) {
        return "coin-dot coin-dot--full";
    }
    return fill > 0 ? "coin-dot coin-dot--half" : "coin-dot";
}
