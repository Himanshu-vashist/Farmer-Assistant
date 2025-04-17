import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../context/constants';

export const getContract = async (signer) => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};


export const registerUser = async (contract, name, isFarmer, phone) => {
    if (!contract) {
        throw new Error("Contract not initialized");
    }
    const tx = await contract.registerUser(name, isFarmer, phone);
    await tx.wait();
    return tx;
};
export const postCrop = async (contract, cropData) => {
    const tx = await contract.postCrop(
        cropData.name,
        cropData.location,
        cropData.phone,
        cropData.quantity,
        cropData.expectedPrice,
        cropData.comments
    );
    await tx.wait();
    return tx;
};

export const fetchCrops = async (contract, isFarmer) => {
    return await contract.getCrops();
};

export const expressInterest = async (contract, cropId, phone) => {
    const tx = await contract.expressInterest(cropId, phone);
    await tx.wait();
    return tx;
};

export const approveTrader = async (contract, cropId, traderAddress) => {
    const tx = await contract.approveTrader(cropId, traderAddress);
    await tx.wait();
    return tx;
};

export const removeCrop = async (contract, cropId) => {
    const tx = await contract.removeCrop(cropId);
    await tx.wait();
    return tx;
};

/*export const getInterests = async (contract, cropId) => {
    try {
        // Make sure we're only getting the addresses
        const interests = await contract.getInterests(cropId);
        return interests.map(interest => interest.trader); // Extract just the address
    } catch (error) {
        console.error("Error getting interests:", error);
        throw error;
    }
};

*/
export const checkUserRegistration = async (contract, address) => {
    try {
        const user = await contract.users(address);
        return {
            isRegistered: user && user.name !== '',
            name: user.name,
            isFarmer: user.isFarmer,
            phone: user.phone
        };
    } catch (error) {
        console.error("Error checking user registration:", error);
        throw error;
    }
};
export const getInterests = async (contract, cropId) => {
    try {
        const interests = await contract.getInterests(cropId);
        return interests.map(interest => interest.traderAddress); // ✅ correct field name
    } catch (error) {
        console.error("Error getting interests:", error);
        throw error;
    }
};

//
// Add this new function to get trader details

export const getTraderDetails = async (contract, traderAddress) => {
    try {
        const trader = await contract.users(traderAddress);
        return {
            name: trader.name,
            phone: trader.phone,
            isFarmer: trader.isFarmer,
            address: traderAddress
        };
    } catch (error) {
        console.error("Error getting trader details:", error);
        throw error;
    }
};
