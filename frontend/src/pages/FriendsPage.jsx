import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { UsersIcon } from "lucide-react";
import Skeleton from "../components/ui/Skeleton";
import { Helmet } from "react-helmet-async";

const FriendsPage = () => {
  const {
    data: friendsRaw = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myFriends"],
    queryFn: getUserFriends,
  });
  const friends = Array.isArray(friendsRaw)
    ? friendsRaw
    : friendsRaw?.friends || [];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-10">
      <Helmet>
        <title>My Connections | Streamify</title>
      </Helmet>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-base-200">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">
            My Connections
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Your global network of professional language partners
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-base-content/50 self-start sm:self-auto">
          <UsersIcon className="size-4" />
          {!isLoading && !isError && (
            <span>{friends.length} {friends.length === 1 ? "connection" : "connections"}</span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
              <Skeleton className="h-14 w-full rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="alert alert-error rounded-lg py-3 text-sm border-none">
          <p>{error?.message || "Failed to load connections"}</p>
        </div>
      ) : friends.length === 0 ? (
        <NoFriendsFound />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {friends.map((friend) => (
            <FriendCard key={friend._id} friend={friend} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;