// src/components/Home.js
/*import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleRoleSelection = (role) => {
        if (role === 'farmer') {
            navigate('/farmer');
        } else if (role === 'trader') {
            navigate('/trader');
        }
    };

    return (
        <div className="home-container">
            <h1>Welcome to AgriTrade</h1>
            <p>Select your role to continue:</p>
            <div className="button-group">
                <button className="role-btn" onClick={() => handleRoleSelection('farmer')}>
                    I'm a Farmer
                </button>
                <button className="role-btn" onClick={() => handleRoleSelection('trader')}>
                    I'm a Trader
                </button>
            </div>
        </div>
    );
};

export default Home;
*/
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgriTradeContext } from '../context/AgriTrade';
import { checkUserRegistration } from '../Utiles/ApiFeatures';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const {
        connectWallet,
        account,
        contract,
        isLoading,
        error: contextError
    } = useContext(AgriTradeContext);

    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(null);

    // Safely get account address
    const getAccountAddress = () => {
        if (!account) return null;
        if (typeof account === 'string') return account;
        if (typeof account === 'object' && account.address) return account.address;
        return null;
    };

    const accountAddress = getAccountAddress();

    const handleConnectWallet = async () => {
        try {
            setLoading(true);
            setLocalError('');
            await connectWallet();
        } catch (error) {
            setLocalError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelection = async (selectedRole) => {
        if (!contract || !accountAddress) {
            setLocalError('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');

            // Check if user is already registered as the opposite role
            const user = await checkUserRegistration(contract, accountAddress);
            if (user.isRegistered) {
                if ((selectedRole === 'farmer' && !user.isFarmer) ||
                    (selectedRole === 'trader' && user.isFarmer)) {
                    throw new Error(`This address is already registered as a ${user.isFarmer ? 'farmer' : 'trader'}`);
                }

                // If already registered with correct role, proceed
                navigate(`/${selectedRole}`);
                return;
            }

            // Not registered yet - set role and proceed to registration
            setRole(selectedRole);
            navigate(`/${selectedRole}`);
        } catch (error) {
            setLocalError(error.message);
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