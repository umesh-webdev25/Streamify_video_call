import { useSearchParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import {
  CameraIcon,
  SparklesIcon,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { capitalize } from "../lib/utils";
import PreferencesPage from "./PreferencesPage.jsx";
import NotificationSettingsPage from "./NotificationSettingsPage.jsx";
import SecurityPage from "./SecurityPage.jsx";

const SettingsPage = () => {
  const { authUser } = useAuthUser();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

 console.log(authUser.profilePic);

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-10">
      <Helmet>
        <title>Account Settings | Streamify</title>
      </Helmet>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-base-200 ">
        <div>
          <h1 className="text-3xl font-bold text-base-content tracking-tight">
            Settings
          </h1>

          <p className="text-sm text-base-content/50 mt-1">
            Personalize your professional experience
          </p>
        </div>

        <button className="btn btn-primary rounded-xl px-6 shadow-md hover:shadow-lg transition-all">
          Update Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* CONTENT AREA */}
        <main className="flex-1 space-y-6 min-w-0">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* PROFILE CARD */}
              <section className="bg-base-100/80 backdrop-blur-sm border border-base-200 rounded-2xl p-6 sm:p-7 space-y-7 shadow-sm -mt-10">
                {/* Top Profile */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar */}
                  <div className="relative shrink-0 group">
                    <div className="size-24 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-lg bg-base-200">
                      <img
                        src={authUser?.profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-content rounded-xl shadow-lg border-2 border-base-100 hover:scale-105 hover:bg-primary/90 transition-all">
                      <CameraIcon className="size-4" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold tracking-tight text-base-content">
                        {authUser?.fullName}
                      </h2>

                      <p className="text-sm text-base-content/50">
                        {authUser?.email}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-lg">
                        ✨ Verified Member
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                        🌍 Language Learner
                      </span>
                    </div>
                  </div>
                </div>

                {/* FORM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* FULL NAME */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={authUser?.fullName}
                      readOnly
                      className="input input-bordered w-full h-12 rounded-xl text-sm bg-base-200/40 border-base-300 focus:outline-none"
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Email Address
                    </label>

                    <input
                      type="email"
                      value={authUser?.email}
                      readOnly
                      className="input input-bordered w-full h-12 rounded-xl text-sm bg-base-200/40 border-base-300 focus:outline-none"
                    />
                  </div>

                  {/* BIO */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Bio
                    </label>

                    <textarea
                      readOnly
                      className="textarea textarea-bordered w-full rounded-xl text-sm bg-base-200/40 border-base-300 h-28 resize-none focus:outline-none leading-relaxed"
                      value={
                        authUser?.bio ||
                        "No bio set yet. Connect with others to share your professional goals!"
                      }
                    />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-base-content/40">
                    Last updated recently
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="btn btn-ghost rounded-xl flex-1 sm:flex-none">
                      Cancel
                    </button>

                    <button className="btn btn-primary rounded-xl px-6 shadow-md hover:shadow-lg transition-all flex-1 sm:flex-none">
                      Update Profile
                    </button>
                  </div>
                </div>
              </section>

              {/* LANGUAGE SECTION */}
              <section className="bg-base-100/80 backdrop-blur-sm border border-base-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-base-content tracking-tight">
                      Language Journey
                    </h3>

                    <p className="text-sm text-base-content/40 mt-1">
                      Your current language preferences
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-primary/10">
                    <SparklesIcon className="size-5 text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Native */}
                  <div className="flex items-center justify-between p-5 bg-base-200/40 rounded-xl border border-base-300 hover:border-primary/20 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                        Native Language
                      </p>

                      <p className="text-sm font-semibold text-base-content mt-1">
                        {capitalize(
                          authUser?.nativeLanguage || "English"
                        )}
                      </p>
                    </div>

                    <span className="text-2xl">🌍</span>
                  </div>

                  {/* Learning */}
                  <div className="flex items-center justify-between p-5 bg-base-200/40 rounded-xl border border-base-300 hover:border-primary/20 transition-colors">
                    <div>
                      <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                        Learning Language
                      </p>

                      <p className="text-sm font-semibold text-base-content mt-1">
                        {capitalize(
                          authUser?.learningLanguage || "Spanish"
                        )}
                      </p>
                    </div>

                    <span className="text-2xl">🎓</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* PREFERENCES */}
          {activeTab === "preferences" && <PreferencesPage />}

          {/* NOTIFICATION SETTINGS */}
          {activeTab === "notifications" && <NotificationSettingsPage />}

          {/* SECURITY */}
          {activeTab === "security" && <SecurityPage />}

          {/* FALLBACK for unknown tabs */}
          {activeTab !== "profile" && activeTab !== "preferences" && activeTab !== "notifications" && activeTab !== "security" && (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-base-300 rounded-2xl bg-base-100/50 backdrop-blur-sm space-y-4">
              <div className="size-12 bg-base-200 rounded-2xl flex items-center justify-center shadow-sm">
                <SparklesIcon className="size-5 text-base-content/30" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-base-content">
                  Coming Soon
                </h3>
                <p className="text-sm text-base-content/40 max-w-sm mx-auto mt-1 leading-relaxed">
                  We're working hard to bring you more control and
                  customization options for your experience.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;