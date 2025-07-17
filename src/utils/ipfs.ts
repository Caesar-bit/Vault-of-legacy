import { Web3Storage, File } from 'web3.storage';

// Returns a Web3Storage client
export function getWeb3StorageClient(token: string) {
  return new Web3Storage({ token });
}

// Uploads encrypted data to IPFS via web3.storage
export async function uploadToIPFS(client: Web3Storage, data: string, filename = 'secret.txt') {
  const file = new File([data], filename, { type: 'text/plain' });
  const cid = await client.put([file]);
  return cid; // IPFS CID
}

// Fetches data from IPFS via web3.storage
export async function fetchFromIPFS(client: Web3Storage, cid: string, filename = 'secret.txt') {
  const res = await client.get(cid);
  if (!res) throw new Error('No response from IPFS');
  const files = await res.files();
  const file = files.find(f => f.name === filename);
  if (!file) throw new Error('File not found in IPFS result');
  return await file.text();
}
