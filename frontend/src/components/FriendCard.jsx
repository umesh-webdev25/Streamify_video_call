import { Link } from "react-router";
import {
  MessageSquareIcon,
  VideoIcon,
  MapPinIcon,
} from "lucide-react";
import { capitalize } from "../lib/utils";
import { LANGUAGE_TO_FLAG } from "../constants";
import { memo } from "react";

const LanguageBadge = ({ language, type, flagUrl }) => {
  const [bg, text] = type === "native"
    ? ["bg-gray-100 text-gray-600", "text-gray-500"]
    : ["bg-blue-50 text-blue-600", "text-blue-500"];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg ${bg} px-2.5 py-1.5`}>
      {flagUrl}
      <div className="flex flex-col leading-tight">
        <span className={`text-[9px] uppercase tracking-wider font-medium ${text}`}>
          {type === "native" ? "Native" : "Learning"}
        </span>
        <span className="text-xs font-semibold">
          {capitalize(language)}
        </span>
      </div>
    </div>
  );
};

export const getLanguageFlag = (language) => {
  if (!language) return <span className="text-sm">🌐</span>;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/w20/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="size-4 rounded-full object-cover"
        loading="lazy"
      />
    );
  }

  return <span className="text-sm">🌐</span>;
};

const FriendCard = memo(({ friend }) => {
  const {
    _id,
    fullName,
    profilePic,
    nativeLanguage,
    learningLanguage,
    location,
    bio,
    isOnline = false,
  } = friend;

  const handleAvatarError = (e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff&size=80`;
  };

  const nativeFlag = getLanguageFlag(nativeLanguage);
  const learningFlag = getLanguageFlag(learningLanguage);

  return (
    <div className="border border-gray-200 rounded-2xl bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="size-16 sm:size-20 rounded-xl overflow-hidden ring-2 ring-gray-100">
              <img
                src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff&size=80`}
                alt={fullName}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={handleAvatarError}
              />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-300"}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {fullName || "Anonymous"}
                </h3>
                {location && (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                    <MapPinIcon className="size-3 shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}
              </div>
              <span className={`shrink-0 text-[10px] font-medium px-2 py-1 rounded-md ${
                isOnline ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
              }`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {nativeLanguage && (
                <LanguageBadge language={nativeLanguage} type="native" flagUrl={nativeFlag} />
              )}
              {learningLanguage && (
                <LanguageBadge language={learningLanguage} type="learning" flagUrl={learningFlag} />
              )}
            </div>
          </div>
        </div>

        {bio && (
          <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 italic">
              &ldquo;{bio}&rdquo;
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link
            to={`/chat/${_id}`}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <MessageSquareIcon className="size-4" />
            Message
          </Link>
          <Link
            to={`/call/${_id}`}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200"
          >
            <VideoIcon className="size-4" />
            Call
          </Link>
        </div>
      </div>
    </div>
  );
});

FriendCard.displayName = "FriendCard";

export default FriendCard;
