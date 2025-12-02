use anchor_lang::prelude::*;
use anchor_spl::token_2022::Token2022;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("CVxtH2zsGwuGWRaC7YjbxaJ2y76pb7wUh8Z4yprVeJ9M");  // Replace after `anchor deploy`

#[program]
pub mod token_launcher {
    use super::*;

    pub fn initialize_mint(
        ctx: Context<InitializeMint>,
        decimals: u8,
        _transfer_fee_basis_points: u16,  // unused for now
        _max_fee: u64,
    ) -> Result<()> {
        // The mint account itself is created & initialized via the `#[account(init, mint::...)]`
        // constraint below, using the Token-2022 program. For now we don't configure the
        // transfer-fee extension on-chain to avoid pulling in the full `spl-token-2022` crate,
        // which conflicts with the program allocator in this environment.
        //
        // You still get a Token-2022 mint; transfer-fee configuration can be added later via
        // an off-chain instruction builder or a small helper program that uses the
        // `spl-token-2022` / interface crates directly.
        let _ = decimals; // keep parameter for IDL, but unused here
        Ok(())
    }

    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let cpi_accounts = anchor_spl::token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::mint_to(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(init, payer = payer, mint::decimals = 9, mint::authority = payer.key(), mint::token_program = token_program)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub mint_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}