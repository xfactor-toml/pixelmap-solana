import { Box } from '@mui/system';
import React, { useState, useEffect } from 'react';
import Resizer from '../utils/ImageResizer';
import {
    generateWebSafeImage,
    rgbToHexTriplet,
    dimensionToPixels,
} from '../utils/ImageUtils';
import { tileSize } from '../config';

type Props = {
    image: string;
    cols: number;
    rows: number;
    handleTileSelect: any;
    editedTiles: any[],
    setEditedTiles: any
};

export default function ImageDisplay({
    image,
    cols,
    rows,
    handleTileSelect,
    editedTiles,
    setEditedTiles
}: Props) {
    const [resizedImage, setResizedImage] = useState<any>();
    const [imageColors, setImageColors] = useState<any>([]);
    const [tileCode, setTileCode] = useState<any>([]);

    function processColours(
        canvas: any,
        width: number,
        height: number
    ): Array<string> {
        let colorArray = [];
        let ctx = canvas.getContext('2d');
        if (!ctx) return [''];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let rgb = ctx.getImageData(x, y, 1, 1).data;
                colorArray.push(rgbToHexTriplet(rgb[0], rgb[1], rgb[2]));
            }
        }

        return colorArray;
    }

    useEffect(() => {
        function processTileCode(
            colorArray: Array<string>,
            width: number,
            height: number
        ) {
            let tileArray = new Array(rows * cols).fill([]);

            let pixelRowIndex = 0;
            let rowIndex = 0;

            for (
                let pixelSliceIndex = 0;
                pixelSliceIndex < colorArray.length;
                pixelSliceIndex += width
            ) {
                let pixelSlice = colorArray.slice(
                    pixelSliceIndex,
                    pixelSliceIndex + width
                );

                for (let i = 0; i < cols; i++) {
                    let index = i + rowIndex * cols;
                    let arr = tileArray[index];
                    let slice = pixelSlice.slice(i * tileSize, (i + 1) * tileSize);

                    tileArray[index] = arr.concat(slice);
                }

                pixelRowIndex++;

                if (pixelRowIndex % (height / rows) === 0) {
                    rowIndex++;
                }
            }
            return tileArray;
        }

        if (!image || image === '') return;

        const height = dimensionToPixels(rows);
        const width = dimensionToPixels(cols);

        try {
            Resizer.imageFileResizer(
                image,
                width,
                height,
                'PNG',
                100,
                0,
                (rawCanvas: any) => {
                    let colors = processColours(rawCanvas, width, height);

                    setImageColors(colors);
                    setTileCode(processTileCode(colors, width, height));
                    setResizedImage(rawCanvas.toDataURL(`image/PNG`, 1));
                },
                'base64',
                width,
                height,
                true
            );
        } catch (err) {
            //console.log(err);
        }
    }, [image, cols, rows]);

    useEffect(() => {
        const height = dimensionToPixels(rows);
        const width = dimensionToPixels(cols);

        let websafeImage = generateWebSafeImage(imageColors, width, height);

        setResizedImage(websafeImage);
    }, [cols, imageColors, rows]);

    useEffect(() => {
        if(tileCode.length == 1 && editedTiles.length == 1 && editedTiles[0].id >= 0) {
            setEditedTiles([{
                ...editedTiles[0],
                code: tileCode[0].join('')
            }]);
        }
    }, [tileCode]);

    const gridSelect = () => {
        let gridBoxes = [];

        for (let grid = 0; grid < tileCode.length; grid++) {
            gridBoxes.push(
                <button
                    key={grid}
                    onClick={() => {
                        handleTileSelect(tileCode[grid].join(''), grid);
                    }}
                    className="group border border-opacity-30 border-gray-400 bg-gray-900 bg-opacity-50 opacity-70 hover:opacity-100 transition duration-150"
                    style={{
                        width: `${100 / cols}%`,
                        height: `${100 / rows}%`,
                    }}
                >
                    {
                        editedTiles[grid]?.id >= 0 && (
                            <span className='text-red-500 text-xs text-bold'>#{editedTiles[grid].id}</span>
                        )
                    }
                    {
                        !(editedTiles[grid]?.id >= 0) && (
                                <span className="text-white text-xs">Select</span>
                        )
                    }
                </button>
            );
        }

        return gridBoxes;
    };

    return (
        <div>
            <div className="flex flex-wrap justify-around items-center">
                <div className="relative w-96">
                    <div
                        className="absolute inset-0 z-20 grid-background border-2 border-gray-400"
                        style={{
                            backgroundSize: `${100 / cols}% ${100 / rows}%`,
                        }}
                    ></div>

                    <div className="absolute inset-0 z-30">{gridSelect()}</div>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="block relative w-full h-auto z-10 pixel-image"
                        src={resizedImage}
                        alt="Tile"
                    />
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <p className="text-md text-gray-600 mb-4 font-bold text-center">
                        Actual size
                    </p>
                    <p className="text-md text-gray-600 mb-4 font-bold text-center">
                        {cols} * {rows}
                    </p>
                    <Box
                        sx={{
                            width: 16*cols,
                            height: 16*rows
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className='block mx-auto pixel-image'
                            src={resizedImage}
                            alt="Tile"
                        />
                    </Box>
                    {/* <img
                        className='block w-auto h-auto mx-auto pixel-image'
                        src={resizedImage}
                        alt="Tile"
                    /> */}
                </div>
            </div>
        </div>
    );
}
