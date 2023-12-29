import * as anchor from '@project-serum/anchor';
import axios from 'axios';
import { isDev } from '../config';
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
    const defaultBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAKUSURBVHjapNBdSFNxHMbx39zrccuktFSCQBIRLXu1El8KpCBRBpUQQRQKXaQJbmUtmCWWIl0YUiF0k0slsSwxUNPUzdbOztzUzea29uKW06ln8zg786X1766bk17UxReeq8/FAwgh+J/+jBR8FA4M2WDfFwdEhroA+9GbwJ2k+sBBr/KC6jIB3Q/YMgHCJTVgK4NbAGoniBaVICBVOZzxIAIHjbhBXIGtqACjdJsDyYQO0lQWSNQ60rabZuJEn0JveNplbyRpKsYC47kYaYrGKN0h4ZKa/Vcg7bPhSPZr54OzTxbtCervh3d1opFozUI3ZnEAx+zPYM9Pm9irBp+AVj7F6IEcBnCvGFnuX0LoZNfEc55fDykKNJyg9A5wJr11LN0vijfrrhUsE1LWOo5YG3iQAZTJ55puSQJWaenSXEbnzO14wl4uCLwTs9zOCwI83I65nenbKD1wQsNtrFVNMwOIQArIHBoCqYRuLC8Oo/Q+g4y79h5ixjyAmb6dBiKI+DZ/q5DuASzcyvxAJrM2PCq1KcTtRrjcsLA//xnVkTrsLow3TqbGalxS4ShZxTLSHo57zsz3TdUzAOcOFLDEbSB5pU1eeYfMv1uysSh+TLXv0dprkprDwRijk8UhVeII/RpijyGKAVTWmLNrJa7qj8dDVEfW+vyVerIis9sLJ976bmQ2op8ijyEV07t6McKn4rqNVxnAtRcGyB7UwPk2y5mbD/3HKuSziVWlK4V5L8mugro1/06rMVlod+SLPOOx/HkN84OSpjHI6yWgSGGFrH4cznUQspZchCRlYXSwb6J699dRiJqaBpHbCHwfvgnQQ8DFV1Ow1/4Bjo4oi1pOoXXZdeRKIvCCGJsWosxbAP/a7wEAW4RNehraA1cAAAAASUVORK5CYII=';
    
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

        console.log('end');

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
    canvas.width = 16;
    canvas.height = 16;

    let ctx = canvas.getContext("2d");
    if (!ctx) return "";

    let hex = decompressTileCode(code);
    // console.log('hex', hex);

    if (hex.length != 768) {
        return;
    }

    hex = hex.match(/.{1,3}/g);

    let index = 0;

    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            ctx.fillStyle = `#${hex[index]}`;
            ctx.fillRect(x, y, 1, 1);
            index++;
        }
    }

    return canvas.toDataURL(`image/PNG`, 1);
}