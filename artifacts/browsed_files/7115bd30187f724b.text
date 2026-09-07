import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { HydrateStores } from "@/components/hydrate-stores";
import { AdSenseLoader } from "@/components/ads/adsense-loader";
import { ConsentBanner } from "@/components/ads/consent-banner";
import appCss from "../styles.css?url";

const APP_NAME = "Platea";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "Questionario di 100 domande. Un film sulle piattaforme che hai.",
      },
      { name: "theme-color", content: "#2a1030" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "google-adsense-account", content: "ca-pub-2155258791610247" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
    scripts: [
      {
        children: `window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});window.gtag('set','ads_data_redaction',true);window.gtag('set','url_passthrough',false);`,
      },
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2155258791610247",
        async: true,
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: () => (
    <html lang="it" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg font-sans">
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
        >
          Vai al contenuto
        </a>
        <PreviewHostBridge />
        <HydrateStores />
        <AuthProvider>
          <Outlet />
          <AdSenseLoader />
          <ConsentBanner />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
