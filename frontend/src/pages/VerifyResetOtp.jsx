import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShipWheelIcon, Loader2Icon, KeyRoundIcon, ArrowLeftIcon } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const VerifyResetOtpPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !email) return;

    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/verify-reset-otp", { email, otp });
      const resetToken = res.data.data.resetToken;
      toast.success("OTP verified!");
      navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setIsResending(true);
      await axiosInstance.post("/auth/forgot-password", { email });
      toast.success("OTP resent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-base-100">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Missing email parameter</h2>
          <Link to="/forget-password" className="btn btn-primary">Go to Forgot Password</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100">
      <div className="w-full max-w-lg bg-base-100 rounded-2xl border border-base-200 shadow-lg overflow-hidden">
        <div className="p-8 sm:p-10">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 mb-10 w-fit mx-auto">
            <div className="p-1.5 bg-primary rounded-lg">
              <ShipWheelIcon className="size-5 text-primary-content" />
            </div>
            <span className="text-lg font-bold tracking-tight text-base-content">MeetFlow</span>
          </Link>

          {/* HEADER */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-base-content tracking-tight">
              Verify OTP
            </h2>
            <p className="text-sm text-base-content/50 mt-1 leading-relaxed">
              We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to reset your password.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control w-full space-y-1.5">
              <label className="label py-0 px-0">
                <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                  Verification Code
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRoundIcon className="size-4 text-base-content/30" />
                </div>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="input input-bordered w-full h-11 pl-10 rounded-lg text-sm focus:border-primary transition-colors bg-base-100 text-center tracking-[0.5em] text-lg font-semibold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="btn btn-primary w-full h-11 rounded-lg text-sm font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-base-200 text-center space-y-4">
            <p className="text-sm text-base-content/40">
              Didn't receive the code?{" "}
              <button 
                onClick={handleResend}
                disabled={isResending}
                className="text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend"}
              </button>
            </p>
            <div>
              <Link to="/forget-password" className="text-sm text-base-content/50 hover:text-primary transition-colors inline-flex items-center gap-1">
                <ArrowLeftIcon className="size-3" /> Change email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtpPage;
