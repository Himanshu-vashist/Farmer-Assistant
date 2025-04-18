import React, { useState, useEffect, useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgriTradeContext } from '../context/AgriTrade';
import { registerUser, fetchCrops, checkUserRegistration, expressInterest } from '../Utiles/ApiFeatures';
import { formatEther } from 'ethers';
import './Trader.css';

// Types
interface UserData {
    isRegistered: boolean;
    isFarmer: boolean;
    name: string;
    phone: string;
}

interface FormData {
    name: string;
    phone: string;
    isFarmer: boolean; // Add isFarmer field to FormData
}

interface Crop {
    id: number;
    name: string;
    location: string;
    quantity: number;
    expectedPrice: number;
    comments: string;
}

const Trader: React.FC = () => {
    const navigate = useNavigate();
    const { account, contract, isLoading, error: contextError } = useContext(AgriTradeContext);

    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [localError, setLocalError] = useState<string>('');
    const [userData, setUserData] = useState<UserData>({
        isRegistered: false,
        isFarmer: false,
        name: '',
        phone: ''
    });

    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        isFarmer: false // Assuming traders are not farmers
    });

    const getAccountAddress = (): string | null => {
        if (!account) return null;
        if (typeof account === 'string') return account;

        // If 'account' is an object, TypeScript should infer it as having 'address' property
        if (typeof account === 'object' && 'address' in account) {
            return account['address'] as string;
        }

        return null;
    };


    const accountAddress = getAccountAddress();

    // In the useEffect hook and other parts where contract is used:
    useEffect(() => {
        const checkRegistration = async () => {
            if (contract && accountAddress) {
                try {
                    setLoading(true);
                    const user = await checkUserRegistration(contract, accountAddress);

                    if (user.isRegistered) {
                        if (user.isFarmer) {
                            throw new Error('This address is registered as a farmer');
                        }

                        setUserData({
                            isRegistered: true,
                            isFarmer: false,
                            name: user.name || 'Trader',
                            phone: user.phone || ''
                        });

                        const cropsData = await fetchCrops(contract, false);
                        setCrops(cropsData);
                    }
                } catch (err: any) {
                    setLocalError(err.message || 'Error checking registration');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };

        checkRegistration();
    }, [contract, accountAddress]);

    // Ensure contract is not null in handleRegister and other function calls
    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        if (!contract || !accountAddress) {
            setLocalError('Wallet not connected');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');
            await registerUser(contract, formData);  // Assuming registerUser expects formData as a single object

            const user = await checkUserRegistration(contract, accountAddress);
            setUserData({
                isRegistered: true,
                isFarmer: false,
                name: user.name || formData.name,
                phone: user.phone || formData.phone
            });

            const cropsData = await fetchCrops(contract, false);
            setCrops(cropsData);

            alert('Registration successful!');
        } catch (err: any) {
            setLocalError(err.reason || err.message || 'Registration failed');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExpressInterest = async (cropId: number) => {
        if (!contract) {
            setLocalError('Smart contract not initialized.');
            return;
        }

        if (!userData.phone) {
            setLocalError('Phone number not available');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');
            await expressInterest(contract, cropId, userData.phone);
            alert('Interest expressed successfully!');
        } catch (err: any) {
            setLocalError(err.reason || err.message || 'Failed to express interest');
            console.error('Interest error:', err);
        } finally {
            setLoading(false);
        }
    };


    if (isLoading) {
        return <div className="trader-dashboard">Loading...</div>;
    }

    if (localError.includes('registered as a farmer')) {
        return (
            <div className="trader-dashboard">
                <h1>Access Denied</h1>
                <p className="error">{localError}</p>
                <button onClick={() => navigate('/')}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="trader-dashboard">
            <h1>Trader Dashboard</h1>
            {accountAddress && <p>Connected Account: {accountAddress}</p>}

            {!userData.isRegistered ? (
                <div className="registration-section">
                    <h2>Register as Trader</h2>
                    <form onSubmit={handleRegister} className="register-form">
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your name"
                            required
                        />
                        <input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Your phone number"
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                        {localError && <p className="error">{localError}</p>}
                    </form>
                </div>
            ) : (
                <div className="dashboard-section">
                    <div className="account-info">
                        <p>Welcome, {userData.name || 'Trader'}</p>
                        {userData.phone && <p>Phone: {userData.phone}</p>}
                    </div>

                    <div className="crops-section">
                        <h2>Available Crops</h2>
                        {loading ? (
                            <p>Loading crops...</p>
                        ) : crops.length > 0 ? (
                            <div className="crops-list">
                                {crops.map((crop, index) => (
                                    <div key={index} className="crop-card">
                                        <h3>{crop.name}</h3>
                                        <p>Location: {crop.location}</p>
                                        <p>Quantity: {crop.quantity}KG</p>
                                        <p>Price: ₹{formatEther(crop.expectedPrice)}</p>

                                        <p>Comments: {crop.comments}</p>
                                        <button
                                            className="interest-btn"
                                            onClick={() => handleExpressInterest(crop.id)}
                                            disabled={loading}
                                        >
                                            Express Interest
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No crops available at the moment</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trader;
