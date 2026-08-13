// "use client";

// import AuthService from "@/lib/services/AuthService";
// import { useUserStore } from "@/stores/user";
// import { AxiosError } from "axios";
// import { redirect } from "next/dist/client/components/navigation";
// import { ReactNode, useEffect, useState } from "react";

// export default function AuthProvider({ children }: { children: ReactNode }) {
//     const [isReady, setIsReady] = useState(false);
//     const { user, userLogged, reset } = useUserStore();

//     useEffect(() => {
//         const initAuth = async () => {
//             if (!user) {
//                 try {
//                     const user = (await AuthService.whois()).data?.user;
//                     console.log("User info fetched successfully:", user);
//                     userLogged({
//                         username: user.username,
//                         language: user.preferredLanguage,
//                         avatar: user.profilePicture,
//                         isPublic: user.isPublic,
//                     });
//                 } catch (err) {
//                     reset();
//                     console.log(
//                         "Error fetching user info:",
//                         (err as AxiosError).message,
//                     );
//                     if ((err as AxiosError).response?.status === 401) {
//                         console.log(
//                             "Unauthorized, redirecting to login page...",
//                         );
//                         redirect("/login");
//                     }
//                     // console.log(err);
//                 } finally {
//                     setIsReady(true);
//                 }
//             }
//         };
//         initAuth();
//     }, [user, userLogged]);
//     if (!isReady) return <div>Waiting for Auth..</div>;
//     return <>{children}</>;
// }
