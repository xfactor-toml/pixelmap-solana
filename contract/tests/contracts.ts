import * as anchor from '@project-serum/anchor'
import { Program, Wallet } from '@project-serum/anchor'
import { Contracts } from "../target/types/contracts";
import {
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    createInitializeMintInstruction,
    MINT_SIZE,
    getAssociatedTokenAddressSync,
    getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';
import {
  LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { BN } from 'bn.js';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

const { SystemProgram } = anchor.web3

describe("contracts", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;

  const metaplex = new Metaplex(connection);
  const wallet = provider.wallet as Wallet;

  const program = anchor.workspace.Contracts as Program<Contracts>;
  
  const payer = anchor.workspace.Contracts.provider.wallet as NodeWallet;

  // const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

  // const tileId = Math.floor(Math.random() * 4000) + 1;
  
  const treasury = new PublicKey("y8tAZfm3YkxnLchTfaePZqefT1gskdZMEYtni49dFZ9");
  const treasury_dev = new PublicKey("2PjBxvYPExZc2Ak9TVSVcCwuwdxfqwQaMaBb7f8GuZou");
  
  const [solwallaPda, solwallaBump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("solwalla-pda-seed-secret")
    ],
    program.programId,
  );
    
  // const tileId = 0;
  // const [tilePda, tileBump] = PublicKey.findProgramAddressSync(
  //   [
  //     Buffer.from("solwalla-pda-seed-secret"),
  //     Buffer.from(tileId.toString())
  //   ],
  //   program.programId,
  // );

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const getMetadata = async (
    mint: anchor.web3.PublicKey
  ): Promise<anchor.web3.PublicKey> => {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
  };

  it("Initialize", async () => {
    await program.methods.initialize(
      new BN(0.1 * LAMPORTS_PER_SOL)
      ).accounts({
        solwallaInfo: solwallaPda,
        treasury,
        treasuryDev: treasury_dev,
    }).rpc();
  });

  // it("Check Solwalla Config", async () => {
  //   const config = await program.account.solwallaInfo.fetch(solwallaPda);
  //   console.log(config.treasury.toString(), config.treasuryDev.toString(), config.mintPrice.toString());
  // });

  // it("Check Solwalla Tiles", async () => {
  //   const tiles = await program.account.tile.all();

  //   for(const { account } of tiles) {
  //     console.log(account.mintAddress.toString(), account.tileId);
  //   }
  // });

  // it("Bulk Mint nft", async () => {
  //   for(let tileId = 3001; tileId < 4000 ; tileId++) {
  //     console.log("Mint Id: ", tileId);
  //     const [tilePda, tileBump] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("solwalla-pda-seed-secret"),
  //         Buffer.from(tileId.toString())
  //       ],
  //       program.programId,
  //     );
  //     const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  
  //     const lamports: number =
  //       await program.provider.connection.getMinimumBalanceForRentExemption(
  //         MINT_SIZE
  //       );
  
  //     const getMasterEdition = async (
  //       mint: anchor.web3.PublicKey
  //     ): Promise<anchor.web3.PublicKey> => {
  //       return (
  //         await anchor.web3.PublicKey.findProgramAddress(
  //           [
  //             Buffer.from("metadata"),
  //             TOKEN_METADATA_PROGRAM_ID.toBuffer(),
  //             mint.toBuffer(),
  //             Buffer.from("edition"),
  //           ],
  //           TOKEN_METADATA_PROGRAM_ID
  //         )
  //       )[0];
  //     };
  
  //     const NftTokenAccount = await getAssociatedTokenAddress(
  //       mintKey.publicKey,
  //       wallet.publicKey
  //     );
  
  //     const mint_tx = new anchor.web3.Transaction().add(
  //       anchor.web3.SystemProgram.createAccount({
  //         fromPubkey: wallet.publicKey,
  //         newAccountPubkey: mintKey.publicKey,
  //         space: MINT_SIZE,
  //         programId: TOKEN_PROGRAM_ID,
  //         lamports,
  //       }),
  //       createInitializeMintInstruction(
  //         mintKey.publicKey,
  //         0,
  //         wallet.publicKey,
  //         wallet.publicKey
  //       ),
  //       createAssociatedTokenAccountInstruction(
  //         wallet.publicKey,
  //         NftTokenAccount,
  //         wallet.publicKey,
  //         mintKey.publicKey
  //       )
  //     );
  
  //     const res = await program.provider.sendAndConfirm(mint_tx, [mintKey]);

  //     const metadataAddress = await getMetadata(mintKey.publicKey);
  //     const masterEdition = await getMasterEdition(mintKey.publicKey);
  
  //     const config = await program.account.solwallaInfo.fetch(solwallaPda);
  
  //     const tx = await program.methods.mintTile(
  //       tileId,
  //       "Old",
  //       "https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA",
  //       "https://crbvusujkf4437eflsv2hph2nbrm47puzpgtv4fzaf2sf3rjhcsq.arweave.net/FENaSolRec38hVyro7z6aGLOffTLzTrwuQF1Iu4pOKU",
  //       "old link",
  //       "old description"
  //     )
  //       .accounts({
  //         mintAuthority: wallet.publicKey,
  //         tileAccount: tilePda,
  //         mint: mintKey.publicKey,
  //         tokenAccount: NftTokenAccount,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         metadata: metadataAddress,
  //         tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  //         payer: wallet.publicKey,
  //         systemProgram: SystemProgram.programId,
  //         rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //         masterEdition: masterEdition,
  //         solwallaInfo: solwallaPda,
  //         treasury: config.treasury,
  //         treasuryDev: config.treasuryDev
  //       })
  //       .rpc();
  //   }
  // });

  // it("Mint nft", async () => {
    
  //   const lamports: number =
  //     await program.provider.connection.getMinimumBalanceForRentExemption(
  //       MINT_SIZE
  //     );

  //   const getMasterEdition = async (
  //     mint: anchor.web3.PublicKey
  //   ): Promise<anchor.web3.PublicKey> => {
  //     return (
  //       await anchor.web3.PublicKey.findProgramAddress(
  //         [
  //           Buffer.from("metadata"),
  //           TOKEN_METADATA_PROGRAM_ID.toBuffer(),
  //           mint.toBuffer(),
  //           Buffer.from("edition"),
  //         ],
  //         TOKEN_METADATA_PROGRAM_ID
  //       )
  //     )[0];
  //   };

  //   const NftTokenAccount = await getAssociatedTokenAddress(
  //     mintKey.publicKey,
  //     wallet.publicKey
  //   );
  //   console.log("NFT Account: ", NftTokenAccount.toBase58());

  //   const mint_tx = new anchor.web3.Transaction().add(
  //     anchor.web3.SystemProgram.createAccount({
  //       fromPubkey: wallet.publicKey,
  //       newAccountPubkey: mintKey.publicKey,
  //       space: MINT_SIZE,
  //       programId: TOKEN_PROGRAM_ID,
  //       lamports,
  //     }),
  //     createInitializeMintInstruction(
  //       mintKey.publicKey,
  //       0,
  //       wallet.publicKey,
  //       wallet.publicKey
  //     ),
  //     createAssociatedTokenAccountInstruction(
  //       wallet.publicKey,
  //       NftTokenAccount,
  //       wallet.publicKey,
  //       mintKey.publicKey
  //     )
  //   );

  //   const res = await program.provider.sendAndConfirm(mint_tx, [mintKey]);
  //   console.log(
  //     await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
  //   );

  //   console.log("Account Create Tx Hash: ", res);
  //   console.log("Mint key: ", mintKey.publicKey.toString());
  //   console.log("User: ", wallet.publicKey.toString());

  //   const metadataAddress = await getMetadata(mintKey.publicKey);
  //   const masterEdition = await getMasterEdition(mintKey.publicKey);

  //   console.log("Metadata address: ", metadataAddress.toBase58());
  //   console.log("MasterEdition: ", masterEdition.toBase58());

  //   const config = await program.account.solwallaInfo.fetch(solwallaPda);

  //   console.log("Program Authority PDA:", solwallaPda.toString());

  //   const tx = await program.methods.mintTile(
  //     tileId,
  //     "Old",
  //     "https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA",
  //     "https://crbvusujkf4437eflsv2hph2nbrm47puzpgtv4fzaf2sf3rjhcsq.arweave.net/FENaSolRec38hVyro7z6aGLOffTLzTrwuQF1Iu4pOKU",
  //     "old link",
  //     "old description"
  //   )
  //     .accounts({
  //       mintAuthority: wallet.publicKey,
  //       tileAccount: tilePda,
  //       mint: mintKey.publicKey,
  //       tokenAccount: NftTokenAccount,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       metadata: metadataAddress,
  //       tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  //       payer: wallet.publicKey,
  //       systemProgram: SystemProgram.programId,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //       masterEdition: masterEdition,
  //       solwallaInfo: solwallaPda,
  //       treasury: config.treasury,
  //       treasuryDev: config.treasuryDev
  //     })
  //     .rpc();
  //   // console.log("Your transaction signature:", tx);
  // });

  // it("Verify Nft", async () => {
  //   const mint = new PublicKey("EUY8xuDUZGi1hJLGFWGX3ND8Sm36cyHd81p6BwdNXHJX");

  //   const nft = await metaplex.nfts().findByMint({
  //     mintAddress: mint
  //   });

  //   console.log(nft.mint.address.toBase58());
  //   console.log(nft.mint.mintAuthorityAddress.toBase58());
  // });

  // it("Update Nft", async () => {
  //   let mint = new PublicKey("2HhekmDLEtcykLuC5rzw1F2vpYgyMhpUDG7XqGfbiygr");

  //   const mintATA = getAssociatedTokenAddressSync(
  //     mint,
  //     payer.publicKey
  //   );

  //   const [lockPda, lockBump] = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("solwalla-pda-seed-secret"),
  //       mint.toBuffer()
  //     ],
  //     program.programId,
  //   );

  //   const metadataAddress = await getMetadata(mint);

  //   console.log("Update Authority:", solwallaPda.toString(), mint.toString());
  //   console.log("Lock :", lockPda.toString(), mintATA.toString());
  //   console.log(metadataAddress.toString());

  //   const tx = await program.methods.updateTile(
  //     tileId,
  //     "New",
  //     "https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA",
  //     "https://crbvusujkf4437eflsv2hph2nbrm47puzpgtv4fzaf2sf3rjhcsq.arweave.net/FENaSolRec38hVyro7z6aGLOffTLzTrwuQF1Iu4pOKU",
  //     "New link",
  //     "New description"
  //   )
  //     .accounts({
  //       tile: tilePda,
  //       lockAccount: lockPda,
  //       mint: mint,
  //       mintAccount: mintATA,
  //       solwallaInfo: solwallaPda,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       metadata: metadataAddress,
  //       tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .rpc();
  // });

  // it("List tile", async () => {
  //   let mint = new PublicKey("2HhekmDLEtcykLuC5rzw1F2vpYgyMhpUDG7XqGfbiygr");

  //   const mintATA = getAssociatedTokenAddressSync(
  //     mint,
  //     payer.publicKey
  //   );

  //   const [lockPda, lockBump] = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("solwalla-pda-seed-secret"),
  //       mint.toBuffer()
  //     ],
  //     program.programId,
  //   );

  //   const metadataAddress = await getMetadata(mint);

  //   const tx = await program.methods.listTile(
  //     tileId,
  //     new BN(0.1 * LAMPORTS_PER_SOL)
  //   )
  //     .accounts({
  //       tile: tilePda,
  //       lockAccount: lockPda,
  //       mint: mint,
  //       mintAccount: mintATA,
  //       solwallaInfo: solwallaPda,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .rpc();
  // });

  // it("Unlist tile", async () => {
  //   let mint = new PublicKey("2HhekmDLEtcykLuC5rzw1F2vpYgyMhpUDG7XqGfbiygr");

  //   const mintATA = getAssociatedTokenAddressSync(
  //     mint,
  //     payer.publicKey
  //   );

  //   const [lockPda, lockBump] = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("solwalla-pda-seed-secret"),
  //       mint.toBuffer()
  //     ],
  //     program.programId,
  //   );

  //   const metadataAddress = await getMetadata(mint);

  //   const tx = await program.methods.unlistTile(
  //     tileId,
  //   )
  //     .accounts({
  //       tile: tilePda,
  //       lockAccount: lockPda,
  //       mint: mint,
  //       mintAccount: mintATA,
  //       solwallaInfo: solwallaPda,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .rpc();
  // });
});

