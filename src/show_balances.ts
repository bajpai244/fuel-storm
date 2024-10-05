import { bn, Provider, Script, ScriptRequest, ScriptTransactionRequest, Signer, Wallet } from "fuels";

const main = async () => {
    
// Create a provider.
const LOCAL_FUEL_NETWORK = process.env.LOCAL_FUEL_NETWORK_URL;
if (!LOCAL_FUEL_NETWORK) {
    console.error('LOCAL_FUEL_NETWORK_URL is not defined in the environment variables.');
    process.exit(1);
}

const provider = await Provider.create(LOCAL_FUEL_NETWORK);

// Create our wallet (with a private key).
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error('PRIVATE_KEY is not defined in the environment variables.');
    process.exit(1);
}
const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

const coins = await provider.getCoins(wallet.address);
console.log("total coins: ",coins.coins.length);

}

main()
