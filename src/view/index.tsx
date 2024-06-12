import React, { Fragment, KeyboardEvent, useEffect, useState } from 'react';
import { Box, Col, Row } from '../common/layout';
import styled from 'styled-components';
import {
    BackendProvider,
    useBackend,
    useCurrentUser,
    useDatabase,
    useEntityQuery,
    usePrincipal,
    UserProvider,
    useViewQuery,
} from './provider';
import { execLogError } from '../common/promise';
import { Button } from '../common/button';
import { Input } from '../common/input';
import { Types, Views } from '../generated-types';
import { Backend, Database } from '@flowdb/api';
import { InlineEdit } from '../common/inline-edit';
import { timestampToLocalTime } from '../common/time';
import { LoadingIndicator } from '../common/loading';

type MessageType = Views['channel']['messages'][number];
const MessageAndActions = styled(Row)`
    justify-content: space-between;
    align-items: center;
`;
const EditMessage = ({ message, onExit }: { message: MessageType; onExit: () => void }) => {
    const { database } = useBackend();
    const [content, setContent] = useState(message.content);
    const onSave = () =>
        execLogError(async () => {
            await database.updateEntity('message', message.id, { content, edited: true });
            onExit();
        });
    return (
        <MessageAndActions>
            <Input
                type={'text'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                        onSave();
                    }
                }}
            />
            <Row>
                <Button onClick={onSave} disabled={content === message.content}>
                    Save
                </Button>
                <Button onClick={onExit}>Cancel</Button>
            </Row>
        </MessageAndActions>
    );
};

const MessageContent = ({
    message,
}: {
    message: { id: string; content: string; authorId: string; edited: boolean; created: number };
}) => {
    const { content, authorId, edited, created } = message;
    return (
        <Col>
            <span>
                {authorId} at {timestampToLocalTime(created)}:
            </span>
            <span>
                {content}
                {edited && (
                    <>
                        {' '}
                        <i>(edited)</i>
                    </>
                )}
            </span>
        </Col>
    );
};

const ThreadMessages = ({ parentMessageId, onClose }: { parentMessageId: string; onClose: () => void }) => {
    const { database } = useBackend();
    const currentUser = useCurrentUser();
    const threadMessages = useEntityQuery('threadMessage', {
        equalityFilters: {
            parentId: parentMessageId,
        },
        orderBy: [{ desc: 'created' }],
        limit: 5,
    });
    const onAdd = (newMessageContent: string) =>
        execLogError(async () =>
            database.createEntity('threadMessage', {
                parentId: parentMessageId,
                content: newMessageContent,
                edited: false,
                authorId: currentUser,
            })
        );
    const onDelete = (messageId: string) => execLogError(async () => database.deleteEntity('threadMessage', messageId));

    return (
        <Col>
            <Row $center={true} $justifyContent={'space-between'}>
                <span>Replies</span>
                <Button onClick={onClose}>Close</Button>
            </Row>
            {threadMessages !== null ? (
                [...threadMessages].reverse().map((message) => (
                    <Box key={message.id}>
                        <MessageAndActions>
                            <MessageContent message={message} />
                            <Button onClick={() => onDelete(message.id)}>Delete</Button>
                        </MessageAndActions>
                    </Box>
                ))
            ) : (
                <LoadingIndicator />
            )}
            <MessageInput onSave={onAdd} />
        </Col>
    );
};

const MessageTextInput = styled(Input)`
    flex: 1;
`;
const MessageInput = ({ onSave }: { onSave: (newValue: string) => void }) => {
    const [content, setContent] = useState('');
    const onSubmit = () => {
        onSave(content);
        setContent('');
    };

    return (
        <Row>
            <MessageTextInput
                type={'text'}
                onChange={(e) => setContent(e.target.value)}
                value={content}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                        onSubmit();
                    }
                }}
            />
            <Button onClick={onSubmit}>Send</Button>
        </Row>
    );
};

