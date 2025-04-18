import { ethers, Signer, Contract, Interface } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../context/constants';

// Ensure that CONTRACT_ABI is typed as a JsonFragment[] or Interface
const contractInterface = new Interface(CONTRACT_ABI); // Type the ABI as an Interface object

// Function to get the contract instance
export const getContract = async (signer: Signer): Promise<Contract> => {
    return new ethers.Contract(CONTRACT_ADDRESS, contractInterface, signer); // Use Interface here
};

//
interface Account {
    address: string;
}
// Register user function
interface RegisterUserParams {
    name: string;
    isFarmer: boolean;
    phone: string;
}
interface Interest {
    traderAddress: string;
}
export const registerUser = async (
    contract: Contract | null,
    { name, isFarmer, phone }: RegisterUserParams
): Promise<ethers.ContractTransaction> => {
    if (!contract) {
        throw new Error("Contract not initialized");
    }
    const tx = await contract.registerUser(name, isFarmer, phone);
    await tx.wait();
    return tx;
};

// Post crop function
interface CropData {
    name: string;
    location: string;
    phone: string;
    quantity: number;
    expectedPrice: number;
    comments: string;
}
export const postCrop = async (contract: Contract, cropData: CropData): Promise<ethers.ContractTransaction> => {
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

// Fetch crops function
export const fetchCrops = async (contract: Contract, isFarmer: boolean): Promise<any[]> => {
    return await contract.getCrops();
};

// Express interest function
export const expressInterest = async (contract: Contract, cropId: number, phone: string): Promise<ethers.ContractTransaction> => {
    const tx = await contract.expressInterest(cropId, phone);
    await tx.wait();
    return tx;
};

// Approve trader function
export const approveTrader = async (contract: Contract, cropId: number, traderAddress: string): Promise<ethers.ContractTransaction> => {
    const tx = await contract.approveTrader(cropId, traderAddress);
    await tx.wait();
    return tx;
};

// Remove crop function
export const removeCrop = async (contract: Contract, cropId: number): Promise<ethers.ContractTransaction> => {
    const tx = await contract.removeCrop(cropId);
    await tx.wait();
    return tx;
};

// Check if the user is registered
export const checkUserRegistration = async (contract: Contract, address: string) => {
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

// Get interests for a crop
export const getInterests = async (contract: Contract, cropId: number): Promise<string[]> => {
    try {
        // Get interests for the crop
        const interests = await contract.getInterests(cropId);

        // Map over interests and type the `interest` parameter
        return interests.map((interest: Interest) => interest.traderAddress);
    } catch (error) {
        console.error("Error getting interests:", error);
        throw error;
    }
};

// Get trader details
export const getTraderDetails = async (contract: Contract, traderAddress: string) => {
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
