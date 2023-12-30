import React from 'react';

import type { FC } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Container,
    Box,
    Menu,
    MenuItem,
    Tooltip,
    Avatar,
    Paper,
    InputBase,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

import dynamic from 'next/dynamic';
const WalletMultiButton = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

import styles from '../styles/Layout.module.css';
import Logo from '../assets/images/logo.png';

const pages = [
    {
        title: 'DASHBOARD',
        path: '/'
    },
    {
        title: 'EDITOR',
        path: '/editor'
    },
    {
        title: 'LEADERBOARD',
        path: '/leaderboard'
    },
    {
        title: 'ABOUT',
        path: '/about'
    }
];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const Header: FC = () => {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const router = useRouter();

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    // console.log(WalletMultiButton);
    
    return (
        <div className={styles.header}>
            <Toolbar
                sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: { xs: 'none', lg: 'flex' }, mr: 1 }}>
                    <Image src={Logo} alt='solwalla' height={64} width={64} />
                </Box>

                {/* <Paper
                    component="form"
                    sx={{
                        p: 0,
                        mx: 6,
                        alignItems: 'center',
                        borderRadius: 10,
                        backgroundColor: 'transparent',
                        border: '2px solid #2E456F',
                        display: { xs: 'none', lg: 'flex' }
                    }}
                >
                    <IconButton type="button" sx={{ p: '7px', color: 'white' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1, color: 'white' }}
                        placeholder="Search mint address"
                        onChange={(e) => console.log(e.target.value)}

                    />
                </Paper> */}

                <Box sx={{ display: { xs: 'none', lg: 'flex' },  flexGrow: 1, ml: 2 }}>
                    {pages.map((page) => (
                        <Button
                            key={page.title}
                            onClick={() => {
                                router.push(page.path);
                            }}
                            sx={{
                                color: 'white',
                                borderRadius: 2,
                                display: 'block',
                                backgroundColor: router.pathname === page.path ? '#152747 !important' : 'inherit',
                                px: 4
                            }}
                        >
                            {page.title}
                        </Button>
                    ))}
                </Box>

                <Box sx={{display: { xs: 'flex', lg: 'none' } }}>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleOpenNavMenu}
                        color="inherit"
                    >
                    <MenuIcon sx={{ color: 'white' }} />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{
                            display: { xs: 'block', lg: 'none' },
                        }}
                    >
                        {pages.map((page) => (
                            <MenuItem
                                key={page.title}
                                onClick={() => {
                                    router.push(page.path);
                                    handleCloseNavMenu();
                                }}
                            >
                                <Typography textAlign="center">{page.title}</Typography>
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
                <Box sx={{ display: { xs: 'flex', lg: 'none' }, mr: 1 }}>
                    <Image src={Logo} alt='solwalla' height={64} width={64} />
                </Box>

                <Box sx={{ display: { xs: 'flex', lg: 'none' }}}>
                    <WalletMultiButton className={styles.connectBtn} />
                </Box>
                <Box sx={{ display: { xs: 'none', lg: 'flex' }}}>
                    <WalletMultiButton className={styles.connectBtn} />
                </Box>
            </Toolbar>
        </div>
    );
};

export default Header;
