import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShipWheelIcon, EyeIcon, EyeOffIcon, LockIcon, Loader2Icon } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.post("/auth/reset-password", {
        resetToken: token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password. Please try again.");
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
              Reset password
            </h2>
            <p className="text-sm text-base-content/50 mt-1 leading-relaxed">
              Please enter your new password below.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control w-full space-y-1.5">
              <label className="label py-0 px-0">
                <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                  New Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockIcon className="size-4 text-base-content/30" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input input-bordered w-full h-11 pl-10 pr-10 rounded-lg text-sm focus:border-primary transition-colors bg-base-100"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-control w-full space-y-1.5">
              <label className="label py-0 px-0">
                <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                  Confirm Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LockIcon className="size-4 text-base-content/30" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input input-bordered w-full h-11 pl-10 pr-10 rounded-lg text-sm focus:border-primary transition-colors bg-base-100"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="btn btn-primary w-full h-11 rounded-lg text-sm font-semibold mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {!token && (
            <div className="mt-4 p-3 bg-error/10 text-error text-sm rounded-lg text-center">
              Missing reset token in URL parameters. Please use the link from your email.
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-base-200 text-center">
            <p className="text-sm text-base-content/40">
              Remembered your password?{" "}
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

export default ResetPasswordPage;