const ReplyButton = styled.button<{ $isActive: boolean }>`
    cursor: pointer;
    border: none;
    background: #eee none;
    text-align: start;
    padding: 5px;

    ${(props) => props.$isActive && 'background-color: #ddd;'}
    &:hover {
        background-color: #ddd;
    }
`;
const ViewMessage = ({
    message,
    onEdit,
    isThreadOpen,
    onViewThread,
}: {
    message: MessageType;
    onEdit: () => void;
    isThreadOpen: boolean;
    onViewThread: () => void;
}) => {
    const { database } = useBackend();
    const { id, threadMessages } = message;
    const onDelete = () => execLogError(() => database.deleteEntity('message', id));

    return (
        <Col>
            <MessageAndActions>
                <MessageContent message={message} />
                <Row>
                    <Button onClick={onEdit}>Edit</Button>
                    {threadMessages.length === 0 && <Button onClick={onViewThread}>Reply</Button>}
                    <Button onClick={onDelete}>Delete</Button>
                </Row>
            </MessageAndActions>
            {threadMessages.length > 0 && (
                <ReplyButton onClick={onViewThread} $isActive={isThreadOpen}>
                    {threadMessages.length} reply(s)
                </ReplyButton>
            )}
        </Col>
    );
};
const Message = ({
    message,
    isThreadOpen,
    onViewThread,
}: {
    message: MessageType;
    isThreadOpen: boolean;
    onViewThread: () => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <Box>
            {isEditing ? (
                <EditMessage message={message} onExit={() => setIsEditing(false)} />
            ) : (
                <ViewMessage
                    message={message}
                    onEdit={() => setIsEditing(true)}
                    isThreadOpen={isThreadOpen}
                    onViewThread={onViewThread}
                />
            )}
        </Box>
    );
};

const AddMessage = ({ channelId }: { channelId: string }) => {
    const backend = useBackend();
    const currentUserId = useCurrentUser();
    const onAddMessage = (content: string) =>
        execLogError(() =>
            backend.database.createEntity('message', {
                content,
                channelId,
                edited: false,
                authorId: currentUserId,
            })
        );

    return <MessageInput onSave={onAddMessage} />;
};

const ChannelContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: space-between;
    align-items: stretch;
`;
const ChannelMessagesContainer = styled(Col)`
    flex: 3;
    justify-content: space-between;
`;
const ThreadMessagesContainer = styled(Col)`
    flex: 2;
`;
const ChannelContainer = styled(Box)`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
const Channel = ({ channelId }: { channelId: string }) => {
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const channels = useViewQuery('channel', { queryParams: { channelId } });
    const [channel = null] = channels || [];
    if (channels === null) {
        return <LoadingIndicator />;
    } else if (channel === null) {
        return <div>Channel {channelId} not found</div>;
    }
    const { channelName, messages: reversedMessages } = channel;
    const messages = [...reversedMessages].reverse();

    return (
        <ChannelContainer>
            <strong>{channelName}</strong>
            <ChannelContentContainer>
                <ChannelMessagesContainer>
                    <Col>
                        {messages.map((message) => (
                            <Message
                                key={message.id}
                                message={message}
                                isThreadOpen={activeThreadId === message.id}
                                onViewThread={() => setActiveThreadId(message.id)}
                            />
                        ))}
                        {messages.length === 0 && <div>No messages yet</div>}
                    </Col>
                    <AddMessage channelId={channelId} />
                </ChannelMessagesContainer>
                {activeThreadId !== null && (
                    <ThreadMessagesContainer>
                        <ThreadMessages parentMessageId={activeThreadId} onClose={() => setActiveThreadId(null)} />
                    </ThreadMessagesContainer>
                )}
            </ChannelContentContainer>
        </ChannelContainer>
    );
};
const ChannelList = ({
    workspaceId,
    channels,
    selectedChannelId,
    onView,
}: {
    workspaceId: string;
    channels: Views['workspace']['channels'][number][];
    selectedChannelId: string | null;
    onView: (channelId: string) => void;
}) => {
    const database = useDatabase();
    const onChangeName = (id: string, newName: string) =>
        execLogError(() => database.updateEntity('channel', id, { name: newName }));
    const onCreate = () =>
        execLogError(async () => {
            const maxOrder = channels.length > 0 ? Math.max(...channels.map((v) => v.order)) : 0;
            const createResult = await database.createEntity('channel', {
                workspaceId,
                name: '?',
                order: maxOrder + 1,
            });
            if (createResult.type === 'success') {
                onView(createResult.value.id);
            }
        });
    const onDelete = (channelId: string) => execLogError(() => database.deleteEntity('channel', channelId));

    return (
        <Col>
            {channels.map(({ id, name }) => (
                <Row key={id} $center={true}>
                    <InlineEdit type={'text'} value={name} onChange={(newName) => onChangeName(id, newName)} />
                    <Button onClick={() => onView(id)} disabled={id === selectedChannelId}>
                        View
                    </Button>
                    <Button onClick={() => onDelete(id)}>Delete</Button>
                </Row>
            ))}
            {channels.length === 0 && <div>(No channels exist yet)</div>}
            <div>
                <button onClick={onCreate}>Add channel</button>
            </div>
        </Col>
    );
};

