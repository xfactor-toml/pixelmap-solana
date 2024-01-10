use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::solana_program::program::{invoke, invoke_signed};
use anchor_spl::token::Mint;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::{self, MintTo, Token, SetAuthority};
use mpl_token_metadata::instruction::{
    create_master_edition_v3,
    create_metadata_accounts_v3,
    update_metadata_accounts_v2
};
use mpl_token_metadata::state::{DataV2};

declare_id!("31E3WieJcKApMz9LR7FEapXZrwApxz46j6dmuHXpKMD6");

const SOLWALLA_PDA_SEED: &[u8] = b"solwalla-pda-seed-secret";

#[program]
pub mod contracts {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        mint_price: u64
    ) -> Result<()> {
        let solwalla_info = &mut ctx.accounts.solwalla_info;

        require!(
            mint_price > 0,
            CustomError::ZeroMintPrice
        );

        solwalla_info.owner = *ctx.accounts.owner.key;
        solwalla_info.treasury = *ctx.accounts.treasury.key;
        solwalla_info.treasury_dev = *ctx.accounts.treasury_dev.key;
        solwalla_info.mint_price = mint_price;

        Ok(())
    }


    /**
     * MINT TILE
     */
    pub fn mint_tile(
        ctx: Context<MintTile>,
        tile_id: u16,
        title: String,
        name: String,
        uri: String,
        image: String,
        link: String,
        description: String,
    ) -> Result<()> {
        require!(
            tile_id < 4000,
            CustomError::InvalidTileId
        );

        require!(
            uri.len() > 0,
            CustomError::InvalidNftUri
        );

        require!(
            title.len() > 0,
            CustomError::InvalidNftTitle
        );

        let mint_config = &ctx.accounts.solwalla_info;

        require!(
            mint_config.owner != Pubkey::default(),
            CustomError::NotInitialized
        );

        require!(
            mint_config.mint_price > 0,
            CustomError::ZeroMintPrice
        );

        require!(
            ctx.accounts.treasury.key() == mint_config.treasury &&
            ctx.accounts.treasury_dev.key() == mint_config.treasury_dev,
            CustomError::InvalidTreasuryAddresses
        );

        require!(
            ctx.accounts.tile_account.mint_address == Pubkey::default(),
            CustomError::AlreadyMintedTile
        );

        // transfer mint price
        let mint_price = mint_config.mint_price;
        let dev_reward = mint_price / 10;
        let treasury_reward = mint_price - dev_reward;

        {
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(), 
                system_program::Transfer {
                    from: ctx.accounts.payer.clone(),
                    to: ctx.accounts.treasury.to_account_info().clone(),
                });
            system_program::transfer(cpi_context, treasury_reward)?;
        }

        {
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(), 
                system_program::Transfer {
                    from: ctx.accounts.payer.clone(),
                    to: ctx.accounts.treasury_dev.to_account_info().clone(),
                });
            system_program::transfer(cpi_context, dev_reward)?;
        }
        //

        msg!("Initializing Mint Ticket");
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        msg!("CPI Accounts Assigned");

        let cpi_program = ctx.accounts.token_program.to_account_info();
        msg!("CPI Program Assigned");

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        msg!("CPI Context Assigned");

        token::mint_to(cpi_ctx, 1)?;
        msg!("Token Minted !!!");

        let account_infos = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.solwalla_info.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];
        msg!("Account Info Assigned");

        let creator = vec![
            mpl_token_metadata::state::Creator {
                address: ctx.accounts.solwalla_info.treasury_dev.key(),
                verified: false,
                share: 100,
            },
        ];
        msg!("Creator Assigned");

        let symbol = std::string::ToString::to_string("SOLWALLA");
        invoke(
            &create_metadata_accounts_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.payer.key(),
                ctx.accounts.solwalla_info.key(),
                title.clone(),
                symbol,
                uri.clone(),
                Some(creator),
                250,
                false,
                true,
                None,
                None,
                None,
            ),
            account_infos.as_slice(),
        )?;
        msg!("Metadata Account Created !!!");

        let master_edition_infos = vec![
            ctx.accounts.master_edition.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.solwalla_info.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];
        msg!("Master Edition Account Infos Assigned");

        let (_update_authority_pubkey, pda_bump) =
            Pubkey::find_program_address(&[SOLWALLA_PDA_SEED.as_ref()], ctx.program_id);

        invoke_signed(
            &create_master_edition_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.master_edition.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.solwalla_info.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.payer.key(),
                Some(0),
            ),
            master_edition_infos.as_slice(),
            &[&[
                SOLWALLA_PDA_SEED.as_ref(), &[pda_bump]
            ]]
        )?;
        msg!("Master Edition Nft Minted !!!");

        let tile_account = &mut ctx.accounts.tile_account;
        tile_account.mint_address = *ctx.accounts.mint.key;
        tile_account.owner = *ctx.accounts.payer.key;
        tile_account.tile_id = tile_id;
        tile_account.name = name;
        tile_account.uri = uri;
        tile_account.image = image;
        tile_account.link = link;
        tile_account.description = description;

        Ok(())
    }
    

    /**
     * UPDATE TILE
     */
    pub fn update_tile(
        ctx: Context<UpdateTile>,
        tile_id: u16,
        title: String,
        name: String,
        uri: String,
        image: String,
        link: String,
        description: String,
    ) -> Result<()> {
        let tile_account = &mut ctx.accounts.tile;
        
        require!(
            tile_account.tile_id == tile_id,
            CustomError::IncorrectTile
        );

        require!(
            tile_account.mint_address == ctx.accounts.mint.key(),
            CustomError::IncorrectTile
        );

        require!(
            tile_id < 4000,
            CustomError::InvalidTileId
        );

        require!(
            uri.len() > 0,
            CustomError::InvalidNftUri
        );

        require!(
            title.len() > 0,
            CustomError::InvalidNftTitle
        );

        // lock nft
        {
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.mint_account.to_account_info(),
                    to: ctx.accounts.lock_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            );
            token::transfer(cpi_ctx, 1)?;
        }
        msg!("Checked if signer own nft!");

        // update nft metadata
        {
            let account_infos = vec![
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.solwalla_info.to_account_info(),
            ];

            let (_update_authority_pubkey, pda_bump) =
                Pubkey::find_program_address(&[SOLWALLA_PDA_SEED.as_ref()], ctx.program_id);

            let creator = vec![
                    mpl_token_metadata::state::Creator {
                        address: ctx.accounts.solwalla_info.treasury_dev.key(),
                        verified: false,
                        share: 100,
                    },
                ];

            let symbol = std::string::ToString::to_string("SOLWALLA");
            let data: DataV2 = DataV2 {
                name: title.clone(),
                symbol,
                uri: uri.clone(),
                seller_fee_basis_points: 250,
                creators: Some(creator),
                collection: None,
                uses: None,
            };

            invoke_signed(
                &update_metadata_accounts_v2(
                    ctx.accounts.token_metadata_program.key(),
                    ctx.accounts.metadata.key(),
                    ctx.accounts.solwalla_info.key(),
                    Some(ctx.accounts.solwalla_info.key()),
                    Some(data),
                    Some(false),
                    Some(true)
                ),
                account_infos.as_slice(),
                &[&[
                    SOLWALLA_PDA_SEED.as_ref(), &[pda_bump]
                ]]
            )?;
        }

        // unlock nft
        {
            let (_update_authority_pubkey, pda_bump) =
                Pubkey::find_program_address(&[SOLWALLA_PDA_SEED.as_ref()], ctx.program_id);
            
            let seeds = &[
                SOLWALLA_PDA_SEED.as_ref(), &[pda_bump]
            ];
            let signer = &[&seeds[..]];
    

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.lock_account.to_account_info(),
                    to: ctx.accounts.mint_account.to_account_info(),
                    authority: ctx.accounts.solwalla_info.to_account_info(),
                },
                signer,
            );
            token::transfer(cpi_ctx, 1)?;

        }
        msg!("Refund the updated nft!");

        tile_account.name = name;
        tile_account.uri = uri;
        tile_account.image = image;
        tile_account.link = link;
        tile_account.description = description;

        Ok(())
    }


    /**
     * LIST TILE
     */
    pub fn list_tile(
        ctx: Context<ListTile>,
        tile_id: u16,
        price: u64,
    ) -> Result<()> {
        let tile_account = &mut ctx.accounts.tile;

        require!(
            tile_account.tile_id == tile_id,
            CustomError::IncorrectTile
        );

        require!(
            tile_account.mint_address != Pubkey::default(),
            CustomError::NotMinted
        );

        require!(
            tile_account.sale == false,
            CustomError::AlreadyListed
        );

        require!(
            price > 0,
            CustomError::ZeroPrice
        );

        // lock nft
        {
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.mint_account.to_account_info(),
                    to: ctx.accounts.lock_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            );
            token::transfer(cpi_ctx, 1)?;
        }

        tile_account.owner = ctx.accounts.owner.key();
        tile_account.price = price;
        tile_account.sale = true;

        Ok(())
    }


    /**
     * BUY TILE
     */
    pub fn buy_tile(
        ctx: Context<BuyTile>,
        tile_id: u16,
    ) -> Result<()> {
        let tile_account = &mut ctx.accounts.tile;

        require!(
            tile_account.tile_id == tile_id,
            CustomError::IncorrectTile
        );

        require!(
            tile_account.sale == true,
            CustomError::NotYetListed
        );

        require!(
            tile_account.owner == ctx.accounts.seller.key(),
            CustomError::IncorrectSeller
        );

        require!(
            tile_account.owner != ctx.accounts.buyer.key(),
            CustomError::IncorrectBuyer
        );

        // transfer mint price
        {
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(), 
                system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info().clone(),
                    to: ctx.accounts.seller.to_account_info().clone(),
                });
            system_program::transfer(cpi_context, tile_account.price)?;
        }

        // transfer nft
        {
            let (_update_authority_pubkey, pda_bump) =
                Pubkey::find_program_address(&[SOLWALLA_PDA_SEED.as_ref()], ctx.program_id);
            
            let seeds = &[
                SOLWALLA_PDA_SEED.as_ref(), &[pda_bump]
            ];
            let signer = &[&seeds[..]];
    

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.lock_account.to_account_info(),
                    to: ctx.accounts.buyer_mint_account.to_account_info(),
                    authority: ctx.accounts.solwalla_info.to_account_info(),
                },
                signer,
            );
            token::transfer(cpi_ctx, 1)?;
        }

        // update tile status
        tile_account.owner = ctx.accounts.buyer.key();
        tile_account.price = 0;
        tile_account.sale = false;

        Ok(())
    }

    /**
     * Unlist TILE
     */
    pub fn unlist_tile(
        ctx: Context<UnlistTile>,
        tile_id: u16,
    ) -> Result<()> {
        let tile_account = &mut ctx.accounts.tile;

        require!(
            tile_account.tile_id == tile_id,
            CustomError::IncorrectTile
        );

        require!(
            tile_account.sale == true,
            CustomError::NotYetListed
        );

        require!(
            tile_account.owner == ctx.accounts.owner.key(),
            CustomError::IncorrectOwner
        );

        // unlock nft
        {
            let (_update_authority_pubkey, pda_bump) =
                Pubkey::find_program_address(&[SOLWALLA_PDA_SEED.as_ref()], ctx.program_id);
            
            let seeds = &[
                SOLWALLA_PDA_SEED.as_ref(), &[pda_bump]
            ];
            let signer = &[&seeds[..]];
    

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.lock_account.to_account_info(),
                    to: ctx.accounts.mint_account.to_account_info(),
                    authority: ctx.accounts.solwalla_info.to_account_info(),
                },
                signer,
            );
            token::transfer(cpi_ctx, 1)?;
        }

        // update tile status
        tile_account.price = 0;
        tile_account.sale = false;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds = [SOLWALLA_PDA_SEED.as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 * 3 + 8 + 2
    )]
    pub solwalla_info: Box<Account<'info, SolwallaInfo>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub treasury: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub treasury_dev: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tile_id: u16)]
