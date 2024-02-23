import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import { Dialog } from '@headlessui/react';
import {
    Switch,
    Button,
    IconButton
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import { MapTile } from '../common/MapTile';

import styles from '../styles/components/EditorModal.module.css';
import ImageUpload from './ImageUpload';
import GridSelect from './GridSelect';
import ImageDisplay from './ImageDisplay';
import MyTile from './MyTile';
import CanvasTile from './CanvasTile';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export default function EditorModal(
    {
        open,
        hidden,
        handleClose,
        handleUpdate,
        setHidden,
        img,
        setImg,
        col,
        row,
        setGrid,
        editedTiles,
        setEditedTiles,
        setCurrentTileIndex,
        setCode
    }:
    {
        open: any,
        hidden: any,
        handleClose: any,
        handleUpdate: any,
        setHidden: any,
        img: string,
        setImg: any,
        col: number,
        row: number,
        setGrid: any,
        editedTiles: any[],
        setEditedTiles: any,
        setCurrentTileIndex: any,
        setCode: any
    }
) {
    const [currentTile, setCurrentTile] = useState<any>({ id: -1 });
    const [allName, setAllName] = useState('');
    const [allLink, setAllLink] = useState('');
    const [allDescription, setAllDescription] = useState('');
    const handleImageChange = (src: any) => {
        setImg(src);
    };

    const handleGridSelect = (col: number, row: number) => {
        setEditedTiles([]);
        setGrid({
            col: col,
            row: row,
        });
    };

    const handleTileSelect = (code: string, index: number) => {
        setCurrentTileIndex(index);
        setCode(code);
        setHidden(true);
    };

    const handleNameChange = (name: string) => {
        const index = currentTile.id ;

        const edited = editedTiles.map((item) => {
            if(
                (item.id == index && index >= 0) ||
                (item.id >= 0 && index < 0)
            ) {
                return {
                    ...item,
                    name: name
                };
            } else {
                return item;
            }
        });

        setEditedTiles(edited);
    };

    const handleLinkChange = (link: string) => {
        const index = currentTile.id ;

        const edited = editedTiles.map((item) => {
            if(
                (item.id == index && index >= 0) ||
                (item.id >= 0 && index < 0)
            ) {
                return {
                    ...item,
                    link: link
                };
            } else {
                return item;
            }
        });

        setEditedTiles(edited);
    };

    const handleDescriptionChange = (description: string) => {
        const index = currentTile.id ;

        const edited = editedTiles.map((item) => {
            if(
                (item.id == index && index >= 0) ||
                (item.id >= 0 && index < 0)
            ) {
                return {
                    ...item,
                    description: description
                };
            } else {
                return item;
            }
        });

        setEditedTiles(edited);
    };

    useEffect(() => {
        const tileArray = editedTiles.filter((item) => {
            if(item.id == currentTile?.id && item.id >= 0) {
                return true;
            } else {
                return false;
            }
        });

        if(tileArray.length) {
            setCurrentTile(tileArray[0]);
        } else {
            setCurrentTile({ id: -1 })
        }

    }, [editedTiles]);

    return (
        <Dialog
            as="div"
            className={`fixed inset-0 z-10 overflow-y-auto ${hidden ? 'hidden' : ''}`}
            open={open}
            onClose={() => {}}
        >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-60" />

            <div className="min-h-screen px-4 text-center">
                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                    className="hidden lg:inline-block lg:h-screen lg:align-middle"
                    aria-hidden="true"
                >
                    &#8203;
                </span>

                <div className="relative border-2 rounded-2xl border-gray-600 bg-white inline-block w-full max-w-4xl p-6 sm:p-8 my-8 overflow-hidden text-left align-middle transition-all transform">
                    <Dialog.Title
                        as="h3"
                        className="title text-2xl mb-4 audiowide"
                    >
                        Solwalla Editor
                    </Dialog.Title>
                    <button className='absolute right-0 top-0'>
                        
                    </button>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleClose}
                        color="inherit"
                        className='!absolute right-1 top-1'
                    >
                        <HighlightOffIcon sx={{ color: 'black' }} />
                    </IconButton>
                    <div className="mt-2">
                        <div className="lg:flex lg:space-between space-y-4 lg:space-y-0 lg:space-x-6 relative">
                            <ImageUpload changeImage={handleImageChange} />
                            <GridSelect
                                changeGrid={handleGridSelect}
                                col={col}
                                row={row}
                            />
                        </div>
                    </div>

                    <div className="my-12">
                        <ImageDisplay
                            image={img}
                            cols={col}
                            rows={row}
                            handleTileSelect={handleTileSelect}
                            editedTiles={editedTiles}
                            setEditedTiles={setEditedTiles}
                        />
                    </div>

                    <div className='flex flex-wrap justify-center'>
                        {
                            editedTiles.map((tile, index) => {
                                if(tile.id >= 0) {
                                    return (
                                        <CanvasTile
                                            selected={tile.id == currentTile?.id}
                                            key={index}
                                            tile={tile}
                                            image={tile.code}
                                            setCurrentTile={setCurrentTile}
                                        />
                                    );
                                }
                            })
                        }
                    </div>

                    <div className="flex flex-wrap justify-start space-x-12 mt-4">
                        <div className="flex flex-col">
                            <div className="mb-3">
                                <div className="flex items-center justify-center w-full mb-2">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={currentTile.id < 0}
                                            onChange={() => {
                                                if(currentTile.id >= 0) {
                                                    setCurrentTile({ id: -1 })
                                                }
                                            }}
                                        />
                                    }
                                    label="Apply for all selected Solwalla"
                                />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="mt-1 border-2 p-2"
                                    value={currentTile?.id >= 0 ? currentTile?.name : allName}
                                    onChange={(e) => {
                                        handleNameChange(e.target.value);
                                        setAllName(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="mb-3">
                                <label
                                    htmlFor="link"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Link
                                </label>
                                <input
                                    type="text"
                                    name="link"
                                    id="link"
                                    className="mt-1 border-2 p-2"
                                    value={currentTile?.id >= 0 ? currentTile?.link : allLink}
                                    onChange={(e) => {
                                        handleLinkChange(e.target.value);
                                        setAllLink(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="mb-3">
                                <label
                                    htmlFor="link"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="link"
                                    id="link"
                                    className="mt-1 border-2 p-2"
                                    value={currentTile?.id >= 0 ? currentTile?.description : allDescription}
                                    onChange={(e) => {

                                        handleDescriptionChange(e.target.value);
                                        setAllDescription(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button
                            type="button"
                            className="border-2 border-red-600 p-2 px-4 bg-blue-800 hover:bg-blue-600 text-white"
                            onClick={handleUpdate}
                        >
                            SAVE
                        </Button>
                        <Button
                            type="button"
                            className="ml-2 border-2 border-gray-600 p-2 px-4 bg-gray-600 hover:bg-gray-400 text-white"
                            onClick={handleClose}
                        >
                            CANCEL
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}