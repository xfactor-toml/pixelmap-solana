import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { MapTile } from '../common/MapTile';

import {
    Connection,
    clusterApiUrl,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    Transaction
  } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { Wallet } from '@project-serum/anchor/dist/cjs/provider';
import { Metaplex } from "@metaplex-foundation/js";
import { useWallet } from '@solana/wallet-adapter-react';
import { isDev, mint_price, network, secret_key, SolwallaIdl, treasury_address, treasury_dev_address } from '../config';
import axios from 'axios';

interface ContextState {
    tiles: MapTile[],
    initialized: Boolean,
    solwallaPda: PublicKey,
    program: any,
    findPda: any,
    connection: any
}

const AppContext = React.createContext({} as ContextState);

const programID = new PublicKey(SolwallaIdl.metadata.address);

const defaultTiles: Array<MapTile> = new Array(4000);

for(let i = 0; i < 4000; i ++) {
    defaultTiles[i] = {
        id: i,
        nft: '',
        name: `Solwalla #${i}`,
        url: '/static/tile.png',
        link: '',
        description: '',
        owner: '',
        price: 0,
        mintable: true,
        saleable: false,
        owned: false,
    }
}

export function AppWrapper({ children }: { children: any }) {
    const [tiles, setTiles] = useState<MapTile[]>(defaultTiles);
    const [fetching, setFetching] = useState(false);
    const [flag, setFlag] = useState(false);
    
    const [initialized, setInitialized] = useState(true);
    const [solwallaPda, setSolwallaPda] = useState<PublicKey>(PublicKey.default);

    const wallet = useWallet();
    const connection = isDev
        ? new Connection(clusterApiUrl(network), "processed") // for test
        : new Connection("", "processed"); // for production

    const provider =  useMemo(() => new AnchorProvider(connection, wallet as Wallet, { commitment: 'processed' }), [wallet]);
    const program = useMemo(() => new Program(SolwallaIdl, programID, provider), [provider]);

    const findPda = useCallback((args = []) => {
        const [pda, bump] = PublicKey.findProgramAddressSync(
            [
              Buffer.from(secret_key),
              ...args
            ],
            program.programId,
        );

        return pda;
    }, [program]);

    useEffect(() => {
        const pda = findPda();
        setSolwallaPda(pda);

        fetchTiles();
    }, [findPda]);

    useEffect(() => {
        if(program.programId == PublicKey.default || solwallaPda == PublicKey.default) {
            return;
        }

        (async () => {
            const status = await checkInitialized();
            
            setInitialized(status);
        })();
    }, [program, solwallaPda]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTiles();
        }, 4000);
        
        return () => clearTimeout(timer);
    }, [flag]);

    const fetchTiles = async () => {
        try {
            setFetching(true);
            
            const start = Date.now();
            // console.log('start fetching');
            const tileInfos = await program.account.tile.all();
    
            const oldTiles = tiles.slice();
    
            for(const tileInfo of tileInfos) {
                const tile: any  = tileInfo.account;

                const id = Number(tile.tileId);
                const nft = tile?.mintAddress ? tile?.mintAddress.toString() : '';
                const owner: string = tile?.owner ? tile?.owner.toString() : '';

                if(id >= 0 && id < 4000) {
                    oldTiles[id] = {
                        id: id,

                        nft,

                        name: tile?.name || '',
                        url: tile?.image ? tile?.image : '',
                        link: tile?.link || '',
                        description: tile?.description || '',

                        owner: tile?.owner ? tile?.owner.toString() : '',
                        price: tile?.price ? tile?.price.toNumber() : 0,

                        mintable: nft ? false : true,
                        saleable: tile?.sale ? true : false,
                        owned: (wallet?.publicKey && wallet?.publicKey.toString() == owner) ? true : false
                    }
                }
            }

            setTiles(oldTiles);
            setFetching(false);
            setFlag(!flag);
            // console.log( 'end fetching: ', (Date.now() - start) / 1000);

        } catch(error) {
            console.log(error);
        }
    };

    const checkInitialized = async () => {
        try {
            const config = await program.account.solwallaInfo.fetch(solwallaPda);
    
            if(config?.mintPrice) {
                return true;
            } else {
                return false;
            }
        } catch(error) {
            return false;
        }
    };

    const values = useMemo(() => (
        { initialized, solwallaPda, tiles, program, findPda, connection }
    ), [initialized, solwallaPda, tiles, program, findPda, connection]);

    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
