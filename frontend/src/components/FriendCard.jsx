import { Link } from "react-router";
import { MessageSquareIcon, VideoIcon, MapPinIcon } from "lucide-react";
import { capitalize } from "../lib/utils";
import { motion } from "framer-motion";
import { LANGUAGE_TO_FLAG } from "../constants";

export const getLanguageFlag = (language) => {
  if (!language) return null;
  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/w40/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="size-4 rounded-sm object-cover"
      />
    );
  }
  return "🌐";
};

const FriendCard = ({ friend }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card bg-base-200 border border-base-300 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
    >
      <div className="card-body p-6 space-y-5">
        <div className="flex items-center gap-5">
          <div className="avatar">
            <div className="w-16 rounded-2xl ring-2 ring-primary/10 ring-offset-base-100 ring-offset-2 group-hover:ring-primary/30 transition-all duration-300 shadow-lg shadow-black/5">
              <img src={friend.profilePic} alt={friend.fullName} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-xl tracking-tight truncate group-hover:text-primary transition-colors">
              {friend.fullName}
            </h3>
            <div className="flex items-center text-[10px] font-black text-base-content/40 mt-1 uppercase tracking-widest">
              <MapPinIcon className="size-3 mr-1 text-primary/60" />
              {friend.location || "Global Learner"}
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-wrap gap-2">
          <div className="badge bg-base-300/50 text-[11px] font-bold py-3.5 px-3 border-none gap-1.5 shadow-sm">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="text-base-content/70">{capitalize(friend.nativeLanguage)}</span>
          </div>
          <div className="badge bg-primary/10 text-primary text-[11px] font-bold py-3.5 px-3 border-none gap-1.5 shadow-sm">
            {getLanguageFlag(friend.learningLanguage)}
            <span>{capitalize(friend.learningLanguage)}</span>
          </div>
        </div>

        {friend.bio && (
          <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2 italic min-h-[2.5rem]">
            "{friend.bio}"
          </p>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            to={`/chat/${friend._id}`}
            className="btn btn-ghost bg-base-300/30 hover:bg-primary hover:text-white rounded-xl gap-2 font-bold transition-all shadow-sm group/btn"
          >
            <MessageSquareIcon className="size-4 group-hover/btn:scale-110 transition-transform" />
            <span>Chat</span>
          </Link>
          <Link
            to={`/call/${friend._id}`}
            className="btn btn-primary rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group/btn"
          >
            <VideoIcon className="size-4 group-hover/btn:scale-110 transition-transform" />
            <span>Call</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FriendCard;
