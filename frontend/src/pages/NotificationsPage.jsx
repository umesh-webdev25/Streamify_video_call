import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading, isError, error } = useQuery({
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
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen">
      <div className="container mx-auto max-w-4xl space-y-10">
        <div className="flex items-center justify-between border-b border-base-300 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-base-content">Notifications</h1>
            <p className="text-base-content/60 mt-1 font-medium">Stay updated with your professional network</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl">
            <BellIcon className="size-6 text-primary" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : isError ? (
          <div className="alert alert-error rounded-2xl border-none shadow-md">
            <span className="font-semibold">{error?.response?.data?.message || error?.message || "Failed to load notifications"}</span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-primary pl-4 py-1">
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    Pending Requests
                    <span className="badge badge-primary badge-md ml-2 font-bold px-3">{incomingRequests.length}</span>
                  </h2>
                </div>

                <div className="grid gap-4">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 border border-base-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                      <div className="card-body p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="avatar size-16">
                                <div className="rounded-2xl ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all shadow-sm">
                                  <img src={request.sender?.profilePic} alt={request.sender?.fullName} />
                                </div>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{request.sender?.fullName}</h3>
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                <span className="badge badge-primary badge-sm font-semibold py-2.5 px-3">
                                  {request.sender?.nativeLanguage}
                                </span>
                                <span className="badge badge-ghost border-base-300 badge-sm font-semibold py-2.5 px-3">
                                  {request.sender?.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-md rounded-xl font-bold tracking-wide shadow-md hover:shadow-primary/20 transition-all px-8 active:scale-95"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQS NOTIFICATONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-6">
                 <div className="flex items-center gap-3 border-l-4 border-success pl-4 py-1">
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    Recent Connections
                  </h2>
                </div>

                <div className="grid gap-4">
                  {acceptedRequests.map((notification) => (
                    <div key={notification._id} className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className="card-body p-5">
                        <div className="flex items-center gap-4">
                          <div className="avatar size-12">
                            <div className="rounded-xl ring-1 ring-base-300 group-hover:ring-success/30 transition-all">
                              <img src={notification.recipient?.profilePic} alt={notification.recipient?.fullName} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-base-content">{notification.recipient?.fullName}</h3>
                            <p className="text-sm text-base-content/60 font-medium mt-0.5">
                              Accepted your friend request and is ready to connect.
                            </p>
                            <p className="text-[11px] font-bold flex items-center text-base-content/40 uppercase tracking-widest mt-2">
                              <ClockIcon className="size-3 mr-1.5" />
                              Just now
                            </p>
                          </div>
                          <div className="badge badge-success badge-md font-bold px-4 py-3 gap-2">
                            <MessageSquareIcon className="size-4" />
                            Connected
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <div className="py-20">
                <NoNotificationsFound />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
