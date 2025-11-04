import {
  TransactionBuilder,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  Keypair,
  BASE_FEE,
  Transaction,
  Horizon,
  xdr,
} from "@stellar/stellar-sdk";
import { Server, Api, assembleTransaction } from "@stellar/stellar-sdk/rpc";
import freighter from "@stellar/freighter-api";

const getRpcUrl = () => import.meta.env.VITE_SOROBAN_RPC || "https://soroban-testnet.stellar.org";
const getContractId = () => import.meta.env.VITE_CONTRACT_ID;
const getNetworkPassphrase = () => import.meta.env.VITE_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

let server: Server;

export const getServer = () => {
  if (!server) {
    server = new Server(getRpcUrl(), { allowHttp: false });
  }
  return server;
};

export interface Escrow {
  id: string;
  sender: string;
  receiver: string;
  amount: string;
  completed: boolean;
}

export enum EscrowError {
  NotFound = "Escrow not found",
  AlreadyExists = "An escrow with this ID already exists",
  AlreadyCompleted = "Escrow already completed",
  NotSender = "Only the sender can perform this action",
  Unknown = "An unknown error occurred",
}

// Check if Freighter is available
export async function isFreighterInstalled(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  try {
    // Try to call isAllowed to see if Freighter responds
    const result = await freighter.isAllowed();
    // If we get a result (even if not allowed), Freighter is installed
    return !result.error;
  } catch {
    return false;
  }
}

// Check if Freighter is available and connected
export async function checkFreighterConnection(): Promise<boolean> {
  try {
    // Use isAllowed instead of isConnected for v5
    const result = await freighter.isAllowed();
    return result.isAllowed;
  } catch (error) {
    console.error("Freighter connection check failed:", error);
    return false;
  }
}

// Get the connected wallet's public key
export async function getWalletPublicKey(): Promise<string> {
  try {
    // First request access
    const accessResult = await freighter.requestAccess();
    if (accessResult.error) {
      throw new Error(accessResult.error);
    }
    
    // Then get the address
    const result = await freighter.getAddress();
    if (result.error) {
      throw new Error(result.error);
    }
    return result.address;
  } catch (error: any) {
    console.error("Failed to get address:", error);
    throw new Error(error.message || "Failed to connect to Freighter wallet");
  }
}

// Get account balance using Horizon (not Soroban RPC)
export async function getAccountBalance(publicKey: string): Promise<string> {
  try {
    // Use Horizon for balance queries
    const horizonServer = new Horizon.Server(
      "https://horizon-testnet.stellar.org"
    );
    const account = await horizonServer.loadAccount(publicKey);
    const xlmBalance = account.balances.find(
      (balance: any) => balance.asset_type === "native"
    );
    return xlmBalance ? xlmBalance.balance : "0";
  } catch (error) {
    console.error("Failed to get balance:", error);
    return "0";
  }
}

// Build and submit a contract transaction
async function buildAndSubmitTransaction(
  publicKey: string,
  operation: xdr.Operation
): Promise<string> {
  const server = getServer();
  const account = await server.getAccount(publicKey);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(operation)
    .setTimeout(180)
    .build();

  // Simulate first to get the resource fee
  const simulateResponse = await server.simulateTransaction(transaction);
  
  if (Api.isSimulationError(simulateResponse)) {
    console.error("Simulation error:", simulateResponse);
    throw new Error(`Simulation failed: ${simulateResponse.error}`);
  }

  if (!simulateResponse.result) {
    console.error("No simulation result:", simulateResponse);
    throw new Error("Simulation failed: no result");
  }

  // Prepare the transaction with simulation results
  const preparedTransaction = assembleTransaction(
    transaction,
    simulateResponse
  ).build();

  // Sign with Freighter
  const signResult = await freighter.signTransaction(
    preparedTransaction.toXDR(),
    {
      networkPassphrase: getNetworkPassphrase(),
      address: publicKey,
    }
  );

  if (signResult.error) {
    throw new Error(`Signature failed: ${signResult.error}`);
  }

  // Parse the signed transaction from XDR
  const signedTransaction = TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    getNetworkPassphrase()
  ) as Transaction;

  // Submit the transaction
  const sendResponse = await server.sendTransaction(signedTransaction);

  if (sendResponse.status === "ERROR") {
    console.error("Send transaction error:", sendResponse);
    throw new Error(`Transaction failed: ${JSON.stringify(sendResponse)}`);
  }

  // Poll for the result
  let getResponse = await server.getTransaction(sendResponse.hash);
  let attempts = 0;
  const maxAttempts = 30;

  while (getResponse.status === "NOT_FOUND" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getResponse = await server.getTransaction(sendResponse.hash);
    attempts++;
  }

  if (getResponse.status === "SUCCESS") {
    return sendResponse.hash;
  } else if (getResponse.status === "FAILED") {
    console.error("Transaction failed:", getResponse);
    throw new Error(`Transaction failed: ${JSON.stringify(getResponse)}`);
  } else {
    console.error("Transaction timeout:", getResponse);
    throw new Error("Transaction timeout");
  }
}

