import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  // Don't throw here on import to avoid crashing the app during startup.
  // Instead, log a clear warning — token creation will throw when attempted.
  console.error("Stream API key or Secret is missing. Chat/call features will not work until these are set.");
}

let streamClient = null;
try {
  if (apiKey && apiSecret) {
    streamClient = StreamChat.getInstance(apiKey, apiSecret);
    try {
      console.log("Stream client initialized with apiKey:", apiKey);
    } catch (e) {
      // ignore logging errors
    }
  }
} catch (err) {
  console.error("Error initializing Stream client:", err && err.message ? err.message : err);
}

export const upsertStreamUser = async (userData) => {
  try {
    if (!streamClient) throw new Error("Stream client is not initialized (missing API key/secret)");
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error && error.message ? error.message : error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    if (!streamClient) throw new Error("Stream client is not initialized (missing API key/secret)");
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error && error.message ? error.message : error);
    throw error;
  }
};

export const isStreamInitialized = () => {
  return !!streamClient;
};
