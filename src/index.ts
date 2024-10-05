import { bn, Provider, Script, ScriptRequest, ScriptTransactionRequest, Signer, Wallet } from "fuels";

// The script does the following:
// takes a single address, with some high amount of coin input
// generates 10k unique input coin by a recursive algorithm
// each iteration of the loop produces 256 output coin
// the end result is saved in a JSON file, called tx_data.json
// the json file is an array: [{tx_id: b256, output_idx: number}]
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

const MIN_AMOUT = bn(10000);

const baseAssetID = provider.getBaseAssetId();
const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

const recipientAddress = wallet.address;

const coins = (await provider.getCoins(wallet.address)).coins;
const coin = coins.find(({amount})=>{return bn(amount) > MIN_AMOUT});

if(typeof coin === "undefined") {
    throw new Error(`No coin with sufficient amount found. Minimum required amount is ${MIN_AMOUT.toString()}`);

}

console.log('coin being used:', coin);

// const scriptTransaction =  await wallet.transfer(recipientAddress, 1);
// const result = await scriptTransaction.wait();

// console.log('result is:', result);
}

main()
