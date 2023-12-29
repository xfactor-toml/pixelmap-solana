import React, { useEffect, useState } from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import clsx from 'clsx';

import { MapTile } from '../common/MapTile';

import styles from '../styles/components/TilePopover.module.scss';
import { Box, IconButton } from '@mui/material';
import TileCard from './TileCard';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export default function TilePopover(
    {
        tile,
        referenceElement,
    }:
    {
        tile: MapTile | null,
        referenceElement: HTMLButtonElement | null
    }
) {
    const [controlledVisible, setControlledVisible] = useState(false);
    
    const { getTooltipProps, setTooltipRef, setTriggerRef, visible } =
        usePopperTooltip({
            trigger: 'click',
            closeOnOutsideClick: true,
            visible: controlledVisible,
            onVisibleChange: setControlledVisible,
        });

    useEffect(() => {
        setTriggerRef(referenceElement);
        setControlledVisible(true);
    }, [referenceElement, setTriggerRef]);

    return (
        <>
            {
                visible && (
                    <Box
                        sx={{
                            zIndex: 50,
                            width: {
                                xs: '95vw',
                                sm: '448px'
                            },
                        }}
                        
                        ref={setTooltipRef}
                        {...getTooltipProps()}
                    >
                        <Box
                            className={styles.popover}
                            sx={{
                                overflow: 'hidden',
                                background: '#152747',
                                borderRadius: '10px',
                                p: 0,
                                position: 'relative',
                            }}
                        >
                            <IconButton
                                aria-label="delete"
                                sx={{
                                    color: '#fff',
                                    position: 'absolute',
                                    right: 4,
                                    top: 4,
                                    zIndex: 10
                                }}
                                onClick={() => setControlledVisible(false)}
                            >
                                <HighlightOffIcon />
                            </IconButton>
                            <TileCard tile={tile} />
                        </Box>
                    </Box>
                )
            }
        </>
    );
}