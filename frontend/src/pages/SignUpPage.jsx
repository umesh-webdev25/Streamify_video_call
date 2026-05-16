import { useState } from "react";
import { ShipWheelIcon, UserIcon, MailIcon, LockIcon, ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import useSignUp from "../hooks/useSignUp";
import { Helmet } from "react-helmet-async";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { isPending, error, signupMutation } = useSignUp(() => {
    navigate("/verify-otp", { state: { email: signupData.email } });
  });

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-base-100">
      <Helmet>
        <title>Create Account | Streamify</title>
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
              <span>{error?.response?.data?.message || error?.message || "Registration failed"}</span>
            </div>
          )}

          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-base-content tracking-tight">Create your account</h2>
              <p className="text-sm text-base-content/50 mt-1">
                Join the global network of professional learners
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">


              {/* FULL NAME */}
              <div className="form-control w-full space-y-1.5">
                <label className="label py-0 px-0">
                  <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Full Name
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="size-4 text-base-content/30" />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered w-full h-11 pl-10 rounded-lg text-sm focus:border-primary transition-colors bg-base-100"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>

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
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="form-control w-full space-y-1.5">
                <label className="label py-0 px-0">
                  <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LockIcon className="size-4 text-base-content/30" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="input input-bordered w-full h-11 pl-10 pr-10 rounded-lg text-sm focus:border-primary transition-colors bg-base-100"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/30 hover:text-base-content/60 transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </div>

              {/* TERMS */}
              <div className="form-control pt-1">
                <label className="label cursor-pointer justify-start gap-3 p-0">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm rounded border-base-300"
                    required
                  />
                  <span className="text-xs text-base-content/50 leading-relaxed">
                    I agree to the{" "}
                    <span className="text-primary font-medium hover:underline cursor-pointer">Terms</span>{" "}
                    and{" "}
                    <span className="text-primary font-medium hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full h-11 rounded-lg text-sm font-semibold gap-2"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRightIcon className="size-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-base-content/40 pt-1">
                Already a member?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT — VISUAL PANEL */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-blue-600 to-cyan-700 items-center justify-center p-12 relative overflow-hidden">
          <div className="max-w-sm relative z-10 text-center text-white space-y-8">
            <div className="relative aspect-square max-w-[260px] mx-auto">
              <div className="absolute inset-0 bg-white/10 rounded-2xl border border-white/15 transform -rotate-3" />
              <img
                src="/i.png"
                alt="Global Network"
                className="relative z-10 w-full h-full object-contain drop-shadow-xl"
              />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight leading-snug">
                Master Languages <br /> Together
              </h2>
              <p className="text-white/55 text-sm leading-relaxed">
                Connect with thousands of professionals and elevate your global communication skills.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-left">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <UserIcon className="size-4 text-white/70" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Verified Learners
                  </p>
                  <p className="text-sm font-semibold text-white">12,400+ Active Members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;