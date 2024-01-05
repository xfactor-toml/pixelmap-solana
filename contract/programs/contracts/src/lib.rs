use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::{invoke, invoke_signed};
use anchor_spl::token::{self, MintTo, Token, SetAuthority};
use spl_token::instruction::AuthorityType;
use mpl_token_metadata::instruction::{create_master_edition_v3, create_metadata_accounts_v3};

declare_id!("2cEv6Dsyf3hW644JF53k6KPNcrPaXUPQwkGqPZP8jzxv");

#[program]
pub mod contracts {
    use super::*;

    const SOLWALLA_PDA_SEED: &[u8] = b"solwalla-pda-seed-secret";

    pub fn initialize(
        ctx: Context<Initialize>,
        treasury: Pubkey,
        treasury_dev: Pubkey,
        mint_price: u64
    ) -> Result<()> {
        let solwalla_info = &mut ctx.accounts.solwalla_info;

        solwalla_info.owner = *ctx.accounts.owner.key;
        solwalla_info.treasury = treasury;
        solwalla_info.treasury_dev = treasury_dev;
        solwalla_info.mint_price = mint_price;

        Ok(())
    }

    pub fn mint_tile(
        ctx: Context<MintTile>,
        tile_id: u16,
        uri: String,
        title: String,
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

        require!(
            ctx.accounts.update_authority.mint_address == Pubkey::default(),
            CustomError::AlreadyMintedTile
        );

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

        let account_info = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.update_authority.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];
        msg!("Account Info Assigned");

        let creator = vec![
            mpl_token_metadata::state::Creator {
                address: ctx.accounts.mint_authority.key(),
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
                ctx.accounts.update_authority.key(),
                title,
                symbol,
                uri,
                Some(creator),
                250,
                false,
                true,
                None,
                None,
                None,
            ),
            account_info.as_slice(),
        )?;
        msg!("Metadata Account Created !!!");

        let master_edition_infos = vec![
            ctx.accounts.master_edition.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.update_authority.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];
        msg!("Master Edition Account Infos Assigned");

        let (_update_authority_pubkey, pda_bump) =
            Pubkey::find_program_address(&[SOLWALLA_PDA_SEED.as_ref(), tile_id.to_string().as_bytes()], ctx.program_id);

        invoke_signed(
            &create_master_edition_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.master_edition.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.update_authority.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.payer.key(),
                Some(0),
            ),
            master_edition_infos.as_slice(),
            &[&[
                SOLWALLA_PDA_SEED.as_ref(), tile_id.to_string().as_bytes(), &[pda_bump]
            ]]
        )?;
        msg!("Master Edition Nft Minted !!!");

        let tile_account = &mut ctx.accounts.update_authority;
        tile_account.mint_address = *ctx.accounts.mint.key;
        tile_account.tile_id = tile_id;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds = [b"solwalla-pda-seed-secret".as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 * 3 + 8 + 2
    )]
    pub solwalla_info: Box<Account<'info, SolwallaInfo>>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tile_id: u16)]
pub struct MintTile<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(
        init,
        seeds = [b"solwalla-pda-seed-secret".as_ref(), tile_id.to_string().as_bytes()],
        bump,
        payer = payer,
        space = 8 + 32 + 8
    )]
    pub update_authority: Box<Account<'info, Tile>>,

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
}

#[account]
#[derive(Default)]
pub struct Tile {
    pub mint_address: Pubkey,
    pub tile_id: u16,
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
    #[msg("Tile Id must less than 4000")]
    InvalidTileId,

    #[msg("Nft Uri must not be blank")]
    InvalidNftUri,

    #[msg("Nft title must not be blank")]
    InvalidNftTitle,

    #[msg("Tile is already minted")]
    AlreadyMintedTile,
}