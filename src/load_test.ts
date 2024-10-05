import {
	bn,
	Provider,
	Script,
	ScriptTransactionRequest,
	Wallet,
} from "fuels";
import { createCoinPairs, getAllCoins } from "./lib";

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

	// Create our wallet (with a private key).
	const PRIVATE_KEY = process.env.RECIPIENT_PRIVATE_KEY;
	if (!PRIVATE_KEY) {
		console.error("RECIPIENT_PRIVATE_KEY is not defined in the environment variables.");
		process.exit(1);
	}

    const gasLimit = 100;
    const gasPrice = await provider.getLatestGasPrice();

	const baseAssetID = provider.getBaseAssetId();
	const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

    const coins = await getAllCoins(wallet.address, provider);
    const coinPairs = createCoinPairs(coins);

    const requests = await Promise.all(coinPairs.map(async ({oneCoin, gasCoin}) => {

    let request = new ScriptTransactionRequest({
        script: new Uint8Array(),
        scriptData: new Uint8Array(),
        gasLimit,
        maxFee: gasPrice.mul(gasLimit)
    });

    request.addCoinInput(oneCoin);
    request.addCoinInput(gasCoin);
    

    request = await wallet.populateTransactionWitnessesSignature(request); 
    return request;
}));


    console.log('total requests to send', requests.length);

    const before = new Date();
    
    const prevBlockNumber = await provider.getBlockNumber();
    console.log('previousBlock:', prevBlockNumber);

    const pendingQueries =  requests.map((request)=> {
        return wallet.sendTransaction(request)
    })

    await Promise.all(pendingQueries);
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
