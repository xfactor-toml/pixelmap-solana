import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import type { NextPage } from 'next';

import { MapTile } from '../common/MapTile';
import Map from '../components/Map';

import styles from '../styles/Home.module.css';
import { useAppContext } from '../context/AppContext';
import { useWallet } from '@solana/wallet-adapter-react';

const Home: NextPage = () => {
    const wallet = useWallet();

    const { tiles } = useAppContext();
    
    return (
        <>
            <Map
                tiles={tiles}
                // setRefresh={setRefresh}
                // tileCardRefresh={tileCardRefresh}
            />
        </>
    );
};

export default Home;
