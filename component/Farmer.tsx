// Fix: Add `?` (optional chaining) and conditional checks before using contract
// Modified the contract parameter type in utility function calls to avoid passing `null`

import React, { useState, useEffect, useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgriTradeContext } from '../context/AgriTrade';
import {
  registerUser,
  postCrop,
  fetchCrops,
  checkUserRegistration,
  getInterests,
  getTraderDetails,
  removeCrop
} from '../Utiles/ApiFeatures';
import { ethers, Contract } from 'ethers';
import './Farmer.css';

interface FormData {
  name: string;
  phone: string;
  cropName: string;
  location: string;
  quantity: number;
  expectedPrice: number;
  comments: string;
}

interface UserData {
  isRegistered: boolean;
  isFarmer: boolean;
  name: string;
  phone: string;
}

interface Crop {
  id: number;
  name: string;
  location: string;
  quantity: number;
  expectedPrice: number;
  comments: string;
}

interface TraderDetails {
  name: string;
  phone: string;
  address: string;
}

const Farmer: React.FC = () => {
  const navigate = useNavigate();
  const {
    account,
    contract,
    isLoading,
    error: contextError,
  } = useContext(AgriTradeContext);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    cropName: '',
    location: '',
    quantity: 0,
    expectedPrice: 0,
    comments: '',
  });

  const [localError, setLocalError] = useState<string>('');
  const [interests, setInterests] = useState<Record<number, TraderDetails[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    isRegistered: false,
    isFarmer: false,
    name: '',
    phone: ''
  });
  const [crops, setCrops] = useState<Crop[]>([]);

  const getAccountAddress = (): string | null => {
    if (!account) return null;
    if (typeof account === 'string') return account;
    if (typeof account === 'object' && 'address' in account) {
      return (account as { address: string }).address;
    }
    return null;
  };

  const accountAddress = getAccountAddress();

  useEffect(() => {
    const checkRegistration = async () => {
      if (!contract || !accountAddress) return;
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
      } catch (err: any) {
        setLocalError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkRegistration();
  }, [contract, accountAddress]);

  useEffect(() => {
    const fetchAllInterests = async () => {
      if (!contract || crops.length === 0) return;
      try {
        setLoading(true);
        const interestsData: Record<number, TraderDetails[]> = {};

        for (const crop of crops) {
          try {
            const traderAddresses = await getInterests(contract, crop.id);
            const traderDetails = await Promise.all(
              traderAddresses
                .filter(address => address)
                .map(async (address: string) => await getTraderDetails(contract, address))
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
    };
    fetchAllInterests();
  }, [contract, crops]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    try {
      setLoading(true);
      setLocalError('');
      await registerUser(contract, {
        name: formData.name,
        isFarmer: true,  // or false depending on your needs
        phone: formData.phone,
      });

      setUserData({
        isRegistered: true,
        isFarmer: true,
        name: formData.name,
        phone: formData.phone
      });

      const farmerCrops = await fetchCrops(contract, true);
      setCrops(farmerCrops);

      alert("Registration successful!");
    } catch (error: any) {
      console.error("Registration failed:", error);
      setLocalError(error.reason || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCrop = async (e: FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    try {
      setLoading(true);
      await postCrop(contract, {
        name: formData.cropName,
        location: formData.location,
        phone: userData.phone || formData.phone,
        quantity: formData.quantity,
        expectedPrice: formData.expectedPrice,
        comments: formData.comments
      });

      const updatedCrops = await fetchCrops(contract, true);
      setCrops(updatedCrops);
      alert("Crop posted successfully!");
    } catch (error: any) {
      console.error("Error posting crop:", error);
      setLocalError(error.reason || error.message || "Failed to post crop");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCrop = async (cropId: number) => {
    if (!contract) return;
    try {
      setLoading(true);
      setLocalError('');

      const confirmDelete = window.confirm("Are you sure you want to remove this crop?");
      if (!confirmDelete) return;

      await removeCrop(contract, cropId);

      const updatedCrops = await fetchCrops(contract, true);
      setCrops(updatedCrops);

      alert("Crop removed successfully!");
    } catch (error: any) {
      console.error("Error removing crop:", error);
      setLocalError(error.reason || error.message || "Failed to remove crop");
    } finally {
      setLoading(false);
    }
  };

  const renderCropCard = (crop: Crop, index: number) => (
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
      <p>
        <p>Price: ₹{crop.expectedPrice}</p>
      </p>

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

  if (isLoading) return <div className="farmer-dashboard">Loading...</div>;

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
      {accountAddress && <p>Connected Account: {accountAddress}</p>}

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
          <h2>Post New Crop</h2>
          <form onSubmit={handlePostCrop} className="crop-form">
            <div className="form-group">
              <label>Crop Name</label>
              <input
                type="text"
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                placeholder="Enter crop name"
                required
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity (kg)</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseFloat(e.target.value) })
                }
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="form-group">
              <label>Expected Price (ETH)</label>
              <input
                type="number"
                value={formData.expectedPrice}
                onChange={(e) =>
                  setFormData({ ...formData, expectedPrice: parseFloat(e.target.value) })
                }
                placeholder="Enter expected price"
                required
              />
            </div>

            <div className="form-group">
              <label>Additional Comments</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Enter any additional comments"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Crop'}
            </button>

            {localError && <p className="error">{localError}</p>}
          </form>

          <div className="crops-list">
            <h2>Your Posted Crops</h2>
            {crops.length === 0 ? (
              <p>No crops posted yet.</p>
            ) : (
              crops.map((crop, index) => renderCropCard(crop, index))
            )}
          </div>
        </div>
      )}
    </div>
  );

};

export default Farmer;
