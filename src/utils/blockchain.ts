import { ethers } from 'ethers';

type BlockListener = (block: Block) => void;
const listeners = new Set<BlockListener>();

// Connect to MetaMask and get provider
export async function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask not found');
  return new ethers.BrowserProvider(window.ethereum);
}

// Send ETH transaction
export async function sendEth({ to, amount }: { to: string; amount: string }) {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(amount)
  });
  return tx;
}

// Call a smart contract (read-only)
export async function callContract({ address, abi, method, args = [] }: { address: string; abi: unknown; method: string; args?: unknown[] }) {
  const provider = await getProvider();
  const contract = new ethers.Contract(address, abi, provider);
  return contract[method](...args);
}

// Call a smart contract (write)
export async function sendContractTx({ address, abi, method, args = [] }: { address: string; abi: unknown; method: string; args?: unknown[] }) {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  const tx = await contract[method](...args);
  return tx;
}
import { EncryptionService } from './encryption';

export interface Block {
  index: number;
  timestamp: Date;
  data: unknown;
  previousHash: string;
  hash: string;
  nonce: number;
}

export class Blockchain {
  private chain: Block[];
  private difficulty: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
  }

  private createGenesisBlock(): Block {
    const genesisBlock: Block = {
      index: 0,
      timestamp: new Date(),
      data: 'Genesis Block - Vault of Legacy',
      previousHash: '0',
      hash: '',
      nonce: 0
    };
    genesisBlock.hash = this.calculateHash(genesisBlock);
    return genesisBlock;
  }

  private calculateHash(block: Block): string {
    const blockString = `${block.index}${block.timestamp}${JSON.stringify(block.data)}${block.previousHash}${block.nonce}`;
    return EncryptionService.hashData(blockString);
  }

  private mineBlock(block: Block): void {
    const target = Array(this.difficulty + 1).join('0');
    
    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
  }

  addBlock(data: unknown): Block {
    const previousBlock = this.getLatestBlock();
    const newBlock: Block = {
      index: previousBlock.index + 1,
      timestamp: new Date(),
      data: data,
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0
    };

    this.mineBlock(newBlock);
    this.chain.push(newBlock);
    listeners.forEach((l) => l(newBlock));
    return newBlock;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getChain(): Block[] {
    return this.chain;
  }
}

export const blockchain = new Blockchain();
export function onBlockAdded(listener: BlockListener) {
  listeners.add(listener);
}

export function offBlockAdded(listener: BlockListener) {
  listeners.delete(listener);
}
