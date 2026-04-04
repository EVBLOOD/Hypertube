import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from 'next/server';

const i18nMiddleware = createMiddleware({
    locales: ['en', 'ar', 'fr'],
    defaultLocale: 'en',
    localePrefix: 'always'
})



// export default createMiddleware({
//     locales: ['en', 'ar', 'fr'],
//     defaultLocale: 'en',
//     localePrefix: 'always'
// })

export default function middleware(req: NextRequest) {
    console.log(req.nextUrl)
    console.log(req.nextUrl.toString())
    const pathname_direction = req.nextUrl.toString()

    const token = req.cookies.get('token')?.value;

    const isProtectedRoute = pathname_direction.includes('/library') || pathname_direction.includes('/profile');
    const isAuthPage = pathname_direction.includes('/login') || pathname_direction.includes('/register');

    if (isProtectedRoute && !token) {
        const locale = pathname_direction.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    if (isAuthPage && token) {
        const locale = pathname_direction.split('/')[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}/library`, req.url));
    }

    return i18nMiddleware(req)
}

export const config = {
    matcher: ['/', '/(ar|en|fr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};