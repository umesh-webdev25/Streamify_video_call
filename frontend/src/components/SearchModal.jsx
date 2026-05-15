import { useState, useEffect, useRef } from "react";
import { SearchIcon, XIcon, UserIcon, MessageSquareIcon, VideoIcon, CommandIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { useNavigate } from "react-router-dom";

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { data: friendsRaw = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: isOpen,
  });
  const friends = Array.isArray(friendsRaw)
    ? friendsRaw
    : friendsRaw?.friends || [];

  const filteredFriends = friends.filter(
    (friend) =>
      friend.fullName.toLowerCase().includes(query.toLowerCase()) ||
      friend.nativeLanguage.toLowerCase().includes(query.toLowerCase()) ||
      friend.learningLanguage.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery("");
  };

  const quickCommands = [
    { icon: UserIcon, label: "View Profile", path: "/settings" },
    { icon: CommandIcon, label: "Manage Connections", path: "/friends" },
    { icon: SearchIcon, label: "Find New Partners", path: "/" },
  ];

  const displayedFriends = query.length > 0 ? filteredFriends : friends.slice(0, 5);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="w-full max-w-xl bg-base-100 rounded-2xl border border-base-200 shadow-xl overflow-hidden relative z-10">

        {/* SEARCH INPUT */}
        <div className="flex items-center gap-3 px-4 h-14 w-100 border-b border-base-200">
          <SearchIcon className="size-4 text-base-content/30 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search friends, languages..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-base-content placeholder:text-base-content/30"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="kbd kbd-xs bg-base-200 border-base-300 text-base-content/40">ESC</kbd>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-base-content"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* RESULTS */}
        <div className="max-h-[55vh] overflow-y-auto">
          {query.length > 0 && filteredFriends.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="size-10 bg-base-200 rounded-full flex items-center justify-center mx-auto">
                <SearchIcon className="size-5 text-base-content/20" />
              </div>
              <p className="text-sm text-base-content/40">
                No results for <span className="font-medium text-base-content/60">"{query}"</span>
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-4">

              {/* FRIENDS */}
              {displayedFriends.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-semibold text-base-content/40 uppercase tracking-wider">
                    Friends
                  </p>
                  <div className="space-y-0.5">
                    {displayedFriends.map((friend) => (
                      <div
                        key={friend._id}
                        onClick={() => handleSelect(`/chat/${friend._id}`)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg overflow-hidden ring-1 ring-base-300 shrink-0">
                            <img
                              src={friend.profilePic}
                              alt={friend.fullName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-base-content leading-tight">
                              {friend.fullName}
                            </p>
                            <p className="text-xs text-base-content/40 mt-0.5">
                              {friend.nativeLanguage} → {friend.learningLanguage}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageSquareIcon className="size-3.5 text-base-content/40" />
                          <VideoIcon className="size-3.5 text-base-content/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUICK COMMANDS */}
              {!query && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-semibold text-base-content/40 uppercase tracking-wider">
                    Quick Actions
                  </p>
                  <div className="space-y-0.5">
                    {quickCommands.map((cmd, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect(cmd.path)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group"
                      >
                        <div className="size-7 bg-base-200 group-hover:bg-base-300 rounded-lg flex items-center justify-center transition-colors shrink-0">
                          <cmd.icon className="size-3.5 text-base-content/50" />
                        </div>
                        <p className="text-sm font-medium text-base-content">{cmd.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 py-2.5 border-t border-base-200 flex items-center justify-between bg-base-200/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <kbd className="kbd kbd-xs bg-base-100 border-base-300">↑↓</kbd>
              <span className="text-[10px] text-base-content/30 font-medium">Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="kbd kbd-xs bg-base-100 border-base-300">↵</kbd>
              <span className="text-[10px] text-base-content/30 font-medium">Select</span>
            </div>
          </div>
          <span className="text-[10px] text-base-content/30 font-medium">Streamify Search</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;