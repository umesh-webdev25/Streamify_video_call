import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { UserIcon, CameraIcon, GlobeIcon, BellIcon, ShieldIcon, LogOutIcon, SparklesIcon } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { capitalize } from "../lib/utils";
import useLogout from "../hooks/useLogout";

const SettingsPage = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "preferences", label: "Preferences", icon: GlobeIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "security", label: "Security", icon: ShieldIcon },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-10">
      <Helmet>
        <title>Account Settings | Streamify</title>
      </Helmet>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-base-200">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Settings</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Personalize your professional experience
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* SIDEBAR TABS */}
        <aside className="w-full lg:w-56 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/50 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <tab.icon className="size-4 shrink-0" />
              {tab.label}
            </button>
          ))}

          <div className="h-px bg-base-200 my-3" />

          <button
            onClick={() => logoutMutation()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors duration-150"
          >
            <LogOutIcon className="size-4 shrink-0" />
            Sign Out
          </button>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 space-y-6 min-w-0">
          {activeTab === "profile" && (
            <div className="space-y-6">

              {/* PROFILE CARD */}
              <section className="bg-base-100 border border-base-200 rounded-xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="size-20 rounded-xl overflow-hidden ring-1 ring-base-300 shadow-sm">
                      <img
                        src={authUser?.profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-primary text-primary-content rounded-lg shadow-md border-2 border-base-100 hover:bg-primary/90 transition-colors">
                      <CameraIcon className="size-3.5" />
                    </button>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h2 className="text-lg font-bold text-base-content tracking-tight">
                      {authUser?.fullName}
                    </h2>
                    <p className="text-sm text-base-content/40">{authUser?.email}</p>
                    <span className="inline-flex items-center text-xs font-medium text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-md mt-1">
                      Verified Member
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={authUser?.fullName}
                      readOnly
                      className="input input-bordered w-full h-11 rounded-lg text-sm bg-base-200/50 border-base-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={authUser?.email}
                      readOnly
                      className="input input-bordered w-full h-11 rounded-lg text-sm bg-base-200/50 border-base-300"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                      Bio
                    </label>
                    <textarea
                      readOnly
                      className="textarea textarea-bordered w-full rounded-lg text-sm bg-base-200/50 border-base-300 h-24 resize-none"
                      value={
                        authUser?.bio ||
                        "No bio set yet. Connect with others to share your professional goals!"
                      }
                    />
                  </div>
                </div>
              </section>

              {/* LANGUAGE SECTION */}
              <section className="bg-base-100 border border-base-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-base-content tracking-tight">
                  Language Journey
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg border border-base-300">
                    <div>
                      <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                        Native Language
                      </p>
                      <p className="text-sm font-semibold text-base-content mt-1">
                        {capitalize(authUser?.nativeLanguage || "English")}
                      </p>
                    </div>
                    <span className="text-xl">🌍</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg border border-base-300">
                    <div>
                      <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                        Learning Language
                      </p>
                      <p className="text-sm font-semibold text-base-content mt-1">
                        {capitalize(authUser?.learningLanguage || "Spanish")}
                      </p>
                    </div>
                    <span className="text-xl">🎓</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab !== "profile" && (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-base-300 rounded-xl space-y-3">
              <div className="size-10 bg-base-200 rounded-full flex items-center justify-center">
                <SparklesIcon className="size-5 text-base-content/30" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-semibold text-base-content">Coming Soon</h3>
                <p className="text-sm text-base-content/40 max-w-xs mx-auto mt-1">
                  We're working hard to bring you more control over your experience.
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