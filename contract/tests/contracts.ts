import * as anchor from '@project-serum/anchor'
import { Program, Wallet } from '@project-serum/anchor'
import { Contracts } from "../target/types/contracts";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  MINT_SIZE
} from '@solana/spl-token';
import { Metaplex, PublicKey } from "@metaplex-foundation/js";

const { SystemProgram } = anchor.web3

describe("contracts", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;

  const metaplex = new Metaplex(connection);
  const wallet = provider.wallet as Wallet;

  const program = anchor.workspace.Contracts as Program<Contracts>;
  const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

  const creator: anchor.web3.Keypair = anchor.web3.Keypair.generate();

  const tileId = 0;

  const [pda, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("solwalla-pda-seed-secret"),
      Buffer.from(tileId.toString())
    ],
    program.programId,
  );

  it("Mint nft", async () => {
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const lamports: number =
      await program.provider.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
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

    const getMasterEdition = async (
      mint: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> => {
      return (
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];
    };

    const NftTokenAccount = await getAssociatedTokenAddress(
      mintKey.publicKey,
      wallet.publicKey
    );
    console.log("NFT Account: ", NftTokenAccount.toBase58());

    const mint_tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      }),
      createInitializeMintInstruction(
        mintKey.publicKey,
        0,
        wallet.publicKey,
        wallet.publicKey
      ),
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        NftTokenAccount,
        wallet.publicKey,
        mintKey.publicKey
      )
    );

    const res = await program.provider.sendAndConfirm(mint_tx, [mintKey]);
    console.log(
      await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
    );

    console.log("Account Create Tx Hash: ", res);
    console.log("Mint key: ", mintKey.publicKey.toString());
    console.log("User: ", wallet.publicKey.toString());

    const metadataAddress = await getMetadata(mintKey.publicKey);
    const masterEdition = await getMasterEdition(mintKey.publicKey);

    console.log("Metadata address: ", metadataAddress.toBase58());
    console.log("MasterEdition: ", masterEdition.toBase58());

    const tx = await program.methods.mintTile(
      new anchor.BN(tileId),
      "https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA",
      "PDA Authority",
    )
      .accounts({
        mintAuthority: wallet.publicKey,
        updateAuthority: pda,
        mint: mintKey.publicKey,
        tokenAccount: NftTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadata: metadataAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        masterEdition: masterEdition,
      },
      )
      .rpc();
    console.log("Your transaction signature:", tx);

    // const nft = await metaplex.nfts().findByMint({
    //   mintAddress: mintKey.publicKey
    // });

    // console.log(nft);
  });

  // it("Verify Nft", async () => {
  //   const mint = new PublicKey("EUY8xuDUZGi1hJLGFWGX3ND8Sm36cyHd81p6BwdNXHJX");

  //   const nft = await metaplex.nfts().findByMint({
  //     mintAddress: mint
  //   });

  //   console.log(nft.mint.address.toBase58());
  //   console.log(nft.mint.mintAuthorityAddress.toBase58());
  // });
});
