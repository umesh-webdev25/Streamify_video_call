import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data.data;
}

// Meeting API
export async function createMeeting(data) {
  const response = await axiosInstance.post("/meetings/create", data);
  return response.data.data;
}

export async function getMeeting(roomId) {
  const response = await axiosInstance.get(`/meetings/${roomId}`);
  return response.data.data;
}

export async function joinMeeting(data) {
  const response = await axiosInstance.post("/meetings/join", data);
  return response.data.data;
}

export async function endMeeting(roomId) {
  const response = await axiosInstance.delete(`/meetings/${roomId}/end`);
  return response.data.data;
}

export async function getMeetingToken() {
  const response = await axiosInstance.get("/meetings/token");
  return response.data.data;
}


// Session API

export async function getAllSessions() {
  const response = await axiosInstance.get("/sessions");
  return response.data.data;
}

export async function getMySessions() {
  const response = await axiosInstance.get("/sessions/me");
  return response.data.data;
}

export async function getSessionById(sessionId) {
  const response = await axiosInstance.get(
    `/sessions/${sessionId}`
  );

  return response.data.data;
}

export async function deleteSession(sessionId) {
  const response = await axiosInstance.delete(
    `/sessions/${sessionId}`
  );

  return response.data;
}

export async function deleteAllMySessions() {
  const response = await axiosInstance.delete(
    "/sessions/me/all"
  );

  return response.data;
}

export async function invalidateSession(sessionId) {
  const response = await axiosInstance.put(
    `/sessions/${sessionId}/invalidate`
  );

  return response.data.data;
}