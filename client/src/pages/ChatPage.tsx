import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Send,
  ArrowLeft,
  MessageSquare,
  Wifi,
  WifiOff,
  AlertCircle,
  X,
  Info,
} from 'lucide-react';
import type { Message, SearchUserResult } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, Avatar, Button, EmptyState, Spinner } from '@/components/ui';
import {
  connectSocket,
  disconnectSocket,
  sendMessage,
  onNewMessage,
} from '@/api/chatApi';
import { searchUsers, getUserById } from '@/api/userApi';
import { formatDate } from '@/utils/date';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
}

export default function ChatPage() {
  const { userId: routeUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [recipient, setRecipient] = useState<SearchUserResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchUsers(q);
      setSearchResults(
        results.filter((r) => r._id !== user?._id),
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectRecipient = (r: SearchUserResult) => {
    setRecipient(r);
    setMessages([]);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/chat/${r._id}`, { replace: true });
  };

  // Connect socket on mount
  useEffect(() => {
    if (!token) return;
    setStatus('connecting');
    const socket = connectSocket();

    if (!socket) {
      setStatus('disconnected');
      return;
    }

    if (socket.connected) {
      setStatus('connected');
    }

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onConnectError = () => setStatus('disconnected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [token]);

  // Listen for incoming messages
  useEffect(() => {
    if (!token) return;

    const off = onNewMessage((message: Message) => {
      // Only add messages relevant to the current conversation
      const involvesCurrent =
        recipient &&
        (message.sender === recipient._id ||
          message.receiver === recipient._id);

      if (!involvesCurrent) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, { ...message }];
      });
    });

    return off;
  }, [token, recipient]);

  // If route has a userId, look up that user
  useEffect(() => {
    if (routeUserId && user && routeUserId !== user._id && (!recipient || recipient._id !== routeUserId)) {
      getUserById(routeUserId)
        .then((u) => {
          setRecipient({
            _id: u._id,
            name: u.name,
            username: u.username,
            profilePicture: u.profilePicture,
          });
        })
        .catch(() => {
          setError('Could not load this user.');
        });
    }
  }, [routeUserId, user, recipient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const content = input.trim();
      if (!content || !recipient || !user || sending) return;

      if (status !== 'connected') {
        setError('Not connected. Please wait for the connection to establish.');
        return;
      }

      setSending(true);
      setError(null);

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: ChatMessage = {
        _id: tempId,
        sender: user._id,
        receiver: recipient._id,
        content,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setInput('');

      sendMessage(
        { receiverId: recipient._id, content },
        (ack) => {
          if (ack.success) {
            setMessages((prev) =>
              prev.map((m) =>
                m._id === tempId
                  ? { ...ack.message }
                  : m,
              ),
            );
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m._id === tempId
                  ? { ...m, pending: false, failed: true }
                  : m,
              ),
            );
            setError(ack.error || 'Failed to send message');
          }
          setSending(false);
        },
      );
    },
    [input, recipient, user, sending, status],
  );

  if (!token || !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <EmptyState
            icon={<MessageSquare className="h-7 w-7" />}
            title="Sign in to chat"
            description="You need to be signed in to use real-time messaging."
            action={<Button onClick={() => navigate('/login')}>Sign In</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-neutral-900">Messages</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Real-time one-to-one chat with other developers
        </p>
      </div>

      {/* Connection status bar */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm transition-colors ${
          status === 'connected'
            ? 'bg-success-50 text-success-700'
            : status === 'connecting'
              ? 'bg-warning-50 text-warning-700'
              : 'bg-error-50 text-error-700'
        }`}
      >
        {status === 'connected' ? (
          <Wifi className="h-4 w-4" />
        ) : status === 'connecting' ? (
          <Spinner className="!h-4 !w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        {status === 'connected'
          ? 'Connected'
          : status === 'connecting'
            ? 'Connecting...'
            : 'Disconnected — trying to reconnect'}
      </div>

      {/* Recipient selection */}
      {!recipient && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">
            Start a conversation
          </h2>
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a developer to message..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-neutral-100 border border-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </form>

          {searching && (
            <div className="flex items-center justify-center py-6">
              <Spinner />
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map((result) => (
                <button
                  key={result._id}
                  onClick={() => selectRecipient(result)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                >
                  <Avatar
                    src={result.profilePicture || undefined}
                    name={result.name}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {result.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      @{result.username}
                    </p>
                  </div>
                  <MessageSquare className="h-4 w-4 text-neutral-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {!searching &&
            searchResults.length === 0 &&
            searchQuery.trim() && (
              <p className="text-sm text-neutral-500 text-center py-6">
                No developers found. Try a different search.
              </p>
            )}

          {!searching &&
            searchResults.length === 0 &&
            !searchQuery.trim() && (
              <p className="text-sm text-neutral-400 text-center py-6">
                Search for someone to start messaging.
              </p>
            )}
        </Card>
      )}

      {/* Active conversation */}
      {recipient && (
        <Card className="overflow-hidden flex flex-col" >
          {/* Conversation header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
            <button
              onClick={() => {
                setRecipient(null);
                setMessages([]);
                navigate('/chat', { replace: true });
              }}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              aria-label="Back to search"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <Avatar
              src={recipient.profilePicture || undefined}
              name={recipient.name}
              size="sm"
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {recipient.name}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                @{recipient.username}
              </p>
            </div>
            <button
              onClick={() => {
                setRecipient(null);
                setMessages([]);
                navigate('/chat', { replace: true });
              }}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              aria-label="Close conversation"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-[300px] max-h-[500px] bg-neutral-50/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  No messages yet
                </p>
                <p className="text-sm text-neutral-500 mt-1 max-w-xs">
                  Send a message to start the conversation. Messages are
                  available in real time during this session.
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isOwn = msg.sender === user._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isOwn
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white border border-neutral-200 text-neutral-700 rounded-bl-md'
                    } ${msg.pending ? 'opacity-60' : ''} ${
                      'failed' in msg && msg.failed
                        ? 'bg-error-100 border-error-300'
                        : ''
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isOwn ? 'text-primary-200' : 'text-neutral-400'
                      }`}
                    >
                      {formatDate(msg.createdAt)}
                      {msg.pending && ' · Sending...'}
                      {'failed' in msg && msg.failed && ' · Failed'}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-4 py-3 border-t border-neutral-200 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Type a message..."
              disabled={status !== 'connected'}
              className="flex-1 h-10 px-4 rounded-xl bg-neutral-100 border border-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              size="sm"
              loading={sending}
              disabled={!input.trim() || status !== 'connected'}
              className="!px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}

      {/* Info banner about message persistence */}
      <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200">
        <Info className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-500 leading-relaxed">
          Messages are delivered in real time during your active session.
          Message history is not available through the current API — switching
          conversations will not retrieve past messages.
        </p>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-error-600 text-white text-sm shadow-card-hover">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
