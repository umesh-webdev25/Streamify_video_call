import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  VideoIcon,
  PhoneIcon,
  MoreVerticalIcon,
  InfoIcon,
  SearchIcon,
  ChevronLeftIcon
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
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `🚀 I've started a premium video call. Join here: ${callUrl}`,
      });
      toast.success("Call invitation sent!");
      navigate(`/call/${channel.id}`);
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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <Chat client={chatClient} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <div className="flex flex-1 overflow-hidden h-full">
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <Window>
                {/* ULTRA PREMIUM HEADER */}
                <div className="sticky top-0 z-30 px-6 py-4 border-b border-white/10 bg-base-100/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-base-100/50">
                  <div className="flex items-center justify-between">
                    
                    {/* LEFT */}
                    <div className="flex items-center gap-4 min-w-0">
                      
                      {/* MOBILE BACK */}
                      <button
                        onClick={() => navigate(-1)}
                        className="lg:hidden flex items-center justify-center size-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                      >
                        <ChevronLeftIcon className="size-5 text-base-content/70" />
                      </button>

                      {/* AVATAR */}
                      <div className="relative group">
                        {/* Glow */}
                        <div className="absolute inset-0 rounded-[28px] bg-primary/20 blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />

                        <div className="relative size-14 rounded-[28px] overflow-hidden ring-2 ring-white/10 shadow-2xl">
                          <img
                            src={targetUser?.image}
                            alt={targetUser?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* ONLINE */}
                        <div className="absolute bottom-0 right-0">
                          <div className="relative flex items-center justify-center">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
                            <span className="relative size-4 rounded-full bg-green-500 border-[3px] border-base-100 shadow-lg" />
                          </div>
                        </div>
                      </div>

                      {/* USER INFO */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold tracking-tight truncate text-base-content">
                            {targetUser?.name || "Premium User"}
                          </h2>

                          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                              PRO
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="size-2 rounded-full bg-green-500 animate-pulse" />

                          <p className="text-xs font-medium text-base-content/50">
                            Active now
                          </p>

                          <span className="text-base-content/20">•</span>

                          <p className="text-xs text-base-content/40 truncate">
                            Language Exchange Partner
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-2">
                      
                      {/* SEARCH */}
                      <button className="hidden sm:flex items-center justify-center size-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105">
                        <SearchIcon className="size-4 text-base-content/60" />
                      </button>

                      {/* INFO */}
                      <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`hidden sm:flex items-center justify-center size-11 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                          showInfo
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-base-content/60"
                        }`}
                      >
                        <InfoIcon className="size-4" />
                      </button>

                      {/* CALL BUTTON */}
                      <button
                        onClick={handleVideoCall}
                        className="group relative overflow-hidden h-11 px-6 rounded-2xl bg-gradient-to-r from-primary to-blue-500 text-white font-semibold shadow-2xl shadow-primary/25 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                      >
                        {/* Glow */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative flex items-center gap-2">
                          <VideoIcon className="size-4" />
                          <span className="hidden md:block">Start Call</span>
                        </div>
                      </button>

                      {/* MORE */}
                      <button className="flex items-center justify-center size-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105">
                        <MoreVerticalIcon className="size-4 text-base-content/60" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-base-200/20">
                  <MessageList />
                </div>

                <div className="p-4 bg-base-100/50 backdrop-blur-sm border-t border-base-200">
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
                  className="hidden lg:flex flex-col border-l border-base-200 bg-base-100/50 backdrop-blur-md overflow-hidden h-full"
                >
                  <div className="p-8 flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="size-32 rounded-[32px] overflow-hidden ring-4 ring-primary/10 ring-offset-4 ring-offset-base-100 shadow-2xl">
                        <img src={targetUser?.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-success px-3 py-1 rounded-full border-4 border-base-100 shadow-lg">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Online</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-base-content tracking-tight">{targetUser?.name}</h2>
                      <p className="text-sm text-base-content/40 font-medium">@{targetUser?.name?.toLowerCase().replace(/\s/g, '')}</p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3">
                      <div className="bg-base-200/50 p-3 rounded-2xl border border-base-300/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-1">Status</p>
                        <p className="text-xs font-semibold text-base-content">Learner</p>
                      </div>
                      <div className="bg-base-200/50 p-3 rounded-2xl border border-base-300/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-1">Joined</p>
                        <p className="text-xs font-semibold text-base-content">May 2024</p>
                      </div>
                    </div>

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
                    </div>
                    
                    <button className="btn btn-outline btn-sm w-full rounded-xl border-base-300 text-base-content/50 hover:bg-base-200 hover:text-base-content mt-auto">
                      View Full Profile
                    </button>
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