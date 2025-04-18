import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, SafeAreaView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import theme from '../theme/theme';
import { AgriTradeContext } from '../services/AgriTrade';
import { registerUser, postCrop, fetchCrops, checkUserRegistration, getInterests, getTraderDetails } from '../utils/ApiFeatures';
import { ethers } from 'ethers';

interface CropData {
  id: string;
  name: string;
  location: string;
  quantity: string;
  expectedPrice: string;
  comments: string;
}

interface TraderData {
  name: string;
  phone: string;
  address: string;
}

interface InterestsData {
  [cropId: string]: TraderData[];
}

const FarmerScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    account,
    contract,
    isLoading: contextLoading,
    error: contextError
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
  const [interests, setInterests] = useState<InterestsData>({});
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    isRegistered: false,
    isFarmer: false,
    name: '',
    phone: ''
  });
  const [crops, setCrops] = useState<CropData[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'crops' | 'post'>('profile');

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
      comments: 'High quality basmati rice'
    },
    {
      id: '2',
      name: 'Wheat',
      location: 'Haryana',
      quantity: '1000',
      expectedPrice: '1800',
      comments: 'Organic wheat, no pesticides used'
    },
    {
      id: '3',
      name: 'Cotton',
      location: 'Gujarat',
      quantity: '300',
      expectedPrice: '5000',
      comments: 'Premium quality cotton'
    }
  ];

  const mockInterests: InterestsData = {
    '1': [
      { name: 'Trader 1', phone: '9876543210', address: '0x1234...5678' },
      { name: 'Trader 2', phone: '8765432109', address: '0x8765...4321' }
    ],
    '2': [
      { name: 'Trader 3', phone: '7654321098', address: '0x5678...1234' }
    ]
  };

  // Use mock data if blockchain is not available
  useEffect(() => {
    if (useMockData) {
      setCrops(mockCrops);
      setInterests(mockInterests);
      setUserData({
        isRegistered: true,
        isFarmer: true,
        name: 'Demo Farmer',
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
                            /*
                            const traderDetails = await Promise.all(
                                traderAddresses.map(async (address) => {
                                    return await getTraderDetails(contract, address);
                                })
                            );*/
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
    //
    const handleRegister = async () => {
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

            if (!contract) {
                throw new Error('Contract not initialized');
            }

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

            Alert.alert(
                "Registration Successful",
                "You have been registered as a Farmer. You can now post crops and view interested traders.",
                [
                    {
                        text: "OK",
                        onPress: () => setActiveTab('profile')
                    }
                ]
            );
        } catch (error: any) {
            console.error("Registration failed:", error);
            setLocalError(error.reason || error.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePostCrop = async () => {
        try {
            setLoading(true);

            if (!contract) {
                throw new Error('Contract not initialized');
            }

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
            Alert.alert("Success", "Crop posted successfully!");
        } catch (error: any) {
            console.error("Error posting crop:", error);
            setLocalError(error.reason || error.message || "Failed to post crop");
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

    if (localError.includes('registered as a trader')) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
                    <Text style={styles.errorTitle}>Access Denied</Text>
                    <Text style={styles.errorMessage}>This wallet address is already registered as a trader. You cannot access the farmer screen with this wallet.</Text>
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
                colors={[theme.colors.primaryDark, theme.colors.primary]}
                style={styles.headerGradient}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Farmer Dashboard</Text>
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
                    style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
                    onPress={() => setActiveTab('profile')}
                >
                    <Ionicons
                        name="person-outline"
                        size={20}
                        color={activeTab === 'profile' ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'crops' && styles.activeTabButton]}
                    onPress={() => setActiveTab('crops')}
                >
                    <Ionicons
                        name="leaf-outline"
                        size={20}
                        color={activeTab === 'crops' ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'crops' && styles.activeTabText]}>My Crops</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'post' && styles.activeTabButton]}
                    onPress={() => setActiveTab('post')}
                >
                    <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={activeTab === 'post' ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'post' && styles.activeTabText]}>Post Crop</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {!userData.isRegistered ? (
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.registrationCard}>
                        <Text style={styles.cardTitle}>Register as Farmer</Text>
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
                                        <Ionicons name="person" size={40} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.profileInfo}>
                                        <Text style={styles.profileName}>{userData.name || 'Farmer'}</Text>
                                        {userData.phone && (
                                            <View style={styles.profileDetail}>
                                                <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
                                                <Text style={styles.profileDetailText}>{userData.phone}</Text>
                                            </View>
                                        )}
                                        <View style={styles.profileDetail}>
                                            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                                            <Text style={styles.profileDetailText}>Verified Farmer</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>{crops.length}</Text>
                                        <Text style={styles.statLabel}>Crops Posted</Text>
                                    </View>

                                    <View style={styles.statDivider} />

                                    <View style={styles.statItem}>
                                        <Text style={styles.statNumber}>
                                            {Object.values(interests).reduce((total, traders) => total + traders.length, 0)}
                                        </Text>
                                        <Text style={styles.statLabel}>Interested Traders</Text>
                                    </View>
                                </View>
                            </Animated.View>
                        )}

                        {/* Crops Tab */}
                        {activeTab === 'crops' && (
                            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.cropsContainer}>
                                {crops.length > 0 ? (
                                    crops.map((crop, index) => (
                                        <View key={index} style={styles.cropCard}>
                                            <View style={styles.cropHeader}>
                                                <Text style={styles.cropName}>{crop.name}</Text>
                                                <View style={styles.cropBadge}>
                                                    <Text style={styles.cropBadgeText}>Active</Text>
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

                                                {crop.comments && (
                                                    <View style={styles.cropComments}>
                                                        <Text style={styles.cropCommentsText}>{crop.comments}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {interests[crop.id]?.length > 0 && (
                                                <View style={styles.interestedTraders}>
                                                    <Text style={styles.interestedTitle}>
                                                        Interested Traders ({interests[crop.id].length})
                                                    </Text>

                                                    {interests[crop.id].map((trader, i) => (
                                                        <View key={i} style={styles.traderItem}>
                                                            <View style={styles.traderIcon}>
                                                                <Ionicons name="person-circle" size={36} color={theme.colors.primary} />
                                                            </View>
                                                            <View style={styles.traderInfo}>
                                                                <Text style={styles.traderName}>{trader.name}</Text>
                                                                <View style={styles.traderDetail}>
                                                                    <Ionicons name="call-outline" size={12} color={theme.colors.textSecondary} />
                                                                    <Text style={styles.traderDetailText}>{trader.phone}</Text>
                                                                </View>
                                                                <View style={styles.traderDetail}>
                                                                    <Ionicons name="wallet-outline" size={12} color={theme.colors.textSecondary} />
                                                                    <Text style={styles.traderDetailText}>{trader.address.substring(0, 10)}...</Text>
                                                                </View>
                                                            </View>
                                                            <TouchableOpacity style={styles.contactButton}>
                                                                <Ionicons name="chatbubble-outline" size={20} color="white" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyCrops}>
                                        <Ionicons name="leaf" size={60} color={theme.colors.textLight} />
                                        <Text style={styles.emptyTitle}>No Crops Posted</Text>
                                        <Text style={styles.emptySubtitle}>Post your first crop to get started</Text>
                                        <TouchableOpacity
                                            style={styles.emptyButton}
                                            onPress={() => setActiveTab('post')}
                                        >
                                            <Text style={styles.emptyButtonText}>Post a Crop</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </Animated.View>
                        )}

                        {/* Post Crop Tab */}
                        {activeTab === 'post' && (
                            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.postCropCard}>
                                <Text style={styles.cardTitle}>Post New Crop</Text>
                                <Text style={styles.cardSubtitle}>Enter details about your crop</Text>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Crop Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.cropName}
                                        onChangeText={(text) => setFormData({ ...formData, cropName: text })}
                                        placeholder="Enter crop name"
                                        placeholderTextColor={theme.colors.textLight}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Location</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.location}
                                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                                        placeholder="Enter location"
                                        placeholderTextColor={theme.colors.textLight}
                                    />
                                </View>

                                <View style={styles.formRow}>
                                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                                        <Text style={styles.label}>Quantity (kg)</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.quantity}
                                            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                                            placeholder="Enter quantity"
                                            placeholderTextColor={theme.colors.textLight}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.label}>Price (₹)</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.expectedPrice}
                                            onChangeText={(text) => setFormData({ ...formData, expectedPrice: text })}
                                            placeholder="Enter price"
                                            placeholderTextColor={theme.colors.textLight}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Additional Comments</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={formData.comments}
                                        onChangeText={(text) => setFormData({ ...formData, comments: text })}
                                        placeholder="Enter any additional details about your crop"
                                        placeholderTextColor={theme.colors.textLight}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.disabledButton]}
                                    onPress={handlePostCrop}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Post Crop</Text>
                                    )}
                                </TouchableOpacity>

                                {localError ? (
                                    <View style={styles.formError}>
                                        <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                                        <Text style={styles.formErrorText}>{localError}</Text>
                                    </View>
                                ) : null}
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
        backgroundColor: theme.colors.primary,
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
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    activeTabText: {
        color: theme.colors.primary,
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
    formRow: {
        flexDirection: 'row',
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
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
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    cropsContainer: {
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
    interestedTraders: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
        paddingTop: 16,
    },
    interestedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 12,
    },
    traderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    traderIcon: {
        marginRight: 12,
    },
    traderInfo: {
        flex: 1,
    },
    traderName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    traderDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    traderDetailText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    contactButton: {
        backgroundColor: theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    postCropCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        ...theme.shadows.md,
    },
});

export default FarmerScreen;