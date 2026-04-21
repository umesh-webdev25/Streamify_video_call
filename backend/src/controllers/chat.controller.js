import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    if (!token) {
      console.log("generateStreamToken returned falsy token");
      return res.status(500).json({ message: "Could not generate stream token" });
    }

  // include the public API key so clients always use the same key the
  // backend used to generate the token. This helps avoid 'api_key not valid'
  // errors caused by mismatched frontend env vars during development.
  const apiKey = process.env.STREAM_API_KEY || null;
  res.status(200).json({ token, apiKey });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error && error.message ? error.message : error);
    // If stream client isn't initialized, give a helpful message
    if (error && error.message && error.message.includes("Stream client is not initialized")) {
      return res.status(500).json({ message: "Stream client is not configured. Please set STREAM_API_KEY and STREAM_API_SECRET." });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
}

