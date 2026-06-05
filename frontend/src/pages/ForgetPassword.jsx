import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailIcon, ShipWheelIcon, Loader2Icon } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await axiosInstance.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email!");
      navigate(`/verify-reset-otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              Forgot password?
            </h2>
            <p className="text-sm text-base-content/50 mt-1 leading-relaxed">
              Enter your email and we'll send you an OTP to reset it.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control w-full space-y-1.5">
              <label className="label py-0 px-0">
                <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                  Email Address
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MailIcon className="size-4 text-base-content/30" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="input input-bordered w-full h-11 pl-10 rounded-lg text-sm focus:border-primary transition-colors bg-base-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full h-11 rounded-lg text-sm font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset OTP"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-base-200 text-center">
            <p className="text-sm text-base-content/40">
              Remember your password?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;