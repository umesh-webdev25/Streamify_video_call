import useAuthUser from "../hooks/useAuthUser";
import { useThemeStore } from "../store/useThemeStore";
import { PaletteIcon, GlobeIcon, MonitorIcon, SaveIcon } from "lucide-react";
import { capitalize } from "../lib/utils";
import { LANGUAGES } from "../constants";
import { useState } from "react";
import toast from "react-hot-toast";

const DAISY_THEMES = [
  // LIGHT THEMES
  { name: "streamify-pro", label: "Streamify Pro", type: "light" },
  { name: "light", label: "Light", type: "light" },
  { name: "cupcake", label: "Cupcake", type: "light" },
  { name: "emerald", label: "Emerald", type: "light" },
  { name: "pastel", label: "Pastel", type: "light" },

  // DARK THEMES
  { name: "streamify-dark", label: "Streamify Dark", type: "dark" },
  { name: "dark", label: "Dark", type: "dark" },
  { name: "dracula", label: "Dracula", type: "dark" },
  { name: "night", label: "Night", type: "dark" },
  { name: "luxury", label: "Luxury", type: "dark" },
];
const PreferencesPage = () => {
  const { authUser } = useAuthUser();
  const { theme, setTheme } = useThemeStore();
  const [nativeLanguage, setNativeLanguage] = useState(authUser?.nativeLanguage || "");
  const [learningLanguage, setLearningLanguage] = useState(authUser?.learningLanguage || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Preferences saved");
    setTimeout(() => setSaved(false), 2000);
  };

  const lightThemes = DAISY_THEMES.filter((t) => t.type === "light");
  const darkThemes = DAISY_THEMES.filter((t) => t.type === "dark");

  return (
    <div className="space-y-8">
      {/* THEME SELECTOR */}
      <section className="bg-base-100/80 backdrop-blur-sm border border-base-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5 -mt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <PaletteIcon className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-base-content tracking-tight">
                Theme
              </h3>
              <p className="text-sm text-base-content/40 mt-0.5">
                Choose your visual style
              </p>
            </div>
          </div>
          <div className="badge badge-outline badge-sm text-base-content/40 gap-1.5 py-3">
            <div className="size-2 rounded-full bg-primary" />
            {DAISY_THEMES.find((t) => t.name === theme)?.label || theme}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
              Light Themes
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {lightThemes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                    theme === t.name
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-base-300/50 hover:border-base-300 hover:bg-base-200/50"
                  }`}
                >
                  <div className="flex gap-1 justify-center mb-1.5">
                    <div className="size-3 rounded-full bg-primary" />
                    <div className="size-3 rounded-full bg-secondary" />
                    <div className="size-3 rounded-full bg-accent" />
                  </div>
                  <span className={`text-[10px] font-semibold ${
                    theme === t.name ? "text-primary" : "text-base-content/60"
                  }`}>
                    {t.label}
                  </span>
                  {theme === t.name && (
                    <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
              Dark Themes
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {darkThemes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                    theme === t.name
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-base-300/50 hover:border-base-300 hover:bg-base-200/50"
                  }`}
                >
                  <div className="flex gap-1 justify-center mb-1.5">
                    <div className="size-3 rounded-full bg-primary" />
                    <div className="size-3 rounded-full bg-secondary" />
                    <div className="size-3 rounded-full bg-accent" />
                  </div>
                  <span className={`text-[10px] font-semibold ${
                    theme === t.name ? "text-primary" : "text-base-content/60"
                  }`}>
                    {t.label}
                  </span>
                  {theme === t.name && (
                    <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGE PREFERENCES */}
      <section className="bg-base-100/80 backdrop-blur-sm border border-base-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <GlobeIcon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-base-content tracking-tight">
              Language Preferences
            </h3>
            <p className="text-sm text-base-content/40 mt-0.5">
              Set your language learning goals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Native Language
            </label>
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className="select select-bordered w-full h-12 rounded-xl text-sm bg-base-200/40"
            >
              <option value="">Select language</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Learning Language
            </label>
            <select
              value={learningLanguage}
              onChange={(e) => setLearningLanguage(e.target.value)}
              className="select select-bordered w-full h-12 rounded-xl text-sm bg-base-200/40"
            >
              <option value="">Select language</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* DISPLAY */}
      <section className="bg-base-100/80 backdrop-blur-sm border border-base-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <MonitorIcon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-base-content tracking-tight">
              Display
            </h3>
            <p className="text-sm text-base-content/40 mt-0.5">
              Customize your viewing experience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-base-200/40 border border-base-300/50 cursor-pointer hover:bg-base-200/70 transition-colors">
            <div>
              <p className="text-sm font-semibold text-base-content">Online Status</p>
              <p className="text-xs text-base-content/40 mt-0.5">Show when you're active</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle toggle-primary" />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-base-200/40 border border-base-300/50 cursor-pointer hover:bg-base-200/70 transition-colors">
            <div>
              <p className="text-sm font-semibold text-base-content">Read Receipts</p>
              <p className="text-xs text-base-content/40 mt-0.5">Let others know you've read their messages</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle toggle-primary" />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-base-200/40 border border-base-300/50 cursor-pointer hover:bg-base-200/70 transition-colors">
            <div>
              <p className="text-sm font-semibold text-base-content">Sound Effects</p>
              <p className="text-xs text-base-content/40 mt-0.5">Play sounds for messages and calls</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle toggle-primary" />
          </label>
        </div>
      </section>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn btn-primary rounded-xl px-8 shadow-md hover:shadow-lg transition-all gap-2"
        >
          {saved ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved
            </>
          ) : (
            <>
              <SaveIcon className="size-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PreferencesPage;
