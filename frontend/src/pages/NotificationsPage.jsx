import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, CheckCircleIcon, UserPlusIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { capitalize } from "../lib/utils";
import { getLanguageFlag } from "../components/FriendCard";
import { Helmet } from "react-helmet-async";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const {
    data: friendRequests,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-10">
      <Helmet>
        <title>Notifications | Streamify</title>
      </Helmet>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-base-200">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Stay updated with your professional network
          </p>
        </div>
        <BellIcon className="size-5 text-base-content/30 self-start sm:self-auto" />
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <span className="loading loading-spinner loading-md text-primary" />
          <p className="text-xs font-medium text-base-content/40 uppercase tracking-widest">
            Loading notifications...
          </p>
        </div>
      ) : isError ? (
        <div className="alert alert-error rounded-lg py-3 text-sm border-none">
          <span>
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to load notifications"}
          </span>
        </div>
      ) : (
        <div className="space-y-10">

          {/* INCOMING REQUESTS */}
          {incomingRequests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest flex items-center gap-2">
                Pending Requests
                <span className="badge badge-primary badge-sm font-semibold rounded-full">
                  {incomingRequests.length}
                </span>
              </h2>

              <div className="space-y-3">
                {incomingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-base-100 border border-base-200 rounded-xl p-4 hover:border-base-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-lg overflow-hidden ring-1 ring-base-300 shrink-0">
                          <img
                            src={request.sender?.profilePic}
                            alt={request.sender?.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base-content truncate leading-tight">
                            {request.sender?.fullName}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-base-200 text-base-content/60 px-2 py-0.5 rounded-md">
                              {getLanguageFlag(request.sender?.nativeLanguage)}
                              {capitalize(request.sender?.nativeLanguage)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                              {getLanguageFlag(request.sender?.learningLanguage)}
                              {capitalize(request.sender?.learningLanguage)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary btn-sm rounded-lg gap-2 font-medium self-start sm:self-auto shrink-0"
                        onClick={() => acceptRequestMutation(request._id)}
                        disabled={isPending}
                      >
                        <UserPlusIcon className="size-4" />
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ACCEPTED REQUESTS */}
          {acceptedRequests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest">
                Recent Connections
              </h2>

              <div className="space-y-3">
                {acceptedRequests.map((notification) => (
                  <div
                    key={notification._id}
                    className="bg-base-100 border border-base-200 rounded-xl p-4 hover:border-base-300 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-lg overflow-hidden ring-1 ring-base-300 shrink-0">
                        <img
                          src={notification.recipient?.profilePic}
                          alt={notification.recipient?.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base-content leading-tight truncate">
                          {notification.recipient?.fullName}
                        </h3>
                        <p className="text-sm text-base-content/50 mt-0.5">
                          Accepted your friend request and is ready to connect.
                        </p>
                        <div className="flex items-center gap-1 text-xs text-base-content/30 mt-1.5">
                          <ClockIcon className="size-3" />
                          Just now
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-md border border-success/20 shrink-0">
                        <CheckCircleIcon className="size-3.5" />
                        Connected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EMPTY STATE */}
          {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
            <NoNotificationsFound />
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;