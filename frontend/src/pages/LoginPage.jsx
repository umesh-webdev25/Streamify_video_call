import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // This is how we did it at first, without using our custom hook
  // const queryClient = useQueryClient();
  // const {
  //   mutate: loginMutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: login,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  // This is how we did it using our custom hook - optimized version
  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-100 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-200 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-base-300">

        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">

          {/* LOGO */}
          <div className="mb-10 flex items-center justify-start gap-3 group">
            <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-all duration-300 shadow-sm">
              <ShipWheelIcon className="size-8 text-primary" />
            </div>

            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 tracking-tight">
              Streamify
            </span>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="alert alert-error mb-6 rounded-2xl shadow-sm border-none">
              <span className="font-semibold text-sm">
                {error.response.data.message}
              </span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-8">

                {/* HEADING */}
                <div>
                  <h2 className="text-4xl font-extrabold tracking-tight text-base-content">
                    Welcome Back
                  </h2>

                  <p className="text-base-content/60 mt-3 font-medium leading-relaxed">
                    Sign in to your professional communication platform
                  </p>
                </div>

                {/* FORM */}
                <div className="flex flex-col gap-5">

                  {/* EMAIL */}
                  <div className="form-control w-full space-y-2">
                    <label className="label py-0">
                      <span className="label-text font-bold text-base-content/70">
                        Email Address
                      </span>
                    </label>

                    <input
                      type="email"
                      placeholder="name@company.com"
                      className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-base-100"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          email: e.target.value,
                        })
                      }
                      require
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="form-control w-full space-y-2">
                    <label className="label py-0">
                      <span className="label-text font-bold text-base-content/70">
                        Password
                      </span>
                    </label>

                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-base-100"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to="/forget-password"
                      className="text-primary font-bold hover:underline transition-colors text-sm"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  {/* BUTTON */}
                  <button
                    type="submit"
                    className="btn btn-primary h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all mt-4"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Authenticating...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                   
                  {/* FOOTER */}
                  <div className="text-center mt-6">
                    <p className="text-sm font-medium text-base-content/60">
                      New to Streamify?{" "}
                      <Link
                        to="/signup"
                        className="text-primary font-bold hover:underline transition-colors"
                      >
                        Create Account
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-primary/5 via-blue-100/30 to-primary/10 items-center justify-center p-12 border-l border-base-300 relative overflow-hidden">

          {/* BACKGROUND GLOW */}
          <div className="absolute w-72 h-72 bg-primary/10 rounded-full blur-3xl top-10 right-10"></div>

          <div className="max-w-md relative z-10">

            {/* IMAGE */}
            <div className="relative aspect-square max-w-sm mx-auto drop-shadow-2xl">
              <img
                src="/i.png"
                alt="Professional Communication"
                className="w-full h-full object-contain"
              />
            </div>

            {/* TEXT */}
            <div className="text-center space-y-4 mt-12">
              <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                Enterprise Grade Communication
              </h2>

              <p className="text-base-content/60 font-medium leading-relaxed text-lg">
                Connect with professionals worldwide using secure messaging and
                high-quality video communication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
