import { useMeetingStore } from "../store/useMeetingStore";
import {
  createGroupMeeting,
  joinGroupMeetingWithCode,
  endGroupMeetingWithCode,
  shareMeetingToGroup,
  getMeetingByCode
} from "../lib/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useMeeting = () => {
  const { setMeetingLoading, setMeetingError, setActiveMeeting } = useMeetingStore();
  const navigate = useNavigate();

  const handleCreateGroupMeeting = async (groupId) => {
    setMeetingLoading(true);
    setMeetingError(null);
    try {
      const data = await createGroupMeeting(groupId);
      setActiveMeeting(data);
      // Wait to share to group immediately
      await shareMeetingToGroup(data.meetingCode, groupId);
      navigate(`/meeting/lobby?code=${data.meetingCode}`);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to create group meeting";
      setMeetingError(msg);
      toast.error(msg);
      throw error;
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingCode) => {
    setMeetingLoading(true);
    setMeetingError(null);
    try {
      const data = await joinGroupMeetingWithCode(meetingCode);
      setActiveMeeting(data);
      navigate(`/meeting/room/${data.roomId}`);
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to join meeting";
      setMeetingError(msg);
      toast.error(msg);
      throw error;
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleEndMeeting = async (meetingCode) => {
    setMeetingLoading(true);
    try {
      await endGroupMeetingWithCode(meetingCode);
      setActiveMeeting(null);
      toast.success("Meeting ended");
    } catch (error) {
      toast.error("Failed to end meeting");
    } finally {
      setMeetingLoading(false);
    }
  };

  const fetchMeetingDetails = async (meetingCode) => {
    try {
      return await getMeetingByCode(meetingCode);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    handleCreateGroupMeeting,
    handleJoinMeeting,
    handleEndMeeting,
    fetchMeetingDetails
  };
};
