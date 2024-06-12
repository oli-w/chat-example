import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './view';
import { initInMemoryBackend } from '@flowdb/api';
import { Types } from './generated-types';
import { backendDefinition } from './backend';

// Creates an in-memory backend that stores data in local storage.
// This is replaced with a call to `initBackend` from @flowdb/api when running against a "real" database.
const backend = initInMemoryBackend<Types>({
    instanceId: 'chat',
    backendDefinition,
    // The database core runs inside a web worker
    worker: new Worker(new URL('@flowdb/api/worker', import.meta.url), { name: 'backend-worker' }),
});

const root = createRoot(document.getElementById('root')!);
root.render(<App backend={backend} />);
