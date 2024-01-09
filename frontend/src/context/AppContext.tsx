import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { MapTile } from '../common/MapTile';

import {
    Connection,
    clusterApiUrl,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    Transaction,
    GetProgramAccountsFilter
  } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { Wallet } from '@project-serum/anchor/dist/cjs/provider';
import { Metaplex } from "@metaplex-foundation/js";
import { useWallet } from '@solana/wallet-adapter-react';
import { isDev, network, secret_key, SolwallaIdl } from '../config';
import axios from 'axios';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface ContextState {
    tiles: MapTile[],
    initialized: Boolean,
    solwallaPda: PublicKey,
    program: any,
    findPda: any,
    connection: any,
    getOwnedNfts: any
}

const AppContext = React.createContext({} as ContextState);

const programID = new PublicKey(SolwallaIdl.metadata.address);

const defaultTiles: Array<MapTile> = new Array(4000);

for(let i = 0; i < 4000; i ++) {
    defaultTiles[i] = {
        id: i,
        nft: '',
        name: `Solwalla #${i}`,
        image: '',
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
    const [ownedNfts, setOwnedNfts] = useState<string[]>([]);
    const [fetching, setFetching] = useState(false);
    const [flag, setFlag] = useState(false);
    
    const [initialized, setInitialized] = useState(true);
    const [solwallaPda, setSolwallaPda] = useState<PublicKey>(PublicKey.default);

    const wallet = useWallet();
    
    const connection = useMemo(() => 
        isDev 
            ? new Connection(process.env.NEXT_PUBLIC_DEVNET_RPC!, "processed")
            : new Connection(process.env.NEXT_PUBLIC_MAINNET_RPC!, "processed")
        , [isDev]);

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

    const getOwnedNfts = useCallback(async () => {
        if(!(wallet.publicKey)) return;

        const address = wallet.publicKey!.toString();

        const filters:GetProgramAccountsFilter[] = [
            {
                dataSize: 165,    //size of account (bytes)
            },
            {
                memcmp: {
                offset: 32,     //location of our query in the account (bytes)
                bytes: address,  //our search criteria, a base58 encoded string
                }            
            }
            ];

        const accounts = await connection.getParsedProgramAccounts(
            TOKEN_PROGRAM_ID,   //SPL Token Program, new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
            {filters: filters}
        );

        const nfts: string[] = [];
        accounts.forEach((account, i) => {
            const parsedAccountInfo:any = account.account.data;
            const mintAddress:string = parsedAccountInfo["parsed"]["info"]["mint"];
            const tokenBalance: number = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];

            if(tokenBalance == 1) {
                nfts.push(mintAddress);
            }
        });

        setOwnedNfts(nfts);
    }, [wallet, connection]);
    
    useEffect(() => {
        const pda = findPda();
        setSolwallaPda(pda);
    }, [findPda]);

    useEffect(() => {
        fetchTiles();
    }, []);

    useEffect(() => {
        getOwnedNfts();
    }, [getOwnedNfts]);

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
        }, 3000);
        
        return () => clearTimeout(timer);
    }, [flag]);

    const fetchTiles = async () => {
        try {
            setFetching(true);
            
            const start = Date.now();
            console.log('start fetching');
            
            const res = await axios.get('/api/tile');
            const tileInfos = res.data;
    
            const oldTiles = tiles.slice();
    
            for(const tileInfo of tileInfos) {
                const id = tileInfo.tileId;
                const nft = tileInfo.nftAddress;

                if(id >= 0 && id < 4000) {
                    oldTiles[id] = {
                        id,

                        nft,
                        image: tileInfo.nftImage.base64Data,

                        name: tileInfo.metaName,
                        link: tileInfo.metaLink,
                        description: tileInfo.metaDescription,

                        owner: tileInfo.saleOwner,
                        price: tileInfo.salePrice,

                        mintable: nft ? false : true,
                        saleable: tileInfo.salePrice ? true : false,
                        owned: tileInfo.saleOwner == wallet.publicKey?.toString() || ownedNfts.includes(nft)
                    }
                }
            }

            setTiles(oldTiles);
            setFetching(false);
            setFlag(!flag);
            console.log( 'end fetching: ', (Date.now() - start) / 1000);

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
        { initialized, solwallaPda, tiles, program, findPda, connection, getOwnedNfts}
    ), [initialized, solwallaPda, tiles, program, findPda, connection, getOwnedNfts]);

    return (
        <AppContext.Provider value={values}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
