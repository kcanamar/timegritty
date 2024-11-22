/// <reference path="../.astro/types.d.ts" />

type NetlifyLocals = import('@astrojs/netlify').NetlifyLocals

declare namespace App {
  interface Locals extends NetlifyLocals {
      authUser: Record<string>;
  }

  interface authUser {
    id: string;
    email: string;
    name: string;
    hash: string;
    tier: 'vip' | 'free' | 'paid';
  }
}
