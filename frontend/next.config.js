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
                hostname: 'aquamarine-active-toad-44.mypinata.cloud',
                port: '',
                pathname: '/ipfs/**',
            },
        ],
    },
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'http://localhost:3030/api/:path*' // Proxy to Backend
          }
        ]
    }
};
