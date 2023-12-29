import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';
import MapToggles from './MapToggles';
import styles from '../styles/components/Map.module.css';
import MapTiles from './MapTiles';

export default function Map(props: any) {
    const [showOwned, setShowOwned] = useState(false);
    const [showForSale, setShowForSale] = useState(false);
    const [showMintable, setShowMintable] = useState(false);

    return (
        <div>
            <Box
                sx={{
                    maxWidth: '1296px',
                    mx: 'auto',
                    px: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <MapToggles
                    showOwned={showOwned}
                    setShowOwned={(value: boolean) => setShowOwned(value)}
                    showForSale={showForSale}
                    setShowForSale={(value: boolean) => setShowForSale(value)}
                    showMintable={showMintable}
                    setShowMintable={(value: boolean) => setShowMintable(value)}
                />
            </Box>
            <Box
                sx={{
                    overflow: 'auto',
                    touchAction: 'manipulation'
                }}
            >
                <MapTiles
                    showOwned={showOwned}
                    showForSale={showForSale}
                    showMintable={showMintable}
                    tiles={props.tiles}
                />
            </Box>
        </div>
    );
}