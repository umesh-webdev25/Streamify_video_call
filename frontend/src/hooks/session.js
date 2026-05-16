import { useQuery } from "@tanstack/react-query";

import { getAllSessions } from "../lib/api";

const useSessions = () => {
  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: getAllSessions,
  });

  return {
    isLoading: sessionsQuery.isLoading,
    sessions: sessionsQuery.data,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,
  };
};

export default useSessions;