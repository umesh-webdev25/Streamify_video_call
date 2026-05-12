import { useState } from "react";
import { Link } from "react-router";
import { MailIcon, ShipWheelIcon, ArrowLeftIcon, CheckCircleIcon } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-100 font-sans">
      <div className="w-full max-w-md bg-base-200 rounded-3xl border border-base-300 shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-12">
          {/* LOGO */}
          <div className="mb-10 flex items-center justify-center gap-3 group">
            <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-all duration-300">
              <ShipWheelIcon className="size-8 text-primary" />
            </div>
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 tracking-tight">
              Streamify
            </span>
          </div>

          {!isSubmitted ? (
            <>
              {/* HEADER */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                  Forgot Password?
                </h2>
                <p className="text-base-content/60 mt-3 font-medium leading-relaxed">
                  Enter your email address and we'll send you a secure password reset link.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control w-full space-y-2">
                  <label className="label py-0">
                    <span className="label-text font-bold text-base-content/70">Email Address</span>
                  </label>
                  <div className="relative group">
                    <MailIcon className="absolute top-1/2 transform -translate-y-1/2 left-4 size-5 text-primary/60 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      className="input input-bordered w-full h-14 pl-12 rounded-2xl bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all mt-4"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-success/10 rounded-full">
                  <CheckCircleIcon className="size-12 text-success" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-base-content tracking-tight mb-3">
                Check Your Email
              </h2>
              <p className="text-base-content/60 font-medium leading-relaxed mb-8">
                We've sent a password reset link to <span className="text-base-content font-bold">{email}</span>. Please check your inbox and spam folder.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn btn-ghost btn-sm rounded-xl font-bold gap-2"
              >
                <ArrowLeftIcon className="size-4" />
                Try another email
              </button>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-10 text-center border-t border-base-300 pt-8">
            <p className="text-sm font-medium text-base-content/60">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-primary font-bold hover:underline transition-colors"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;