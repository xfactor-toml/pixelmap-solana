import * as anchor from '@project-serum/anchor';
import axios from 'axios';
import { isDev, tileSize } from '../config';
import { MapTile } from './MapTile';
import { NFTStorage, File, Blob } from 'nft.storage';
import { decompressTileCode } from '../utils/ImageUtils';

const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY!;
const nftStorageClient = new NFTStorage({ token: NFT_STORAGE_TOKEN })

export const { SystemProgram } = anchor.web3

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const getMasterEdition = async (
    mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
    return (
        await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID
        )
    )[0];
};;

export const getMetadata = async (
    mint: anchor.web3.PublicKey
  ): Promise<anchor.web3.PublicKey> => {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
};

export const base64ToBlob = (imageBase64: string) => {
    let byteString;
    if (imageBase64.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(imageBase64.split(',')[1]);
    else
        byteString = unescape(imageBase64.split(',')[1]);

    // separate out the mime component
    let mimeString = imageBase64.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    let ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

// IPFS
export const uploadDefaultImage = async (): Promise<string> => {
    const defaultBase64 = 'data:image/png;base64,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';
    
    try {
        const file = base64ToBlob(defaultBase64);
        const formData = new FormData();
        formData.append('file', file, 'solwalla.png');

        const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers: {
                'pinata_api_key': `${process.env.NEXT_PUBLIC_PINATA_KEY}`,
                'pinata_secret_api_key': `${process.env.NEXT_PUBLIC_PINATA_SECRET}`,
                "Content-Type": "multipart/form-data"
            },
        });

        const CID: string = resFile.data.IpfsHash;

        return CID || '';
    } catch (error) {
        console.log(error);
        return '';
    }
};

export const uploadImage = async (imgBase64: any): Promise<string> => {
    try {
        const file = base64ToBlob(imgBase64);
        const formData = new FormData();
        formData.append('file', file, 'solwalla.png');

        const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers: {
                'pinata_api_key': `${process.env.NEXT_PUBLIC_PINATA_KEY}`,
                'pinata_secret_api_key': `${process.env.NEXT_PUBLIC_PINATA_SECRET}`,
                "Content-Type": "multipart/form-data"
            },
        });

        const CID: string = resFile.data.IpfsHash;

        return CID || '';
    } catch (error) {
        console.log(error);
        return '';
    }
};


// Nft Storage
// export const uploadDefaultImage = async (): Promise<string> => {
//     const defaultBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAKUSURBVHjapNBdSFNxHMbx39zrccuktFSCQBIRLXu1El8KpCBRBpUQQRQKXaQJbmUtmCWWIl0YUiF0k0slsSwxUNPUzdbOztzUzea29uKW06ln8zg786X1766bk17UxReeq8/FAwgh+J/+jBR8FA4M2WDfFwdEhroA+9GbwJ2k+sBBr/KC6jIB3Q/YMgHCJTVgK4NbAGoniBaVICBVOZzxIAIHjbhBXIGtqACjdJsDyYQO0lQWSNQ60rabZuJEn0JveNplbyRpKsYC47kYaYrGKN0h4ZKa/Vcg7bPhSPZr54OzTxbtCervh3d1opFozUI3ZnEAx+zPYM9Pm9irBp+AVj7F6IEcBnCvGFnuX0LoZNfEc55fDykKNJyg9A5wJr11LN0vijfrrhUsE1LWOo5YG3iQAZTJ55puSQJWaenSXEbnzO14wl4uCLwTs9zOCwI83I65nenbKD1wQsNtrFVNMwOIQArIHBoCqYRuLC8Oo/Q+g4y79h5ixjyAmb6dBiKI+DZ/q5DuASzcyvxAJrM2PCq1KcTtRrjcsLA//xnVkTrsLow3TqbGalxS4ShZxTLSHo57zsz3TdUzAOcOFLDEbSB5pU1eeYfMv1uysSh+TLXv0dprkprDwRijk8UhVeII/RpijyGKAVTWmLNrJa7qj8dDVEfW+vyVerIis9sLJ976bmQ2op8ijyEV07t6McKn4rqNVxnAtRcGyB7UwPk2y5mbD/3HKuSziVWlK4V5L8mugro1/06rMVlod+SLPOOx/HkN84OSpjHI6yWgSGGFrH4cznUQspZchCRlYXSwb6J699dRiJqaBpHbCHwfvgnQQ8DFV1Ow1/4Bjo4oi1pOoXXZdeRKIvCCGJsWosxbAP/a7wEAW4RNehraA1cAAAAASUVORK5CYII=';
    
//     try {
//         const file = base64ToBlob(defaultBase64);
//         const cid = await nftStorageClient.storeBlob(file);

//         return cid || '';
//     } catch (error) {
//         console.log(error);
//         return '';
//     }
// };

export const uploadMetadata = async (imgUri: string, tile: any) => {
    try {
        const data = {
            pinataOptions: {
              cidVersion: 0
            },
            pinataMetadata: {
              name: "nft metadata",
            },
            pinataContent: {
                name: `Solwalla #${tile?.id}`,
                symbol: 'SOLWALLA',
                description: 'Solwalla.io is a Solana Leaderboard, forked from Pixelmap.io',
                image: imgUri,
                attributes: [
                    {
                        trait_type: "row",
                        value: Math.floor(tile?.id / 80 + 1).toString()
                    },
                    {
                        trait_type: "col",
                        value: (tile?.id % 80 + 1).toString()
                    },
                    {
                        trait_type: "name",
                        value: tile?.name ? tile?.name : ''
                    },
                    {
                        trait_type: "link",
                        value: tile?.link ? tile?.link : ''
                    },
                    {
                        trait_type: "description",
                        value: tile?.description ? tile?.description : ''
                    },
                ],
                external_url: 'https://solwalla.io/',
                properties: {
                    files: [{

                        type: 'image/png',
                        uri: imgUri
                    }],
                    category: 'image',
                },
                seller_fee_basis_points: 250,
            }
        };

        const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            data,
            headers: {
                'pinata_api_key': `${process.env.NEXT_PUBLIC_PINATA_KEY}`,
                'pinata_secret_api_key': `${process.env.NEXT_PUBLIC_PINATA_SECRET}`,
                "Content-Type": "application/json"
            },
        });

        const CID = resFile.data.IpfsHash;

        return CID || '';
    } catch(error) {
        console.log(error);
        return '';
    }
};

export const solscan = (address: string) => {
    return isDev ? 
        `https://solscan.io/token/${address}?cluster=devnet`:
        `https://solscan.io/token/${address}`
}


export const solscanAddress = (address: string) => {
    return isDev ? 
        `https://solscan.io/account/${address}?cluster=devnet`:
        `https://solscan.io/account/${address}`
}


export const shortenAddress = (address: string) => {
    if(address.length < 16) {
        return address;
    } else {
        return address.substring(0, 8) + ' ... ' + address.substring(address.length - 8);
    }
}

export const codeToBase64 = (code: string) => {
    let canvas = document.createElement("canvas");
    canvas.width = tileSize;
    canvas.height = tileSize;

    let ctx = canvas.getContext("2d");
    if (!ctx) return "";

    let hex = decompressTileCode(code);
    // console.log('hex', hex);

    if (hex.length != 3*tileSize*tileSize) {
        return;
    }

    hex = hex.match(/.{1,3}/g);

    let index = 0;

    for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
            ctx.fillStyle = `#${hex[index]}`;
            ctx.fillRect(x, y, 1, 1);
            index++;
        }
    }

    return canvas.toDataURL(`image/PNG`, 1);
}