pub struct MintTile<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(
        init,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), tile_id.to_string().as_bytes()],
        bump,
        payer = payer,
        space = 8 + 32 + 2 + 32 + 1 + 8 + 50 + 150 + 150 + 150 + 250 + 100
    )]
    pub tile_account: Account<'info, Tile>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: AccountInfo<'info>,

    // #[account(mut)]
    pub token_program: Program<'info, Token>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    #[account(
        seeds = [SOLWALLA_PDA_SEED.as_ref()],
        bump,
    )]
    pub solwalla_info: Account<'info, SolwallaInfo>,

    #[account(mut)]
    pub treasury: SystemAccount<'info>,

    #[account(mut)]
    pub treasury_dev: SystemAccount<'info>
}

#[derive(Accounts)]
#[instruction(tile_id: u16)]
pub struct UpdateTile<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), tile_id.to_string().as_bytes()],
        bump,
    )]
    pub tile: Account<'info, Tile>,
    #[account(
        init_if_needed,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), mint.to_account_info().key.as_ref()],
        bump,
        payer = owner,
        token::mint = mint,
        token::authority = solwalla_info
    )]
    pub lock_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint_account: UncheckedAccount<'info>,

    #[account(
        seeds = [SOLWALLA_PDA_SEED.as_ref()],
        bump,
    )]
    pub solwalla_info: Account<'info, SolwallaInfo>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(tile_id: u16)]
