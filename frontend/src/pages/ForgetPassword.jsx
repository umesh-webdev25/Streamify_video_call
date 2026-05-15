import { useState } from "react";
import { Link } from "react-router-dom";
import { MailIcon, ShipWheelIcon, ArrowLeftIcon, CheckCircleIcon } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
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
            <span className="text-lg font-bold tracking-tight text-base-content">Streamify</span>
          </Link>

          {!isSubmitted ? (
            <>
              {/* HEADER */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-base-content tracking-tight">
                  Forgot password?
                </h2>
                <p className="text-sm text-base-content/50 mt-1 leading-relaxed">
                  Enter your email and we'll send you a reset link.
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
                  className="btn btn-primary w-full h-11 rounded-lg text-sm font-semibold"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircleIcon className="size-8 text-success" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-base-content tracking-tight mb-2">
                Check your email
              </h2>
              <p className="text-sm text-base-content/50 leading-relaxed mb-6">
                We sent a reset link to{" "}
                <span className="text-base-content font-semibold">{email}</span>.
                Check your inbox and spam folder.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn btn-ghost btn-sm rounded-lg gap-2 text-sm font-medium"
              >
                <ArrowLeftIcon className="size-3.5" />
                Try another email
              </button>
            </div>
          )}

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