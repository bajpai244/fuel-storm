import {
	bn,
	Provider,
	Script,
	ScriptTransactionRequest,
	Wallet,
} from "fuels";
import { createCoinPairs, getAllCoins, getMinAmountCoins } from "./lib";
import { MIN_COIN_AMONT } from "./constants";
import {readFileSync} from "node:fs"

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
		console.error(
			"LOCAL_FUEL_NETWORK_URL is not defined in the environment variables.",
		);
		process.exit(1);
	}

	const provider = await Provider.create(LOCAL_FUEL_NETWORK);

    if (!process.env.RECIPIENT_ID) {
		console.error("RECIPIENT_ID is not defined in the environment variables.");
		process.exit(1);
	}

	const RECIPIENT_ID = Number.parseInt(process.env.RECIPIENT_ID);
	const generatedWallets: { address: string; privateKey: string }[] = JSON.parse(
		readFileSync("generated_wallets.json", "utf-8")
	);

	const PRIVATE_KEY = generatedWallets[RECIPIENT_ID].privateKey;

    const gasLimit = 100;
    const gasPrice = await provider.getLatestGasPrice();

	const baseAssetID = provider.getBaseAssetId();
	const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

    const coins = await getAllCoins(wallet.address, provider);
    const mintAmountCoins = getMinAmountCoins(coins);

    const requests = await Promise.allSettled(mintAmountCoins.map(async (coin) => {
        
    let request = new ScriptTransactionRequest({
        script: new Uint8Array(),
        scriptData: new Uint8Array(),
        gasLimit,
        maxFee: MIN_COIN_AMONT,
        tip: 10
    });

    request.addCoinInput(coin);

    request = await wallet.populateTransactionWitnessesSignature(request); 
    return request;
}));


    console.log('total requests to send', requests.length);

    const before = new Date();
    
    const prevBlockNumber = await provider.getBlockNumber();
    console.log('previousBlock:', prevBlockNumber);


    const requestsValue = requests.filter((request)=> {
        return request.status === "fulfilled" 
    }).map((request)=> {
        return request.value;
    })

    const pendingQueries =  requestsValue.map((request)=> {
        return wallet.sendTransaction(request)
    })

    console.log('starting to send transactions');
    await Promise.allSettled(pendingQueries);
    console.log('all transactions sent');

    const after = new Date();
    const afterBlockNumber = await provider.getBlockNumber();
    console.log('afterBlock', afterBlockNumber);

    let totalTransactions = 0;
    for(let i = prevBlockNumber.toNumber(); i < afterBlockNumber.toNumber(); i+=1 ) {
       const block = await provider.getBlock(i);
       totalTransactions += block?.transactionIds ? block.transactionIds.length : 0;
    }

    console.log('total transaction: ', totalTransactions)
    console.log('total block time:', afterBlockNumber.sub(prevBlockNumber).toNumber());

    // Calculate the difference in milliseconds
// @ts-ignore
const differenceInMilliseconds = after - before;

// Convert milliseconds to seconds
const differenceInSeconds = differenceInMilliseconds / 1000;

console.log(`Difference: ${differenceInSeconds} seconds`);

console.log(`TPS: ${totalTransactions/differenceInSeconds}`)

};

main();
