import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

type MaybeMetaMaskProvider = ethers.Eip1193Provider & {
  isMetaMask?: boolean;
  providers?: ethers.Eip1193Provider[];
};

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
  const rawProviderRef = useRef<ethers.Eip1193Provider | null>(null);
  const hasAttemptedConnect = useRef(false);

  const refreshBalance = useCallback(async (addr: string) => {
    try {
      const provider = providerRef.current;
      if (!provider) return;
      const bal = await provider.getBalance(addr);
      setBalance(ethers.formatEther(bal));
    } catch (err: unknown) {
      console.error(err);
    }
  }, []);

  const refreshNetwork = useCallback(async () => {
    try {
      const provider = providerRef.current;
      if (!provider) return;
      const net = await provider.getNetwork();
      setNetwork(net.name ? `${net.name} (${net.chainId})` : `${net.chainId}`);
    } catch (err: unknown) {
      console.error(err);
    }
  }, []);

  const connect = useCallback(async () => {
    if (status === 'connecting') return;
    setStatus('connecting');
    const detected = (await detectEthereumProvider({ silent: true })) as MaybeMetaMaskProvider | null;
    if (!detected) {
      setStatus('not-installed');
      return;
    }
    const raw: MaybeMetaMaskProvider = Array.isArray(detected.providers)
      ? (detected.providers.find((p) => (p as MaybeMetaMaskProvider).isMetaMask) || detected.providers[0])
      : detected;
    rawProviderRef.current = raw;
    const provider = new ethers.BrowserProvider(raw);
    providerRef.current = provider;
    try {
      const accounts = (await raw.request({
        method: 'eth_requestAccounts',
      })) as string[];
      const addr = accounts[0];
      setAddress(addr);
      await refreshBalance(addr);
      await refreshNetwork();
      setStatus('connected');
    } catch (err: unknown) {
      console.error(err);
      setStatus('disconnected');
    }
  }, [status, refreshBalance, refreshNetwork]);

  useEffect(() => {
    let raw: MaybeMetaMaskProvider | null = null;
    let provider: ethers.BrowserProvider | null = null;

    const init = async () => {
      const detected = (await detectEthereumProvider({ silent: true })) as MaybeMetaMaskProvider | null;
      if (!detected) {
        setStatus('not-installed');
        return;
      }
      raw = Array.isArray(detected.providers)
        ? (detected.providers.find((p) => (p as MaybeMetaMaskProvider).isMetaMask) || detected.providers[0])
        : detected;
      rawProviderRef.current = raw;
      provider = new ethers.BrowserProvider(raw);
      providerRef.current = provider;

      provider.on('block', (num) => setBlockNumber(num));
      raw.on('connect', () => {
        setStatus('connected');
        refreshNetwork();
      });
      raw.on('disconnect', () => {
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

      raw.on('accountsChanged', handleAccounts);
      raw.on('chainChanged', handleChain);

      raw
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            handleAccounts(accounts);
            refreshNetwork();
          } else if (!hasAttemptedConnect.current) {
            hasAttemptedConnect.current = true;
            connect();
          }
        })
        .catch((err: unknown) => {
          console.error(err);
          if (!hasAttemptedConnect.current) {
            hasAttemptedConnect.current = true;
            connect();
          }
        });

      return () => {
        provider?.removeAllListeners();
        raw?.removeListener('accountsChanged', handleAccounts);
        raw?.removeListener('chainChanged', handleChain);
      };
    };

    const cleanupPromise = init();
    return () => {
      cleanupPromise.then((fn) => typeof fn === 'function' && fn());
    };
  }, [refreshBalance, refreshNetwork, connect]);

  return { status, address, balance, network, blockNumber, connect };
}
