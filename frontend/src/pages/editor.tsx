import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';


import { useAppContext } from '../context/AppContext';
import { useWallet } from '@solana/wallet-adapter-react';
import Head from 'next/head';
import { MapTile } from '../common/MapTile';

import styles from '../styles/Editor.module.css';
import MyTile from '../components/MyTile';
import { Box, Button } from '@mui/material';
import EditorModal from '../components/EditorModal';
import { codeToBase64, getMetadata, SystemProgram, TOKEN_METADATA_PROGRAM_ID, uploadImage, uploadMetadata } from '../common/utils';
import { toast } from 'react-toastify';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

const Editor: NextPage = () => {
    const wallet = useWallet();
    const { findPda, tiles, program, solwallaPda } = useAppContext();

    const [ownedTiles, setOwnedTiles] = useState<MapTile[]>([]);
    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [img, setImg] = useState('');
    const [{ col, row }, setGrid] = useState({
        col: 1,
        row: 1,
    });
    const [editedTiles, setEditedTiles] = useState<any[]>([]);
    const [currentTileIndex, setCurrentTileIndex] = useState(0);
    const [code, setCode] = useState('');
    
    useEffect(() => {
        if(updating) return;

        setDefaultEditedTiles();
    }, [row, col]);

    const setDefaultEditedTiles = () => {
        const tilesForEdit = [];

        for(let i = 0; i < row; i ++) {
            for(let j = 0; j < col; j ++) {
                tilesForEdit.push({
                    id: -1,
                });
            }
        }

        setEditedTiles(tilesForEdit);
    };

    useEffect(() => {
        if(updating) return;

        let owned = tiles.filter((tile: MapTile) => {
            return tile.owned;
        });

        setOwnedTiles([...owned]);
    }, [tiles]);

    const handleUpdate = async () => {
        console.log(updating, wallet.publicKey);
        if(updating || !wallet.publicKey) return;
        console.log(editedTiles);
        
        setUpdating(true);

        for(const tile of editedTiles) {
            const tileId = tile?.id!;

            if(tileId >= 0) {
                let toastId = toast.loading(`Solwalla #${tile.id} Updating...`);

                try {
                    let imgUri = '';
                    if(tile?.code) {
                        const imgBase64 = codeToBase64(tile.code);
                        const imgCid = await uploadImage(imgBase64);

                        if(!imgCid.length) {
                            throw "Image Uploading Failed";
                        }

                        imgUri = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}${imgCid}`;
                    } else {
                        imgUri = tile.url
                    }

                    const metadataCid = await uploadMetadata(imgUri, tile);

                    if(!metadataCid.length) {
                        throw "Image Uploading Failed";
                    }

                    const metadataUri = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}${metadataCid}`;

                    console.log(imgUri, metadataUri);

                    const tilePda = findPda([
                        Buffer.from(tileId.toString()),
                    ]);
                    const mint = new PublicKey(tile.nft);

                    const mintATA = getAssociatedTokenAddressSync(
                        mint,
                        wallet.publicKey
                    );

                    const [lockPda, lockBump] = PublicKey.findProgramAddressSync(
                        [
                            Buffer.from(process.env.NEXT_PUBLIC_SECRET_KEY!),
                            mint.toBuffer()
                        ],
                        program.programId,
                    );

                    const metadataAddress = await getMetadata(mint);

                    const tx = await program.methods.updateTile(
                        tileId,
                        `Solwalla #${tileId}`,
                        tile.name!,
                        metadataUri,
                        imgUri,
                        tile.link!,
                        tile.description!
                    )
                        .accounts({
                            tile: tilePda,
                            lockAccount: lockPda,
                            mint: mint,
                            mintAccount: mintATA,
                            solwallaInfo: solwallaPda,
                            tokenProgram: TOKEN_PROGRAM_ID,
                            metadata: metadataAddress,
                            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                            systemProgram: SystemProgram.programId,
                        })
                        .rpc();

                    toast.update(toastId, {
                        render: `Solwalla #${tile.id} Updated Successfully`,
                        type: 'success',
                        isLoading: false,
                        autoClose: 5000,
                        closeOnClick: true
                    });
                } catch(error) {
                    console.log(error);

                    toast.update(toastId, {
                        render: `Solwalla #${tile.id} Updating Failed`,
                        type: 'error',
                        isLoading: false,
                        autoClose: 5000,
                        closeOnClick: true
                    });
                }
            
            }
        }

        setUpdating(false);

        setTimeout(() => {
            window.location.reload();
        }, 5000)
    };
    
    return (
        <>
            <Head>
                <title>Editor | Solwalla</title>
            </Head>
            <div className={styles.wrap}>
                <div className={styles.body}>
                    <div className={styles.tiles}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 4,
                                mt: 2
                            }}
                        >
                            <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-white audiowide">Your #Solwalla</h1>
                            {
                                hidden ? (
                                    <span className='audiowide text-lg text-white'>👇 Select Your Tile</span>
                                ) : (
                                    <Button
                                        sx={{
                                            background: '#435B88 !important',
                                            borderRadius: '5px',
                                            height: '40px',
                                            color: 'white',
                                            px: 4
                                        }}
                                        onClick={() => {
                                            if(!wallet.publicKey) {
                                                toast.warn('Please connect wallet!', {
                                                    position: "top-right",
                                                    autoClose: 5000,
                                                    hideProgressBar: false,
                                                    closeOnClick: true,
                                                    pauseOnHover: true,
                                                    draggable: true,
                                                    progress: undefined,
                                                    theme: "colored",
                                                });
                                                return;
                                            }
                                            if(updating) return;

                                            setDefaultEditedTiles();
                                            setGrid({
                                                col: 1,
                                                row: 1,
                                            });
                                            setImg('');
                                            setOpen(true);
                                        }}
                                    >
                                        Open Editor
                                    </Button>
                                )
                            }
                        </Box>
                        <div className={styles.list}>
                            {
                                ownedTiles.map((tile, index) => 
                                    <MyTile
                                        key={index}
                                        tile={tile}
                                        selectTile={() => {
                                            if(updating) return;

                                            if(hidden) {
                                                const edited = editedTiles.map((item) => {
                                                    if(item.id == tile.id) {
                                                        return { id: -1 };
                                                    } else {
                                                        return item;
                                                    }
                                                });

                                                edited[currentTileIndex] = {
                                                    ...tile,
                                                    code: code
                                                };
                                                setEditedTiles(edited);
                                                setHidden(false);
                                                setOpen(true);
                                            } else {
                                                setDefaultEditedTiles();
                                                setEditedTiles([tile]);
                                                setGrid({
                                                    col: 1,
                                                    row: 1,
                                                });
                                                setImg('');
                                                setOpen(true);
                                            }
                                        }}
                                    />
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
            <EditorModal
                open={open}
                hidden={hidden}
                handleClose={() => setOpen(false)}
                handleUpdate={() => handleUpdate()}
                setHidden={setHidden}
                img={img}
                setImg={setImg}
                col={col}
                row={row}
                setGrid={setGrid}
                editedTiles={editedTiles}
                setEditedTiles={setEditedTiles}
                setCurrentTileIndex={setCurrentTileIndex}
                setCode={setCode}
            />
        </>
    );
};

export default Editor;
