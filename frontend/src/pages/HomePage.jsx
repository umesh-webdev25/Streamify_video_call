import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  SparklesIcon,
  GlobeIcon,
} from "lucide-react";
import { capitalize, cn } from "../lib/utils";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import Skeleton from "../components/ui/Skeleton";
import { Helmet } from "react-helmet-async";

const HomePage = () => {
  const queryClient = useQueryClient();

  const { data: friendsRaw = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  const friends = Array.isArray(friendsRaw)
    ? friendsRaw
    : friendsRaw?.friends || [];

  const { data: recommendedUsersRaw = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });
  const recommendedUsers = Array.isArray(recommendedUsersRaw)
    ? recommendedUsersRaw
    : recommendedUsersRaw?.users || [];

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  const outgoingRequestsIds = useMemo(() => {
    const ids = new Set();
    const reqs = Array.isArray(outgoingFriendReqs)
      ? outgoingFriendReqs
      : outgoingFriendReqs?.requests || [];
    reqs.forEach((req) => ids.add(req.recipient?._id));
    return ids;
  }, [outgoingFriendReqs]);

  return (
    <div className="p-6 sm:p-8 max-w-8xl mx-auto space-y-10">
      <Helmet>
        <title>Dashboard | Streamify</title>
      </Helmet>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-base-200">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">
            Your Network
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Manage and connect with your language partners
          </p>
        </div>
        <Link
          to="/friends"
          className="btn btn-primary btn-sm gap-2 rounded-lg self-start sm:self-auto"
        >
          <UsersIcon className="size-4" />
          View All Friends
        </Link>
      </div>

      {/* FRIENDS SECTION */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest">
          Current Connections
        </h2>

        {loadingFriends ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-base-200 rounded-xl p-4 space-y-3 border border-base-300"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
      </section>

      {/* RECOMMENDED SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest">
              Meet New Learners
            </h2>
            <p className="text-sm text-base-content/50 mt-0.5">
              Handpicked partners for your language goals
            </p>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
            <SparklesIcon className="size-3.5" />
            AI Suggested
          </span>
        </div>

        {loadingUsers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-base-200 rounded-xl p-5 space-y-4 border border-base-300"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="size-14 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : recommendedUsers.length === 0 ? (
          <div className="border border-dashed border-base-300 rounded-xl p-12 text-center space-y-3">
            <div className="size-12 bg-base-200 rounded-full flex items-center justify-center mx-auto">
              <GlobeIcon className="size-6 text-base-content/30" />
            </div>
            <h3 className="font-semibold text-base-content">
              No suggestions right now
            </h3>
            <p className="text-sm text-base-content/50 max-w-sm mx-auto">
              Check back later for new language partners tailored to your
              profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedUsers.map((user) => {
              const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
              return (
                <div
                  key={user._id}
                  className="bg-base-100 border border-base-200 rounded-xl p-5 space-y-4 hover:border-base-300 hover:shadow-sm transition-all duration-200"
                >
                  {/* User Header */}
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-lg overflow-hidden ring-1 ring-base-300 shrink-0">
                      <img
                        src={user.profilePic}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base-content truncate leading-tight">
                        {user.fullName}
                      </h3>
                      {user.location && (
                        <div className="flex items-center gap-1 text-xs text-base-content/40 mt-0.5">
                          <MapPinIcon className="size-3 shrink-0" />
                          <span className="truncate">{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-base-200 text-base-content/60 px-2.5 py-1 rounded-md">
                      {getLanguageFlag(user.nativeLanguage)}
                      {capitalize(user.nativeLanguage)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                      {getLanguageFlag(user.learningLanguage)}
                      {capitalize(user.learningLanguage)}
                    </span>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-base-content/50 leading-relaxed line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Action */}
                  <button
                    className={cn(
                      "btn btn-sm w-full rounded-lg gap-2 font-medium border-none",
                      hasRequestBeenSent
                        ? "bg-base-200 text-base-content/40 cursor-not-allowed"
                        : "btn-primary"
                    )}
                    onClick={() => sendRequestMutation(user._id)}
                    disabled={hasRequestBeenSent || isPending}
                  >
                    {hasRequestBeenSent ? (
                      <>
                        <CheckCircleIcon className="size-4" />
                        Request Sent
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="size-4" />
                        Connect
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;