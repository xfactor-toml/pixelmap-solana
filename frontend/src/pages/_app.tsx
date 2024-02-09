import {  WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    SolletExtensionWalletAdapter,
    SlopeWalletAdapter,
    SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { AppProps } from 'next/app';
import type { FC } from 'react';
import React, { useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import { isDev } from '../config';
import { AppWrapper } from '../context/AppContext';

import Layout from '../layouts';

import 'react-toastify/dist/ReactToastify.css';
// Use require instead of import since order matters
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = isDev ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint
    const endpoint = useMemo(() => 
        isDev 
            ? process.env.NEXT_PUBLIC_DEVNET_RPC!
            : process.env.NEXT_PUBLIC_MAINNET_RPC!
        , [isDev]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter(),
            new SolletExtensionWalletAdapter(),
            new SlopeWalletAdapter()
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <AppWrapper>
                        <Layout>
                            <Component {...pageProps} />
                            <ToastContainer
                                position="top-right"
                                autoClose={5000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnHover
                                theme="colored"
                            />
                        </Layout>
                    </AppWrapper>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default App;
