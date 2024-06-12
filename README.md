# What is this?
This repo is an example of how to use the `@flowdb/*` NPM packages, creating an 
example chat application similar to Slack. This is what the schema looks like:

![Chat schema](/schema.png)

Each workspace has channels, channels have messages, and messages can be 
replied to with thread messages.

# Getting started
1. Clone this repo and `cd` into the root of the repo.
2. Run `yarn install`.
3. Run `yarn start` to run the chat example app.
4. Click around and try editing some data.

# Parts
* `src/index.tsx` - entry point to the React app.
* `src/backend/index.ts` - the FlowDB backend definition, including schema and views.
* `src/generated-types.ts` - TypeScript bindings for the backend definition, generated 
by `@flowdb/cli`.

# Dev loop
* Start the webpack dev server using `yarn start` and edit anything in `src/`.
* To update `generated-types.ts` after changing `backend/index.ts`, run 
`yarn generate-types --watch`
* Build using `yarn build` to run linting, type checking and build the webpack output.

# `@flowdb/*` packages
* `@flowdb/api`: API for defining a schema, views, and connecting to the database.
* `@flowdb/cli`: CLI for generating types and deploying to the real database.
* `@flowdb/react`: Utilities for developing a React application.

# Troubleshooting
* If the app crashes in the browser after some changes, try opening the dev tools 
\> "Application" tab > "Local storage" tab > delete all entries.