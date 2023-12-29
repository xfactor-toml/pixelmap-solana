import React from 'react';

import type { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Box, Button } from '@mui/material';
import Discord from '../assets/images/discord.png';
import Twitter from '../assets/images/twitter.png';
import styles from '../styles/Layout.module.css';

const Footer: FC = () => {
    return (
        <div className={styles.footer}>
            <Box>
                Total Minted: 1538
            </Box>

            <Link href='/about'>
                Terms and Conditions
            </Link>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', minWidth: '100px' }}>
                <a href='/tw' target='_blank'>
                    <Image src={Twitter} alt='twitter' />
                </a>
                <a href='/tw' target='_blank'>
                    <Image src={Discord} alt='twitter' />
                </a>
            </Box>
        </div>
    );
};

export default Footer;
