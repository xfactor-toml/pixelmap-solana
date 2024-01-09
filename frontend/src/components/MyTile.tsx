import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import { Box } from '@mui/material';

import { MapTile } from '../common/MapTile';

import styles from '../styles/components/MyTile.module.scss';

export default function MyTile(
    {
        tile,
        selectTile,
        src
    }:
    {
        tile: any,
        selectTile?: any,
        src?: any
    }
) {

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                m: 1
            }}
        >
            <button
                className={clsx(
                    styles.tile,
                )}
                onClick={(e) => {
                    selectTile();
                }}
            >
                { /*eslint-disable-next-line @next/next/no-img-element*/ }
                <img src={tile.image} alt='' />
                <div className={styles.overlay} />
            </button>
            {
                tile?.id >= 0 && (
                    <span>Solwalla #{tile?.id}</span>
                )
            }
        </Box>
    );
}