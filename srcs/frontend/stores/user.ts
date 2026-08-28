import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserStoreState } from "@/types/app";

export const useUserStore = create<UserStoreState>()(
    persist(
        (set) => ({
            user: undefined,
            userLogged: (user) => set(() => ({ user: user })),
            userAvatarUpdate: (avatar) =>
                set((state) => ({
                    user: state.user
                        ? { ...state.user, avatar: avatar }
                        : undefined,
                })),
            userLanguageUpdate: (language) =>
                set((state) => ({
                    user: state.user
                        ? { ...state.user, language: language }
                        : undefined,
                })),
            reset: () => {
                console.log("Resetting user state");
                set({ user: undefined });
            },
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
