import { Wallet } from "fuels";
import {writeFileSync} from "node:fs"

const main = () => {

    const wallets = [];
    
    for(let i =0; i<= 50; i+=1) {
        const wallet =  Wallet.generate();
        wallets.push({privateKey: wallet.privateKey, address: wallet.address});
    }

    writeFileSync("wallets.json", JSON.stringify(wallets));
}

main()