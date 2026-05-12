import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6 font-sans">
      <div className="card bg-base-200 w-full max-w-3xl shadow-2xl border border-base-300 rounded-3xl overflow-hidden">
        <div className="card-body p-8 sm:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-base-content">Complete Your Profile</h1>
            <p className="text-base-content/60 mt-2 font-medium">Set up your professional identity for global language exchange</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-6 bg-base-100 p-8 rounded-3xl border border-dashed border-base-300">
              {/* IMAGE PREVIEW */}
              <div className="size-36 rounded-2xl ring-4 ring-primary/10 ring-offset-base-200 ring-offset-4 overflow-hidden shadow-2xl">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-base-300">
                    <ShipWheelIcon className="size-14 text-base-content opacity-30" />
                  </div>
                )}
              </div>

              {/* Generate Random Avatar BTN */}
              <button 
                type="button" 
                onClick={handleRandomAvatar} 
                className="btn btn-primary btn-outline btn-sm rounded-xl font-bold border-2 hover:bg-primary hover:text-white transition-all gap-2"
              >
                <ShuffleIcon className="size-4" />
                Randomize Avatar
              </button>
            </div>

            <div className="grid gap-6">
              {/* FULL NAME */}
              <div className="form-control w-full space-y-1.5">
                <label className="label py-0">
                  <span className="label-text font-bold text-base-content/70">Professional Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="input input-bordered w-full rounded-xl bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Your full name"
                />
              </div>

              {/* BIO */}
              <div className="form-control w-full space-y-1.5">
                <label className="label py-0">
                  <span className="label-text font-bold text-base-content/70">Professional Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formState.bio}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  className="textarea textarea-bordered h-32 rounded-xl bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all font-medium leading-relaxed"
                  placeholder="Share your professional background and language goals..."
                />
              </div>

              {/* LANGUAGES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NATIVE LANGUAGE */}
                <div className="form-control w-full space-y-1.5">
                  <label className="label py-0">
                    <span className="label-text font-bold text-base-content/70">Native Language</span>
                  </label>
                  <select
                    name="nativeLanguage"
                    value={formState.nativeLanguage}
                    onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                    className="select select-bordered w-full rounded-xl bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  >
                    <option value="">Select Language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LEARNING LANGUAGE */}
                <div className="form-control w-full space-y-1.5">
                  <label className="label py-0">
                    <span className="label-text font-bold text-base-content/70">Learning Language</span>
                  </label>
                  <select
                    name="learningLanguage"
                    value={formState.learningLanguage}
                    onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                    className="select select-bordered w-full rounded-xl bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  >
                    <option value="">Select Language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LOCATION */}
              <div className="form-control w-full space-y-1.5">
                <label className="label py-0">
                  <span className="label-text font-bold text-base-content/70">Office Location</span>
                </label>
                <div className="relative group">
                  <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-4 size-5 text-primary/60 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="location"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className="input input-bordered w-full pl-12 rounded-xl bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              className="btn btn-primary w-full h-14 rounded-2xl text-lg font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all mt-6" 
              disabled={isPending} 
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-6 mr-2" />
                  Launch Professional Profile
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-6 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
