import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { HydrateStores } from "@/components/hydrate-stores";
import { AdSenseLoader } from "@/components/ads/adsense-loader";
import { ConsentBanner } from "@/components/ads/consent-banner";
import { ADS_CONFIG } from "@/lib/ads-config";
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
        content:
          "Un quiz per capire che film ti va stasera. 20 domande, 50, oppure 10 turni sui film che hai già visto.",
      },
      { name: "theme-color", content: "#2a1030" },
      { name: "google-adsense-account", content: ADS_CONFIG.client },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
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
