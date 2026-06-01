import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon, UploadIcon, XIcon, CameraIcon } from "lucide-react";
import { LANGUAGES } from "../constants";
import { getImageUrl } from "../lib/utils";
import ProfileImage from "../components/ProfileImage.jsx";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
      navigate("/");
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
    <div className="bg-base-100 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl bg-base-100 border border-base-200 rounded-2xl shadow-lg overflow-hidden">

        <div className="p-5 sm:p-6">

          {/* LOGO */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-1.5 bg-primary rounded-lg">
              <ShipWheelIcon className="size-5 text-primary-content" />
            </div>

            <span className="text-lg font-bold tracking-tight text-base-content">
              MeetFlow
            </span>
          </div>

          {/* HEADER */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-base-content tracking-tight">
              Complete Your Profile
            </h1>

            <p className="text-sm text-base-content/50 mt-1">
              Set up your identity for global language exchange
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* AVATAR UPLOAD */}
            <div className="space-y-3">

              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-[0.15em]">
                  Profile Photo
                </span>

                <span className="text-[10px] text-base-content/35">
                  JPG, PNG · Max 5MB
                </span>
              </div>

              {/* AVATAR CARD */}
              <div className="relative flex flex-col items-center">

                {/* AVATAR */}
                {/* AVATAR */}
                <div className="relative">

                  {/* IMAGE CONTAINER */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
      relative size-24 rounded-3xl overflow-hidden
      bg-base-200 cursor-pointer
      border border-base-300/60
      shadow-lg
      transition-all duration-200
      isolate
      ${isDragging
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-primary/40"
                      }
    `}
                  >
                    {/* IMAGE */}
                    <ProfileImage
                      src={formState.profilePic}
                      alt="Profile"
                      className={`w-full h-full object-cover ${!formState.profilePic && 'opacity-30'}`}
                      iconClassName="opacity-30"
                    />

                    {/* STATIC OVERLAY */}
                    <div
                      className="
        absolute inset-0
        bg-black/0 hover:bg-black/45
        transition-colors duration-200
        flex flex-col items-center justify-center
      "
                    >
                      {/* ICON */}
                      <div
                        className="
          size-10 rounded-2xl
          bg-white/0 hover:bg-white/15
          flex items-center justify-center
          transition-all duration-200
        "
                      >
                        <UploadIcon className="size-5 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
                      </div>

                      {/* TEXT */}
                      <p
                        className="
          mt-2 text-[11px]
          font-semibold text-white uppercase tracking-wider
          opacity-0 hover:opacity-100
          transition-opacity duration-200
        "
                      >
                        Upload
                      </p>
                    </div>
                  </div>

                  {/* CAMERA BUTTON */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="
      absolute bottom-1 right-1
      size-8 rounded-xl
      bg-primary text-primary-content
      flex items-center justify-center
      shadow-md
      border-2 border-base-100
      transition-colors duration-200
      hover:bg-primary/90
      z-10
    "
                  >
                    <CameraIcon className="size-4" />
                  </button>

                  {/* REMOVE BUTTON */}
                  {formState.profilePic && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="
        absolute top-1 right-1
        size-7 rounded-lg
        bg-error text-white
        flex items-center justify-center
        shadow-md
        transition-colors duration-200
        hover:bg-error/90
        z-10
      "
                    >
                      <XIcon className="size-4" />
                    </button>
                  )}

                  {/* INPUT */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                </div>

                {/* HELP TEXT */}
                <div className="mt-4 text-center space-y-1">
                  <p className="text-xs text-base-content/55">
                    Drag & drop or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary font-semibold hover:underline"
                    >
                      browse files
                    </button>
                  </p>

                  <p className="text-[11px] text-base-content/35">
                    Recommended size 400×400px
                  </p>
                </div>

              </div>
            </div>

            {/* FORM */}
            <div className="grid gap-4">

              {/* FULL NAME */}
              <div className="form-control w-full space-y-1">
                <label className="label py-0 px-0">
                  <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Full Name
                  </span>
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      fullName: e.target.value,
                    })
                  }
                  className="input input-bordered w-full h-10 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors"
                  placeholder="Your full name"
                />
              </div>

              {/* BIO */}
              <div className="form-control w-full space-y-1">
                <label className="label py-0 px-0">
                  <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Bio
                  </span>
                </label>

                <textarea
                  name="bio"
                  value={formState.bio}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      bio: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered h-20 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors resize-none leading-relaxed"
                  placeholder="Share your background and language goals..."
                />
              </div>

              {/* LANGUAGES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="form-control w-full space-y-1">
                  <label className="label py-0 px-0">
                    <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Native Language
                    </span>
                  </label>

                  <select
                    name="nativeLanguage"
                    value={formState.nativeLanguage}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        nativeLanguage: e.target.value,
                      })
                    }
                    className="select select-bordered w-full h-10 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors"
                  >
                    <option value="">Select language</option>

                    {LANGUAGES.map((lang) => (
                      <option
                        key={`native-${lang}`}
                        value={lang.toLowerCase()}
                      >
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control w-full space-y-1">
                  <label className="label py-0 px-0">
                    <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Learning Language
                    </span>
                  </label>

                  <select
                    name="learningLanguage"
                    value={formState.learningLanguage}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        learningLanguage: e.target.value,
                      })
                    }
                    className="select select-bordered w-full h-10 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors"
                  >
                    <option value="">Select language</option>

                    {LANGUAGES.map((lang) => (
                      <option
                        key={`learning-${lang}`}
                        value={lang.toLowerCase()}
                      >
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LOCATION */}
              <div className="form-control w-full space-y-1">
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
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        location: e.target.value,
                      })
                    }
                    className="input input-bordered w-full h-10 pl-10 rounded-lg text-sm bg-base-100 focus:border-primary transition-colors"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              className="btn btn-primary w-full h-10 rounded-lg text-sm font-semibold gap-2"
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