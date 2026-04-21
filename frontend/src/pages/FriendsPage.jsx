import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["myFriends"],
    queryFn: getUserFriends,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <div className="p-6">Error loading friends.</div>;

  if (!data || data.length === 0) return (
    <div className="p-6">
      <NoFriendsFound />
    </div>
  );

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((friend) => (
        <FriendCard key={friend._id} friend={friend} />
      ))}
    </div>
  );
};

export default FriendsPage;
