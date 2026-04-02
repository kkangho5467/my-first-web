import { create } from "zustand";

type UserStore = {
  email: string;
  nickname: string;
  avatarUrl: string;
  setEmail: (email: string) => void;
  setNickname: (nickname: string) => void;
  setAvatarUrl: (avatarUrl: string) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  email: "",
  nickname: "",
  avatarUrl: "",
  setEmail: (email) => set({ email }),
  setNickname: (nickname) => set({ nickname }),
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
  clearUser: () => set({ email: "", nickname: "", avatarUrl: "" }),
}));
