import { create } from "zustand";

type UserStore = {
  email: string;
  nickname: string;
  avatarUrl: string;
  isAuthReady: boolean;
  setEmail: (email: string) => void;
  setNickname: (nickname: string) => void;
  setAvatarUrl: (avatarUrl: string) => void;
  setAuthReady: (isAuthReady: boolean) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  email: "",
  nickname: "",
  avatarUrl: "",
  isAuthReady: false,
  setEmail: (email) => set({ email }),
  setNickname: (nickname) => set({ nickname }),
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
  setAuthReady: (isAuthReady) => set({ isAuthReady }),
  clearUser: () => set({ email: "", nickname: "", avatarUrl: "" }),
}));
