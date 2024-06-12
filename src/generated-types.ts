type ExactEntityTypes = {
    workspace: { id: string; created: number; updated: number; type: 'workspace'; name: string };
    channel: {
        id: string;
        created: number;
        updated: number;
        type: 'channel';
        name: string;
        workspaceId: string;
        order: number;
    };
    message: {
        id: string;
        created: number;
        updated: number;
        type: 'message';
        channelId: string;
        content: string;
        edited: boolean;
        authorId: string;
    };
    threadMessage: {
        id: string;
        created: number;
        updated: number;
        type: 'threadMessage';
        parentId: string;
        content: string;
        edited: boolean;
        authorId: string;
    };
};
type EditableEntityTypes = {
    workspace: ExactEntityTypes['workspace'];
    channel: ExactEntityTypes['channel'];
    message: ExactEntityTypes['message'];
    threadMessage: ExactEntityTypes['threadMessage'];
};
type ResultEntityTypes = {
    workspace: ExactEntityTypes['workspace'];
    channel: ExactEntityTypes['channel'];
    message: ExactEntityTypes['message'];
    threadMessage: ExactEntityTypes['threadMessage'];
};
export type Views = {
    workspace: { workspaceId: string; channels: { id: string; name: string; order: number }[] };
    channel: {
        channelId: string;
        channelName: string;
        messages: {
            id: string;
            content: string;
            authorId: string;
            edited: boolean;
            created: number;
            threadMessages: { id: string }[];
        }[];
    };
};
export type Types = {
    entityTypes: ExactEntityTypes;
    editableEntityTypes: EditableEntityTypes;
    resultEntityTypes: ResultEntityTypes;
    views: {
        workspace: { viewType: Views['workspace']; queryParams: Record<string, never> };
        channel: { viewType: Views['channel']; queryParams: { channelId: string } };
    };
};
