import {
    BackendDefinition,
    createReadPermissions,
    createSchemaBuilder,
    createValidations,
    createViewBuilder,
    createViews,
    DATA_TYPE_BUILDER,
    EMPTY_MIGRATIONS,
    Schema,
    Views,
} from '@flowdb/api';

const { STRING, BOOLEAN, NUMBER } = DATA_TYPE_BUILDER;

// The normalised schema (or "tables")
const schema = createSchemaBuilder({
    workspace: { name: 'Workspace' },
    channel: { name: 'Channel' },
    message: { name: 'Message' },
    threadMessage: { name: 'Thread message' },
}).defineFields(({ reference, simple, user }) => ({
    workspace: {
        name: simple(STRING),
    },
    channel: {
        name: simple(STRING),
        workspaceId: reference('workspace'),
        order: simple(NUMBER),
    },
    message: {
        channelId: reference('channel'),
        content: simple(STRING),
        edited: simple(BOOLEAN),
        authorId: user({ isRequired: true }),
    },
    threadMessage: {
        parentId: reference('message'),
        content: simple(STRING),
        edited: simple(BOOLEAN),
        authorId: user({ isRequired: true }),
    },
})) satisfies Schema;
export type ChatSchema = typeof schema;

// Allows custom validation to be applied when creating/updating/deleting an entity
const validations = createValidations(schema, {});

// Allows defining anonymous or user-specific entity read permissions (or "row-level security")
const readPermissions = createReadPermissions({
    schema,
    publicByDefault: true,
    permissions: {},
});

const messageSubView = createViewBuilder<typeof schema, { c: 'channel' }>(schema)
    .from({ m: 'message' })
    .joinOn(['m.channelId', 'c.id'])
    .list('threadMessages', (threadView) =>
        threadView
            .from({ t: 'threadMessage' })
            .joinOn(['t.parentId', 'm.id'])
            .select(({ field }) => ({ id: field('t.id') }))
            .build()
    )
    .select(({ field }) => ({
        id: field('m.id'),
        content: field('m.content'),
        authorId: field('m.authorId'),
        edited: field('m.edited'),
        created: field('m.created'),
    }))
    .orderByLimit(({ field }) => [{ desc: field('m.created') }], 5)
    .build();

// "Views" that can join together any data you want and are incrementally kept up-to-date
const views = createViews({
    workspace: {
        name: 'Workspace',
        view: createViewBuilder(schema)
            .from({ w: 'workspace' })
            .list('channels', (channelView) =>
                channelView
                    .from({ c: 'channel' })
                    .joinOn(['c.workspaceId', 'w.id'])
                    .select(({ field }) => ({ id: field('c.id'), name: field('c.name'), order: field('c.order') }))
                    .orderByLimit(({ field }) => [{ asc: field('c.order') }], 100)
                    .build()
            )
            .select(({ field }) => ({
                workspaceId: field('w.id'),
            }))
            .build(),
    },
    channel: {
        name: 'Channel',
        view: createViewBuilder(schema)
            .from({ c: 'channel' })
            .list('messages', () => messageSubView)
            .select(({ field, aggregation }) => ({
                channelId: field('c.id'),
                channelName: field('c.name'),
            }))
            .where(({ eq, field, queryParam }) => eq(field('c.id'), queryParam.string('channelId')))
            .build(),
    },
}) satisfies Views;

export const backendDefinition: BackendDefinition<ChatSchema> = {
    version: 1,
    schema,
    validations: validations as any,
    readPermissions,
    views,
    previous: { version: 0, schema: {} },
    migrations: EMPTY_MIGRATIONS,
};