const Workspace = ({ workspaceView }: { workspaceView: Views['workspace'] }) => {
    const { channels, workspaceId } = workspaceView;
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    useEffect(() => {
        const [firstChannel = null] = channels;
        if (firstChannel !== null && selectedChannelId === null) {
            setSelectedChannelId(firstChannel.id);
        }
    }, [channels]);
    return (
        <Row $wrap={false}>
            <Box>
                <ChannelList
                    workspaceId={workspaceId}
                    channels={channels}
                    selectedChannelId={selectedChannelId}
                    onView={setSelectedChannelId}
                />
            </Box>
            {selectedChannelId !== null ? (
                <Channel key={selectedChannelId} channelId={selectedChannelId!} />
            ) : (
                <div>(No channel selected)</div>
            )}
        </Row>
    );
};

const createExampleData = (database: Database<Types>, userId: string) =>
    execLogError(async () => {
        const batch = database.createWriteBatch();
        const { id: workspaceId } = batch.createEntity('workspace', { name: 'Main workspace' });
        let channelOrder = 0;
        {
            const { id: channelId } = batch.createEntity('channel', {
                workspaceId,
                order: channelOrder++,
                name: '📢 Announcements',
            });
            batch.createEntity('message', { channelId, edited: false, content: 'Hello!', authorId: userId });
            batch.createEntity('message', {
                channelId,
                edited: false,
                content: 'An important announcement!!',
                authorId: userId,
            });
        }

        {
            const { id: channelId } = batch.createEntity('channel', {
                workspaceId,
                order: channelOrder++,
                name: 'Hobbies',
            });
            const { id: messageId } = batch.createEntity('message', {
                channelId,
                edited: false,
                content: 'Anyone here like fishing?',
                authorId: userId,
            });
            batch.createEntity('threadMessage', {
                parentId: messageId,
                authorId: userId,
                edited: false,
                content: 'Specifically on rivers',
            });
        }

        {
            batch.createEntity('channel', {
                workspaceId,
                order: channelOrder++,
                name: 'Misc',
            });
        }
        await batch.commit();
    });
const Workspaces = () => {
    // This is the first "view" we subscribe to. Check out the types defined in `Types['views']['workspace']`
    const workspaceViews = useViewQuery('workspace', { queryParams: {} });
    const userId = useCurrentUser();
    const database = useDatabase();
    const onDelete = (workspaceId: string) => execLogError(() => database.deleteEntity('workspace', workspaceId));

    if (workspaceViews === null) {
        return <LoadingIndicator />;
    }
    return (
        <Col>
            {workspaceViews.map((workspaceView) => (
                <Fragment key={workspaceView.workspaceId}>
                    <Workspace workspaceView={workspaceView} />
                    <div>
                        <Button onClick={() => onDelete(workspaceView.workspaceId)}>Delete workspace</Button>
                    </div>
                </Fragment>
            ))}
            {workspaceViews.length === 0 && (
                <>
                    <div>No workspaces created</div>
                    <div>
                        <Button onClick={() => createExampleData(database, userId)}>
                            Create workspace with example data
                        </Button>
                    </div>
                </>
            )}
        </Col>
    );
};

const WithBackend = () => {
    const principal = usePrincipal();
    const backend = useBackend();
    if (principal === null) {
        return <LoadingIndicator />;
    } else if (principal.type === 'anonymous') {
        return (
            <div>
                <Button onClick={() => backend.authentication.signIn()}>Sign in</Button>
            </div>
        );
    }

    return (
        <UserProvider userId={principal.userId}>
            <Workspaces />
        </UserProvider>
    );
};

export const App = ({ backend }: { backend: Backend<Types> }) => (
    <BackendProvider backend={backend}>
        <WithBackend />
    </BackendProvider>
);
