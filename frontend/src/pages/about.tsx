import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import type { NextPage } from 'next';

import { MapTile } from '../common/MapTile';
import Map from '../components/Map';

import styles from '../styles/Home.module.css';
import { useAppContext } from '../context/AppContext';
import { useWallet } from '@solana/wallet-adapter-react';

const Home: NextPage = () => {
    const wallet = useWallet();

    const { tiles } = useAppContext();
    
    return (
        <div className='mt-8 flex flex-col justify-center items-center text-white audiowide'>
            <h1 className='text-lg md:text-xl lg:text-2xl xl:text-3xl text-center'>
                {`What is SOLWALLA?`}
            </h1>
            <h3 className='max-w-4xl mt-2 px-4 text-justify'>
                {`PixelMap (2016) is often considered an NFT "relic" or "antique", due to being one of the oldest NFTs in existence. The original "billboard-style" NFT, PixelMap is also known for being one of the first to store image data directly on-chain, as well as the oldest (Ethereum) NFT tradeable on OpenSea. It provides the ability to create, display, and update artwork on a "pixel map" with all historical data immortalized on the Blockchain.`}
            </h3>

            <h1 className='text-lg md:text-xl lg:text-2xl xl:text-3xl text-center mt-8'>
                What inspired SOLWALLA?
            </h1>
            <h3 className='max-w-4xl mt-2 px-4 text-justify'>
                {`Heavily inspired by Alex Tew's The Million Dollar Homepage, Ken Erwin created the first fully decentralized equivalent, going live with SOLWALLA on November 17, 2016, years before the Non-Fungible Token (NFT) Standard (EIP-721) would even be written.`}
                {`The The Million Dollar Homepage consists of a 1000x1000 pixel grid, with a total of 1,000,000 pixels, sold for $1 each. Because the pixels themselves were too small to be seen individually, Alex sold them in 10x10 squares for $100 each. Advertisers would then provide him with an image to display on the square, as well as a URL. Notably, the tiles themselves could only be updated by Alex, as the page itself was static (invented roughly four years before Bitcoin had even launched).`}
            </h3>

            <h1 className='text-lg md:text-xl lg:text-2xl xl:text-3xl text-center mt-8'>
                What makes SOLWALLA special?
            </h1>
            <h3 className='max-w-4xl mt-2 px-4 text-justify'>
                {`In many ways, SOLWALLA.io is similar to the The Million Dollar Homepage. There are a total of 1,016,064 pixels for sale (on a 1,296 x 784 grid). The grid is broken up into 3,969 (visible, plus one secret) 16x16 tiles, each at an initial price of 2 Ethereum ($20 at launch).`}
                {`However, unlike The Million Dollar Homepage, every tile is controlled by a contract on the Ethereum Blockchain, lending the following benefits.`}
                {`Each tile is truly owned by the entity that purchases it. Because the data is stored on the Blockchain, nothing short of every single Ethereum node shutting down can eliminate the data.`}
                {`The contract is designed so that if a tile owner wants to update the image, change the URL the tile points to, or sell the tile for any amount they'd like, they can, without any central authority facilitating or controlling any part of the process.`}
                {`If PixelMap.io itself were ever to go down, the data, owner, and URLs for every single pixel remain on the Blockchain, and any site could easily replicate and display the overall image. Essentially, the backend data of SOLWALLA is invincible as long as the Blockchain exists.`}
                {`The project has been open sourced, which means anyone can view the code, audit the Solidity contract, or even set up more frontends if they'd like. For instance, if someone wanted to set up an easier-to-use tile editor for PixelMap.io, they could, as all of the data is stored safely on the Ethereum blockchain.`}
            </h3>

            <h1 className='text-lg md:text-xl lg:text-2xl xl:text-3xl text-center mt-8'>
                {`What was the "rediscovery"?`}
            </h1>
            <h3 className='max-w-4xl mt-2 px-4 text-justify'>
                {`When SOLWALLA launched, much like a few other early projects, it was a bit too early before the concept of "NFTs" had taken off. Maybe 30-40 tiles were sold between the end of 2016 and 2017. The webserver crashed at some point in 2018, eventually shut down entirely at the end of 2018. Between 2018 and August 21, 2021, nearly all traces of SOLWALLA disappeared from the Internet, except for the data stored on-chain.`}
                {`On August 22, 2021, Adam McBride, an "NFT Archaeologist" as he's best described, reached out to myself (Ken Erwin), asking if I had created PixelMap. That was the beginning of the "rediscovery", leading to a massive amount of attention in a few hours, no sleep for 50+ hours, an ERC-721 wrapper to make PixelMap easier to use, and a revival of the website. More information about the rediscovery can be found on Adam's Blog.`}
            </h3>
        </div>
    );
};

export default Home;
