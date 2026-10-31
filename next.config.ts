import type { NextConfig } from "next";
import { buildCsp } from "./src/lib/csp";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Audited src/ and public/: audio output only, no capture, location,
        // payment, USB or Topics APIs. This does not restrict audio playback.
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'X-Frame-Options', value: 'DENY' },
        // Turnstile uses an iframe, not opener/popup communication; the site has
        // no popup auth flow. COOP does not prevent cross-origin iframe loading.
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Content-Security-Policy', value: buildCsp(process.env.NODE_ENV) },
      ],
    }];
  },
};

export default nextConfig;
