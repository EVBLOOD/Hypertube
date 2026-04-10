import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from 'next/server';
import AuthService from "./lib/services/AuthService";
import { useUserStore } from "./stores/user";

const i18nMiddleware = createMiddleware({
    locales: ['en', 'ar', 'fr'],
    defaultLocale: 'en',
    localePrefix: 'always'
})

export default async function middleware(req: NextRequest) {

    const pathname_direction = req.nextUrl.toString()
     

    const token = req.cookies.get('AUTH_TOKEN')?.value;
    console.log(req.cookies)

    if (token) {
        try {
            const user = (await AuthService.whois()).data
            useUserStore.getState().userLogged({ username: user.username, language: user.preferredLanguage, avatar: user.profilePicture })
        } catch (err) {
            console.log(err)
        }
    }

    // const isProtectedRoute = pathname_direction.includes('/library') || pathname_direction.includes('/profile');
    const isProtectedRoute = pathname_direction.includes('/profile');
    const isAuthPage = pathname_direction.includes('/login') || pathname_direction.includes('/register');

    if (isProtectedRoute && !(useUserStore.getState().user)) {
        const locale = pathname_direction.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    if (isAuthPage && useUserStore.getState().user) {
        const locale = pathname_direction.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/library`, req.url));
    }

    return i18nMiddleware(req)
}

export const config = {
    matcher: ['/', '/(ar|en|fr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};