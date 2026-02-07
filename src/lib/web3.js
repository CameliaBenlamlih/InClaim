import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient } from '@tanstack/react-query';
import { http } from 'viem';

export const coston2 = {
  id: 114,
  name: 'Coston2',
  nativeCurrency: {
    decimals: 18,
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
  },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
  testnet: true,
};

const projectId = '0ab3f2c9a30c1add3cff35eadf12cfc7';

const chains = [coston2];

export const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  transports: {
    [coston2.id]: http('https://coston2-api.flare.network/ext/C/rpc'),
  },
});

export const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  networks: chains,
  projectId,
  metadata: {
    name: 'InClaim',
    description: 'File in a flash, get your cash',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://inclaim.app',
    icons: [typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '']
  },
  features: {
    analytics: false,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#ef4444',
    '--w3m-border-radius-master': '12px',
  }
});

export const config = wagmiAdapter.wagmiConfig;
