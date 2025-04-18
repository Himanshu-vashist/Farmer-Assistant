import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import theme from '../theme/theme';
import { fetchGovernmentInitiatives, saveUserPreferences, fetchUserPreferences, Initiative } from '../services/GovernmentService';

const { width } = Dimensions.get('window');

// Width for layout calculations
const cardWidth = (width - 48) / 2;

// Mock data for government initiatives
const mockInitiatives: Initiative[] = [
  {
    id: '1',
    title: 'PM-KISAN Scheme',
    description: 'Income support of ₹6,000 per year in three equal installments to all land holding farmer families.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2019-02-01',
    endDate: '2024-03-31',
    status: 'active',
    category: 'Financial Support',
    eligibility: 'All landholding farmers with cultivable land',
    benefits: '₹6,000 per year in three equal installments',
    applicationUrl: 'https://pmkisan.gov.in/',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: false
  },
  {
    id: '2',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Crop insurance scheme to provide financial support to farmers suffering crop loss/damage due to unforeseen events.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2016-04-01',
    endDate: '2023-12-31',
    status: 'active',
    category: 'Insurance',
    eligibility: 'All farmers including sharecroppers and tenant farmers',
    benefits: 'Insurance coverage and financial support in case of crop failure',
    applicationUrl: 'https://pmfby.gov.in/',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: true
  },
  {
    id: '3',
    title: 'Soil Health Card Scheme',
    description: 'Provides information on soil health to farmers to help them improve productivity through judicious use of inputs.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2015-02-19',
    endDate: '2023-09-30',
    status: 'active',
    category: 'Soil Management',
    eligibility: 'All farmers',
    benefits: 'Soil health assessment and recommendations for nutrients and fertilizers',
    applicationUrl: 'https://soilhealth.dac.gov.in/',
    imageUrl: 'https://images.unsplash.com/photo-1620553967565-8e5d6e594496?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: false
  },
  {
    id: '4',
    title: 'National Agriculture Market (e-NAM)',
    description: 'Electronic trading platform for agricultural commodities to create a unified national market.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2016-04-14',
    endDate: '2025-03-31',
    status: 'active',
    category: 'Market Access',
    eligibility: 'All farmers, traders, and FPOs',
    benefits: 'Better price discovery and access to a larger national market',
    applicationUrl: 'https://enam.gov.in/',
    imageUrl: 'https://images.unsplash.com/photo-1595274459742-4a5f7e730a6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: false
  },
  {
    id: '5',
    title: 'Pradhan Mantri Krishi Sinchayee Yojana',
    description: 'Ensures access to means of irrigation to all agricultural farms to produce "per drop more crop".',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2015-07-01',
    endDate: '2024-03-31',
    status: 'active',
    category: 'Irrigation',
    eligibility: 'All farmers with focus on small and marginal farmers',
    benefits: 'Improved access to irrigation and water-use efficiency',
    applicationUrl: 'https://pmksy.gov.in/',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: true
  },
  {
    id: '6',
    title: 'Agriculture Infrastructure Fund',
    description: 'Financing facility for investment in agriculture infrastructure projects at farm-gate & aggregation points.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2020-07-08',
    endDate: '2029-03-31',
    status: 'active',
    category: 'Infrastructure',
    eligibility: 'Farmers, FPOs, PACS, Marketing Cooperative Societies, SHGs',
    benefits: 'Interest subvention and credit guarantee for loans up to ₹2 crore',
    applicationUrl: 'https://agriinfra.dac.gov.in/',
    imageUrl: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: false
  },
  {
    id: '7',
    title: 'Kisan Credit Card Scheme',
    description: 'Provides farmers with affordable credit for their agricultural operations.',
    ministry: 'Ministry of Finance',
    startDate: '1998-08-01',
    endDate: '2025-03-31',
    status: 'active',
    category: 'Financial Support',
    eligibility: 'All farmers, sharecroppers, tenant farmers, and SHGs',
    benefits: 'Short-term loans at reduced interest rates',
    applicationUrl: 'https://www.nabard.org/content1.aspx?id=572&catid=23&mid=530',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: false
  },
  {
    id: '8',
    title: 'National Mission for Sustainable Agriculture',
    description: 'Promotes sustainable agriculture through climate change adaptation measures.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2014-04-01',
    endDate: '2023-12-31',
    status: 'active',
    category: 'Sustainable Farming',
    eligibility: 'All farmers',
    benefits: 'Support for climate-resilient agricultural practices',
    applicationUrl: 'https://nmsa.dac.gov.in/',
    imageUrl: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: false
  },
  {
    id: '9',
    title: 'Micro Irrigation Fund',
    description: 'Special fund to facilitate states in expanding coverage of micro irrigation.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2019-01-01',
    endDate: '2023-12-31',
    status: 'active',
    category: 'Irrigation',
    eligibility: 'State Governments',
    benefits: 'Financial assistance for micro irrigation projects',
    applicationUrl: 'https://pmksy.gov.in/microirrigation/index.aspx',
    imageUrl: 'https://images.unsplash.com/photo-1591105627759-349c7d489020?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: false
  },
  {
    id: '10',
    title: 'PM-Kisan Maan Dhan Yojana',
    description: 'Pension scheme for small and marginal farmers aged between 18 to 40 years.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    startDate: '2019-09-12',
    endDate: '2024-03-31',
    status: 'upcoming',
    category: 'Pension',
    eligibility: 'Small and marginal farmers aged 18-40 years',
    benefits: 'Monthly pension of ₹3,000 after age of 60',
    applicationUrl: 'https://maandhan.in/',
    imageUrl: 'https://images.unsplash.com/photo-1569235186275-626cb53b83ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    isSaved: false
  }
];

