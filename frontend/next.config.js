/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gateway.pinata.cloud',
                port: '',
                pathname: '/ipfs/**',
            },
            {
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
                port: '',
                pathname: '/ipfs/**',
            },
        ],
    },
};
