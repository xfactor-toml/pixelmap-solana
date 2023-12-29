import React, { useEffect } from 'react';
import clsx from 'clsx';

import { MapTile } from '../common/MapTile';

import styles from '../styles/components/Tile.module.scss';

export default function Tile(
    {
        tile,
        showOwned,
        showForSale,
        showMintable,
        showPopover,
    }:
    {
        tile: MapTile,
        showOwned: boolean,
        showForSale: boolean,
        showMintable: boolean,
        showPopover: any
    }
) {
    return (
        <button
            className={clsx(
                styles.tile,
                tile.mintable && showMintable && styles.mintable,
                tile.saleable && showForSale && styles.saleable,
                tile.owned && showOwned && styles.owned,
                tile.nft && styles.noborder
            )}
            onClick={(e) => {
                showPopover(tile.id, e.currentTarget);
            }}
            style={{
                backgroundImage: `url(${tile.url})`,
            }}
        >
            <div className={styles.overlay} />
        </button>
    );
}