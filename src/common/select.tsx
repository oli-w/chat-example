import React, { ChangeEvent } from 'react';

export type SelectOption = {
    id: string;
    label: string;
    enabled?: boolean;
};

export function Select<AllowNone extends boolean>({
    selectedId,
    options,
    onChange,
    allowUnselect,
    noneText = '(None)',
}: {
    selectedId: string | null;
    options: SelectOption[];
    onChange: (newStatusId: AllowNone extends true ? string | null : string) => void;
    allowUnselect: AllowNone;
    noneText?: string;
}) {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const optionId = e.target.value;
        if (allowUnselect === true) {
            onChange((optionId !== '' ? optionId : null) as string);
        } else {
            onChange(optionId);
        }
    };
    return (
        <select value={selectedId || undefined} onChange={handleChange}>
            {(selectedId === null || allowUnselect) && <option value={''}>{noneText}</option>}
            {options.map(({ id, label, enabled = true }) => (
                <option key={id} value={id} disabled={!enabled}>
                    {label}
                </option>
            ))}
        </select>
    );
}
