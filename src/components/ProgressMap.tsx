import { FactsUtils } from "../utils/facts/utils.ts";
import type { LeitnerBoxes } from "../utils/leitner/utils.ts";
import { Messages } from "../utils/messages.ts";
import { ProgressUtils } from "../utils/progress/utils.ts";

interface ProgressMapProps {
    boxes: LeitnerBoxes;
}

export function ProgressMap({ boxes }: ProgressMapProps) {
    const factors: number[] = FactsUtils.getValidFactors();

    return (
        <>
            <table className="progress-map">
                <caption className="visually-hidden">Mapa das tabuadas: cada quadrado mostra como vai cada conta.</caption>
                <thead>
                    <tr>
                        <th scope="col">
                            <span aria-hidden="true">×</span>
                        </th>
                        {factors.map((factor) => (
                            <th key={factor} scope="col">
                                {factor}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {factors.map((rowFactor) => (
                        <tr key={rowFactor}>
                            <th scope="row">{rowFactor}</th>
                            {factors.map((columnFactor) => {
                                const level: number = ProgressUtils.getLevel(boxes, rowFactor, columnFactor);
                                const product: number = rowFactor * columnFactor;
                                return (
                                    <td key={columnFactor} className={`level-${level}`}>
                                        <span className="progress-map__value" aria-hidden="true">
                                            {product}
                                        </span>
                                        <span className="visually-hidden">
                                            {`${rowFactor} × ${columnFactor} = ${product}: ${Messages.getMasteryLabel(level)}`}
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <ul className="legend" aria-label="Legenda">
                {ProgressUtils.getLevels().map((level) => (
                    <li key={level}>
                        <span className={`legend__swatch level-${level}`} aria-hidden="true" />
                        {Messages.getMasteryLabel(level)}
                    </li>
                ))}
            </ul>
        </>
    );
}