pub struct ListTile<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), tile_id.to_string().as_bytes()],
        bump,
    )]
    pub tile: Account<'info, Tile>,

    #[account(
        init_if_needed,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), mint.to_account_info().key.as_ref()],
        bump,
        payer = owner,
        token::mint = mint,
        token::authority = solwalla_info
    )]
    pub lock_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub mint_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [SOLWALLA_PDA_SEED.as_ref()],
        bump,
    )]
    pub solwalla_info: Account<'info, SolwallaInfo>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(tile_id: u16)]
pub struct BuyTile<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub seller: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), tile_id.to_string().as_bytes()],
        bump,
    )]
    pub tile: Account<'info, Tile>,

    #[account(
        init_if_needed,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), mint.to_account_info().key.as_ref()],
        bump,
        payer = buyer,
        token::mint = mint,
        token::authority = solwalla_info
    )]
    pub lock_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        seeds = [SOLWALLA_PDA_SEED.as_ref()],
        bump,
    )]
    pub solwalla_info: Account<'info, SolwallaInfo>,

    #[account(mut)]
    pub buyer_mint_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(tile_id: u16)]
pub struct UnlistTile<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), tile_id.to_string().as_bytes()],
        bump,
    )]
    pub tile: Account<'info, Tile>,

    #[account(
        init_if_needed,
        seeds = [SOLWALLA_PDA_SEED.as_ref(), mint.to_account_info().key.as_ref()],
        bump,
        payer = owner,
        token::mint = mint,
        token::authority = solwalla_info
    )]
    pub lock_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub mint_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [SOLWALLA_PDA_SEED.as_ref()],
        bump,
    )]
    pub solwalla_info: Account<'info, SolwallaInfo>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(Default)]
