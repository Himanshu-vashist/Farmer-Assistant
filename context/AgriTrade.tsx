import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    FC,
} from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface AgriTradeContextProps {
    connectWallet: () => Promise<void>;
    account: string | null;
    contract: ethers.Contract | null;
    provider: ethers.BrowserProvider | null;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
}

export const AgriTradeContext = createContext<AgriTradeContextProps>({
    connectWallet: async () => { },
    account: null,
    contract: null,
    provider: null,
    isLoading: false,
    error: null,
    isInitialized: false,
});

interface ProviderProps {
    children: ReactNode;
}

export const AgriTradeProvider: FC<ProviderProps> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    const connectWallet = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            if (!window.ethereum) {
                throw new Error("MetaMask not installed");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();

            if (network.chainId !== 11155111n) {
                throw new Error("Please switch to Sepolia network in MetaMask");
            }

            const accounts: string[] = await provider.send("eth_requestAccounts", []);

            if (accounts.length === 0) {
                throw new Error("No accounts found");
            }

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            setProvider(provider);
            setAccount(accounts[0]);
            setContract(contract);
        } catch (error: any) {
            console.error("Wallet connection error:", error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (window.ethereum && !isInitialized) {
                try {
                    setIsLoading(true);
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signers = await provider.listAccounts();
                    const accounts = await Promise.all(signers.map(signer => signer.getAddress()));

                    if (accounts.length > 0) {
                        const signer = await provider.getSigner();
                        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

                        setProvider(provider);
                        setAccount(accounts[0]);
                        setContract(contract);
                    }
                    setIsInitialized(true);
                } catch (error: any) {
                    console.error("Initial connection error:", error);
                    setError(error.message);
                } finally {
                    setIsLoading(false);
                }
            } else if (!window.ethereum) {
                setError("Ethereum provider not detected");
                setIsInitialized(true);
            }
        };

        init();
    }, [isInitialized]);

    return (
        <AgriTradeContext.Provider
            value={{
                connectWallet,
                account,
                contract,
                provider,
                isLoading,
                error,
                isInitialized,
            }}
        >
            {children}
        </AgriTradeContext.Provider>
    );
};
