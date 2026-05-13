import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendIcon,
  MessageSquareIcon,
  XIcon,
  SmilePlusIcon,
  ImageIcon,
  PaperclipIcon,
  ReplyIcon,
  CheckIcon,
  LoaderIcon,
  SearchIcon,
  FileIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { StreamChat } from "stream-chat";

const EMOJI_LIST = ["😀", "😂", "❤️", "🎉", "👍", "🔥", "😍", "🙌", "😢", "💀", "✨", "😎", "🤝", "💯", "👋", "😅", "🤔", "🙏"];

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "😢", "🔥"];

const InCallChatPanel = ({ roomId, authUser, tokenData, onUnreadChange, isMobile }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactingTo, setReactingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const channelRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
        setReactingTo(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showEmojiPicker) setReactingTo(null);
  }, [showEmojiPicker]);

  useEffect(() => {
    let client;
    let mounted = true;

    const initChat = async () => {
      if (!tokenData?.token || !authUser || !roomId) {
        setIsLoading(false);
        return;
      }
      try {
        const clientApiKey = tokenData?.apiKey || import.meta.env.VITE_STREAM_API_KEY;
        client = StreamChat.getInstance(clientApiKey);
        await client.connectUser(
          { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
          tokenData.token
        );

        const channelId = `meeting-${roomId}`;
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id],
        });

        await currChannel.watch();

        if (mounted) {
          channelRef.current = currChannel;
          setIsLoading(false);

          currChannel.on("message.new", (event) => {
            if (event.user?.id !== authUser._id) {
              setMessages((prev) => {
                const exists = prev.some((m) => m.id === event.message.id);
                return exists ? prev : [...prev, event.message];
              });
            }
          });

          currChannel.on("message.updated", (event) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === event.message.id ? event.message : m))
            );
          });

          currChannel.on("reaction.new", (event) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === event.message.id
                  ? { ...m, latest_reactions: event.message.latest_reactions, reaction_counts: event.message.reaction_counts }
                  : m
              )
            );
          });

          currChannel.on("typing.start", (event) => {
            if (event.user?.id !== authUser._id) {
              setTypingUsers((prev) => ({ ...prev, [event.user.id]: event.user.name || "Someone" }));
            }
          });

          currChannel.on("typing.stop", (event) => {
            setTypingUsers((prev) => {
              const next = { ...prev };
              delete next[event.user.id];
              return next;
            });
          });

          const stateMessages = currChannel.state.messages || [];
          setMessages(stateMessages);
        }
      } catch (err) {
        if (mounted) {
          setError("Could not connect to chat");
          setIsLoading(false);
        }
      }
    };

    initChat();

    return () => {
      mounted = false;
      if (client) {
        client.disconnectUser();
      }
    };
  }, [tokenData?.token, authUser?._id, roomId]);

  useEffect(() => {
    const unread = messages.filter(
      (m) => m.user?.id !== authUser?._id && !m.isRead
    ).length;
    onUnreadChange?.(unread);
  }, [messages, authUser?._id, onUnreadChange]);

  const sendMessage = async () => {
    const ch = channelRef.current;
    if ((!inputValue.trim() && attachments.length === 0) || !ch) return;

    const msgData = { text: inputValue.trim() };

    if (replyTo) {
      msgData.quoted_message_id = replyTo.id;
    }

    if (attachments.length > 0) {
      msgData.attachments = attachments;
    }

    try {
      setIsUploading(true);
      const msg = await ch.sendMessage(msgData);
      setMessages((prev) => [...prev, msg.message]);
      setInputValue("");
      setAttachments([]);
      setReplyTo(null);
      setIsUploading(false);
      ch.stopTyping();
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      return;
    }
    const ch = channelRef.current;
    if (ch && inputValue.trim()) {
      ch.keystroke();
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        ch.stopTyping();
      }, 2000);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const ch = channelRef.current;
      if (!ch) return;
      const msg = messages.find((m) => m.id === messageId);
      const hasReacted = msg?.latest_reactions?.some(
        (r) => r.user_id === authUser._id && r.type === emoji
      );
      if (hasReacted) {
        await ch.deleteReaction(messageId, emoji);
      } else {
        await ch.sendReaction(messageId, { type: emoji });
      }
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        if (file.type.startsWith("image/")) {
          setAttachments((prev) => [
            ...prev,
            {
              type: "image",
              fallback: file.name,
              image_url: dataUrl,
              file_size: file.size,
              mime_type: file.type,
            },
          ]);
        } else {
          setAttachments((prev) => [
            ...prev,
            {
              type: "file",
              fallback: file.name,
              file_size: file.size,
              mime_type: file.type,
              asset_url: dataUrl,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const hasTyping = Object.keys(typingUsers).length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a]">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-black/40">
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="size-4 text-primary" />
          <h3 className="text-sm font-bold tracking-tight text-white">In-Call Chat</h3>
          <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full font-medium">
            {messages.length}
          </span>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={cn(
            "btn btn-ghost btn-circle btn-xs transition-all",
            showSearch ? "bg-primary/20 text-primary" : "text-white/30 hover:text-white/60"
          )}
        >
          <SearchIcon className="size-3.5" />
        </button>
      </div>

      {/* SEARCH BAR */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="p-2">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                <SearchIcon className="size-3.5 text-white/30 shrink-0" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-white/20 outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-white/30 hover:text-white/60">
                    <XIcon className="size-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="loading loading-spinner loading-sm text-primary" />
            <p className="text-xs text-white/30 font-medium">Connecting chat...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <MessageSquareIcon className="size-8 text-white/10" />
            <p className="text-xs text-white/40">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-ghost btn-xs text-primary"
            >
              Retry
            </button>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-4">
            <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <MessageSquareIcon className="size-6 text-white/15" />
            </div>
            <div>
              <p className="text-sm text-white/40 font-semibold">
                {searchQuery ? "No results found" : "No messages yet"}
              </p>
              <p className="text-[11px] text-white/20 mt-1">
                {searchQuery ? "Try a different search term" : "Be the first to say something!"}
              </p>
            </div>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const isMe = msg.user?.id === authUser?._id;
            const prevMsg = filteredMessages[idx - 1];
            const showAvatar = !isMe && prevMsg?.user?.id !== msg.user?.id;
            const reactions = msg.latest_reactions || [];
            const reactionCounts = msg.reaction_counts || {};
            const uniqueReactions = [...new Set(reactions.map((r) => r.type))];

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={cn("flex gap-2 group", isMe ? "justify-end" : "justify-start")}
              >
                {/* AVATAR */}
                {!isMe && showAvatar && (
                  <div className="size-6 rounded-full overflow-hidden shrink-0 ring-1 ring-white/10 mt-0.5">
                    <img src={msg.user?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {!isMe && !showAvatar && <div className="w-6 shrink-0" />}

                <div className={cn("max-w-[88%] min-w-0", isMe && "items-end flex flex-col")}>
                  {/* SENDER NAME */}
                  {!isMe && showAvatar && (
                    <p className="text-[10px] text-white/25 font-medium mb-0.5 ml-1">
                      {msg.user?.name || "Unknown"}
                    </p>
                  )}

                  {/* REPLY QUOTE */}
                  {msg.quoted_message && (
                    <div
                      className={cn(
                        "px-3 py-1.5 rounded-t-xl border-l-2 text-[11px] mb-0.5 max-w-[200px] truncate",
                        isMe
                          ? "bg-primary/20 border-primary/40 text-primary-content/70"
                          : "bg-white/5 border-white/20 text-white/40"
                      )}
                    >
                      <span className="font-semibold text-[10px]">
                        {msg.quoted_message.user?.name || "Unknown"}
                      </span>
                      <p className="truncate">{msg.quoted_message.text || "Image"}</p>
                    </div>
                  )}

                  {/* BUBBLE */}
                  <div
                    className={cn(
                      "px-3.5 py-2 text-sm leading-relaxed break-words shadow-sm",
                      isMe
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-content rounded-2xl rounded-tr-md"
                        : "bg-white/8 text-white/90 rounded-2xl rounded-tl-md border border-white/5"
                    )}
                  >
                    {/* IMAGE ATTACHMENT */}
                    {msg.attachments?.map((att, i) => (
                      <div key={i} className="mb-1.5">
                        {att.type === "image" ? (
                          <img
                            src={att.image_url || att.asset_url}
                            alt={att.fallback || "Image"}
                            className="rounded-xl max-h-48 w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                            <FileIcon className="size-4 text-white/40 shrink-0" />
                            <span className="text-xs truncate text-white/60">{att.fallback}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {msg.text && <span className="whitespace-pre-wrap">{msg.text}</span>}
                  </div>

                  {/* REACTIONS ROW */}
                  {uniqueReactions.length > 0 && (
                    <div
                      className={cn(
                        "flex gap-0.5 -mt-1.5 px-1",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className="bg-[#1a1a1a] border border-white/5 rounded-full px-1.5 py-0.5 shadow-lg flex gap-0.5">
                        {uniqueReactions.map((emoji) => (
                          <span
                            key={emoji}
                            className="text-xs cursor-default hover:scale-125 transition-transform"
                            title={`${reactionCounts[emoji] || 0}`}
                          >
                            {emoji}
                            {(reactionCounts[emoji] || 0) > 1 && (
                              <span className="text-[9px] text-white/30 ml-0.5">{reactionCounts[emoji]}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QUICK REACTIONS (on hover) */}
                  {!isMobile && (
                    <div
                      className={cn(
                        "flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(msg.id, emoji)}
                          className="text-xs hover:scale-125 transition-transform text-white/30 hover:text-white/80"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        onClick={() => setReplyTo(msg)}
                        className="text-[10px] hover:text-white/60 text-white/20 transition-colors ml-0.5"
                      >
                        <ReplyIcon className="size-3" />
                      </button>
                    </div>
                  )}

                  {/* TIME */}
                  <p className={cn("text-[9px] text-white/15 mt-0.5 px-1", isMe && "text-right")}>
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}

        {/* TYPING INDICATOR */}
        {hasTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-1 py-1"
          >
            <div className="flex items-center gap-1 bg-white/5 rounded-full px-3 py-1.5">
              <div className="flex gap-0.5">
                <span className="size-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[10px] text-white/30 ml-1">
                {Object.values(typingUsers).join(", ")} typing...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ATTACHMENT PREVIEWS */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="flex gap-2 p-2 overflow-x-auto">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative shrink-0">
                  {att.type === "image" ? (
                    <img
                      src={att.image_url}
                      alt=""
                      className="size-14 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="size-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <FileIcon className="size-5 text-white/30" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-error text-white flex items-center justify-center"
                  >
                    <XIcon className="size-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REPLY BANNER */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-white/5"
          >
            <div className="flex items-center gap-2 px-3 py-1.5">
              <ReplyIcon className="size-3 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-primary font-semibold truncate">
                  {replyTo.user?.name || "Unknown"}
                </p>
                <p className="text-[10px] text-white/30 truncate">{replyTo.text || "Image"}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-white/30 hover:text-white/60">
                <XIcon className="size-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT */}
      <div className="p-2.5 border-t border-white/10 shrink-0 bg-black/20">
        <div className="flex items-end gap-1.5 bg-white/5 rounded-2xl p-1.5 border border-white/5 focus-within:border-primary/30 transition-colors">
          {/* EMOJI PICKER TRIGGER */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="btn btn-ghost btn-circle btn-xs text-white/30 hover:text-white/60 hover:bg-white/5 shrink-0"
            >
              <SmilePlusIcon className="size-4" />
            </button>

            <AnimatePresence>
              {showEmojiPicker && !reactingTo && (
                <motion.div
                  ref={emojiPickerRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-3 shadow-2xl z-50"
                >
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setInputValue((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                          inputRef.current?.focus();
                        }}
                        className="text-lg hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ATTACH FILE */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost btn-circle btn-xs text-white/30 hover:text-white/60 hover:bg-white/5 shrink-0"
            disabled={isUploading}
          >
            <PaperclipIcon className="size-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* TEXT INPUT */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-white placeholder:text-white/20 outline-none px-2 py-1.5"
            />
          </div>

          {/* SEND */}
          <button
            onClick={sendMessage}
            disabled={(!inputValue.trim() && attachments.length === 0) || isUploading}
            className={cn(
              "btn btn-circle btn-sm border-none transition-all shrink-0",
              inputValue.trim() || attachments.length > 0
                ? "bg-primary text-primary-content hover:bg-primary/80"
                : "bg-white/5 text-white/20"
            )}
          >
            {isUploading ? (
              <LoaderIcon className="size-3.5 animate-spin" />
            ) : (
              <SendIcon className="size-3.5" />
            )}
          </button>
        </div>

        {/* EMOJI REACTION PICKER (for reacting to specific messages) */}
        <AnimatePresence>
          {reactingTo && showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 mt-2"
            >
              <div className="grid grid-cols-6 gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      addReaction(reactingTo, emoji);
                      setShowEmojiPicker(false);
                      setReactingTo(null);
                    }}
                    className="text-lg hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-white/20 text-center mt-2">React to message</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InCallChatPanel;
