import {writeFileSync} from "node:fs"
  import { Wallet } from "fuels";

const main = async ( ) => {

  const wallets = [];

  for (let i = 0; i < 10; i++) {
    const wallet = Wallet.generate();

    wallets.push({
      address: wallet.address.toString(),
      privateKey: wallet.privateKey,
    });
  }

  console.log("Generated wallets:", wallets);

  // Optionally, save the wallets to a file
  writeFileSync('generated_wallets.json', JSON.stringify(wallets, null, 2));
}

main()