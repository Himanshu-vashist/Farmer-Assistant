import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

export const AgriTradeContext = createContext();

export const AgriTradeProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Changed initial state to false
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    /*const connectWallet = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!window.ethereum) {
                throw new Error("MetaMask not installed - please install it to continue");
            }

            // Request account access if needed
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);

            if (accounts.length === 0) {
                throw new Error("No accounts found - please unlock your wallet");
            }

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            setProvider(provider);
            setAccount(accounts[0]);
            setContract(contract);
            setIsInitialized(true);

            return { provider, account: accounts[0], contract };
        } catch (error) {
            console.error("Wallet connection error:", error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    */
    // In your AgriTradeProvider component
    const connectWallet = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!window.ethereum) {
                throw new Error("MetaMask not installed");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();

            if (network.chainId !== 11155111) {
                throw new Error("Please switch to Sepolia network in MetaMask");
            }

            const accounts = await provider.send("eth_requestAccounts", []);

            if (accounts.length === 0) {
                throw new Error("No accounts found");
            }

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            setProvider(provider);
            setAccount(accounts[0]);
            setContract(contract);

            return { provider, account: accounts[0], contract };
        } catch (error) {
            console.error("Wallet connection error:", error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize provider on component mount
    useEffect(() => {
        const init = async () => {
            if (window.ethereum && !isInitialized) {
                try {
                    setIsLoading(true);
                    const provider = new ethers.BrowserProvider(window.ethereum);

                    // Check if already connected
                    const accounts = await provider.listAccounts();
                    if (accounts.length > 0) {
                        const signer = await provider.getSigner();
                        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

                        setProvider(provider);
                        setAccount(accounts[0]);
                        setContract(contract);
                    }
                    setIsInitialized(true);
                } catch (error) {
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
        <AgriTradeContext.Provider value={{
            connectWallet,
            account,
            contract,
            provider,
            isLoading,
            error,
            isInitialized
        }}>
            {children}
        </AgriTradeContext.Provider>
    );
};