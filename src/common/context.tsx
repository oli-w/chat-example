import React, { ComponentType, createContext, ReactNode, useContext } from 'react';

export type ContextProviderDefinition<ContextType, ForwardedProps> = {
    ProviderComponent: ComponentType<{ children: ReactNode } & ForwardedProps>;
    useContextFunction: () => ContextType;
};

/**
 * Creates a React context provider and consumer hook.
 * @param getValue function to compute the context value. Called inside a React function component so can use hooks.
 */
export function createContextProvider<ContextType, ForwardedProps>(
    getValue: (props: ForwardedProps) => ContextType
): ContextProviderDefinition<ContextType, ForwardedProps> {
    const Context = createContext<ContextType>(null as unknown as ContextType);
    const Provider = (props: { children: ReactNode } & ForwardedProps) => {
        return <Context.Provider value={getValue(props)}>{props.children}</Context.Provider>;
    };

    return {
        ProviderComponent: Provider,
        useContextFunction: () => useContext(Context),
    };
}
