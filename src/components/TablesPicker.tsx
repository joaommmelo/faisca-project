import { FactsUtils } from "../utils/facts/utils.ts";
import { Messages } from "../utils/messages.ts";
import { ProfilesUtils } from "../utils/profiles/utils.ts";
import { CheckIcon } from "./Icons.tsx";

interface TablesPickerProps {
    selectedTables: number[];
    onChange: (tables: number[]) => void;
}

export function TablesPicker({ selectedTables, onChange }: TablesPickerProps) {
    return (
        <fieldset>
            <legend className="section-title">{Messages.getLabels().tablesQuestion}</legend>
            <div className="tables-grid">
                {FactsUtils.getValidFactors().map((table) => {
                    const isSelected: boolean = selectedTables.includes(table);
                    return (
                        <label key={table} className="table-toggle">
                            <input
                                className="visually-hidden"
                                type="checkbox"
                                checked={isSelected}
                                aria-label={Messages.getLabels().tableName(table)}
                                onChange={() => onChange(ProfilesUtils.toggleTable(selectedTables, table))}
                            />
                            <span aria-hidden="true">{table}</span>
                            {isSelected && (
                                <span className="table-toggle__check">
                                    <CheckIcon />
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
