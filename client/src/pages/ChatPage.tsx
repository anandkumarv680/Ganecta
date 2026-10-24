import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Send,
  ArrowLeft,
  MessageSquare,
  Wifi,
  WifiOff,
  AlertCircle,
  X,
  RefreshCw,
  Plus,
} from "lucide-react";
import type {
  Message,
  MessageUser,
  Conversation,
  SearchUserResult,
} from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Card, Avatar, Button, EmptyState, Spinner } from "@/components/ui";
import {
  connectSocket,
  sendMessage,
  onNewMessage,
  getConversations,
  getChatHistory,
} from "@/api/chatApi";
import { searchUsers, getUserById } from "@/api/userApi";
import { extractErrorMessage } from "@/api/errors";
import { formatDate } from "@/utils/date";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
}

function getUserIdFromField(field: string | MessageUser): string {
  return typeof field === "string" ? field : field._id;
}

function normalizeMessage(msg: Message): ChatMessage {
  return {
    _id: msg._id,
    senderId: getUserIdFromField(msg.sender),
    receiverId: getUserIdFromField(msg.receiver),
    content: msg.content,
    createdAt: msg.createdAt,
  };
}

export default function ChatPage() {
  const { userId: routeUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [recipient, setRecipient] = useState<SearchUserResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(
    null,
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep a ref of the current recipient ID so socket listeners don't
  // re-register on every recipient change.
  const recipientRef = useRef<SearchUserResult | null>(null);
  useEffect(() => {
    recipientRef.current = recipient;
  }, [recipient]);

  // Track which userId has been loaded so the route effect doesn't
  // re-clear state when setRecipient triggers a re-render.
  const loadedUserIdRef = useRef<string | null>(null);

  // Fetch conversation list
  const fetchConversations = useCallback(async () => {
    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      setConversationsError(extractErrorMessage(err));
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // Fetch chat history for a specific user
  const fetchHistory = useCallback(async (otherUserId: string) => {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const data = await getChatHistory(otherUserId);
      const normalized = data.messages.map(normalizeMessage);
      normalized.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      setMessages(normalized);
    } catch (err) {
      setMessagesError(extractErrorMessage(err));
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Connect socket on mount
  useEffect(() => {
    if (!token) return;
    setStatus("connecting");
    const socket = connectSocket();

    if (!socket) {
      setStatus("disconnected");
      return;
    }

    if (socket.connected) {
      setStatus("connected");
    }

    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onConnectError = () => setStatus("disconnected");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [token]);

  // Fetch conversations whenever the token is available and we're
  // on the /chat route (no specific conversation open). Also refetch
  // when navigating back from /chat/:userId to /chat.
  useEffect(() => {
    if (!token) return;
    if (routeUserId) return;
    fetchConversations();
  }, [token, routeUserId, fetchConversations]);

  // Listen for incoming messages — stable listener, uses ref to check
  // whether the message belongs to the currently open conversation.
  useEffect(() => {
    if (!token) return;

    const off = onNewMessage((message: Message) => {
      const currentRecipient = recipientRef.current;
      const senderId = getUserIdFromField(message.sender);
      const receiverId = getUserIdFromField(message.receiver);

      if (
        currentRecipient &&
        (senderId === currentRecipient._id ||
          receiverId === currentRecipient._id)
      ) {
        // Message belongs to the open conversation — add it (dedup by _id)
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, normalizeMessage(message)];
        });
      }

      // Update conversation list preview for the relevant conversation
      const otherId = senderId === user?._id ? receiverId : senderId;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.user._id === otherId);
        if (idx === -1) {
          // New conversation from someone not in the list yet —
          // we'll pick it up on next refetch, but add a stub if we
          // know the recipient
          if (currentRecipient && otherId === currentRecipient._id) {
            return [
              {
                user: {
                  _id: currentRecipient._id,
                  name: currentRecipient.name,
                  username: currentRecipient.username,
                  profilePicture: currentRecipient.profilePicture,
                },
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
              },
              ...prev,
            ];
          }
          return prev;
        }
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
        };
        // Move to top
        const [moved] = updated.splice(idx, 1);
        updated.unshift(moved);
        return updated;
      });
    });

    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // If route has a userId, load that user + chat history.
  // Uses loadedUserIdRef to prevent re-clearing state when
  // setRecipient triggers a re-render of this effect.
  useEffect(() => {
    if (!routeUserId || !user || routeUserId === user._id) return;
    if (loadedUserIdRef.current === routeUserId) return;

    loadedUserIdRef.current = routeUserId;
    setRecipient(null);
    setMessages([]);

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
        setError("Could not load this user.");
      });

    fetchHistory(routeUserId);
  }, [routeUserId, user, fetchHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      setSearchResults(results.filter((r) => r._id !== user?._id));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectRecipient = (r: SearchUserResult) => {
    setRecipient(r);
    setMessages([]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    loadedUserIdRef.current = r._id;
    navigate(`/chat/${r._id}`, { replace: true });
    fetchHistory(r._id);
  };

  const goBackToList = () => {
    setRecipient(null);
    setMessages([]);
    loadedUserIdRef.current = null;
    navigate("/chat", { replace: true });
  };

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const content = input.trim();
      if (!content || !recipient || !user || sending) return;

      if (status !== "connected") {
        setError("Not connected. Please wait for the connection to establish.");
        return;
      }

      setSending(true);
      setError(null);

      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: ChatMessage = {
        _id: tempId,
        senderId: user._id,
        receiverId: recipient._id,
        content,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setInput("");

      // Update conversation preview optimistically, or add a new
      // conversation entry if this is the first message to this user.
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.user._id === recipient._id);
        if (idx === -1) {
          return [
            {
              user: {
                _id: recipient._id,
                name: recipient.name,
                username: recipient.username,
                profilePicture: recipient.profilePicture,
              },
              lastMessage: content,
              lastMessageAt: optimisticMsg.createdAt,
            },
            ...prev,
          ];
        }
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: content,
          lastMessageAt: optimisticMsg.createdAt,
        };
        const [moved] = updated.splice(idx, 1);
        updated.unshift(moved);
        return updated;
      });

      sendMessage({ receiverId: recipient._id, content }, (ack) => {
        if (ack.success) {
          const normalized = normalizeMessage(ack.message);
          setMessages((prev) => {
            // Replace the optimistic message, but also dedup in case
            // the socket 'new-message' event already added it.
            const filtered = prev.filter(
              (m) => m._id !== tempId && m._id !== normalized._id,
            );
            return [...filtered, normalized];
          });
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId ? { ...m, pending: false, failed: true } : m,
            ),
          );
          setError(ack.error || "Failed to send message");
        }
        setSending(false);
      });
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
            action={<Button onClick={() => navigate("/login")}>Sign In</Button>}
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
          Connect, collaborate, and share ideas with developers.
        </p>

      </div>

      {/* Connection status bar */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm transition-colors ${
          status === "connected"
            ? "bg-success-50 text-success-700"
            : status === "connecting"
              ? "bg-warning-50 text-warning-700"
              : "bg-error-50 text-error-700"
        }`}
      >
        {status === "connected" ? (
          <Wifi className="h-4 w-4" />
        ) : status === "connecting" ? (
          <Spinner className="!h-4 !w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        {status === "connected"
          ? "Online"
          : status === "connecting"
            ? "Connecting..."
            : "Disconnected — trying to reconnect"}
      </div>

      {/* Conversation list (shown when no recipient selected) */}
      {!recipient && !showSearch && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-700">
              Recent Chats
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchConversations}
                disabled={conversationsLoading}
                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                aria-label="Refresh conversations"
              >
                <RefreshCw
                  className={`h-4 w-4 ${conversationsLoading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
          </div>

          {conversationsLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {!conversationsLoading && conversationsError && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-6 w-6 text-error-400 mb-2" />
              <p className="text-sm text-neutral-600 mb-3">
                {conversationsError}
              </p>
              <Button onClick={fetchConversations} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          )}

          {!conversationsLoading &&
            !conversationsError &&
            conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  No conversations yet
                </p>
                <p className="text-sm text-neutral-500 mt-1 mb-4">
                  Search for a developer to start your first chat.
                </p>
                <Button onClick={() => setShowSearch(true)} size="sm">
                  <Plus className="h-4 w-4" />
                  Start a conversation
                </Button>
              </div>
            )}

          {!conversationsLoading &&
            !conversationsError &&
            conversations.length > 0 && (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.user._id}
                    onClick={() =>
                      selectRecipient({
                        _id: conv.user._id,
                        name: conv.user.name,
                        username: conv.user.username,
                        profilePicture: conv.user.profilePicture || "",
                      })
                    }
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                  >
                    <Avatar
                      src={conv.user.profilePicture || undefined}
                      name={conv.user.name}
                      size="md"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {conv.user.name}
                        </p>
                        <span className="text-xs text-neutral-400 shrink-0">
                          {formatDate(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">
                        @{conv.user.username}
                      </p>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </Card>
      )}

      {/* New conversation search (shown when "New" is clicked) */}
      {!recipient && showSearch && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <h2 className="text-sm font-semibold text-neutral-700">
              Search by name or username
            </h2>
          </div>
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

          {!searching && searchResults.length === 0 && searchQuery.trim() && (
            <p className="text-sm text-neutral-500 text-center py-6">
              No developers found. Try a different search.
            </p>
          )}

          {!searching && searchResults.length === 0 && !searchQuery.trim() && (
            <p className="text-sm text-neutral-400 text-center py-6">
              Search for someone to start messaging.
            </p>
          )}
        </Card>
      )}

      {/* Active conversation */}
      {recipient && (
        <Card className="overflow-hidden flex flex-col">
          {/* Conversation header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
            <button
              onClick={goBackToList}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              aria-label="Back to conversations"
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
              onClick={goBackToList}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              aria-label="Close conversation"
            >
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-[300px] max-h-[500px] bg-neutral-50/50">
            {messagesLoading && (
              <div className="flex items-center justify-center py-10">
                <Spinner />
              </div>
            )}

            {!messagesLoading && messagesError && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-6 w-6 text-error-400 mb-2" />
                <p className="text-sm text-neutral-600 mb-3">{messagesError}</p>
                <Button
                  onClick={() => fetchHistory(recipient._id)}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}

            {!messagesLoading && !messagesError && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  No messages yet
                </p>
                <p className="text-sm text-neutral-500 mt-1 max-w-xs">
                  Send a message to start the conversation.
                </p>
              </div>
            )}

            {!messagesLoading &&
              !messagesError &&
              messages.map((msg) => {
                const isOwn = msg.senderId === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
                  >
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                        isOwn
                          ? "bg-primary-600 text-white rounded-br-md"
                          : "bg-white border border-neutral-200 text-neutral-700 rounded-bl-md"
                      } ${msg.pending ? "opacity-60" : ""} ${
                        msg.failed ? "bg-error-100 border-error-300" : ""
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? "text-primary-200" : "text-neutral-400"
                        }`}
                      >
                        {formatDate(msg.createdAt)}
                        {msg.pending && " · Sending..."}
                        {msg.failed && " · Failed"}
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
              disabled={status !== "connected"}
              className="flex-1 h-10 px-4 rounded-xl bg-neutral-100 border border-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              size="sm"
              loading={sending}
              disabled={!input.trim() || status !== "connected"}
              className="!px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}

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
