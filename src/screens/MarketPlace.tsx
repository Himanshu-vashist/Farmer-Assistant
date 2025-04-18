import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, SafeAreaView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import theme from '../theme/theme';
import { AgriTradeContext } from '../services/AgriTrade';
import { checkUserRegistration } from '../utils/ApiFeatures';

interface UserData {
  isRegistered: boolean;
  isFarmer: boolean;
  name: string;
  phone: string;
}

const MarketPlaceScreen: React.FC = () => {
    const navigation = useNavigation();
    const {
        connectWallet,
        account,
        contract,
        isLoading: contextLoading,
        error: contextError
    } = useContext(AgriTradeContext);

    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);

    // Get account address safely
    const getAccountAddress = () => {
        if (!account) return null;
        if (typeof account === 'string') return account;
        if (typeof account === 'object' && account.address) return account.address;
        return null;
    };

    const accountAddress = getAccountAddress();

    // Check user registration when account or contract changes
    useEffect(() => {
        const checkRegistration = async () => {
            if (contract && accountAddress) {
                try {
                    setLoading(true);
                    const user = await checkUserRegistration(contract, accountAddress);
                    setUserData(user);
                } catch (error: any) {
                    console.error('Registration check error:', error);
                    setLocalError(error.message || 'Failed to check registration');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (accountAddress) {
            checkRegistration();
        }
    }, [contract, accountAddress]);

    // Handle wallet connection
    const handleConnectWallet = async () => {
        try {
            setLoading(true);
            setLocalError('');
            await connectWallet();
        } catch (error: any) {
            setLocalError(error.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    // Handle role selection
    const handleRoleSelection = async (selectedRole: 'farmer' | 'trader') => {
        if (!contract || !accountAddress) {
            setLocalError('Please connect your wallet first');
            return;
        }

        try {
            setLoading(true);
            setLocalError('');

            // Check if user is already registered
            if (userData?.isRegistered) {
                // Check if user is trying to access a role they're not registered as
                if ((selectedRole === 'farmer' && !userData.isFarmer) ||
                    (selectedRole === 'trader' && userData.isFarmer)) {
                    setLocalError(`You are registered as a ${userData.isFarmer ? 'farmer' : 'trader'}. You cannot access the ${userData.isFarmer ? 'trader' : 'farmer'} screen.`);
                    return;
                }

                // If already registered with correct role, proceed
                if (selectedRole === 'farmer') {
                    navigation.navigate('FarmerScreen' as never);
                } else {
                    navigation.navigate('TraderScreen' as never);
                }
                return;
            }

            // Not registered yet - proceed to registration screen
            if (selectedRole === 'farmer') {
                navigation.navigate('FarmerScreen' as never);
            } else {
                navigation.navigate('TraderScreen' as never);
            }
        } catch (error: any) {
            setLocalError(error.message || 'Selection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[theme.colors.primaryDark, theme.colors.primary]}
                style={styles.headerGradient}
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
                    <Image
                        source={require('../assets/farmer-assistant-logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>AgriTrade Marketplace</Text>
                    <Text style={styles.subtitle}>Connect farmers and traders directly</Text>
                </Animated.View>

                {/* Main Content */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.mainContent}>
                    {!accountAddress ? (
                        <View style={styles.walletSection}>
                            <Text style={styles.sectionTitle}>Connect your wallet to get started</Text>
                            <TouchableOpacity
                                style={[styles.connectButton, loading && styles.disabledButton]}
                                onPress={handleConnectWallet}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="wallet-outline" size={24} color="white" style={styles.buttonIcon} />
                                        <Text style={styles.buttonText}>Connect Wallet</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {localError ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                                    <Text style={styles.errorText}>{localError}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <View style={styles.roleSection}>
                            <View style={styles.accountInfo}>
                                <Ionicons name="person-circle-outline" size={24} color={theme.colors.primary} />
                                <Text style={styles.accountText}>Connected: {accountAddress}</Text>
                            </View>

                            {userData?.isRegistered ? (
                                <View style={styles.registrationInfo}>
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} style={styles.registrationIcon} />
                                    <View>
                                        <Text style={styles.registrationTitle}>Registered as {userData.isFarmer ? 'Farmer' : 'Trader'}</Text>
                                        <Text style={styles.registrationName}>{userData.name}</Text>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.sectionTitle}>Select your role to register:</Text>
                            )}

                            <View style={styles.roleButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.roleButton,
                                        userData?.isRegistered && !userData.isFarmer && styles.disabledRoleButton,
                                        loading && styles.disabledButton
                                    ]}
                                    onPress={() => handleRoleSelection('farmer')}
                                    disabled={loading || (userData?.isRegistered && !userData.isFarmer)}
                                >
                                    <Ionicons name="leaf-outline" size={32} color="white" style={styles.roleIcon} />
                                    <Text style={styles.roleText}>I'm a Farmer</Text>
                                    <Text style={styles.roleDescription}>Sell your crops directly</Text>

                                    {userData?.isRegistered && userData.isFarmer && (
                                        <View style={styles.currentRoleBadge}>
                                            <Ionicons name="checkmark" size={16} color="white" />
                                            <Text style={styles.currentRoleText}>Current</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.roleButton,
                                        styles.traderButton,
                                        userData?.isRegistered && userData.isFarmer && styles.disabledRoleButton,
                                        loading && styles.disabledButton
                                    ]}
                                    onPress={() => handleRoleSelection('trader')}
                                    disabled={loading || (userData?.isRegistered && userData.isFarmer)}
                                >
                                    <Ionicons name="cart-outline" size={32} color="white" style={styles.roleIcon} />
                                    <Text style={styles.roleText}>I'm a Trader</Text>
                                    <Text style={styles.roleDescription}>Buy crops from farmers</Text>

                                    {userData?.isRegistered && !userData.isFarmer && (
                                        <View style={styles.currentRoleBadge}>
                                            <Ionicons name="checkmark" size={16} color="white" />
                                            <Text style={styles.currentRoleText}>Current</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {localError ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                                    <Text style={styles.errorText}>{localError}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}
                </Animated.View>

                {/* Features Section */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.featuresSection}>
                    <Text style={styles.featuresSectionTitle}>Why Use AgriTrade?</Text>

                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="shield-checkmark-outline" size={32} color={theme.colors.primary} />
                            <Text style={styles.featureTitle}>Secure Transactions</Text>
                            <Text style={styles.featureDescription}>Blockchain-based secure trading platform</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <Ionicons name="cash-outline" size={32} color={theme.colors.primary} />
                            <Text style={styles.featureTitle}>Better Prices</Text>
                            <Text style={styles.featureDescription}>Eliminate middlemen for better profits</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <Ionicons name="people-outline" size={32} color={theme.colors.primary} />
                            <Text style={styles.featureTitle}>Direct Connection</Text>
                            <Text style={styles.featureDescription}>Connect directly with buyers and sellers</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* How It Works Section */}
                <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.howItWorksSection}>
                    <Text style={styles.featuresSectionTitle}>How It Works</Text>

                    <View style={styles.stepsList}>
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Connect Wallet</Text>
                                <Text style={styles.stepDescription}>Connect your MetaMask wallet to get started</Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Choose Your Role</Text>
                                <Text style={styles.stepDescription}>Register as a farmer or trader</Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Start Trading</Text>
                                <Text style={styles.stepDescription}>Post crops or express interest in available crops</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
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
        height: 220,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 8,
    },
    mainContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        ...theme.shadows.md,
    },
    walletSection: {
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    connectButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        ...theme.shadows.sm,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        width: '100%',
    },
    errorText: {
        color: theme.colors.error,
        marginLeft: 8,
        flex: 1,
    },
    roleSection: {
        width: '100%',
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    accountText: {
        marginLeft: 8,
        color: theme.colors.text,
        fontWeight: '500',
    },
    registrationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    registrationIcon: {
        marginRight: 12,
    },
    registrationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    registrationName: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    roleButtons: {
        flexDirection: 'column',
        gap: 16,
    },
    roleButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        ...theme.shadows.md,
        position: 'relative',
        overflow: 'visible',
    },
    traderButton: {
        backgroundColor: theme.colors.secondary,
    },
    disabledRoleButton: {
        opacity: 0.5,
        backgroundColor: theme.colors.textLight,
    },
    roleIcon: {
        marginBottom: 12,
    },
    roleText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    roleDescription: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    currentRoleBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: theme.colors.success,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    currentRoleText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    featuresSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        ...theme.shadows.md,
    },
    featuresSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    featuresList: {
        gap: 16,
    },
    featureItem: {
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 8,
        marginBottom: 4,
    },
    featureDescription: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    howItWorksSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        ...theme.shadows.md,
    },
    stepsList: {
        gap: 16,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        ...theme.shadows.sm,
    },
    stepNumberText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    stepDescription: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
});

export default MarketPlaceScreen;