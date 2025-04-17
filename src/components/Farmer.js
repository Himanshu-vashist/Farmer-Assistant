/*import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgriTradeContext } from '../context/AgriTrade';
import { registerUser, postCrop, fetchCrops, checkUserRegistration, getInterests, getTraderDetails, removeCrop } from '../Utiles/ApiFeatures';
//import { registerUser, postCrop, fetchCrops, checkUserRegistration } from '../Utiles/ApiFeatures';
import { ethers } from 'ethers';
import './Farmer.css';

const Farmer = () => {
    const navigate = useNavigate();
    const {
        account,
        contract,
        isLoading,
        error: contextError,
    } = useContext(AgriTradeContext);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cropName: '',
        location: '',
        quantity: '',
        expectedPrice: '',
        comments: '',
    });

    const [localError, setLocalError] = useState('');
    const [interests, setInterests] = useState({});
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        isRegistered: false,
        isFarmer: false,
        name: '',
        phone: ''
    });
    const [crops, setCrops] = useState([]);

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
                        if (!user.isFarmer) {
                            throw new Error('This address is registered as a trader');
                        }
                        setUserData({
                            isRegistered: true,
                            isFarmer: true,
                            name: user.name || formData.name,
                            phone: user.phone || formData.phone
                        });
                        const farmerCrops = await fetchCrops(contract, true);
                        setCrops(farmerCrops);
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

    useEffect(() => {
        const fetchAllInterests = async () => {
            if (contract && crops.length > 0) {
                try {
                    setLoading(true);
                    const interestsData = {};

                    for (const crop of crops) {
                        try {
                            // Get just the trader addresses
                            const traderAddresses = await getInterests(contract, crop.id);

                            // Get details for each trader
                            
                            const traderDetails = await Promise.all(
                                traderAddresses
                                    .filter(address => address) // filters out null/undefined
                                    .map(async (address) => {
                                        return await getTraderDetails(contract, address);
                                    })
                            );


                            interestsData[crop.id] = traderDetails;
                        } catch (error) {
                            console.error(`Error fetching interests for crop ${crop.id}:`, error);
                            interestsData[crop.id] = []; // Set empty array if error occurs
                        }
                    }

                    setInterests(interestsData);
                } catch (error) {
                    console.error("Error fetching interests:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAllInterests();
    }, [contract, crops]);
    
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setLocalError('');
            await registerUser(contract, formData.name, true, formData.phone);

            // Update user data with registration info
            setUserData({
                isRegistered: true,
                isFarmer: true,
                name: formData.name,
                phone: formData.phone
            });

            const farmerCrops = await fetchCrops(contract, true);
            setCrops(farmerCrops);

            alert("Registration successful!");
        } catch (error) {
            console.error("Registration failed:", error);
            setLocalError(error.reason || error.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePostCrop = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await postCrop(contract, {
                name: formData.cropName,
                location: formData.location,
                phone: userData.phone || formData.phone,
                quantity: formData.quantity,
                expectedPrice: ethers.parseEther(formData.expectedPrice.toString()),
                comments: formData.comments
            });

            const updatedCrops = await fetchCrops(contract, true);
            setCrops(updatedCrops);
            alert("Crop posted successfully!");
        } catch (error) {
            console.error("Error posting crop:", error);
            setLocalError(error.reason || error.message || "Failed to post crop");
        } finally {
            setLoading(false);
        }
    };
    const handleRemoveCrop = async (cropId) => {
        try {
            setLoading(true);
            setLocalError('');

            // Confirm deletion with user
            const confirmDelete = window.confirm("Are you sure you want to remove this crop?");
            if (!confirmDelete) return;

            await removeCrop(contract, cropId);

            // Refresh crops list after removal
            const updatedCrops = await fetchCrops(contract, true);
            setCrops(updatedCrops);

            alert("Crop removed successfully!");
        } catch (error) {
            console.error("Error removing crop:", error);
            setLocalError(error.reason || error.message || "Failed to remove crop");
        } finally {
            setLoading(false);
        }
    };
    if (isLoading) {
        return <div className="farmer-dashboard">Loading...</div>;
    }

    if (localError.includes('registered as a trader')) {
        return (
            <div className="farmer-dashboard">
                <h1>Access Denied</h1>
                <p className="error">{localError}</p>
                <button onClick={() => navigate('/')}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="farmer-dashboard">
            <h1>Farmer Dashboard</h1>
            {accountAddress && (
                <p>Connected Account: {accountAddress}</p>
            )}

            {!userData.isRegistered ? (
                <div className="registration-section">
                    <h2>Register as Farmer</h2>
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
                        <p>Welcome, {userData.name || 'Farmer'}</p>
                        {userData.phone && <p>Phone: {userData.phone}</p>}
                    </div>

                    <form onSubmit={handlePostCrop} className="crop-form">
                        <h2>Post New Crop</h2>
                        <input
                            value={formData.cropName}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                            placeholder="Crop Name"
                            required
                        />
                        <input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Location"
                            required
                        />
                        <input
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="Quantity in KG"
                            type="number"
                            required
                        />
                        <input
                            value={formData.expectedPrice}
                            onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                            placeholder="Expected Price in Rupee"
                            type="number"
                            step="0.0001"
                            required
                        />
                        <textarea
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            placeholder="Additional Comments"
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Crop'}
                        </button>
                        {localError && <p className="error">{localError}</p>}
                    </form>

                    <div className="crops-section">
                        <h2>Your Crops</h2>
                        {loading ? (
                            <p>Loading crops...</p>
                        ) : crops.length > 0 ? (
                            <div className="crops-list">
                                {crops.map((crop, index) => (
                                    <div key={index} className="crop-card">
                                        <h3>{crop.name}</h3>
                                        <p>Location: {crop.location}</p>
                                        <p>Quantity: {crop.quantity}</p>
                                        <p>Price: ₹{ethers.formatEther(crop.expectedPrice)} </p>
                                        <p>Comments: {crop.comments}</p>
                                        {interests[crop.id]?.length > 0 && (
                                            <div className="interested-traders">
                                                <h4>Interested Traders:</h4>
                                                <ul>
                                                    {interests[crop.id].map((trader, i) => (
                                                        <li key={i}>
                                                            <p>Name: {trader.name}</p>
                                                            <p>Phone: {trader.phone}</p>
                                                            <p>Address: {trader.address}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No crops posted yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Farmer;
*/
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgriTradeContext } from '../context/AgriTrade';
import { registerUser, postCrop, fetchCrops, checkUserRegistration, getInterests, getTraderDetails, removeCrop } from '../Utiles/ApiFeatures';
import { ethers } from 'ethers';
import './Farmer.css';

