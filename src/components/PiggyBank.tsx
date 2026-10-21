import { Messages } from "../utils/messages.ts";
import { WalletUtils, type Wallet } from "../utils/wallet/utils.ts";
import { CoinIcon } from "./Icons.tsx";

interface PiggyBankProps {
    wallet: Wallet;
}

// Coins pay for helps. The bar fills towards the next coin and never goes back.
export function PiggyBank({ wallet }: PiggyBankProps) {
    const isFull: boolean = WalletUtils.isFull(wallet);
    const answers: number = WalletUtils.getAnswersTowardsNextCoin(wallet);

    return (
        <section className="card piggy" aria-label="Mealheiro">
            <PiggyDrawing />
            <div className="piggy__body">
                <p className="piggy__coins">
                    {Messages.getCoinsCount(wallet.coins)}
                    <span className="piggy__max"> de {WalletUtils.getMaxCoins()}</span>
                </p>
                <ol className="coin-slots" aria-hidden="true">
                    {Array.from({ length: WalletUtils.getMaxCoins() }, (_, slot) => (
                        <li key={slot} className={slot < wallet.coins ? "coin-slot coin-slot--filled" : "coin-slot"}>
                            {slot < wallet.coins && <CoinIcon />}
                        </li>
                    ))}
                </ol>
                <p className="piggy__next">{isFull ? Messages.getPiggyBankFull() : `Próxima moeda: ${Messages.getCoinProgress(answers)}`}</p>
                <div className="meter" aria-hidden="true">
                    <div className="meter__fill" style={{ transform: `scaleX(${answers / WalletUtils.getAnswersPerCoin()})` }} />
                </div>
                <p className="piggy__about">{Messages.getPiggyBankAbout()}</p>
            </div>
        </section>
    );
}

function PiggyDrawing() {
    return (
        <svg className="piggy__drawing" viewBox="0 0 96 80" aria-hidden="true" focusable="false">
            <ellipse cx="48" cy="46" rx="36" ry="27" fill="#f7a8b8" />
            <path d="M28 24 L33 10 L42 21 Z" fill="#ef8aa0" />
            <ellipse cx="84" cy="46" rx="9" ry="10" fill="#ef8aa0" />
            <circle cx="82" cy="44" r="1.8" fill="#9b3550" />
            <circle cx="86.5" cy="48" r="1.8" fill="#9b3550" />
            <circle cx="66" cy="36" r="3.2" fill="#2a1a10" />
            <rect x="38" y="20" width="18" height="4" rx="2" fill="#9b3550" />
            <rect x="24" y="66" width="10" height="11" rx="4" fill="#ef8aa0" />
            <rect x="58" y="66" width="10" height="11" rx="4" fill="#ef8aa0" />
            <path d="M12 44 q-8 -2 -6 -10" fill="none" stroke="#ef8aa0" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
    );
}
