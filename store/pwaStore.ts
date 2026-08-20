import { create } from "zustand";
import { PWA_INSTALL_SEEN_KEY } from "@/components/pwa/constants";

type PwaStore = {
  hydrated: boolean;
  installSeen: boolean;
  hydrate: () => void;
  markSeen: () => void;
  clearSeen: () => void;
};

export const usePwaStore = create<PwaStore>((set) => ({
  hydrated: false,
  installSeen: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    set({
      hydrated: true,
      installSeen: localStorage.getItem(PWA_INSTALL_SEEN_KEY) === "1",
    });
  },

  markSeen: () => {
    localStorage.setItem(PWA_INSTALL_SEEN_KEY, "1");
    set({ installSeen: true });
  },

  clearSeen: () => {
    localStorage.removeItem(PWA_INSTALL_SEEN_KEY);
    set({ installSeen: false });
  },
}));
