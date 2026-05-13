import { useState } from "react";
import { ShipWheelIcon, MailIcon, LockIcon, ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";
import { Helmet } from "react-helmet-async";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-base-100">
      <Helmet>
        <title>Login | Streamify</title>
      </Helmet>

      <div className="flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-2xl shadow-lg overflow-hidden border border-base-200">

        {/* LEFT — FORM */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 mb-10 w-fit">
            <div className="p-1.5 bg-primary rounded-lg">
              <ShipWheelIcon className="size-5 text-primary-content" />
            </div>
            <span className="text-lg font-bold tracking-tight text-base-content">Streamify</span>
          </Link>

          {/* ERROR */}
          {error && (
            <div className="alert alert-error mb-6 rounded-lg py-3 text-sm border-none">
              <span>{error?.response?.data?.message || error?.message || "Authentication failed"}</span>
            </div>
          )}

          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-base-content tracking-tight">Welcome back</h2>
              <p className="text-sm text-base-content/50 mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* EMAIL */}
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
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="form-control w-full space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="label py-0 px-0">
                    <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Password
                    </span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockIcon className="size-4 text-base-content/30" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="input input-bordered w-full h-11 pl-10 pr-10 rounded-lg text-sm focus:border-primary transition-colors bg-base-100"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/30 hover:text-base-content/50 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                <Link
                  to="/forget-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full h-11 rounded-lg text-sm font-semibold mt-2 gap-2"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="size-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-base-content/40 pt-1">
                New to the platform?{" "}
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT — VISUAL PANEL */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-blue-600 to-cyan-700 items-center justify-center p-12 relative overflow-hidden">
          <div className="max-w-sm relative z-10 text-center text-white space-y-8">
            <div className="relative aspect-square max-w-[260px] mx-auto">
              <div className="absolute inset-0 bg-white/10 rounded-2xl border border-white/15 transform rotate-3" />
              <img
                src="/i.png"
                alt="Professional Communication"
                className="relative z-10 w-full h-full object-contain drop-shadow-xl"
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight leading-snug">
                Enterprise-Grade <br /> Communication
              </h2>
              <p className="text-white/55 text-sm leading-relaxed">
                Connect with professionals worldwide using secure, high-definition video and messaging.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full border-2 border-white/20 bg-white/10"
                  />
                ))}
              </div>
              <span className="text-xs text-white/40 font-medium">Joined by 10k+ teams</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;