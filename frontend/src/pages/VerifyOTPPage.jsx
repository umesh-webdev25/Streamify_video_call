import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ShieldCheckIcon,
  MailIcon,
  RefreshCcwIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react";
import { verifyOTP, resendOTP } from "../lib/api";
import { motion } from "framer-motion";

const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  // Redirect if email missing
  useEffect(() => {
    if (!email) {
      toast.error("Email not found");
      navigate("/signup");
    }
  }, [email, navigate]);

  // Timer
  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timer]);

  // Verify OTP
  const verifyMutation = useMutation({
    mutationFn: (data) => verifyOTP(data),

    onSuccess: () => {
      toast.success(
        "Email verified successfully!"
      );

      navigate("/login");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Verification failed"
      );
    },
  });

  // Resend OTP
  const resendMutation = useMutation({
    mutationFn: () => resendOTP(email),

    onSuccess: () => {
      toast.success("OTP resent successfully");
      setTimer(60);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to resend OTP"
      );
    },
  });

  // Handle input
  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];

    newOtp[index] =
      value.substring(value.length - 1);

    setOtp(newOtp);

    // Next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace navigation
  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error(
        "Please enter the 6-digit OTP"
      );

      return;
    }

    verifyMutation.mutate({
      email,
      otp: otpCode,
    });
  };

  return (
    <div
      className="
        min-h-screen
        relative
        overflow-hidden
        flex items-center justify-center
        bg-gradient-to-br
        from-blue-50
        via-white
        to-sky-100
        p-4
      "
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-blue-400/20 blur-3xl rounded-full" />

        <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-sky-300/20 blur-3xl rounded-full" />
      </div>

      {/* Card */}
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
        }}
        className="
          relative
          w-full
          max-w-md
          rounded-[2rem]
          border border-blue-100
          bg-white/90
          backdrop-blur-xl
          shadow-[0_20px_60px_rgba(59,130,246,0.15)]
          p-8 sm:p-10
        "
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className="
              relative
              w-24 h-24
              rounded-[2rem]
              bg-gradient-to-br
              from-blue-100
              to-sky-100
              flex items-center justify-center
              mb-7
              ring-1 ring-blue-100
            "
          >
            <div className="absolute inset-0 rounded-[2rem] bg-white/40 backdrop-blur-xl" />

            <ShieldCheckIcon className="relative w-11 h-11 text-blue-600" />

            <SparklesIcon className="absolute top-3 right-3 w-4 h-4 text-blue-400" />
          </div>

          {/* Title */}
          <h1
            className="
              text-3xl
              font-black
              tracking-tight
              text-gray-900
            "
          >
            Verify Your Account
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-relaxed
              text-gray-500
              max-w-[300px]
            "
          >
            We sent a secure verification code to
          </p>

          {/* Email */}
          <div
            className="
              mt-3
              px-4 py-2
              rounded-xl
              bg-blue-50
              border border-blue-100
              text-blue-700
              text-sm
              font-semibold
              break-all
            "
          >
            {email}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-10"
        >
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <motion.input
                whileFocus={{
                  scale: 1.06,
                }}
                key={index}
                ref={(el) =>
                  (inputRefs.current[index] = el)
                }
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(
                    index,
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                className="
                  w-12 h-14
                  sm:w-14 sm:h-16
                  rounded-2xl
                  border border-blue-100
                  bg-white
                  text-center
                  text-2xl
                  font-black
                  text-gray-900
                  outline-none
                  transition-all
                  focus:border-blue-400
                  focus:bg-blue-50
                  focus:ring-4
                  focus:ring-blue-500/20
                "
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="
              mt-8
              w-full
              h-14
              rounded-2xl
              bg-gradient-to-r
              from-blue-600
              to-sky-500
              hover:from-blue-500
              hover:to-sky-400
              text-white
              font-bold
              flex items-center justify-center gap-2
              transition-all duration-300
              hover:scale-[1.02]
              active:scale-95
              shadow-lg shadow-blue-500/20
              disabled:opacity-50
            "
          >
            {verifyMutation.isPending ? (
              <RefreshCcwIcon className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Verify OTP
                <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Didn’t receive the code?
          </p>

          <button
            onClick={() =>
              resendMutation.mutate()
            }
            disabled={
              timer > 0 ||
              resendMutation.isPending
            }
            className={`
              inline-flex
              items-center gap-2
              px-5 py-3
              rounded-xl
              text-sm font-semibold
              transition-all
              ${
                timer > 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }
            `}
          >
            <RefreshCcwIcon
              className={`w-4 h-4 ${
                resendMutation.isPending
                  ? "animate-spin"
                  : ""
              }`}
            />

            {timer > 0
              ? `Resend in ${timer}s`
              : "Resend OTP"}
          </button>
        </div>

        {/* Footer */}
        <div
          className="
            mt-8
            pt-6
            border-t border-blue-100
            flex items-center justify-center gap-2
            text-xs
            text-gray-400
          "
        >
          <MailIcon className="w-3.5 h-3.5" />

          <span>
            Check your spam folder if you
            can't find the email
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTPPage;