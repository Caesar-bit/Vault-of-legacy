import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export interface EthereumState {
  status: 'not-installed' | 'disconnected' | 'connecting' | 'connected';
  address: string;
  balance: string;
  network: string;
  blockNumber: number | null;
  connect: () => Promise<void>;
}

export function useEthereum(): EthereumState {
  const [status, setStatus] = useState<EthereumState['status']>('disconnected');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [network, setNetwork] = useState('');
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const providerRef = useRef<ethers.BrowserProvider | null>(null);
  const hasAttemptedConnect = useRef(false);

  const refreshBalance = useCallback(async (addr: string) => {
    try {
      const provider = providerRef.current;
      if (!provider) return;
      const bal = await provider.getBalance(addr);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshNetwork = useCallback(async () => {
    try {
      const provider = providerRef.current;
      if (!provider) return;
      const net = await provider.getNetwork();
      setNetwork(net.name ? `${net.name} (${net.chainId})` : `${net.chainId}`);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setStatus('not-installed');
      return;
    }
    if (status === 'connecting') return;
    setStatus('connecting');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      providerRef.current = provider;
      const accounts = await provider.send('eth_requestAccounts', []);
      const addr = accounts[0];
      setAddress(addr);
      await refreshBalance(addr);
      await refreshNetwork();
      setStatus('connected');
    } catch (err) {
      console.error(err);
      setStatus('disconnected');
    }
  }, [status, refreshBalance, refreshNetwork]);

  useEffect(() => {
    if (!window.ethereum) {
      setStatus('not-installed');
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    providerRef.current = provider;

    provider.on('block', (num) => setBlockNumber(num));
    provider.on('connect', () => {
      setStatus('connected');
      refreshNetwork();
    });
    provider.on('disconnect', () => {
      setStatus('disconnected');
      setAddress('');
      setBalance('');
    });

    const handleAccounts = (accounts: string[]) => {
      if (accounts.length === 0) {
        setStatus('disconnected');
        setAddress('');
        setBalance('');
      } else {
        setAddress(accounts[0]);
        refreshBalance(accounts[0]);
        setStatus('connected');
      }
    };
    const handleChain = () => {
      refreshNetwork();
    };

    window.ethereum.on('accountsChanged', handleAccounts);
    window.ethereum.on('chainChanged', handleChain);

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts.length > 0) {
          handleAccounts(accounts as string[]);
          refreshNetwork();
        } else if (!hasAttemptedConnect.current) {
          hasAttemptedConnect.current = true;
          connect();
        }
      })
      .catch((err) => {
        console.error(err);
        if (!hasAttemptedConnect.current) {
          hasAttemptedConnect.current = true;
          connect();
        }
      });

    return () => {
      provider.removeAllListeners();
      window.ethereum?.removeListener('accountsChanged', handleAccounts);
      window.ethereum?.removeListener('chainChanged', handleChain);
    };
  }, [refreshBalance, refreshNetwork, connect]);

  return { status, address, balance, network, blockNumber, connect };
}