pub struct Tile {
    pub mint_address: Pubkey, // 32
    pub tile_id: u16, // 2

    pub owner: Pubkey, // 32
    pub sale: bool, // 1
    pub price: u64, // 8

    pub name: String, // MAX_LENGTH: 50
    pub uri: String, // MAX_LENGTH: 150
    pub image: String, // MAX_LENGTH: 150
    pub link: String, // MAX_LENGTH: 150
    pub description: String, // MAX_LENGTH: 250
}

#[account]
pub struct SolwallaInfo {
    pub owner: Pubkey,
    // 90%
    pub treasury: Pubkey,
    // 10%
    pub treasury_dev: Pubkey,
    pub mint_price: u64,
    pub minted_count: u16,
}

#[error_code]
pub enum CustomError {
    #[msg("Not initialized to mint")]
    NotInitialized,

    #[msg("Tile Id must less than 4000")]
    InvalidTileId,

    #[msg("Nft Uri must not be blank")]
    InvalidNftUri,

    #[msg("Nft title must not be blank")]
    InvalidNftTitle,

    #[msg("Tile is already minted")]
    AlreadyMintedTile,

    #[msg("Could not mint free")]
    ZeroMintPrice,

    #[msg("Invalid treasury addresses")]
    InvalidTreasuryAddresses,

    #[msg("Insufficient Mint Fund")]
    InsufficientMintFund,

    #[msg("Incorrect Tile")]
    IncorrectTile,

    #[msg("Not yet minted")]
    NotMinted,

    #[msg("Already listed for sale")]
    AlreadyListed,

    #[msg("Not yet listed for sale")]
    NotYetListed,

    #[msg("Incorrect Seller")]
    IncorrectSeller,

    #[msg("Incorrect Buyer")]
    IncorrectBuyer,

    #[msg("Incorrect Owner")]
    IncorrectOwner,

    #[msg("Zero Sale Price")]
    ZeroPrice,
}