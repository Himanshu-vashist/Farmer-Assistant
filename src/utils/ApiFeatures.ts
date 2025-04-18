import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../services/constants';

// Define types for our contract interactions
interface CropData {
    name: string;
    location: string;
    phone: string;
    quantity: string;
    expectedPrice: string;
    comments: string;
}

interface UserData {
    isRegistered: boolean;
    name: string;
    isFarmer: boolean;
    phone: string;
}

interface TraderData {
    name: string;
    phone: string;
    isFarmer: boolean;
    address: string;
}

export const getContract = async (signer: ethers.Signer): Promise<ethers.Contract> => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};


export const registerUser = async (
    contract: ethers.Contract,
    name: string,
    isFarmer: boolean,
    phone: string
): Promise<ethers.ContractTransactionResponse> => {
    if (!contract) {
        throw new Error("Contract not initialized");
    }
    const tx = await contract.registerUser(name, isFarmer, phone);
    await tx.wait();
    return tx;
};

export const postCrop = async (
    contract: ethers.Contract,
    cropData: CropData
): Promise<ethers.ContractTransactionResponse> => {
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

export const fetchCrops = async (
    contract: ethers.Contract,
    _isFarmer: boolean // Prefixed with underscore to indicate it's not used
): Promise<any[]> => {
    return await contract.getCrops();
};

export const expressInterest = async (
    contract: ethers.Contract,
    cropId: string,
    phone: string
): Promise<ethers.ContractTransactionResponse> => {
    const tx = await contract.expressInterest(cropId, phone);
    await tx.wait();
    return tx;
};

export const approveTrader = async (
    contract: ethers.Contract,
    cropId: string,
    traderAddress: string
): Promise<ethers.ContractTransactionResponse> => {
    const tx = await contract.approveTrader(cropId, traderAddress);
    await tx.wait();
    return tx;
};

export const removeCrop = async (
    contract: ethers.Contract,
    cropId: string
): Promise<ethers.ContractTransactionResponse> => {
    const tx = await contract.removeCrop(cropId);
    await tx.wait();
    return tx;
};

export const checkUserRegistration = async (
    contract: ethers.Contract,
    address: string
): Promise<UserData> => {
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

export const getInterests = async (
    contract: ethers.Contract,
    cropId: string
): Promise<string[]> => {
    try {
        const interests = await contract.getInterests(cropId);
        return interests.map((interest: any) => interest.traderAddress);
    } catch (error: any) {
        console.error("Error getting interests:", error);

        // Check if this is the permission error
        if (error.reason && error.reason.includes("Only crop owner")) {
            // Return empty array instead of throwing error
            console.log(`No permission to view interests for crop ${cropId}, returning empty array`);
            return [];
        }

        // For other errors, still throw
        throw error;
    }
};

// Function to get trader details
export const getTraderDetails = async (
    contract: ethers.Contract,
    traderAddress: string
): Promise<TraderData> => {
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