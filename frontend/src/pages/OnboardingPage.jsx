import { useState, useRef } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon, UploadIcon, XIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
  });

  const [imageSource, setImageSource] = useState("none"); // "none" | "upload" | "random"
  const [isDragging, setIsDragging] = useState(false);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile set up successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const [profilePicFile, setProfilePicFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(formState).forEach((key) => {
      if (key !== "profilePic") {
        formData.append(key, formState[key]);
      }
    });

    if (profilePicFile) {
      formData.append("profilePic", profilePicFile);
    } else {
      formData.append("profilePic", formState.profilePic);
    }

    onboardingMutation(formData);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState({ ...formState, profilePic: randomAvatar });
    setProfilePicFile(null);
    setImageSource("random");
    toast.success("Random avatar generated!");
  };

  const handleFileChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setProfilePicFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormState({ ...formState, profilePic: e.target.result });
      setImageSource("upload");
      toast.success("Photo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearImage = () => {
    setFormState({ ...formState, profilePic: "" });
    setProfilePicFile(null);
    setImageSource("none");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-base-100 border border-base-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 sm:p-10">

          {/* LOGO */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="p-1.5 bg-primary rounded-lg">
              <ShipWheelIcon className="size-5 text-primary-content" />
            </div>
            <span className="text-lg font-bold tracking-tight text-base-content">Streamify</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-base-content tracking-tight">Complete Your Profile</h1>
            <p className="text-sm text-base-content/50 mt-1">
              Set up your identity for global language exchange
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* AVATAR UPLOAD */}
            <div className="space-y-3 ">
              <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mt-0">
                Profile Photo
              </span>

              <div className="flex flex-col items-center gap-5">

                {/* CIRCLE PREVIEW + UPLOAD TRIGGER */}
                <div className="relative group">
                  <div
                    className={`size-28 rounded-full overflow-hidden ring-2 transition-all duration-200 cursor-pointer bg-base-200 flex items-center justify-center ${isDragging ? "ring-primary ring-offset-2 ring-offset-base-100" : "ring-base-300 hover:ring-primary/50 ring-offset-2 ring-offset-base-100"
                      }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {formState.profilePic ? (
                      <img
                        src={formState.profilePic}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
                      />
                    ) : (
                      <img src="/avatar.png" alt="Avatar" className="w-full h-full object-cover opacity-20" />
                    )}

                    {/* HOVER OVERLAY */}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 pointer-events-none">
                      <UploadIcon className="size-5 text-white" />
                      <span className="text-white text-[10px] font-semibold uppercase tracking-wider">Upload</span>
                    </div>
                  </div>

                  {/* CLEAR BUTTON */}
                  {formState.profilePic && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-0.5 right-0.5 size-6 bg-base-100 border border-base-300 text-base-content/50 rounded-full flex items-center justify-center hover:bg-error hover:text-white hover:border-error transition-all duration-150 shadow-sm"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  )}

                  {/* CAMERA BADGE */}
                  {!formState.profilePic && (
                    <div
                      className="absolute bottom-0.5 right-0.5 size-7 bg-primary rounded-full flex items-center justify-center shadow-md cursor-pointer border-2 border-base-100"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadIcon className="size-3.5 text-primary-content" />
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                </div>

                {/* HELPER TEXT */}
                <div className="text-center space-y-0.5">
                  <p className="text-xs text-base-content/40">
                    Click the photo or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary font-semibold hover:underline"
                    >
                      browse
                    </button>{" "}
                    to upload
                  </p>
                  <p className="text-[11px] text-base-content/25">PNG, JPG, WEBP — max 5MB</p>
                </div>

                {/* DIVIDER */}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-base-200" />
                  <span className="text-xs text-base-content/30 font-medium">or</span>
                  <div className="flex-1 h-px bg-base-200" />
                </div>

                {/* RANDOM AVATAR */}
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-outline btn-sm rounded-lg gap-2 font-medium border-base-300 px-6"
                >
                  <ShuffleIcon className="size-4" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            <div className="grid gap-5">
              {/* FULL NAME */}
              <div className="form-control w-full space-y-1.5">
                <label className="label py-0 px-0">
                  <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="input input-bordered w-full h-11 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors"
                  placeholder="Your full name"
                />
              </div>

              {/* BIO */}
              <div className="form-control w-full space-y-1.5">
                <label className="label py-0 px-0">
                  <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Bio
                  </span>
                </label>
                <textarea
                  name="bio"
                  value={formState.bio}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  className="textarea textarea-bordered h-24 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors resize-none leading-relaxed"
                  placeholder="Share your background and language goals..."
                />
              </div>

              {/* LANGUAGES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control w-full space-y-1.5">
                  <label className="label py-0 px-0">
                    <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Native Language
                    </span>
                  </label>
                  <select
                    name="nativeLanguage"
                    value={formState.nativeLanguage}
                    onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                    className="select select-bordered w-full h-11 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors"
                  >
                    <option value="">Select language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control w-full space-y-1.5">
                  <label className="label py-0 px-0">
                    <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Learning Language
                    </span>
                  </label>
                  <select
                    name="learningLanguage"
                    value={formState.learningLanguage}
                    onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                    className="select select-bordered w-full h-11 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors"
                  >
                    <option value="">Select language</option>
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
                <label className="label py-0 px-0">
                  <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Location
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPinIcon className="size-4 text-base-content/30" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formState.location}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className="input input-bordered w-full h-11 pl-10 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              className="btn btn-primary w-full h-11 rounded-lg text-sm font-semibold gap-2"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <LoaderIcon className="animate-spin size-4" />
                  Saving profile...
                </>
              ) : (
                <>
                  <ShipWheelIcon className="size-4" />
                  Complete Profile
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