import { PublicKey } from "@solana/web3.js";
import { BN  } from 'bn.js';

export interface MapTile {
    id?: number; // The ID of the actual tile

    nft?: string;
    image?: string;

    name?: string; // Name input by tile owner
    link?: string;
    description?: string;

    owner?: string;
    price?: number;

    mintable?: Boolean;
    saleable?: Boolean;
    owned?: Boolean;

    updater?: string;
}
