import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware';

interface Generalinfos {
    username: string;
    language: string;
    avatar: string;
}

interface GeneralInfosState {
    user: Generalinfos | undefined;
    userLogged: (user: Generalinfos) => void;
    userAvatarUpdate: (avatar: string) => void;
    userLanguageUpdate: (language: string) => void;
    reset: () => void;
}

export const useUserStore = create<GeneralInfosState>()(
    persist(
        (set) => (
            {
                user: undefined,
                userLogged: (user) => (set((state) => ({ user: user }))),
                userAvatarUpdate: (avatar) => (set((state) => ({ user: state.user ?  { ...state.user, avatar: avatar } : undefined }))),
                userLanguageUpdate: (language) => (set((state) => ({user: state.user ? {...state.user, language: language} : undefined}))),
                reset: () => set({ user: undefined })
            }), {
        name: 'user-storage',
        storage: createJSONStorage(() => localStorage),
    })
)