import validator from "validator";
import dns from "dns";
import { promisify } from "util";
import net from "net";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const disposableDomains = require("disposable-email-domains");

const resolveMx = promisify(dns.resolveMx);

/**
 * Comprehensive email validation including:
 * 1. Format validation
 * 2. DNS MX record verification
 * 3. SMTP mailbox verification (optional - can be slow)
 */
export async function validateEmail(email, options = {}) {
  const { checkSMTP = false } = options;
  
  // Step 1: Validate email format
  if (!validator.isEmail(email)) {
    return {
      valid: false,
      reason: "Invalid email format"
    };
  }

  // Step 2: Extract domain
  const domain = email.split("@")[1];
  if (!domain) {
    return {
      valid: false,
      reason: "Invalid email format - missing domain"
    };
  }

  // Step 3: Check DNS MX records
  try {
    // Add timeout to DNS lookup
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DNS lookup timeout')), 5000); // 5 second timeout
    });

    const mxRecords = await Promise.race([
      resolveMx(domain),
      timeoutPromise
    ]);
    
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        reason: "Email domain does not exist or has no mail servers"
      };
    }

    // Sort MX records by priority (lower number = higher priority)
    mxRecords.sort((a, b) => a.priority - b.priority);
    
    // Step 4: Optional SMTP verification
    if (checkSMTP) {
      const smtpValid = await verifySMTP(email, mxRecords[0].exchange);
      if (!smtpValid) {
        return {
          valid: false,
          reason: "Email address does not exist on the mail server"
        };
      }
    }

    return {
      valid: true,
      domain,
      mxRecords: mxRecords.map(mx => mx.exchange)
    };
  } catch (dnsError) {
    console.log(`⚠️ DNS lookup failed for ${domain}:`, dnsError.message);
    // For development/testing, allow signup even if DNS fails
    // In production, you might want to be stricter
    return {
      valid: true,
      domain,
      mxRecords: [],
      warning: "DNS lookup failed - allowing signup for development"
    };
  }
}

/**
 * Verify email existence via SMTP
 * Connects to mail server and checks if email address exists
 */
async function verifySMTP(email, mxHost, timeout = 10000) {
  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    let stage = 0;
    const domain = email.split("@")[1];

    const timeoutId = setTimeout(() => {
      socket.destroy();
      console.log(`⚠️ SMTP verification timeout for ${email}`);
      resolve(false);
    }, timeout);

    socket.on("data", (data) => {
      const response = data.toString();
      console.log(`📧 SMTP [${stage}]: ${response.trim()}`);
      
      if (stage === 0 && response.includes("220")) {
        socket.write(`HELO ${domain}\r\n`);
        stage = 1;
      } else if (stage === 1 && response.includes("250")) {
        socket.write(`MAIL FROM:<verify@${domain}>\r\n`);
        stage = 2;
      } else if (stage === 2 && response.includes("250")) {
        socket.write(`RCPT TO:<${email}>\r\n`);
        stage = 3;
      } else if (stage === 3) {
        clearTimeout(timeoutId);
        socket.write("QUIT\r\n");
        socket.destroy();
        
        // Check SMTP response codes
        // 250 = success (email exists)
        // 550 = mailbox not found
        // 551 = user not local
        // 553 = mailbox name not allowed
        const emailExists = response.includes("250");
        console.log(`${emailExists ? '✅' : '❌'} SMTP verification result for ${email}: ${emailExists ? 'EXISTS' : 'NOT FOUND'}`);
        resolve(emailExists);
      }
    });

    socket.on("error", (error) => {
      clearTimeout(timeoutId);
      console.log(`⚠️ SMTP connection error for ${mxHost}:`, error.code);
      resolve(false); // If SMTP check fails, allow signup (don't block valid emails)
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}


/**
 * Check if email is from a disposable/temporary email service
 */
export function isDisposableEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}
