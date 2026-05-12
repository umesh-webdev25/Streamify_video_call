import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";

import useSignUp from "../hooks/useSignUp";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // This is how we did it at first, without using our custom hook
  // const queryClient = useQueryClient();
  // const {
  //   mutate: signupMutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: signup,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  // This is how we did it using our custom hook - optimized version
  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-100 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-200 rounded-3xl shadow-2xl overflow-hidden border border-base-300">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          {/* LOGO */}
          <div className="mb-8 flex items-center justify-start gap-3 group">
            <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <ShipWheelIcon className="size-8 text-primary" />
            </div>
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 tracking-tight">
              Streamify
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-6 rounded-xl shadow-sm border-none">
              <span className="font-semibold text-sm">{error.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-base-content">Get Started</h2>
                  <p className="text-base-content/60 mt-2 font-medium">
                    Create your professional language exchange profile
                  </p>
                </div>

                <div className="space-y-4">
                  {/* FULLNAME */}
                  <div className="form-control w-full space-y-1.5">
                    <label className="label py-0">
                      <span className="label-text font-bold text-base-content/70">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-base-100"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  {/* EMAIL */}
                  <div className="form-control w-full space-y-1.5">
                    <label className="label py-0">
                      <span className="label-text font-bold text-base-content/70">Work Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-base-100"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full space-y-1.5">
                    <label className="label py-0">
                      <span className="label-text font-bold text-base-content/70">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-base-100"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input type="checkbox" className="checkbox checkbox-primary rounded-md" required />
                      <span className="text-xs font-medium text-base-content/60 leading-tight">
                        I agree to the{" "}
                        <span className="text-primary font-bold hover:underline">Terms of Service</span> and{" "}
                        <span className="text-primary font-bold hover:underline">Privacy Policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  className="btn btn-primary w-full rounded-xl h-12 text-base font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all mt-4"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Onboarding...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm font-medium text-base-content/60">
                    Already have a professional account?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-primary/5 via-blue-100/30 to-primary/10 items-center justify-center p-12 border-l border-base-300">
          <div className="max-w-md">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto drop-shadow-2xl">
              <img src="/i.png" alt="SaaS Onboarding" className="w-full h-full object-contain" />
            </div>

            <div className="text-center space-y-4 mt-12">
              <h2 className="text-2xl font-extrabold text-base-content tracking-tight">Join the Global Network</h2>
              <p className="text-base-content/60 font-medium leading-relaxed">
                Connect with thousands of professional language learners and elevate your communication skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
