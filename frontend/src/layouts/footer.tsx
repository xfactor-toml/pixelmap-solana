import React from 'react';

import type { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Box, Button } from '@mui/material';
import Discord from '../assets/images/discord.png';
import Twitter from '../assets/images/twitter.png';
import styles from '../styles/Layout.module.css';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';
import { useEffect } from 'react';

const Footer: FC = () => {
    const [count, setCount] = useState(0);
    const { tiles } = useAppContext();

    useEffect(() => {
        if(!tiles) return;
        
        let ct = 0;
        for(const tile of tiles) {
            if(tile?.id && tile?.id >= 0) {
                ct++;
            }
        }
        setCount(ct);
    }, [tiles]);

    return (
        <div className={styles.footer}>
            <Box>
                Total Minted: {count}
            </Box>

            <Link href='/about'>
                Terms and Conditions
            </Link>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', minWidth: '100px' }}>
                <a href='https://twitter.com/solwalla' target='_blank' rel='noreferrer'>
                    <Image src={Twitter} alt='twitter' />
                </a>
                <a href='https://discord.gg/qz33qyNpqR' target='_blank' rel='noreferrer'>
                    <Image src={Discord} alt='twitter' />
                </a>
            </Box>
        </div>
    );
};

export default Footer;
