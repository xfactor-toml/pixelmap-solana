import SolwallaIdlJson from '../config/idl/solwalla.json';
import { Idl } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const isDev = true;
export const network = isDev ? "devnet" : "mainnet-beta";

export const SolwallaIdl = SolwallaIdlJson as Idl;

export const mint_price = Number(process.env.NEXT_PUBLIC_MINT_PRICE || 0) * LAMPORTS_PER_SOL
export const treasury_address = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '';
export const treasury_dev_address = process.env.NEXT_PUBLIC_TREASURY_DEV_ADDRESS || '';
export const secret_key = process.env.NEXT_PUBLIC_SECRET_KEY || '';

export const IMAGE_COMPRESSED = 'b#';
export const tileSize = 64;