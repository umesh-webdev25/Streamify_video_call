import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 border border-base-300 hover:shadow-lg transition-all duration-300 group">
      <div className="card-body p-5">
        {/* USER INFO */}
        <div className="flex items-center gap-4 mb-4">
          <div className="avatar size-14">
            <div className="rounded-xl ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all duration-300">
              <img src={friend.profilePic} alt={friend.fullName} />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
              {friend.fullName}
            </h3>
            <p className="text-xs text-base-content/50 font-medium">SaaS User</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="badge badge-primary badge-sm py-2.5 font-medium">
            {getLanguageFlag(friend.nativeLanguage)}
            {friend.nativeLanguage}
          </span>
          <span className="badge badge-ghost border-base-300 badge-sm py-2.5 font-medium">
            {getLanguageFlag(friend.learningLanguage)}
            {friend.learningLanguage}
          </span>
        </div>

        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-primary btn-sm rounded-lg w-full font-semibold tracking-wide shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          Send Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