// Create an escrow
export async function createEscrow(
  id: string,
  receiver: string,
  amount: string
): Promise<string> {
  const publicKey = await getWalletPublicKey();
  const contractId = getContractId();

  if (!contractId) {
    throw new Error("Contract ID not configured");
  }

  const contract = new Contract(contractId);

  const operation = contract.call(
    "create",
    nativeToScVal(id, { type: "symbol" }),
    new Address(publicKey).toScVal(),
    new Address(receiver).toScVal(),
    nativeToScVal(BigInt(amount), { type: "i128" })
  );

  return await buildAndSubmitTransaction(publicKey, operation);
}

// Get escrow details (read-only)
export async function getEscrow(id: string): Promise<Escrow | null> {
  const server = getServer();
  const contractId = getContractId();

  if (!contractId) {
    throw new Error("Contract ID not configured");
  }

  const contract = new Contract(contractId);
  
  // Use a temporary keypair for simulation
  const tempKeypair = Keypair.random();
  const tempAccount = await server.getAccount(tempKeypair.publicKey());

  const transaction = new TransactionBuilder(tempAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(
      contract.call("get", nativeToScVal(id, { type: "symbol" }))
    )
    .setTimeout(180)
    .build();

  const simulateResponse = await server.simulateTransaction(transaction);

  if (Api.isSimulationError(simulateResponse)) {
    return null;
  }

  if (!simulateResponse.result) {
    return null;
  }

  try {
    const resultValue = simulateResponse.result.retval;
    const escrowData = scValToNative(resultValue);

    if (!escrowData) {
      return null;
    }

    return {
      id: escrowData.id,
      sender: escrowData.sender,
      receiver: escrowData.receiver,
      amount: escrowData.amount.toString(),
      completed: escrowData.completed,
    };
  } catch (error) {
    console.error("Failed to parse escrow data:", error);
    return null;
  }
}

// Release an escrow
export async function releaseEscrow(id: string): Promise<string> {
  const publicKey = await getWalletPublicKey();
  const contractId = getContractId();

  if (!contractId) {
    throw new Error("Contract ID not configured");
  }

  const contract = new Contract(contractId);

  const operation = contract.call(
    "release",
    nativeToScVal(id, { type: "symbol" }),
    new Address(publicKey).toScVal()
  );

  return await buildAndSubmitTransaction(publicKey, operation);
}

// Refund an escrow
export async function refundEscrow(id: string): Promise<string> {
  const publicKey = await getWalletPublicKey();
  const contractId = getContractId();

  if (!contractId) {
    throw new Error("Contract ID not configured");
  }

  const contract = new Contract(contractId);

  const operation = contract.call(
    "refund",
    nativeToScVal(id, { type: "symbol" }),
    new Address(publicKey).toScVal()
  );

  return await buildAndSubmitTransaction(publicKey, operation);
}

// Parse contract errors
export function parseContractError(error: any): string {
  console.error("Full error object:", error);
  const errorString = error.toString().toLowerCase();
  const errorMessage = error.message?.toLowerCase() || "";

  if (errorString.includes("notfound") || errorMessage.includes("notfound")) {
    return EscrowError.NotFound;
  } else if (errorString.includes("alreadyexists") || errorMessage.includes("alreadyexists")) {
    return EscrowError.AlreadyExists;
  } else if (errorString.includes("alreadycompleted") || errorMessage.includes("alreadycompleted")) {
    return EscrowError.AlreadyCompleted;
  } else if (errorString.includes("notsender") || errorMessage.includes("notsender")) {
    return EscrowError.NotSender;
  } else if (errorString.includes("contract id not configured") || errorMessage.includes("contract id not configured")) {
    return "Contract ID not configured. Please check your .env file.";
  }

  // Return the actual error message if available
  return error.message || EscrowError.Unknown;
}

// Get explorer link for transaction
export function getExplorerLink(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}