const Farmer = () => {
    const navigate = useNavigate();
    const {
        account,
        contract,
        isLoading,
        error: contextError,
    } = useContext(AgriTradeContext);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cropName: '',
        location: '',
        quantity: '',
        expectedPrice: '',
        comments: '',
    });

    const [localError, setLocalError] = useState('');
    const [interests, setInterests] = useState({});
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        isRegistered: false,
        isFarmer: false,
        name: '',
        phone: ''
    });
    const [crops, setCrops] = useState([]);

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
                        if (!user.isFarmer) {
                            throw new Error('This address is registered as a trader');
                        }
                        setUserData({
                            isRegistered: true,
                            isFarmer: true,
                            name: user.name || formData.name,
                            phone: user.phone || formData.phone
                        });
                        const farmerCrops = await fetchCrops(contract, true);
                        setCrops(farmerCrops);
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

    useEffect(() => {
        const fetchAllInterests = async () => {
            if (contract && crops.length > 0) {
                try {
                    setLoading(true);
                    const interestsData = {};

                    for (const crop of crops) {
                        try {
                            const traderAddresses = await getInterests(contract, crop.id);
                            const traderDetails = await Promise.all(
                                traderAddresses
                                    .filter(address => address)
                                    .map(async (address) => {
                                        return await getTraderDetails(contract, address);
                                    })
                            );
                            interestsData[crop.id] = traderDetails;
                        } catch (error) {
                            console.error(`Error fetching interests for crop ${crop.id}:`, error);
                            interestsData[crop.id] = [];
                        }
                    }

                    setInterests(interestsData);
                } catch (error) {
                    console.error("Error fetching interests:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAllInterests();
    }, [contract, crops]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setLocalError('');
            await registerUser(contract, formData.name, true, formData.phone);

            setUserData({
                isRegistered: true,
                isFarmer: true,
                name: formData.name,
                phone: formData.phone
            });

            const farmerCrops = await fetchCrops(contract, true);
            setCrops(farmerCrops);

            alert("Registration successful!");
        } catch (error) {
            console.error("Registration failed:", error);
            setLocalError(error.reason || error.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePostCrop = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await postCrop(contract, {
                name: formData.cropName,
                location: formData.location,
                phone: userData.phone || formData.phone,
                quantity: formData.quantity,
                expectedPrice: ethers.parseEther(formData.expectedPrice.toString()),
                comments: formData.comments
            });

            const updatedCrops = await fetchCrops(contract, true);
            setCrops(updatedCrops);
            alert("Crop posted successfully!");
        } catch (error) {
            console.error("Error posting crop:", error);
            setLocalError(error.reason || error.message || "Failed to post crop");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCrop = async (cropId) => {
        try {
            setLoading(true);
            setLocalError('');

            const confirmDelete = window.confirm("Are you sure you want to remove this crop?");
            if (!confirmDelete) return;

            await removeCrop(contract, cropId);

            const updatedCrops = await fetchCrops(contract, true);
            setCrops(updatedCrops);

            alert("Crop removed successfully!");
        } catch (error) {
            console.error("Error removing crop:", error);
            setLocalError(error.reason || error.message || "Failed to remove crop");
        } finally {
            setLoading(false);
        }
    };

    const renderCropCard = (crop, index) => (
        <div key={index} className="crop-card">
            <div className="crop-header">
                <h3>{crop.name}</h3>
                <button
                    className="delete-btn"
                    onClick={() => handleRemoveCrop(crop.id)}
                    disabled={loading}
                >
                    {loading ? 'Removing...' : 'Remove'}
                </button>
            </div>
            <p>Location: {crop.location}</p>
            <p>Quantity: {crop.quantity} KG</p>
            <p>Price: ₹{ethers.formatEther(crop.expectedPrice)}</p>
            <p>Comments: {crop.comments}</p>

            {interests[crop.id]?.length > 0 && (
                <div className="interested-traders">
                    <h4>Interested Traders:</h4>
                    <ul>
                        {interests[crop.id].map((trader, i) => (
                            <li key={i}>
                                <p>Name: {trader.name}</p>
                                <p>Phone: {trader.phone}</p>
                                <p>Address: {trader.address}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    if (isLoading) {
        return <div className="farmer-dashboard">Loading...</div>;
    }

    if (localError.includes('registered as a trader')) {
        return (
            <div className="farmer-dashboard">
                <h1>Access Denied</h1>
                <p className="error">{localError}</p>
                <button onClick={() => navigate('/')}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="farmer-dashboard">
            <h1>Farmer Dashboard</h1>
            {accountAddress && (
                <p>Connected Account: {accountAddress}</p>
            )}

            {!userData.isRegistered ? (
                <div className="registration-section">
                    <h2>Register as Farmer</h2>
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
                        <p>Welcome, {userData.name || 'Farmer'}</p>
                        {userData.phone && <p>Phone: {userData.phone}</p>}
                    </div>

                    <form onSubmit={handlePostCrop} className="crop-form">
                        <h2>Post New Crop</h2>
                        <input
                            value={formData.cropName}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                            placeholder="Crop Name"
                            required
                        />
                        <input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Location"
                            required
                        />
                        <input
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="Quantity in KG"
                            type="number"
                            required
                        />
                        <input
                            value={formData.expectedPrice}
                            onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                            placeholder="Expected Price in Rupee"
                            type="number"
                            step="0.0001"
                            required
                        />
                        <textarea
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            placeholder="Additional Comments"
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Crop'}
                        </button>
                        {localError && <p className="error">{localError}</p>}
                    </form>

                    <div className="crops-section">
                        <h2>Your Crops</h2>
                        {loading ? (
                            <p>Loading crops...</p>
                        ) : crops.length > 0 ? (
                            <div className="crops-list">
                                {crops.map((crop, index) => renderCropCard(crop, index))}
                            </div>
                        ) : (
                            <p>No crops posted yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Farmer;
