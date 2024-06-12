import React, { useEffect, useState } from 'react';

export function InlineEdit<T extends 'text' | 'number'>({
    type,
    value,
    onChange,
}: {
    type: T;
    value: T extends 'number' ? number : string;
    onChange: (newValue: T extends 'number' ? number : string) => void;
}) {
    const [newValue, setNewValue] = useState(value);
    useEffect(() => {
        // Sync external value changes to newValue
        setNewValue(value);
    }, [value]);
    return (
        <input
            type={type}
            value={newValue}
            onChange={(e) => {
                if (type === 'number') {
                    // @ts-expect-error ignore
                    setNewValue(parseInt(e.target.value, 10));
                } else {
                    // @ts-expect-error ignore
                    setNewValue(e.target.value);
                }
            }}
            onBlur={() => {
                if (newValue !== value) {
                    onChange(newValue);
                }
            }}
        />
    );
}
