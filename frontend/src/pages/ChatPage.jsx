import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  VideoIcon,
  MoreVerticalIcon,
  InfoIcon,
  SearchIcon,
  ChevronLeftIcon,
  MessageSquareIcon,
  PhoneIcon,
} from "lucide-react";

import {
  Channel,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import { Helmet } from "react-helmet-async";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData, isError: tokenIsError, error: tokenError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (tokenIsError) {
      toast.error(`Chat connection failed: ${tokenError?.message || "Check your backend"}`);
    }
  }, [tokenIsError, tokenError]);

  useEffect(() => {
    let client;

    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const clientApiKey = tokenData?.apiKey || STREAM_API_KEY;

        client = StreamChat.getInstance(clientApiKey);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId]
          .sort()
          .join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to the chat server");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [tokenData?.token, authUser?._id, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/meeting/room/${channel.id}`;
      channel.sendMessage({
        text: `🚀 Join my video call: ${callUrl}`,
      });
      toast.success("Call invitation sent!");
      navigate(`/meeting/room/${channel.id}`);
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  const targetUser = channel.state.members[targetUserId]?.user;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-base-100 overflow-hidden relative">
      <Helmet>
        <title>Chat with {targetUser?.name || "Member"} | Streamify</title>
      </Helmet>

      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <Chat client={chatClient} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <div className="flex flex-1 overflow-hidden h-full">
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <Window>
                {/* HEADER */}
                <div className="sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 border-b border-base-300/50 bg-base-100/80 backdrop-blur-2xl">
                  <div className="flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">

                      {/* MOBILE BACK */}
                      <button
                        onClick={() => navigate(-1)}
                        className="lg:hidden flex items-center justify-center size-9 sm:size-10 rounded-xl bg-base-200/80 hover:bg-base-300/80 border border-base-300/50 transition-all"
                      >
                        <ChevronLeftIcon className="size-4 sm:size-5 text-base-content/60" />
                      </button>

                      {/* AVATAR WITH GLOW */}
                      <div className="relative group shrink-0">
                        <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />
                        <div className="relative size-11 sm:size-14 rounded-2xl overflow-hidden ring-2 ring-base-300/60 shadow-lg">
                          <img
                            src={targetUser?.image || "/avatar.png"}
                            alt={targetUser?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                          />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 size-3.5 sm:size-4 rounded-full bg-success border-[3px] border-base-100 shadow-sm" />
                      </div>

                      {/* USER INFO */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold tracking-tight truncate text-base-content">
                            {targetUser?.name || "User"}
                          </h2>
                          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            <span className="size-1 rounded-full bg-primary" />
                            <span className="text-[9px] uppercase tracking-widest font-bold text-primary">PRO</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="size-1.5 rounded-full bg-success" />
                          <p className="text-xs font-medium text-base-content/50">Active now</p>
                          <span className="text-base-content/20 hidden xs:inline">·</span>
                          <p className="text-xs text-base-content/40 truncate hidden xs:block">
                            Language Exchange Partner
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button className="hidden sm:flex items-center justify-center size-9 sm:size-10 rounded-xl bg-base-200/80 hover:bg-base-300/80 border border-base-300/50 transition-all hover:scale-105 text-base-content/50 hover:text-base-content">
                        <SearchIcon className="size-4" />
                      </button>

                      <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`hidden sm:flex items-center justify-center size-9 sm:size-10 rounded-xl border transition-all hover:scale-105 ${showInfo
                            ? "bg-primary text-primary-content border-primary shadow-md shadow-primary/20"
                            : "bg-base-200/80 hover:bg-base-300/80 border-base-300/50 text-base-content/50 hover:text-base-content"
                          }`}
                      >
                        <InfoIcon className="size-4" />
                      </button>

                      <button
                        onClick={handleVideoCall}
                        className="group relative overflow-hidden h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-1.5 sm:gap-2">
                          <VideoIcon className="size-3.5 sm:size-4" />
                          <span className="hidden md:block text-xs sm:text-sm">Call</span>
                        </div>
                      </button>

                      <button className="flex items-center justify-center size-9 sm:size-10 rounded-xl bg-base-200/80 hover:bg-base-300/80 border border-base-300/50 transition-all hover:scale-105">
                        <MoreVerticalIcon className="size-4 text-base-content/50" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* MESSAGE LIST */}
                <div className="flex-1 overflow-hidden relative bg-base-200/10">
                  <MessageList />
                </div>

                {/* MESSAGE INPUT */}
                <div className="p-3 sm:p-4 bg-base-100/60 backdrop-blur-sm border-t border-base-300/40">
                  <MessageComposer />
                </div>
              </Window>
              <Thread />
            </div>

            {/* RIGHT INFO SIDEBAR */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="hidden lg:flex flex-col border-l border-base-300/50 bg-base-100/40 backdrop-blur-md overflow-hidden h-full"
                >
                  <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6 overflow-y-auto">
                    {/* AVATAR */}
                    <div className="relative">
                      <div className="size-28 sm:size-32 rounded-3xl overflow-hidden ring-4 ring-primary/10 ring-offset-4 ring-offset-base-100 shadow-2xl">
                        <img src={targetUser?.image || "/avatar.png"} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/avatar.png"; }} />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-success px-3 py-1 rounded-full border-4 border-base-100 shadow-lg">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Online</span>
                      </div>
                    </div>

                    {/* NAME */}
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-base-content tracking-tight">
                        {targetUser?.name}
                      </h2>
                      <p className="text-sm text-base-content/40 font-medium">
                        @{targetUser?.name?.toLowerCase().replace(/\s/g, '')}
                      </p>
                    </div>

                    {/* STATS */}
                    <div className="w-full grid grid-cols-2 gap-3">
                      <div className="bg-base-200/50 p-3 rounded-2xl border border-base-300/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-1">Status</p>
                        <p className="text-xs font-semibold text-base-content flex items-center gap-1.5 justify-center">
                          <span className="size-1.5 rounded-full bg-success" />
                          Active
                        </p>
                      </div>
                      <div className="bg-base-200/50 p-3 rounded-2xl border border-base-300/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-1">Joined</p>
                        <p className="text-xs font-semibold text-base-content">May 2024</p>
                      </div>
                    </div>

                    {/* ABOUT */}
                    <div className="w-full space-y-4 pt-4 border-t border-base-200">
                      <div className="text-left space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30">About</p>
                        <p className="text-sm text-base-content/60 leading-relaxed italic">
                          "Passionate about learning languages and connecting with people worldwide."
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {['English', 'Spanish', 'French'].map(lang => (
                          <span key={lang} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/20">
                            {lang}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleVideoCall}
                          className="btn btn-primary btn-sm flex-1 rounded-xl gap-1.5 shadow-md shadow-primary/20"
                        >
                          <VideoIcon className="size-3.5" />
                          Call
                        </button>
                        <button
                          onClick={() => navigate(`/meeting/room/${[authUser._id, targetUserId].sort().join("-")}`)}
                          className="btn btn-outline btn-sm flex-1 rounded-xl border-base-300 text-base-content/60 hover:bg-base-200 hover:text-base-content gap-1.5"
                        >
                          <MessageSquareIcon className="size-3.5" />
                          Meeting
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
