import React from 'react';

import type { AppProps } from 'next/app';
import type { FC } from 'react';

import styles from '../styles/Layout.module.css';

import Header from './header';
import Footer from './footer';


const Layout: FC<any> = ({ children }) => {
    return (
        <div>
            <Header />
            <div className={`relative w-full min-h-screen flex flex-col ${styles.body}`}>
                {children}
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
