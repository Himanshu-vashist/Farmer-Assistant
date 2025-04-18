import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, SafeAreaView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import theme from '../theme/theme';
import { AgriTradeContext } from '../services/AgriTrade';
import { registerUser, fetchCrops, checkUserRegistration, expressInterest } from '../utils/ApiFeatures';
import { ethers } from 'ethers';

interface CropData {
  id: string;
  name: string;
  location: string;
  quantity: string;
  expectedPrice: string;
  comments: string;
  farmerAddress: string;
}

const TraderScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        account,
        contract,
        isLoading: contextLoading,
        error: contextError,
    } = useContext(AgriTradeContext);

    const [crops, setCrops] = useState<CropData[]>([]);
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
    const [activeTab, setActiveTab] = useState<'profile' | 'marketplace'>('marketplace');

    // For development/testing when blockchain is not available
    const useMockData = true;

    // Mock data for UI development
    const mockCrops: CropData[] = [
        {
            id: '1',
            name: 'Rice',
            location: 'Punjab',
            quantity: '500',
            expectedPrice: '2500',
            comments: 'High quality basmati rice',
            farmerAddress: '0x1234...5678'
        },
        {
            id: '2',
            name: 'Wheat',
            location: 'Haryana',
            quantity: '1000',
            expectedPrice: '1800',
            comments: 'Organic wheat, no pesticides used',
            farmerAddress: '0x8765...4321'
        },
        {
            id: '3',
            name: 'Cotton',
            location: 'Gujarat',
            quantity: '300',
            expectedPrice: '5000',
            comments: 'Premium quality cotton',
            farmerAddress: '0x5678...1234'
        }
    ];

    // Use mock data if blockchain is not available
    useEffect(() => {
        if (useMockData) {
            setCrops(mockCrops);
            setUserData({
                isRegistered: true,
                isFarmer: false,
                name: 'Demo Trader',
                phone: '9876543210'
            });
        }
    }, [useMockData]);

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

    const handleRegister = async () => {
        if (!contract || !accountAddress) {
            setLocalError('Wallet not connected');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');

            // Validate inputs
            if (!formData.name.trim()) {
                throw new Error('Please enter your name');
            }
            if (!formData.phone.trim()) {
                throw new Error('Please enter your phone number');
            }

            if (useMockData) {
                // Simulate registration with mock data
                setTimeout(() => {
                    setUserData({
                        isRegistered: true,
                        isFarmer: false,
                        name: formData.name,
                        phone: formData.phone
                    });
                    Alert.alert(
                        "Registration Successful",
                        "You have been registered as a Trader. You can now browse available crops and express interest.",
                        [
                            {
                                text: "OK",
                                onPress: () => setActiveTab('profile')
                            }
                        ]
                    );
                    setLoading(false);
                }, 1000);
                return;
            }

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

            Alert.alert(
                "Registration Successful",
                "You have been registered as a Trader. You can now browse available crops and express interest.",
                [
                    {
                        text: "OK",
                        onPress: () => setActiveTab('profile')
                    }
                ]
            );
        } catch (err: any) {
            setLocalError(err.reason || err.message || 'Registration failed');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExpressInterest = async (cropId: string) => {
        if (!userData.phone) {
            setLocalError('Phone number not available');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');

            if (useMockData) {
                // Simulate expressing interest with mock data
                setTimeout(() => {
                    Alert.alert('Success', 'Interest expressed successfully!');
                    setLoading(false);
                }, 1000);
                return;
            }

            if (!contract) {
                throw new Error('Contract not initialized');
            }

            await expressInterest(contract, cropId, userData.phone);
            Alert.alert('Success', 'Interest expressed successfully!');
        } catch (err: any) {
            setLocalError(err.reason || err.message || 'Failed to express interest');
            console.error('Interest error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || contextLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (localError.includes('registered as a farmer')) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
                    <Text style={styles.errorTitle}>Access Denied</Text>
                    <Text style={styles.errorMessage}>This wallet address is already registered as a farmer. You cannot access the trader screen with this wallet.</Text>
                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[theme.colors.secondaryDark, theme.colors.secondary]}
                style={styles.headerGradient}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Trader Dashboard</Text>
                {accountAddress && (
                    <View style={styles.accountBadge}>
                        <Ionicons name="person-circle" size={16} color="white" />
                        <Text style={styles.accountText}>
                            {accountAddress.substring(0, 6)}...{accountAddress.substring(accountAddress.length - 4)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'marketplace' && styles.activeTabButton]}
                    onPress={() => setActiveTab('marketplace')}
                >
                    <Ionicons
                        name="basket-outline"
                        size={20}
                        color={activeTab === 'marketplace' ? theme.colors.secondary : theme.colors.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'marketplace' && styles.activeTabText]}>Marketplace</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
                    onPress={() => setActiveTab('profile')}
                >
                    <Ionicons
                        name="person-outline"
                        size={20}
                        color={activeTab === 'profile' ? theme.colors.secondary : theme.colors.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {!userData.isRegistered ? (
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.registrationCard}>
                        <Text style={styles.cardTitle}>Register as Trader</Text>
                        <Text style={styles.cardSubtitle}>Please provide your details to register</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Your Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Enter your full name"
                                placeholderTextColor={theme.colors.textLight}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="Enter your phone number"
                                placeholderTextColor={theme.colors.textLight}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>Register</Text>
                            )}
                        </TouchableOpacity>

                        {localError ? (
                            <View style={styles.formError}>
                                <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                                <Text style={styles.formErrorText}>{localError}</Text>
                            </View>
                        ) : null}
                    </Animated.View>
                ) : (
                    <>
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.profileCard}>
                                <View style={styles.profileHeader}>
                                    <View style={styles.profileAvatar}>
                                        <Ionicons name="person" size={40} color={theme.colors.secondary} />
                                    </View>
                                    <View style={styles.profileInfo}>
                                        <Text style={styles.profileName}>{userData.name || 'Trader'}</Text>
                                        {userData.phone && (
                                            <View style={styles.profileDetail}>
                                                <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
                                                <Text style={styles.profileDetailText}>{userData.phone}</Text>
                                            </View>
                                        )}
                                        <View style={styles.profileDetail}>
                                            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                                            <Text style={styles.profileDetailText}>Verified Trader</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>{crops.length}</Text>
                                        <Text style={styles.statLabel}>Available Crops</Text>
                                    </View>
                                </View>
                            </Animated.View>
                        )}

                        {/* Marketplace Tab */}
                        {activeTab === 'marketplace' && (
                            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.marketplaceContainer}>
                                {crops.length > 0 ? (
                                    crops.map((crop, index) => (
                                        <View key={index} style={styles.cropCard}>
                                            <View style={styles.cropHeader}>
                                                <Text style={styles.cropName}>{crop.name}</Text>
                                                <View style={styles.cropBadge}>
                                                    <Text style={styles.cropBadgeText}>Available</Text>
                                                </View>
                                            </View>

                                            <View style={styles.cropDetails}>
                                                <View style={styles.cropDetail}>
                                                    <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                                                    <Text style={styles.cropDetailText}>{crop.location}</Text>
                                                </View>

                                                <View style={styles.cropDetail}>
                                                    <Ionicons name="basket-outline" size={16} color={theme.colors.textSecondary} />
                                                    <Text style={styles.cropDetailText}>{crop.quantity} kg</Text>
                                                </View>

                                                <View style={styles.cropDetail}>
                                                    <Ionicons name="cash-outline" size={16} color={theme.colors.textSecondary} />
                                                    <Text style={styles.cropDetailText}>₹{crop.expectedPrice}</Text>
                                                </View>

                                                <View style={styles.cropDetail}>
                                                    <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                                                    <Text style={styles.cropDetailText}>Farmer: {crop.farmerAddress.substring(0, 10)}...</Text>
                                                </View>

                                                {crop.comments && (
                                                    <View style={styles.cropComments}>
                                                        <Text style={styles.cropCommentsText}>{crop.comments}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                style={[styles.interestButton, loading && styles.disabledButton]}
                                                onPress={() => handleExpressInterest(crop.id)}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator size="small" color="white" />
                                                ) : (
                                                    <>
                                                        <Ionicons name="hand-right-outline" size={18} color="white" style={styles.interestIcon} />
                                                        <Text style={styles.interestButtonText}>Express Interest</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyCrops}>
                                        <Ionicons name="basket" size={60} color={theme.colors.textLight} />
                                        <Text style={styles.emptyTitle}>No Crops Available</Text>
                                        <Text style={styles.emptySubtitle}>Check back later for new crop listings</Text>
                                    </View>
                                )}
                            </Animated.View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: theme.colors.text,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 16,
    },
    errorMessage: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    errorButton: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    accountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
    },
    accountText: {
        color: 'white',
        fontSize: 12,
        marginLeft: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: -8,
        ...theme.shadows.md,
        zIndex: 10,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        borderBottomColor: theme.colors.secondary,
    },
    tabText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    activeTabText: {
        color: theme.colors.secondary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingTop: 24,
    },
    registrationCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        ...theme.shadows.md,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 20,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 6,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    submitButton: {
        backgroundColor: theme.colors.secondary,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    formError: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
    formErrorText: {
        color: theme.colors.error,
        marginLeft: 8,
        flex: 1,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows.md,
    },
    profileHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    profileAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    profileDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    profileDetailText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: 6,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        padding: 16,
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.secondary,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    marketplaceContainer: {
        marginBottom: 16,
    },
    cropCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows.md,
    },
    cropHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cropName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    cropBadge: {
        backgroundColor: theme.colors.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    cropBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    cropDetails: {
        marginBottom: 16,
    },
    cropDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cropDetailText: {
        fontSize: 14,
        color: theme.colors.text,
        marginLeft: 8,
    },
    cropComments: {
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    cropCommentsText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    interestButton: {
        backgroundColor: theme.colors.secondary,
        borderRadius: 8,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    interestIcon: {
        marginRight: 8,
    },
    interestButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyCrops: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
});

export default TraderScreen;