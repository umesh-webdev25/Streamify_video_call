import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-base-200 p-6 rounded-2xl border border-base-300 shadow-sm">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-base-content">Your Network</h2>
            <p className="text-base-content/60 mt-1 font-medium">Manage and connect with your professional contacts</p>
          </div>
          <Link to="/notifications" className="btn btn-primary btn-md rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 px-6">
            <UsersIcon className="mr-2 size-5" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section className="space-y-8">
          <div className="border-l-4 border-primary pl-6 py-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-base-content">Meet New Learners</h2>
            <p className="text-base-content/60 mt-1 font-medium">
              Perfect matches for your professional language exchange
            </p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-10 text-center border border-dashed border-base-300 rounded-2xl">
              <h3 className="font-bold text-xl mb-2">No suggestions right now</h3>
              <p className="text-base-content/60 max-w-md mx-auto">
                Check back later for new professional language partners tailored to your profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 border border-base-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="card-body p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="avatar size-16">
                          <div className="rounded-2xl ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all duration-300 shadow-sm">
                            <img src={user.profilePic} alt={user.fullName} />
                          </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-bold text-xl truncate group-hover:text-primary transition-colors">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs font-semibold text-base-content/50 mt-1 uppercase tracking-wider">
                              <MapPinIcon className="size-3 mr-1.5 text-primary/70" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-primary badge-sm py-3 px-3 font-semibold">
                          {getLanguageFlag(user.nativeLanguage)}
                          {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-ghost border-base-300 badge-sm py-3 px-3 font-semibold">
                          {getLanguageFlag(user.learningLanguage)}
                          {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                          {user.bio}
                        </p>
                      )}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-2 rounded-xl font-bold tracking-wide transition-all shadow-sm active:scale-95 ${
                          hasRequestBeenSent ? "btn-disabled bg-base-300 border-none" : "btn-primary hover:shadow-md"
                        } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-5 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-5 mr-2" />
                            Connect
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
