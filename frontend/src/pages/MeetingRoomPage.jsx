import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneOffIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  MonitorUpIcon,
  HandIcon,
  MessageSquareIcon,
  UsersIcon,
  CopyIcon,
  CheckIcon,
  Maximize2Icon,
  Minimize2Icon,
  ChevronDownIcon,
  XIcon,
  ArrowLeftIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import PageLoader from "../components/PageLoader";
import { cn } from "../lib/utils";
import InCallChatPanel from "../components/meeting/InCallChatPanel";
import LeaveMeetingModal from "../components/meeting/LeaveMeetingModal";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const MeetingRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isHost = location.state?.isHost || false;

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [raisedHands, setRaisedHands] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const clientRef = useRef(null);
  const callRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !roomId) {
        setIsConnecting(false);
        return;
      }
      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };
        const clientApiKey = tokenData?.apiKey || STREAM_API_KEY;
        if (!clientApiKey) throw new Error("Stream API key is missing");

        const videoClient = new StreamVideoClient({
          apiKey: clientApiKey,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", roomId);
        await callInstance.join({ create: true });

        clientRef.current = videoClient;
        callRef.current = callInstance;
        setClient(videoClient);
        setCall(callInstance);

        try {
          await callInstance.camera.enable();
          await callInstance.microphone.enable();
        } catch {
          toast.error("Could not access camera/microphone.");
        }
      } catch (error) {
        toast.error(error?.message || "Could not join the meeting");
      } finally {
        setIsConnecting(false);
      }
    };
    initCall();
    return () => {
      const cleanup = async () => {
        if (callRef.current) await callRef.current.leave();
        if (clientRef.current) await clientRef.current.disconnectUser();
      };
      cleanup();
    };
  }, [tokenData, authUser, roomId]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/meeting/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleUnreadChange = useCallback((count) => {
    setUnreadCount((prev) => {
      if (count > prev) {
        setShowNewMsgToast(true);
        setTimeout(() => setShowNewMsgToast(false), 3000);
      }
      return count;
    });
  }, []);

  const [showNewMsgToast, setShowNewMsgToast] = useState(false);

  const handleOpenChat = () => {
    setShowChat(true);
    setShowNewMsgToast(false);
  };

  const handleEndCall = (endForEveryone) => {
    if (endForEveryone && callRef.current) {
      callRef.current.endCall();
    }
  };

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div ref={containerRef} className="h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Helmet>
        <title>Meeting Room {roomId} | Streamify</title>
      </Helmet>

      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <MeetingRoomContent
              showChat={showChat}
              setShowChat={handleOpenChat}
              onCloseChat={() => setShowChat(false)}
              showParticipants={showParticipants}
              setShowParticipants={setShowParticipants}
              showLeaveModal={showLeaveModal}
              setShowLeaveModal={setShowLeaveModal}
              copied={copied}
              copyInviteLink={copyInviteLink}
              unreadCount={unreadCount}
              elapsed={elapsed}
              formatTime={formatTime}
              isFullscreen={isFullscreen}
              toggleFullscreen={toggleFullscreen}
              roomId={roomId}
              raisedHands={raisedHands}
              setRaisedHands={setRaisedHands}
              navigate={navigate}
              onUnreadChange={handleUnreadChange}
              authUser={authUser}
              tokenData={tokenData}
              isMobile={isMobile}
              isHost={isHost}
              onEndCall={handleEndCall}
              showNewMsgToast={showNewMsgToast}
              setShowNewMsgToast={setShowNewMsgToast}
            />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="h-full flex items-center justify-center p-6">
          <div className="glass-dark p-12 rounded-[3rem] border border-white/5 text-center max-w-lg space-y-8">
            <div className="size-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto animate-pulse">
              <PhoneOffIcon className="size-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter">Connection Interrupted</h1>
              <p className="text-white/40 font-bold tracking-tight">
                We couldn't establish a secure connection to the meeting.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary flex-1 h-14 rounded-2xl font-black"
              >
                Retry Connection
              </button>
              <button
                onClick={() => navigate("/meeting/lobby")}
                className="btn btn-ghost border border-white/10 flex-1 h-14 rounded-2xl font-black"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MeetingRoomContent = ({
  showChat,
  setShowChat,
  onCloseChat,
  showParticipants,
  setShowParticipants,
  showLeaveModal,
  setShowLeaveModal,
  copied,
  copyInviteLink,
  unreadCount,
  elapsed,
  formatTime,
  isFullscreen,
  toggleFullscreen,
  roomId,
  raisedHands,
  setRaisedHands,
  navigate,
  onUnreadChange,
  authUser,
  tokenData,
  isMobile,
  isHost,
  onEndCall,
  showNewMsgToast,
  setShowNewMsgToast,
}) => {
  const {
    useCallCallingState,
    useParticipants,
    useLocalParticipant,
    useMicrophoneState,
    useCameraState,
    useScreenShareState,
    useDominantSpeaker,
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const dominantSpeaker = useDominantSpeaker();

  const { microphone, isMuted: isMicMuted } = useMicrophoneState();
  const { camera, isMuted: isCamMuted } = useCameraState();
  const { screenShare, isSharing: isScreenSharing } = useScreenShareState();
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const remoteParticipants = participants.filter(
    (p) => p.sessionId !== localParticipant?.sessionId
  );

  if (callingState === CallingState.LEFT) {
    navigate("/meeting/lobby");
    return null;
  }

  const raiseHand = () => {
    const id = localParticipant?.sessionId;
    if (!id) return;
    const newHands = new Set(raisedHands);
    if (newHands.has(id)) {
      newHands.delete(id);
    } else {
      newHands.add(id);
    }
    setRaisedHands(newHands);
  };

  return (
    <StreamTheme>
      <div className="relative h-screen w-full flex flex-col">
        {/* TOP BAR */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 z-40 p-3 sm:p-6 flex items-center justify-between pointer-events-none"
        >
          {/* LEFT: BACK BUTTON + STATUS */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            <button
              onClick={() => {
                if (remoteParticipants.length > 0) {
                  setShowLeaveModal(true);
                } else {
                  navigate("/meeting/lobby");
                }
              }}
              className="btn btn-ghost btn-circle btn-xs sm:btn-sm glass-dark border-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
              title="Back to lobby"
            >
              <ArrowLeftIcon className="size-3 sm:size-4" />
            </button>

            <div className="glass-dark px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-white/5 flex items-center gap-2 sm:gap-4">
              <div className="size-2.5 sm:size-3 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/60">Live</span>
              <div className="h-3 sm:h-4 w-px bg-white/10" />
              <span className="text-xs sm:text-sm font-bold tracking-tight">{formatTime(elapsed)}</span>
              <div className="h-3 sm:h-4 w-px bg-white/10" />
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                {participants.length} {participants.length === 1 ? "Participant" : "Participants"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <button
              onClick={copyInviteLink}
              className="btn btn-ghost btn-circle btn-xs sm:btn-sm glass-dark border-white/5 hover:bg-white/10"
              title="Copy invite link"
            >
              {copied ? <CheckIcon className="size-3 sm:size-4 text-success" /> : <CopyIcon className="size-3 sm:size-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex btn btn-ghost btn-circle btn-sm glass-dark border-white/5 hover:bg-white/10"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2Icon className="size-4" /> : <Maximize2Icon className="size-4" />}
            </button>
          </div>
        </motion.div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          {/* VIDEO GRID */}
          <div className="flex-1 relative bg-black flex items-center justify-center p-2 sm:p-4">
            {remoteParticipants.length > 0 ? (
              <div
                className={cn(
                  "grid gap-2 sm:gap-4 w-full h-full max-w-7xl mx-auto",
                  remoteParticipants.length === 1
                    ? "grid-cols-1"
                    : remoteParticipants.length <= 4
                    ? "grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                )}
              >
                {remoteParticipants.map((p) => {
                  const isDominant = dominantSpeaker?.sessionId === p.sessionId;
                  return (
                    <div
                      key={p.sessionId}
                      className={cn(
                        "relative rounded-xl sm:rounded-[2.5rem] overflow-hidden border bg-zinc-900 group shadow-2xl transition-all duration-500",
                        isDominant
                          ? "border-primary/50 ring-2 ring-primary/30 scale-[1.02] z-10"
                          : "border-white/5 scale-100"
                      )}
                    >
                      <ParticipantView participant={p} className="h-full w-full object-cover" />
                      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 glass-dark px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/5 flex items-center gap-1.5 sm:gap-2">
                        <p className="text-[10px] sm:text-sm font-bold tracking-tight">
                          {p.name || "External User"}
                        </p>
                        {!p.isMicrophoneEnabled && <MicOffIcon className="size-2.5 sm:size-3.5 text-error" />}
                      </div>
                      {raisedHands.has(p.sessionId) && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 glass-dark px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-white/5">
                          <HandIcon className="size-3 sm:size-5 text-warning animate-bounce" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                <div className="size-20 sm:size-32 rounded-full glass-dark flex items-center justify-center border border-white/5 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <PhoneOffIcon className="size-8 sm:size-10 text-primary/40" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg sm:text-2xl font-black tracking-tighter">Waiting for others...</h3>
                  <p className="text-xs sm:text-sm text-white/40 font-bold tracking-tight">
                    Share the meeting link to invite participants
                  </p>
                </div>
              </div>
            )}

            {/* LOCAL PARTICIPANT PIP */}
            <motion.div
              drag
              dragMomentum={false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              className="absolute bottom-4 right-2 sm:bottom-6 sm:right-6 w-28 sm:w-56 aspect-video glass-dark rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl z-30 cursor-move"
            >
              {localParticipant && (
                <div className="relative w-full h-full bg-zinc-800">
                  <ParticipantView participant={localParticipant} mirror={true} className="w-full h-full object-cover" />
                  {isCamMuted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                      <VideoOffIcon className="size-5 sm:size-8 text-white/10" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 glass-dark px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-white/5 flex items-center gap-1 sm:gap-1.5">
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">You</p>
                    {isMicMuted && <MicOffIcon className="size-2 sm:size-3 text-error" />}
                  </div>
                  {raisedHands.has(localParticipant?.sessionId) && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 glass-dark px-1 py-0.5 sm:px-1.5 sm:py-1 rounded-lg border border-white/5">
                      <HandIcon className="size-3 sm:size-4 text-warning" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* DESKTOP CHAT SIDEBAR */}
          <AnimatePresence>
            {showChat && !isMobile && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden lg:flex flex-col border-l border-white/10 bg-black/90 backdrop-blur-xl overflow-hidden h-full shrink-0"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 shrink-0">
                  <span className="text-xs text-white/20 font-medium">Meeting Chat</span>
                  <button
                    onClick={onCloseChat}
                    className="btn btn-ghost btn-circle btn-xs text-white/30 hover:text-white/60"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
                <InCallChatPanel
                  roomId={roomId}
                  authUser={authUser}
                  tokenData={tokenData}
                  onUnreadChange={onUnreadChange}
                  isMobile={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NEW MESSAGE TOAST */}
        <AnimatePresence>
          {showNewMsgToast && !showChat && !isMobile && (
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={() => { setShowChat(true); setShowNewMsgToast(false); }}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 glass-dark px-4 py-2.5 rounded-2xl border border-primary/20 shadow-2xl flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
            >
              <MessageSquareIcon className="size-4 text-primary" />
              <span className="text-sm font-bold text-white">
                {unreadCount} new message{unreadCount > 1 ? "s" : ""}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* BOTTOM CONTROLS */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 z-40 p-3 sm:p-6 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent"
        >
          <div className="glass-dark px-3 sm:px-6 py-3 sm:py-4 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center gap-2 sm:gap-4">
            <ControlToggle
              active={!isMicMuted}
              onClick={() => microphone.toggle()}
              icon={isMicMuted ? MicOffIcon : MicIcon}
              error={isMicMuted}
              tooltip={isMicMuted ? "Unmute" : "Mute"}
              isMobile={isMobile}
            />
            <ControlToggle
              active={!isCamMuted}
              onClick={() => camera.toggle()}
              icon={isCamMuted ? VideoOffIcon : VideoIcon}
              error={isCamMuted}
              tooltip={isCamMuted ? "Turn on camera" : "Turn off camera"}
              isMobile={isMobile}
            />
            <ControlToggle
              active={isScreenSharing}
              onClick={() => screenShare.toggle()}
              icon={MonitorUpIcon}
              primary={isScreenSharing}
              tooltip={isScreenSharing ? "Stop sharing" : "Share screen"}
              isMobile={isMobile}
            />
            <ControlToggle
              active={false}
              onClick={raiseHand}
              icon={HandIcon}
              tooltip={raisedHands.has(localParticipant?.sessionId) ? "Lower hand" : "Raise hand"}
              customActive={raisedHands.has(localParticipant?.sessionId)}
              isMobile={isMobile}
            />

            {/* CHAT BUTTON WITH UNREAD BADGE */}
            <button
              onClick={() => {
                if (isMobile) {
                  setMobileChatOpen(true);
                  setShowNewMsgToast(false);
                } else {
                  setShowChat(!showChat);
                  setShowNewMsgToast(false);
                }
              }}
              className={cn(
                "btn btn-circle transition-all border-none relative",
                isMobile ? "btn-md" : "btn-lg",
                showChat ? "bg-primary text-primary-content" : "bg-white/10 text-white hover:bg-white/20"
              )}
              title="Chat"
            >
              <MessageSquareIcon className={isMobile ? "size-4" : "size-5"} />
              {unreadCount > 0 && !showChat && !mobileChatOpen && (
                <span className="absolute -top-1 -right-1 size-4 sm:size-5 bg-error text-white text-[8px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-in">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <div className="h-6 sm:h-10 w-px bg-white/10 mx-0.5 sm:mx-1" />

            <button
              onClick={() => setShowLeaveModal(true)}
              className={cn(
                "btn btn-error btn-circle shadow-xl shadow-error/20 hover:scale-110 active:scale-95 transition-all group",
                isMobile ? "btn-md" : "btn-lg"
              )}
              title="End Meeting"
            >
              <PhoneOffIcon className={cn(
                "group-hover:rotate-[135deg] transition-all duration-500",
                isMobile ? "size-5" : "size-6"
              )} />
            </button>
          </div>
        </motion.div>

        {/* MOBILE BOTTOM SHEET CHAT */}
        <AnimatePresence>
          {mobileChatOpen && isMobile && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed inset-0 z-[60] flex flex-col lg:hidden"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileChatOpen(false)} />
              <motion.div
                className="relative mt-auto h-[75vh] rounded-t-3xl overflow-hidden bg-[#0a0a0a] border-t border-white/10 shadow-2xl flex flex-col"
              >
                {/* SHEET HANDLE */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileChatOpen(false)}
                      className="btn btn-ghost btn-circle btn-sm text-white/40 hover:text-white/60"
                    >
                      <ChevronDownIcon className="size-5" />
                    </button>
                    <h3 className="text-sm font-bold text-white">Chat</h3>
                  </div>
                  <span className="text-xs text-white/30">{unreadCount > 0 ? `${unreadCount} new` : ""}</span>
                </div>

                <div className="flex-1 overflow-hidden">
                  <InCallChatPanel
                    roomId={roomId}
                    authUser={authUser}
                    tokenData={tokenData}
                    onUnreadChange={onUnreadChange}
                    isMobile={true}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEAVE MODAL */}
        <AnimatePresence>
          {showLeaveModal && (
            <LeaveMeetingModal
              isHost={isHost}
              onConfirm={(endForEveryone) => {
                onEndCall(endForEveryone);
                navigate("/meeting/lobby");
              }}
              onCancel={() => setShowLeaveModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </StreamTheme>
  );
};

const ControlToggle = ({
  active,
  onClick,
  icon: Icon,
  error,
  primary,
  tooltip,
  customActive,
  isMobile,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "btn btn-circle transition-all border-none relative overflow-hidden tooltip tooltip-top",
      isMobile ? "btn-md" : "btn-lg",
      customActive
        ? "bg-warning text-warning-content"
        : active
        ? primary
          ? "bg-primary text-primary-content hover:bg-primary/80"
          : "bg-white/10 text-white hover:bg-white/20"
        : "bg-error/10 text-error hover:bg-error/20"
    )}
    data-tip={tooltip}
  >
    <Icon className={cn(isMobile ? "size-4" : "size-5", !active && !customActive && "animate-pulse")} />
    {active && !customActive && (
      <motion.div layoutId="active-bg" className="absolute inset-0 bg-white/5 pointer-events-none" />
    )}
  </button>
);

export default MeetingRoomPage;
