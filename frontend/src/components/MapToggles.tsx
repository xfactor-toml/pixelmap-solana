import { Box, Button, Checkbox, FormControlLabel } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from 'clsx';
import { mint_price, treasury_address, treasury_dev_address } from "../config";
import { useAppContext } from "../context/AppContext";

import styles from '../styles/components/MapToggles.module.css';

import { BN } from 'bn.js';
import { toast } from "react-toastify";

export default function MapToggles({
    showOwned,
    setShowOwned,
    showForSale,
    setShowForSale,
    showMintable,
    setShowMintable,
}: {
    showOwned: boolean,
    setShowOwned: Function,
    showForSale: boolean,
    setShowForSale: Function,
    showMintable: boolean,
    setShowMintable: Function
}) {
    const { initialized, program, solwallaPda } = useAppContext();
    const wallet = useWallet();

    const isAdmin = wallet.publicKey?.toString() == treasury_address ? true : false;

    const initialize = async () => {
        let toastId = toast.loading("Initializing...")
        try {
            await program.methods.initialize(
                new BN(mint_price)
                ).accounts({
                  solwallaInfo: solwallaPda,
                  treasury: treasury_address,
                  treasuryDev: treasury_dev_address,
            }).rpc();

            toast.update(toastId, {
                render: 'Initialized Successfully',
                type: 'success',
                isLoading: false,
                autoClose: 5000,
                closeOnClick: true
            });
        } catch (error) {
            console.log(error);
            
            toast.update(toastId, {
                render: 'Initialization Failed',
                type: 'error',
                isLoading: false,
                autoClose: 5000,
                closeOnClick: true
            });
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                my: 2
            }}
        >
            {
                (!initialized && isAdmin ) && (
                    <Button
                        className="bg-gray-900"
                        variant="text"
                        sx={{ background: '#171717' }}
                        onClick={() => initialize()}
                    >
                        Solwalla Initialize
                    </Button>
                )
            }
            <FormControlLabel
                className={clsx(styles.toggle, showMintable && styles.checked)}
                control={
                    <Checkbox
                        sx={{
                            color: 'white',
                            '&.Mui-checked': {
                            color: 'white',
                            },
                        }}
                        onChange={(e) => setShowMintable(e.target.checked)}
                        checked={showMintable}
                    />
                }
                label="Mintable"
                sx={{
                    mx: 1
                }}
            />

            <FormControlLabel
                className={`${styles.toggle} ${ showOwned && styles.checked }`}
                control={
                    <Checkbox
                        sx={{
                            color: 'white',
                            '&.Mui-checked': {
                            color: 'white',
                            },
                        }}
                        onChange={(e) => setShowOwned(e.target.checked)}
                        checked={showOwned}
                    />
                }
                label="Owned"
                sx={{
                    mx: 1
                }}
            />

            <FormControlLabel
                className={`${styles.toggle} ${ showForSale && styles.checked }`}
                control={
                    <Checkbox
                        sx={{
                            color: 'white',
                            '&.Mui-checked': {
                            color: 'white',
                            },
                        }}
                        onChange={(e) => setShowForSale(e.target.checked)}
                        checked={showForSale}
                    />
                }
                label="For Sale"
                sx={{
                    mx: 1
                }}
            />
        </Box>
    );
}