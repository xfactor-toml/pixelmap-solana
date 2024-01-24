import { Blob } from 'buffer';

export const base64ToBlob = (imageBase64: string) => {
    let byteString;

    if (imageBase64.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(imageBase64.split(',')[1]);
    }
    else {
        byteString = unescape(imageBase64.split(',')[1]);
    }

    // separate out the mime component
    const mimeString = imageBase64.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type:mimeString });
}