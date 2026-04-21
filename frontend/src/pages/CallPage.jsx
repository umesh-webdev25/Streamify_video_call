import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

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
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const clientApiKey = tokenData?.apiKey || STREAM_API_KEY;

        if (!clientApiKey) {
          throw new Error("Stream API key is missing");
        }

        const videoClient = new StreamVideoClient({
          apiKey: clientApiKey,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        // Join the call first
        await callInstance.join({ 
          create: true,
        });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);

        // Enable camera and microphone after setting state
        try {
          await callInstance.camera.enable();
          await callInstance.microphone.enable();
          console.log("Camera and microphone enabled");
        } catch (mediaError) {
          console.warn("Could not enable camera/microphone:", mediaError);
          // Don't fail the entire call if media permissions are denied
          toast.error("Could not access camera/microphone. Please check permissions.");
        }
      } catch (error) {
        console.error("Error joining call:", error);
        const errorMessage = error?.message || "Could not join the call";
        toast.error(errorMessage);
        setIsConnecting(false);
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    // Cleanup function
    return () => {
      if (call) {
        call.leave().catch(err => console.error("Error leaving call:", err));
      }
      if (client) {
        client.disconnectUser().catch(err => console.error("Error disconnecting user:", err));
      }
    };
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
