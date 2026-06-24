import { create } from "zustand";
import type { InterviewSession, Message, FeedbackReport } from "@/types";

interface SessionState {
  session: InterviewSession | null;
  messages: Message[];
  isLoading: boolean;
  isSpeaking: boolean;
  isRecording: boolean;
  error: string | null;

  setSession: (session: InterviewSession | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setRecording: (recording: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  messages: [],
  isLoading: false,
  isSpeaking: false,
  isRecording: false,
  error: null,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setRecording: (isRecording) => set({ isRecording }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
