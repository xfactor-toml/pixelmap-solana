import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import type { NextPage } from 'next';

import { MapTile } from '../common/MapTile';
import Map from '../components/Map';

import { useAppContext } from '../context/AppContext';
import { useWallet } from '@solana/wallet-adapter-react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { shortenAddress, solscanAddress } from '../common/utils';
import { useMediaQuery } from 'react-responsive';

import clsx from 'clsx';

const Leaderboard: NextPage = () => {

    const isMobile = useMediaQuery({
        query: '(max-width: 800px)'
    });

    const { tiles } = useAppContext();

    const [rank, setRank] = useState<any[]>([]);
    const [pageRank, setPageRank] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(0);

    const perPage = 25;

    useEffect(() => {
        const page = rank.slice(pageIndex * perPage, (pageIndex + 1) * perPage);

        setPageRank(page);
    }, [rank, pageIndex]);

    useEffect(() => {
        const userRank: any[] = [];
        const tileCounts: any = {};
        for(const tile of tiles) {
            const owner = tile?.owner;
            if(owner) {
                tileCounts[owner] = tileCounts[owner] ? tileCounts[owner] + 1 : 1;
            }
        }

        for(const [address, count] of Object.entries(tileCounts)) {
            userRank.push([address, count]);
        }

        userRank.sort((a, b) => {
            if(a[1] > b[1]) {
                return -1;
            }

            if(a[1] < b[1]) {
                return 1;
            }

            return 0
        });

        setRank(userRank);
    }, [tiles]);

    const start = () => {
        setPageIndex(0);
    }

    const prev = () => {
        if(pageIndex > 0) {
            const current = pageIndex;
            setPageIndex(current - 1);
        } else {
            return;
        }
    }

    const end = () => {
        setPageIndex(Math.floor((rank.length-1) / perPage));
    }

    const next = () => {
        const maxPage = Math.floor((rank.length-1) / perPage);
        if(pageIndex < maxPage) {
            const current = pageIndex;
            setPageIndex(current + 1);
        } else {
            return;
        }
    }
    
    return (
        <div className='mt-4 flex flex-col justify-center items-center'>
            <h1 className='my-4 text-white text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl audiowide'>SOLWALLA Leaderboard</h1>
            <table className="text-white audiowide">
                <thead>
                    <tr className={'space-x-2'}>
                        <th>Ranking</th>
                        <th>Wallet Address</th>
                        <th>Owned</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        pageRank.map((info, index) =>
                            <tr className='mt-8' key={index}>
                                <td className='text-left'>#{pageIndex * perPage + index + 1}</td>
                                <td className='text-center'>
                                    <a
                                        className='hover:text-blue-300'
                                        href={solscanAddress(info[0])}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        {
                                            isMobile ? 
                                                shortenAddress(info[0]) : 
                                                info[0]
                                        }
                                    </a>
                                </td>
                                <td className='text-right'>{info[1]}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
            <div className='flex justify-center mt-4 text-white'>
                <IconButton
                    aria-label="start"
                    onClick={() => start()}
                >
                    <KeyboardDoubleArrowLeftIcon className='text-white hover:text-blue-100' />
                </IconButton>
                <IconButton
                    aria-label="prev"
                    onClick={() => prev()}
                >
                    <KeyboardArrowLeftIcon className='text-white hover:text-blue-100' />
                </IconButton>
                <span className='mt-2 mx-4'>{pageIndex + 1}</span>
                <IconButton
                    aria-label="next"
                    onClick={() => next()}
                >
                    <KeyboardArrowRightIcon className='text-white hover:text-blue-100' />
                </IconButton>
                <IconButton
                    aria-label="end"
                    onClick={() => end()}
                >
                    <KeyboardDoubleArrowRightIcon className='text-white hover:text-blue-100' />
                </IconButton>
            </div>
        </div>
    );
};

export default Leaderboard;
