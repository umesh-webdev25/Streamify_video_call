import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PhoneOffIcon, 
  MicIcon, 
  MicOffIcon, 
  VideoIcon, 
  VideoOffIcon, 
  MonitorUpIcon, 
  SettingsIcon,
  MessageSquareIcon,
  Maximize2Icon
} from "lucide-react";

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
import PageLoader from "../components/PageLoader";
import { cn } from "../lib/utils";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  
  const clientRef = useRef(null);
  const callRef = useRef(null);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) {
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

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        clientRef.current = videoClient;
        callRef.current = callInstance;
        
        setClient(videoClient);
        setCall(callInstance);

        try {
          await callInstance.camera.enable();
          await callInstance.microphone.enable();
        } catch (mediaError) {
          toast.error("Could not access camera/microphone. Please check permissions.");
        }
      } catch (error) {
        toast.error(error?.message || "Could not join the call");
        setIsConnecting(false);
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
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen bg-[#050505] text-white overflow-hidden font-sans">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <PremiumCallContent />
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
                <p className="text-white/40 font-bold tracking-tight">We couldn't establish a secure connection to the call servers. This might be due to your network or an invalid call ID.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => window.location.reload()} className="btn btn-primary flex-1 h-14 rounded-2xl font-black">Retry Connection</button>
                <button onClick={() => window.location.href = "/"} className="btn btn-ghost border border-white/10 flex-1 h-14 rounded-2xl font-black">Back Home</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PremiumCallContent = () => {
  const { useCallCallingState, useParticipants, useLocalParticipant, useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const navigate = useNavigate();

  const { microphone, isMuted: isMicMuted } = useMicrophoneState();
  const { camera, isMuted: isCamMuted } = useCameraState();
  const { screenShare, isSharing: isScreenSharing } = useScreenShareState();

  const remoteParticipants = participants.filter(p => p.sessionId !== localParticipant?.sessionId);

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <div className="relative h-screen w-full flex flex-col">
        {/* TOP OVERLAY - INFO */}
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 z-50 p-8 flex items-center justify-between pointer-events-none"
        >
            <div className="glass-dark px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4 pointer-events-auto">
                <div className="size-3 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-black uppercase tracking-widest text-white/60">Live Call</span>
                <div className="h-4 w-[1px] bg-white/10" />
                <span className="text-sm font-bold tracking-tight">{participants.length} Participant{participants.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex items-center gap-3 pointer-events-auto">
                <button className="btn btn-ghost btn-circle btn-md glass-dark border-white/5 hover:bg-white/10">
                    <Maximize2Icon className="size-5" />
                </button>
                <button className="btn btn-ghost btn-circle btn-md glass-dark border-white/5 hover:bg-white/10">
                    <SettingsIcon className="size-5" />
                </button>
            </div>
        </motion.div>

        {/* MAIN VIDEO AREA */}
        <div className="flex-1 relative bg-black flex items-center justify-center p-4">
           {remoteParticipants.length > 0 ? (
               <div className={cn(
                   "grid gap-4 w-full h-full max-w-7xl mx-auto",
                   remoteParticipants.length === 1 ? "grid-cols-1" : 
                   remoteParticipants.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
               )}>
                   {remoteParticipants.map(p => (
                       <div key={p.sessionId} className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-zinc-900 group shadow-2xl">
                           <ParticipantView participant={p} className="h-full w-full object-cover" />
                           <div className="absolute bottom-6 left-6 glass-dark px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                                <p className="text-sm font-bold tracking-tight">{p.name || 'External User'}</p>
                                {!p.isMicrophoneEnabled && <MicOffIcon className="size-3.5 text-error" />}
                           </div>
                       </div>
                   ))}
               </div>
           ) : (
               <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="size-32 rounded-full glass-dark flex items-center justify-center border border-white/5 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <PhoneOffIcon className="size-10 text-primary/40" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-2xl font-black tracking-tighter">Waiting for others...</h3>
                        <p className="text-white/40 font-bold tracking-tight">Share the call ID to invite participants</p>
                    </div>
               </div>
           )}

           {/* LOCAL PARTICIPANT - Picture in Picture */}
           <motion.div 
                drag
                dragConstraints={{ left: 20, right: 20, top: 20, bottom: 20 }}
                className="absolute bottom-32 right-8 w-48 sm:w-64 aspect-video glass-dark rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl z-40 cursor-move"
            >
                {localParticipant && (
                    <div className="relative w-full h-full bg-zinc-800">
                        <ParticipantView participant={localParticipant} mirror={true} className="w-full h-full object-cover" />
                        {isCamMuted && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                <VideoOffIcon className="size-8 text-white/10" />
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 glass-dark px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-widest">You</p>
                            {isMicMuted && <MicOffIcon className="size-3 text-error" />}
                        </div>
                    </div>
                )}
           </motion.div>
        </div>

        {/* BOTTOM OVERLAY - CONTROLS */}
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 z-50 p-10 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent"
        >
            <div className="glass-dark px-8 py-5 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center gap-6">
                
                <ControlToggle 
                    active={!isMicMuted} 
                    onClick={() => microphone.toggle()} 
                    icon={isMicMuted ? MicOffIcon : MicIcon}
                    error={isMicMuted}
                />

                <ControlToggle 
                    active={!isCamMuted} 
                    onClick={() => camera.toggle()} 
                    icon={isCamMuted ? VideoOffIcon : VideoIcon}
                    error={isCamMuted}
                />

                <ControlToggle 
                    active={isScreenSharing} 
                    onClick={() => screenShare.toggle()} 
                    icon={MonitorUpIcon}
                    primary={isScreenSharing}
                />

                <button className="btn btn-ghost btn-circle btn-lg hover:bg-white/10 transition-all">
                    <MessageSquareIcon className="size-6" />
                </button>

                <div className="h-10 w-[1px] bg-white/10 mx-2" />

                <button 
                    onClick={() => navigate("/")}
                    className="btn btn-error btn-circle btn-lg shadow-xl shadow-error/20 hover:scale-110 active:scale-95 transition-all group"
                    title="End Call"
                >
                    <PhoneOffIcon className="size-7 group-hover:rotate-[135deg] transition-all duration-500" />
                </button>
            </div>
        </motion.div>
      </div>
    </StreamTheme>
  );
};

const ControlToggle = ({ active, onClick, icon: Icon, error, primary }) => (
    <button 
        onClick={onClick}
        className={cn(
            "btn btn-circle btn-lg transition-all border-none relative overflow-hidden",
            active ? (primary ? "bg-primary text-primary-content hover:bg-primary/80" : "bg-white/10 text-white hover:bg-white/20") : "bg-error/10 text-error hover:bg-error/20"
        )}
    >
        <Icon className={cn("size-6 z-10", !active && "animate-pulse")} />
        {active && (
             <motion.div 
                layoutId="active-bg"
                className="absolute inset-0 bg-white/5 pointer-events-none"
             />
        )}
    </button>
);

export default CallPage;
