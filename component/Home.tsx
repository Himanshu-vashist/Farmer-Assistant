import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgriTradeContext } from '../context/AgriTrade';
import { checkUserRegistration } from '../Utiles/ApiFeatures';
import './Home.css';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const {
        connectWallet,
        account,
        contract,
        isLoading,
        error: contextError
    } = useContext(AgriTradeContext);

    const [localError, setLocalError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [role, setRole] = useState<string | null>(null);

    const getAccountAddress = (): string | null => {
        if (!account) return null;
        if (typeof account === 'string') return account;
        if (typeof account === 'object' && 'address' in account) {
            return (account as { address: string }).address;
        }
        return null;
    };


    const accountAddress = getAccountAddress();

    const handleConnectWallet = async (): Promise<void> => {
        console.log("connectWallet clicked"); // Debug log
        try {
            setLoading(true);
            setLocalError('');
            await connectWallet();
            console.log("here");
        } catch (error: any) {
            console.error(error); // Debug error
            setLocalError(error.message || 'An error occurred while connecting.');
        } finally {
            setLoading(false);
        }
    };


    const handleRoleSelection = async (selectedRole: 'farmer' | 'trader'): Promise<void> => {
        if (!contract || !accountAddress) {
            setLocalError('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');

            const user = await checkUserRegistration(contract, accountAddress);
            if (user.isRegistered) {
                if ((selectedRole === 'farmer' && !user.isFarmer) ||
                    (selectedRole === 'trader' && user.isFarmer)) {
                    throw new Error(`This address is already registered as a ${user.isFarmer ? 'farmer' : 'trader'}`);
                }

                navigate(`/${selectedRole}`);
                return;
            }

            setRole(selectedRole);
            navigate(`/${selectedRole}`);
        } catch (error: any) {
            setLocalError(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-container">
            <h1>Welcome to AgriTrade</h1>

            {!accountAddress ? (
                <div className="wallet-section">
                    <p>Connect your wallet to get started</p>
                    <button
                        onClick={handleConnectWallet}
                        className="connect-btn"
                        disabled={isLoading || loading}
                    >
                        {isLoading ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                    {(contextError || localError) && (
                        <p className="error">{contextError || localError}</p>
                    )}
                </div>
            ) : (
                <div className="role-selection">
                    <p>Connected Account: {accountAddress}</p>
                    <p>Select your role:</p>
                    <div className="button-group">
                        <button
                            className="role-btn"
                            onClick={() => handleRoleSelection('farmer')}
                            disabled={loading}
                        >
                            I'm a Farmer
                        </button>
                        <button
                            className="role-btn"
                            onClick={() => handleRoleSelection('trader')}
                            disabled={loading}
                        >
                            I'm a Trader
                        </button>
                    </div>
                    {(contextError || localError) && (
                        <p className="error">{contextError || localError}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
