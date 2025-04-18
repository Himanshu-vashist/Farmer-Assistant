import AgriTrade from './AgriTrade.json';
import { JsonFragment } from 'ethers';

// Define types for the contract address and ABI
export const CONTRACT_ADDRESS: string = "0x9C121213bcc190a92B3d17a84B34fbbc3a4316D9";

// Cast the ABI to JsonFragment[] (which ethers.Interface expects)
export const CONTRACT_ABI: JsonFragment[] = AgriTrade.abi as JsonFragment[];
