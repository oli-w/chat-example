import { createBackendContextProvider } from '@flowdb/react';
import { Types } from '../generated-types';
import { createContextProvider } from '../common/context';

export const { BackendProvider, useBackend, useDatabase, usePrincipal, useEntityQuery, useViewQuery } =
    createBackendContextProvider<Types>();

export const { ProviderComponent: UserProvider, useContextFunction: useCurrentUser } = createContextProvider(
    ({ userId }: { userId: string }) => userId
);
