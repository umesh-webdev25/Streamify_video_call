import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  VideoIcon,
  VideoOffIcon,
  MicIcon,
  MicOffIcon,
  CopyIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon,
  UsersIcon,
  LinkIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";

const generateMeetingCode = () => {
  // Safe characters excluding O, 0, I, 1
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const getSegment = (length) =>
    Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");

  // Format: XXXX-XXXX-XXXX
  return `${getSegment(4)}-${getSegment(4)}-${getSegment(4)}`;
};

const MeetingLobbyPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const [roomCode, setRoomCode] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const generatedRoomId = useRef(generateMeetingCode());

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audio = devices.filter((d) => d.kind === "audioinput");
        const video = devices.filter((d) => d.kind === "videoinput");
        setAudioDevices(audio);
        setVideoDevices(video);
        if (audio.length) setSelectedAudio(audio[0].deviceId);
        if (video.length) setSelectedVideo(video[0].deviceId);
      } catch {}
    };
    getDevices();
  }, []);

  useEffect(() => {
    const startPreview = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isCameraOn ? { deviceId: selectedVideo ? { exact: selectedVideo } : undefined } : false,
          audio: isMicOn ? { deviceId: selectedAudio ? { exact: selectedAudio } : undefined } : false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (isCameraOn) setIsCameraOn(false);
      }
    };
    startPreview();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOn, isMicOn, selectedVideo, selectedAudio]);

  const toggleCamera = () => setIsCameraOn((p) => !p);
  const toggleMic = () => setIsMicOn((p) => !p);

  const copyRoomCode = () => {
    const link = `${window.location.origin}/meeting/room/${generatedRoomId.current}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const startMeeting = () => {
    navigate(`/meeting/room/${generatedRoomId.current}`, {
      state: { isHost: true },
    });
  };

  const joinMeeting = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a meeting code");
      return;
    }
    navigate(`/meeting/room/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Helmet>
        <title>Meeting Lobby | Streamify</title>
      </Helmet>

      {/* BACK BUTTON */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => navigate("/")}
          className="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-xl transition-all"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-base-content">
              Video Meeting
            </h1>
            <p className="text-base-content/50 mt-2 font-medium">
              Start or join a secure video meeting
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CAMERA PREVIEW */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-base-300 border border-base-300/50 shadow-xl">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-base-300">
                    <div className="size-20 rounded-full bg-base-200 flex items-center justify-center">
                      <VideoOffIcon className="size-8 text-base-content/30" />
                    </div>
                  </div>
                )}
                {authUser && (
                  <div className="absolute bottom-3 left-3 glass px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <div className="size-6 rounded-full overflow-hidden ring-1 ring-white/20">
                      <img
                        src={authUser.profilePic}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-bold text-base-content">
                      {authUser.fullName}
                    </span>
                  </div>
                )}
              </div>

              {/* DEVICE CONTROLS */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleMic}
                  className={cn(
                    "btn btn-circle btn-md transition-all",
                    isMicOn
                      ? "bg-base-200 text-base-content hover:bg-base-300"
                      : "bg-error/10 text-error hover:bg-error/20"
                  )}
                  title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                >
                  {isMicOn ? (
                    <MicIcon className="size-5" />
                  ) : (
                    <MicOffIcon className="size-5" />
                  )}
                </button>

                <button
                  onClick={toggleCamera}
                  className={cn(
                    "btn btn-circle btn-md transition-all",
                    isCameraOn
                      ? "bg-base-200 text-base-content hover:bg-base-300"
                      : "bg-error/10 text-error hover:bg-error/20"
                  )}
                  title={isCameraOn ? "Turn off camera" : "Turn on camera"}
                >
                  {isCameraOn ? (
                    <VideoIcon className="size-5" />
                  ) : (
                    <VideoOffIcon className="size-5" />
                  )}
                </button>

                <button
                  onClick={() => setShowDevices(!showDevices)}
                  className="btn btn-circle btn-md bg-base-200 text-base-content hover:bg-base-300"
                  title="Select devices"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                </button>
              </div>

              {/* DEVICE SELECTION */}
              {showDevices && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 p-4 rounded-xl bg-base-200 border border-base-300/50"
                >
                  {videoDevices.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-base-content/50 uppercase tracking-wider block mb-1">
                        Camera
                      </label>
                      <select
                        value={selectedVideo}
                        onChange={(e) => setSelectedVideo(e.target.value)}
                        className="select select-sm select-bordered w-full bg-base-100 text-sm"
                      >
                        {videoDevices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {audioDevices.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-base-content/50 uppercase tracking-wider block mb-1">
                        Microphone
                      </label>
                      <select
                        value={selectedAudio}
                        onChange={(e) => setSelectedAudio(e.target.value)}
                        className="select select-sm select-bordered w-full bg-base-100 text-sm"
                      >
                        {audioDevices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Mic ${d.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* CONTROLS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* START MEETING */}
              <div className="backdrop-blur-md bg-base-100/70 border border-base-300/50 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <VideoIcon className="size-5 text-primary" />
                  Start a Meeting
                </h2>
                <p className="text-sm text-base-content/50">
                  Your room code:{" "}
                  <span className="font-mono font-bold text-primary text-base">
                    {generatedRoomId.current}
                  </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={startMeeting}
                    className="btn bg-gradient-to-r from-primary to-blue-500 text-white border-none flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <VideoIcon className="size-5" />
                    Start Meeting
                  </button>
                  <button
                    onClick={copyRoomCode}
                    className="btn btn-outline border-base-300 text-base-content h-12 rounded-xl font-bold hover:bg-base-200 transition-all"
                  >
                    {copied ? (
                      <CheckIcon className="size-5 text-success" />
                    ) : (
                      <CopyIcon className="size-5" />
                    )}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* JOIN MEETING */}
              <div className="backdrop-blur-md bg-base-100/70 border border-base-300/50 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                  <ArrowRightIcon className="size-5 text-primary" />
                  Join with Code
                </h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter room code..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                    className="input input-bordered bg-base-200/50 border-base-300 flex-1 h-12 rounded-xl text-base font-mono uppercase tracking-widest placeholder:tracking-normal placeholder:font-normal"
                    maxLength={8}
                  />
                  <button
                    onClick={joinMeeting}
                    disabled={!roomCode.trim()}
                    className="btn btn-primary h-12 rounded-xl font-bold shadow-lg shadow-primary/25 disabled:opacity-50 transition-all"
                  >
                    <ArrowRightIcon className="size-5" />
                  </button>
                </div>
              </div>

              {/* SCHEDULE LINK */}
              <div className="backdrop-blur-md bg-base-100/70 border border-base-300/50 rounded-2xl p-6 shadow-xl">
                <button
                  onClick={() => navigate("/meeting/schedule")}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-base-200/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CalendarIcon className="size-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-base-content">
                        Schedule a Meeting
                      </p>
                      <p className="text-xs text-base-content/40">
                        Plan a future meeting and invite friends
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="size-4 text-base-content/30" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingLobbyPage;