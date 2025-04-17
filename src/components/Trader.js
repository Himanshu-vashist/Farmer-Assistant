/*import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgriTradeContext } from '../context/AgriTrade';
import { registerUser, fetchCrops, checkUserRegistration, expressInterest } from '../Utiles/ApiFeatures';
import { ethers } from 'ethers';
import './Trader.css';

const Trader = () => {
    const navigate = useNavigate();
    const {
        account,
        contract,
        isLoading,
        error: contextError,
    } = useContext(AgriTradeContext);

    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [userData, setUserData] = useState({
        isRegistered: false,
        isFarmer: false,
        name: '',
        phone: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });
    const getAccountAddress = () => {
        if (!account) return null;
        if (typeof account === 'string') return account;
        if (typeof account === 'object' && account.address) return account.address;
        return null;
    };
    const accountAddress = getAccountAddress();
    /*useEffect(() => {
        const checkRegistration = async () => {
            if (contract && account) {
                try {
                    setLoading(true);
                    const user = await checkUserRegistration(contract, account);

                    if (user.isRegistered) {
                        if (user.isFarmer) {
                            throw new Error('This address is registered as a farmer');
                        }
                        setIsRegistered(true);
                        setUserData(user);
                        const cropsData = await fetchCrops(contract, false);
                        setCrops(cropsData);
                    }
                } catch (err) {
                    setLocalError(err.message);
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        checkRegistration();
    }, [contract, account]);
    */
/* useEffect(() => {
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
                         name: user.name || '',
                         phone: user.phone || ''
                     });
                     const cropsData = await fetchCrops(contract, false);
                     setCrops(cropsData);
                 }
             } catch (err) {
                 setLocalError(err.message);
                 console.error(err);
             } finally {
                 setLoading(false);
             }
         }
     };
     checkRegistration();
 }, [contract, accountAddress]);
 const handleRegister = async (e) => {
     e.preventDefault();
     try {
         setLoading(true);
         setLocalError('');
         await registerUser(contract, formData.name, false, formData.phone);
         setIsRegistered(true);

         const user = await checkUserRegistration(contract, account);
         setUserData(user);

         const cropsData = await fetchCrops(contract, false);
         setCrops(cropsData);

         alert('Registration successful!');
     } catch (err) {
         setLocalError(err.reason || err.message || 'Registration failed');
         console.error('Registration error:', err);
     } finally {
         setLoading(false);
     }
 };

 const handleExpressInterest = async (cropId) => {
     try {
         setLoading(true);
         setLocalError('');
         await expressInterest(contract, cropId, userData.phone);
         alert('Interest expressed successfully!');
     } catch (err) {
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
         {accountAddress && (
             <p>Connected Account: {accountAddress}</p>
         )}

         {!isRegistered ? (
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
                     <p>Welcome, {userData.name}</p>
                     <p>Phone: {userData.phone}</p>
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
                                     <p>Quantity: {crop.quantity}</p>
                                     <p>Price: {ethers.formatEther(crop.expectedPrice)} ETH</p>
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

export default Trader;*/
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgriTradeContext } from '../context/AgriTrade';
import { registerUser, fetchCrops, checkUserRegistration, expressInterest } from '../Utiles/ApiFeatures';
import { ethers } from 'ethers';
import './Trader.css';

const Trader = () => {
    const navigate = useNavigate();
    const {
        account,
        contract,
        isLoading,
        error: contextError,
    } = useContext(AgriTradeContext);

    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [userData, setUserData] = useState({
        isRegistered: false,
        isFarmer: false,
        name: '',
        phone: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    // Safely get account address
    const getAccountAddress = () => {
        if (!account) return null;
        if (typeof account === 'string') return account;
        if (typeof account === 'object' && account.address) return account.address;
        return null;
    };

    const accountAddress = getAccountAddress();

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
                } catch (err) {
                    setLocalError(err.message);
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        checkRegistration();
    }, [contract, accountAddress]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!contract || !accountAddress) {
            setLocalError('Wallet not connected');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');
            await registerUser(contract, formData.name, false, formData.phone);

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
        } catch (err) {
            setLocalError(err.reason || err.message || 'Registration failed');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExpressInterest = async (cropId) => {
        if (!userData.phone) {
            setLocalError('Phone number not available');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');
            await expressInterest(contract, cropId, userData.phone);
            alert('Interest expressed successfully!');
        } catch (err) {
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
            {accountAddress && (
                <p>Connected Account: {accountAddress}</p>
            )}

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
                                        <p>Price:₹ {ethers.formatEther(crop.expectedPrice)}</p>
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