import React, { useEffect, useState } from 'react';

import { Box } from "@mui/material";
import { MapTile } from "../common/MapTile";
import Tile from './Tile';

import styles from '../styles/components/MapTiles.module.css';
import TilePopover from './TilePopover';

export default function MapTiles(
    {
        tiles,
        showOwned,
        showForSale,
        showMintable
    }:
    {
        tiles: MapTile[],
        showOwned: boolean,
        showForSale: boolean,
        showMintable: boolean
    }
) {
    let [currentTile, setCurrentTile] = useState<MapTile | null>(null);
    let [tileElement, setTileElement] = useState<HTMLButtonElement | null>(null);
    let [currentTileIndex, setCurrentTileIndex] = useState<number>(-1);

    const handleClick = (tileIndex: number, ref: HTMLButtonElement) => {
        setCurrentTileIndex(tileIndex);
        setCurrentTile(tiles[tileIndex]);
        setTileElement(ref);
    };

    useEffect(() => {
        if(currentTileIndex < 0) return;
        setCurrentTile(tiles[currentTileIndex]);
    }, [tiles]);
    
    return (
        <>
            <div className={styles.mapTiles}>
                {
                    tiles.map((tile: MapTile, id: number) => 
                        <Tile
                            key={id}
                            tile={tile}
                            showOwned={showOwned}
                            showForSale={showForSale}
                            showMintable={showMintable}
                            showPopover={handleClick}
                        />
                    )
                }
            </div>

            {
                currentTile && (
                    <TilePopover
                        tile={currentTile}
                        referenceElement={tileElement}
                    />
                )
            }
        </>
    );
}