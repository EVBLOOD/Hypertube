import createMiddleware from "next-intl/middleware";

console.log("Middleware is running!")
export default createMiddleware({
    locales: ['en', 'ar', 'fr'],
    defaultLocale: 'en',
    localePrefix: 'always'
})

export const config = {
  matcher: ['/', '/(ar|en|fr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};