import {
	bn,
	Provider,
	Script,
	ScriptRequest,
	ScriptTransactionRequest,
	Signer,
	Wallet,
} from "fuels";
import {readFileSync} from "node:fs"
import { getAllCoins } from "./lib";

// fund each wallet 10 eth each
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
	const PRIVATE_KEY = process.env.FUNDING_PRIVATE_KEY;
	if (!PRIVATE_KEY) {
		console.error("PRIVATE_KEY is not defined in the environment variables.");
		process.exit(1);
	}


	const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

	const wallets : [{privateKey: string, address: string}] = JSON.parse(readFileSync('wallets.json', "utf-8"));

	// 0.001 eth
	const ethAmount = bn("1000000");

	for (const recipientWallet of wallets) {
		try {
			const transfer = await wallet.transfer(recipientWallet.address, ethAmount, provider.getBaseAssetId());
			const result = await transfer.wait();
			console.log(`Funded ${recipientWallet.address} with 0.001 ETH. Transaction ID: ${result.id}`);
		} catch (error) {
			console.error(`Failed to fund ${recipientWallet.address}:`, error);
		}
	}

	console.log("Checking balances of funded wallets:");
	for (const recipientWallet of wallets) {
		try {
			const balance = await provider.getBalance(recipientWallet.address, provider.getBaseAssetId());
			console.log(`Wallet ${recipientWallet.address} balance: ${balance} base asset units`);
		} catch (error) {
			console.error(`Failed to get balance for ${recipientWallet.address}:`, error);
		}
	}

};

main();
