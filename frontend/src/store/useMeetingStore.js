import { create } from "zustand";

export const useMeetingStore = create((set) => ({
  activeMeeting: null,
  isMeetingLoading: false,
  meetingError: null,

  setActiveMeeting: (meeting) => set({ activeMeeting: meeting }),
  setMeetingLoading: (isLoading) => set({ isMeetingLoading: isLoading }),
  setMeetingError: (error) => set({ meetingError: error }),
  clearMeetingState: () => set({ activeMeeting: null, meetingError: null, isMeetingLoading: false }),
}));
