import React, { useEffect, useState } from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import clsx from 'clsx';
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { MapTile } from '../common/MapTile';
import { Box, Button } from '@mui/material';

import styles from '../styles/components/TileCard.module.scss';
import { useWallet } from '@solana/wallet-adapter-react';

import dynamic from 'next/dynamic';
import { useAppContext } from '../context/AppContext';

import {
    MINT_SIZE,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import { getMasterEdition, getMetadata, getMetadataJson, shortenAddress, solscan, solscanAddress, SystemProgram, TOKEN_METADATA_PROGRAM_ID } from '../common/utils';
import { toast } from 'react-toastify';
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { BN } from 'bn.js';
import { defaultBase64 } from '../config';
import axios from 'axios';

const WalletMultiButton = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function TileCard(
    {
        tile,
    }:
    {
        tile: MapTile | null,
    }
) {
    const wallet = useWallet();
    const { findPda, program, initialized, solwallaPda, connection, getOwnedNfts } = useAppContext();

    const [actionButtonText, setActionButtonText] = useState('');
    const [mode, setMode] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [price, setPrice] = useState(1);

    useEffect(() => {
        if(!initialized) return;

        if(!wallet.publicKey) {
            setMode(0);
            setActionButtonText('Connect');
        } else if(tile?.mintable) {
            setMode(1);
            setActionButtonText('Mint');
        } else if(!tile?.saleable && tile?.owned) {
            setMode(2);
            setActionButtonText('List for Sale');
        } else if(tile?.saleable && tile?.owned) {
            setMode(3);
            setActionButtonText('Cancel listing');
        } else if(tile?.saleable && !tile?.owned) {
            setMode(4);
            setActionButtonText('Buy');
        }
        // else if(tile?.owned && tile?.)
    }, [wallet, tile]);

    const handleAction = () => {
        if(processing || !initialized || !wallet.publicKey || !tile) return;

        (async () => {
            setProcessing(true);
            
                if(mode == 0) {
                    setProcessing(false);
                    return;
                } else if(mode == 1) {
                    let toastId = toast.loading(`Minting Solwalla #${tile?.id}...`);

                    let imgCid = '';
                    let metadataCid = '';

                    try {
                        const tileId = tile?.id!;

                        const resForImg = await axios.post("/api/image/upload", {
                            image: defaultBase64
                        });

                        imgCid = resForImg.data;

                        if(!imgCid.length) {
                            throw "Image Uploading Failed";
                        }

                        const imgUri = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}${imgCid}`;
                        const metadataJson = await getMetadataJson(imgUri, tile);

                        const resForMetadata = await axios.post("/api/metadata/upload", {
                            metadata: metadataJson
                        });

                        metadataCid = resForMetadata.data;

                        if(!metadataCid.length) {
                            throw "Image Uploading Failed";
                        }

                        const metadataUri = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}${metadataCid}`;

                        const tilePda = findPda([
                            Buffer.from(tileId.toString()),
                        ]);

                        const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
                        const mint = mintKeypair.publicKey;
            
                        const lamports: number = await program.provider.connection.getMinimumBalanceForRentExemption(
                            MINT_SIZE
                        );
    
                        const NftTokenAccount = await getAssociatedTokenAddress(
                            mint,
                            wallet.publicKey!
                        );

                        const transaction = new Transaction();

                        transaction.add(
                            anchor.web3.SystemProgram.createAccount({
                                fromPubkey: wallet.publicKey!,
                                newAccountPubkey: mint,
                                space: MINT_SIZE,
                                programId: TOKEN_PROGRAM_ID,
                                lamports,
                            }),
                            createInitializeMintInstruction(
                                mint,
                                0,
                                wallet.publicKey!,
                                wallet.publicKey!
                            ),
                            createAssociatedTokenAccountInstruction(
                                wallet.publicKey!,
                                NftTokenAccount,
                                wallet.publicKey!,
                                mint
                            )
                        );

                        const metadataAddress = await getMetadata(mint);
                        const masterEdition = await getMasterEdition(mint);
                        const config = await program.account.solwallaInfo.fetch(solwallaPda);

                        transaction.add(
                            await program.methods.mintTile(
                                tileId,
                                metadataUri,
                                metadataCid,
                                imgCid,
                                `Solwalla #${tileId}`,
                                "-",
                                "-"
                            )
                                .accounts({
                                    mintAuthority: wallet.publicKey,
                                    tileAccount: tilePda,
                                    mint: mint,
                                    tokenAccount: NftTokenAccount,
                                    tokenProgram: TOKEN_PROGRAM_ID,
                                    metadata: metadataAddress,
                                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                                    payer: wallet.publicKey,
                                    systemProgram: SystemProgram.programId,
                                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                                    masterEdition: masterEdition,
                                    solwallaInfo: solwallaPda,
                                    treasury: config.treasury,
                                    treasuryDev: config.treasuryDev
                                })
                                .instruction()
                        );

                        await program.provider.sendAndConfirm(transaction, [mintKeypair]);
                        
                        await axios.post("/api/tile/update", {
                            tileId: tileId,
                            imageCid: imgCid,
                            metadataCid: metadataCid,
                            nftAddress: mint.toString(),
                            metaName: tile.name,
                            metaLink: tile.link,
                            metaDescription: tile.description,
                            saleOwner: '',
                            salePrice: 0,
                            updater: wallet.publicKey?.toString()
                        });

                        toast.update(toastId, {
                            render: 'Minted Successfully',
                            type: 'success',
                            isLoading: false,
                            autoClose: 5000,
                            closeOnClick: true
                        });

                        getOwnedNfts();
                    } catch(error) {
                        console.log(error);
                        setProcessing(false);

                        if(imgCid) {
                            await axios.post("/api/image/remove", {
                                cid: imgCid
                            });
                        }

                        if(metadataCid) {
                            await axios.post("/api/metadata/remove", {
                                cid: metadataCid
                            });
                        }

                        toast.update(toastId, {
                            render: 'Minting Failed',
                            type: 'error',
                            isLoading: false,
                            autoClose: 5000,
                            closeOnClick: true
                        });
                    }
                } else if(mode == 2) {
                    if(price <= 0) {
                        toast.warn('Sale Price must be bigger than 0.', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        });
                    } else {
                        let toastId = toast.loading(`Listing Solwalla #${tile?.id}...`);

                        try {
                            const tileId = tile?.id!;
                            
                            const mint = new PublicKey(tile?.nft!);

                            const mintATA = getAssociatedTokenAddressSync(
                                mint,
                                wallet.publicKey!
                            );

                            const [lockPda, lockBump] = PublicKey.findProgramAddressSync(
                                [
                                    Buffer.from(process.env.NEXT_PUBLIC_SECRET_KEY!),
                                    mint.toBuffer()
                                ],
                                program.programId,
                            );

                            const [tilePda, tileBump] = PublicKey.findProgramAddressSync(
                                [
                                    Buffer.from(process.env.NEXT_PUBLIC_SECRET_KEY!),
                                    Buffer.from(tileId.toString())
                                ],
                                program.programId,
                            );

                            const tx = await program.methods.listTile(
                                tileId,
                                new BN(price * LAMPORTS_PER_SOL)
                            )
                                .accounts({
                                    tile: tilePda,
                                    lockAccount: lockPda,
                                    mint: mint,
                                    mintAccount: mintATA,
                                    solwallaInfo: solwallaPda,
                                    tokenProgram: TOKEN_PROGRAM_ID,
                                })
                                .rpc();
                            
                            await axios.post(
                                '/api/tile/list', {
                                    tileId,
                                    salePrice: price * LAMPORTS_PER_SOL,
                                    saleOwner: wallet.publicKey?.toString()
                                }
                            );                            
                            
                            toast.update(toastId, {
                                render: 'Listed Successfully',
                                type: 'success',
                                isLoading: false,
                                autoClose: 5000,
                                closeOnClick: true
                            });
                        } catch (error) {
                            console.log(error);

                            toast.update(toastId, {
                                render: 'Listing Failed',
                                type: 'error',
                                isLoading: false,
                                autoClose: 5000,
                                closeOnClick: true
                            });
                        }
                    }
                } else if(mode == 3) {
                    let toastId = toast.loading(`Unlisting Solwalla #${tile?.id}...`);

                        try {
                            const tileId = tile?.id!;
                            
                            const mint = new PublicKey(tile?.nft!);

                            const mintATA = getAssociatedTokenAddressSync(
                                mint,
                                wallet.publicKey!
                            );

                            const [lockPda, lockBump] = PublicKey.findProgramAddressSync(
                                [
                                    Buffer.from(process.env.NEXT_PUBLIC_SECRET_KEY!),
                                    mint.toBuffer()
                                ],
                                program.programId,
                            );

                            const [tilePda, tileBump] = PublicKey.findProgramAddressSync(
                                [
                                    Buffer.from(process.env.NEXT_PUBLIC_SECRET_KEY!),
                                    Buffer.from(tileId.toString())
                                ],
                                program.programId,
                            );

                            const tx = await program.methods.unlistTile(
                                tileId,
                            )
                                .accounts({
                                    tile: tilePda,
                                    lockAccount: lockPda,
                                    mint: mint,
                                    mintAccount: mintATA,
                                    solwallaInfo: solwallaPda,
                                    tokenProgram: TOKEN_PROGRAM_ID,
                                })
                                .rpc();
                            
                            await axios.post(
                                '/api/tile/unlist', {
                                    tileId,
                                }
                            );
                            
                            toast.update(toastId, {
                                render: 'Unlisted Successfully',
                                type: 'success',
                                isLoading: false,
                                autoClose: 5000,
                                closeOnClick: true
                            });
                        } catch (error) {
                            console.log(error);

                            toast.update(toastId, {
                                render: 'Unlisting Failed',
                                type: 'error',
                                isLoading: false,
                                autoClose: 5000,
                                closeOnClick: true
                            });
                        }
                } else if(mode == 4) {
                    let toastId = toast.loading(`Buying Solwalla #${tile?.id}...`);

                    try {
                        const tileId = tile?.id!;

                        const transaction = new Transaction();

                        const mint = new PublicKey(tile?.nft!);

                        const mintATA = await getAssociatedTokenAddress(
                            mint,
                            wallet.publicKey!
                        );
                        const mintATAInfo = await connection.getAccountInfo(mintATA);

                        if (!mintATAInfo) {
                            transaction.add(
                                createAssociatedTokenAccountInstruction(
                                    wallet.publicKey!,
                                    mintATA,
                                    wallet.publicKey!,
                                    mint
                                )
                            )
                        }

                        const [lockPda, lockBump] = PublicKey.findProgramAddressSync(
                            [
                                Buffer.from(process.env.NEXT_PUBLIC_SECRET_KEY!),
                                mint.toBuffer()
                            ],
                            program.programId,
                        );

                        const [tilePda, tileBump] = PublicKey.findProgramAddressSync(
                            [
                                Buffer.from(process.env.NEXT_PUBLIC_SECRET_KEY!),
                                Buffer.from(tileId.toString())
                            ],
                            program.programId,
                        );

                        transaction.add(
                            await program.methods.buyTile(
                                tileId,
                            )
                                .accounts({
                                    seller: new PublicKey(tile?.owner!),
                                    tile: tilePda,
                                    lockAccount: lockPda,
                                    mint: mint,
                                    buyerMintAccount: mintATA,
                                    solwallaInfo: solwallaPda,
                                    tokenProgram: TOKEN_PROGRAM_ID,
                                })
                                .instruction()
                        )

                        await wallet.sendTransaction(transaction, connection);

                        await axios.post(
                            '/api/tile/unlist', {
                                tileId,
                            }
                        );

                        getOwnedNfts();
                        
                        toast.update(toastId, {
                            render: 'Bought Successfully',
                            type: 'success',
                            isLoading: false,
                            autoClose: 5000,
                            closeOnClick: true
                        });
                    } catch (error) {
                        console.log(error);

                        toast.update(toastId, {
                            render: 'Buying Failed',
                            type: 'error',
                            isLoading: false,
                            autoClose: 5000,
                            closeOnClick: true
                        });
                    }
                }

                setProcessing(false);

                // setTimeout(() => {
                //     window.location.reload();
                // }, 5000)
        })();
    };

    

    return (
        <div
            className={styles.card}
        >
            <div className={styles.header}>
                <h3
                    className={styles.name}
                >
                    Solwalla #{tile?.id}
                </h3>
            </div>
            <div className={styles.body}>
                <div className={styles.image}>
                    {
                        tile?.nft ? (
                            <Image
                                className={styles.nft} src={tile?.image!}
                                width={80}
                                height={80}
                                alt=''
                            />
                        ) : (
                            <div className={styles.default} />
                        )
                    }
                </div>
                <div className={styles.infos}>
                    <div className={styles.info}>
                        {
                            <span>
                                Owner: {' '}
                                {
                                    tile?.updater ? (
                                        <a className='hover:text-blue-400' href={`${solscanAddress(tile.updater)}`} target='_blank' rel='noreferrer'>
                                            {shortenAddress(tile.updater)}
                                        </a>
                                    ) : '-' 
                                }
                            </span>
                        }
                    </div>
                    <div className={styles.info}>
                        <span>
                            Name: { tile?.name ? tile.name : '-' }
                        </span>
                    </div>
                    <div className={styles.info}>
                        <span>
                            Link: {' '}
                            {
                                tile?.link ? (
                                    <a className='hover:text-blue-400 underline' href={tile.link} target='_blank' rel='noreferrer'>
                                        {tile.link}
                                    </a>
                                ) : '-' 
                            }
                        </span>
                    </div>
                    <div className={styles.info}>
                        <span>
                            Description: { tile?.description ? tile.description : '-' }
                        </span>
                    </div>
                    <div className={styles.info}>
                        <span>
                            Price: { tile?.price ? `${tile.price / LAMPORTS_PER_SOL} SOL` : '-' }
                        </span>
                    </div>
                </div>
            </div>
            {
                (mode == 2) && (
                    <div className='flex justify-center text-white mt-2'>
                        Sale Price:
                        <input
                            className='bg-transparent border border-white rounded-sm w-24 mx-2 pl-2'
                            type='number'
                            value={price}
                            onChange={(e) => setPrice(+e.target.value)}
                        /> SOL
                    </div>
                )
            }
            <div className={styles.buttons}>
                {
                    tile?.nft ? (
                        <a
                            href={solscan(tile?.nft!)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button className={styles.button}>
                                <SearchIcon sx={{ fontSize: 18 }} /> Solscan
                            </Button>
                        </a>
                    ) : (
                        <></>
                    )
                }
                
                {
                    wallet.publicKey ? 
                        (!(!tile?.owned && !tile?.saleable && !tile?.mintable) && (
                            <Button
                                onClick={() => {
                                    handleAction();
                                }}
                                className={styles.button}
                            >
                                {actionButtonText}
                            </Button>
                        ))
                    : (
                        <WalletMultiButton className={styles.button}>
                            {actionButtonText}
                        </WalletMultiButton>
                    )
                }
            </div>
        </div>
    );
}