import mongoose from "mongoose";
import dns from "dns/promises";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log("MONGO_URI is not set in environment variables.");
    process.exit(1);
  }

  const maxAttempts = 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      attempt++;

      // If using mongodb+srv, do an explicit SRV lookup first so we can give a clearer
      // error message when SRV resolution fails (ENOTFOUND / querySrv errors).
      if (uri.startsWith("mongodb+srv://")) {
        // Extract hostname without credentials. Use URL if available, otherwise fallback.
        let host = null;
        try {
          const parsed = new URL(uri);
          host = parsed.hostname; // this strips username:password@ automatically
        } catch (e) {
          // Fallback: remove scheme, then drop userinfo if present
          host = uri.replace("mongodb+srv://", "").split("/")[0];
          if (host.includes("@")) host = host.split("@").pop();
        }

        try {
          await dns.resolveSrv(`_mongodb._tcp.${host}`);
        } catch (dnsErr) {
          console.log(
            `DNS SRV lookup failed for host \"${host}\". This prevents 'mongodb+srv' connections.`,
          );
          console.log(
            "If you're behind a captive portal, offline, or your DNS resolver doesn't support SRV records, replace MONGO_URI with a standard 'mongodb://' connection string that lists hosts with ports, or fix your DNS."
          );
          // rethrow to be handled by outer catch and exit after retries
          throw dnsErr;
        }
      }

      const conn = await mongoose.connect(uri, {
        // keep options explicit for clarity; mongoose 6+ has sensible defaults
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.log(`Error connecting to MongoDB (attempt ${attempt}):`, error && error.message ? error.message : error);
      if (attempt >= maxAttempts) {
        console.log("Could not connect to MongoDB after multiple attempts.");
        if ((error && error.code === "ENOTFOUND") || (error && error.message && error.message.includes("querySrv"))) {
          console.log(
            "SRV DNS lookup failed. Possible fixes:\n" +
              "- Check your internet connection and DNS settings.\n" +
              "- Use a 'mongodb://' connection string with host:port(s) instead of 'mongodb+srv://'.\n" +
              "- Ensure your network/firewall allows DNS SRV queries.\n" +
              "- If using MongoDB Atlas, verify the cluster address is correct and your IP is allowed in the Atlas Network Access list."
          );
        }
        process.exit(1);
      }

      // Exponential-ish backoff before retrying
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
};