// Categories for filtering
const categories = [
  { id: 'all', name: 'All Schemes' },
  { id: 'Financial Support', name: 'Financial Support' },
  { id: 'Insurance', name: 'Insurance' },
  { id: 'Market Access', name: 'Market Access' },
  { id: 'Irrigation', name: 'Irrigation' },
  { id: 'Infrastructure', name: 'Infrastructure' },
  { id: 'Sustainable Farming', name: 'Sustainable Farming' },
  { id: 'Soil Management', name: 'Soil Management' },
  { id: 'Pension', name: 'Pension' },
];

// Status filters
const statusFilters = [
  { id: 'all', name: 'All Status' },
  { id: 'active', name: 'Active' },
  { id: 'upcoming', name: 'Upcoming' },
  { id: 'expired', name: 'Expired' },
];

const GovernmentInitiativesScreen: React.FC = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [filteredInitiatives, setFilteredInitiatives] = useState<Initiative[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInitiative, setExpandedInitiative] = useState<string | null>(null);
  const [savedInitiativeIds, setSavedInitiativeIds] = useState<string[]>([]);

  // Fetch initiatives from API on component mount
  useEffect(() => {
    loadInitiatives();
    loadSavedInitiatives();
  }, []);

  // Load saved initiatives from user preferences
  const loadSavedInitiatives = async () => {
    try {
      const savedIds = await fetchUserPreferences();
      setSavedInitiativeIds(savedIds);
    } catch (err) {
      console.error('Error loading saved initiatives:', err);
    }
  };

  // Load initiatives from API
  const loadInitiatives = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGovernmentInitiatives();

      // Mark saved initiatives
      const initiativesWithSavedStatus = data.map(initiative => ({
        ...initiative,
        isSaved: savedInitiativeIds.includes(initiative.id)
      }));

      setInitiatives(initiativesWithSavedStatus);
    } catch (err: any) {
      console.error('Error fetching initiatives:', err);
      setError(err.message || 'Failed to load government initiatives');
      // Fallback to mock data in case of error
      setInitiatives(mockInitiatives);
    } finally {
      setLoading(false);
    }
  };

  // Filter initiatives based on category, status, and search query
  useEffect(() => {
    let filtered = initiatives;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(initiative => initiative.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(initiative => initiative.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        initiative =>
          initiative.title.toLowerCase().includes(query) ||
          initiative.description.toLowerCase().includes(query) ||
          initiative.ministry.toLowerCase().includes(query)
      );
    }

    setFilteredInitiatives(filtered);
  }, [initiatives, selectedCategory, selectedStatus, searchQuery]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitiatives();
    setRefreshing(false);
  };

  // Toggle saved status
  const toggleSaved = async (id: string) => {
    // Update local state
    const updatedInitiatives = initiatives.map(initiative =>
      initiative.id === id
        ? { ...initiative, isSaved: !initiative.isSaved }
        : initiative
    );
    setInitiatives(updatedInitiatives);

    // Update saved initiatives list
    const initiative = initiatives.find(item => item.id === id);
    if (initiative) {
      const isSaved = !initiative.isSaved;
      let newSavedIds;

      if (isSaved) {
        // Add to saved list
        newSavedIds = [...savedInitiativeIds, id];
      } else {
        // Remove from saved list
        newSavedIds = savedInitiativeIds.filter(savedId => savedId !== id);
      }

      setSavedInitiativeIds(newSavedIds);

      // Save to user preferences
      try {
        await saveUserPreferences(newSavedIds);
      } catch (err) {
        console.error('Error saving preferences:', err);
        Alert.alert('Error', 'Failed to save your preferences');
      }
    }
  };

  // Toggle expanded view
  const toggleExpanded = (id: string) => {
    setExpandedInitiative(expandedInitiative === id ? null : id);
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'upcoming':
        return theme.colors.warning;
      case 'expired':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  // Render initiative card
  const renderInitiativeCard = ({ item }: { item: Initiative }) => {
    const isExpanded = expandedInitiative === item.id;
    const statusColor = getStatusColor(item.status);

    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(parseInt(item.id) * 100)}
        style={styles.cardContainer}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.9}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => toggleSaved(item.id)}
            >
              <Ionicons
                name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={item.isSaved ? theme.colors.primary : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Card Image */}
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />

          {/* Card Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardDescription} numberOfLines={isExpanded ? undefined : 2}>
              {item.description}
            </Text>

            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.detailText}>
                  Start: {formatDate(item.startDate)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.detailText}>
                  End: {formatDate(item.endDate)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="briefcase-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.ministry}
                </Text>
              </View>
            </View>

            {/* Expanded Content */}
            {isExpanded && (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={styles.expandedContent}
              >
                <View style={styles.expandedSection}>
                  <Text style={styles.expandedSectionTitle}>Eligibility</Text>
                  <Text style={styles.expandedSectionText}>{item.eligibility}</Text>
                </View>

                <View style={styles.expandedSection}>
                  <Text style={styles.expandedSectionTitle}>Benefits</Text>
                  <Text style={styles.expandedSectionText}>{item.benefits}</Text>
                </View>

                <View style={styles.expandedSection}>
                  <Text style={styles.expandedSectionTitle}>Category</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.applyButton}>
                  <Ionicons name="open-outline" size={18} color="white" style={styles.applyIcon} />
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Expand/Collapse Button */}
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleExpanded(item.id)}
            >
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Show Less' : 'Show More'}
              </Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerContent}>
          <Text style={styles.headerTitle}>Government Initiatives</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schemes, policies..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </Animated.View>
      </LinearGradient>

      {/* Filters */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.filtersContainer}>
        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilters}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryFilterButton,
                selectedCategory === category.id && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilters}
        >
          {statusFilters.map(status => (
            <TouchableOpacity
              key={status.id}
              style={[
                styles.statusFilterButton,
                selectedStatus === status.id && {
                  backgroundColor: getStatusColor(status.id),
                  borderColor: getStatusColor(status.id),
                }
              ]}
              onPress={() => setSelectedStatus(status.id)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === status.id && styles.selectedStatusText
                ]}
              >
                {status.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading government initiatives...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInitiatives}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Initiatives List */}
      {!loading && !error && (
        <FlatList
          data={filteredInitiatives}
          renderItem={renderInitiativeCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={60} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Initiatives Found</Text>
              <Text style={styles.emptySubtitle}>
                Try changing your filters or search query
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...theme.shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: theme.colors.text,
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: 'white',
    ...theme.shadows.sm,
  },
  categoryFilters: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryFilterText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: '600',
  },
  statusFilters: {
    paddingHorizontal: 16,
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusFilterText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  selectedStatusText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    padding: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  expandedSection: {
    marginBottom: 16,
  },
  expandedSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  expandedSectionText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 22,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  applyIcon: {
    marginRight: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  expandButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
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
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GovernmentInitiativesScreen;
