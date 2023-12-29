import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { Box } from '@mui/material';

import { MapTile } from '../common/MapTile';

import styles from '../styles/components/MyTile.module.scss';
import { decompressTileCode } from '../utils/ImageUtils';

export default function CanvasTile(
    {
        tile,
        image,
        selected,
        setCurrentTile,
    }:
    {
        tile: any,
        image: any,
        selected: Boolean,
        setCurrentTile: any
    }
) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if(!image) return;
        
        const draw = (ctx: any) => {
            // console.log('image', image);
            let hex = decompressTileCode(image);
            // console.log('hex', hex);

            if (hex.length != 768) {
                return;
            }

            hex = hex.match(/.{1,3}/g);

            let index = 0;

            for (let y = 0; y < 16; y++) {
                for (let x = 0; x < 16; x++) {
                    ctx.fillStyle = `#${hex[index]}`;
                    ctx.fillRect(x, y, 1, 1);
                    index++;
                }
            }
        };

        const canvas: any = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });

        context.clearRect(0, 0, canvas.width, canvas.height);
        //Our draw come here
        draw(context);
    }, [image]);
    
    return (
        <div
            className={`flex flex-col items-center p-2 cursor-pointer ${selected ? 'border border-red-300' : ''}`}
            onClick={() => {
                setCurrentTile(tile);
            }}
        >
            {
                image ? (
                    <canvas
                        ref={canvasRef}
                        className={`border bg-gray-200 img-pixel `}
                        width={16}
                        height={16}
                    />
                ) : (
                    <div
                        className='w-4 h-4 bg-no-repeat bg-cover'
                        style={{
                            backgroundImage: tile?.url ? `url(${tile.url})` : '',
                        }}
                    />
                )
            }
            {
                tile?.id >= 0 && (
                    <span>Solwalla #{tile?.id}</span>
                )
            }
        </div>
    );
}