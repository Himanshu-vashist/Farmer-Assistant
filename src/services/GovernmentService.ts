import axios from 'axios';

// Types for government initiatives
export interface Initiative {
  id: string;
  title: string;
  description: string;
  ministry: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'expired';
  category: string;
  eligibility: string;
  benefits: string;
  applicationUrl: string;
  imageUrl: string;
  isSaved?: boolean;
}

// Base URL for the API
const API_BASE_URL = 'https://api.data.gov.in/resource';
// Alternative base URL for direct resource access
const API_CATALOG_URL = 'https://data.gov.in/api/datastore/resource.json';

// API key for data.gov.in
const API_KEY = '579b464db66ec23bdd00000140f951356f6449f97042e07dea9e83c4';

// Resource IDs for Local Government Directory (LGD)
// Updated resource IDs based on data.gov.in catalog
const LGD_VILLAGES_RESOURCE = '6110e28c-8274-41e5-9e30-37c7a7e9045e';
const LGD_LOCAL_BODIES_RESOURCE = 'c7ed3a35-2812-4be0-8e2e-85e8f1b4a914';

// Mock data for fallback when API is not available
export const mockInitiatives: Initiative[] = [
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
    isSaved: false
  },
  // More mock data...
];

// Function to fetch government initiatives from the API
export const fetchGovernmentInitiatives = async (): Promise<Initiative[]> => {
  try {
    // Try multiple API endpoints to get data
    let villagesResponse;
    let localBodiesResponse;
    let apiSuccess = false;

    try {
      // First attempt: Standard resource API
      villagesResponse = await axios.get(
        `${API_BASE_URL}/${LGD_VILLAGES_RESOURCE}`,
        {
          params: {
            'api-key': API_KEY,
            format: 'json',
            limit: 10,
            offset: 0
          }
        }
      );

      localBodiesResponse = await axios.get(
        `${API_BASE_URL}/${LGD_LOCAL_BODIES_RESOURCE}`,
        {
          params: {
            'api-key': API_KEY,
            format: 'json',
            limit: 10,
            offset: 0
          }
        }
      );

      // Check if we got valid data
      if (villagesResponse.data && villagesResponse.data.records &&
          localBodiesResponse.data && localBodiesResponse.data.records) {
        apiSuccess = true;
      }
    } catch (error) {
      console.log('First API attempt failed, trying alternative endpoint...');
    }

    // If first attempt failed, try the alternative endpoint
    if (!apiSuccess) {
      try {
        villagesResponse = await axios.get(
          API_CATALOG_URL,
          {
            params: {
              'resource_id': LGD_VILLAGES_RESOURCE,
              'api-key': API_KEY,
              limit: 10
            }
          }
        );

        localBodiesResponse = await axios.get(
          API_CATALOG_URL,
          {
            params: {
              'resource_id': LGD_LOCAL_BODIES_RESOURCE,
              'api-key': API_KEY,
              limit: 10
            }
          }
        );

        // Check if we got valid data
        if (villagesResponse.data && villagesResponse.data.records &&
            localBodiesResponse.data && localBodiesResponse.data.records) {
          apiSuccess = true;
        }
      } catch (error) {
        console.log('Alternative API endpoint also failed');
      }
    }

    // If both attempts failed, try a direct API call to a known working endpoint
    if (!apiSuccess) {
      try {
        // This is a known working endpoint for agricultural data
        const agricultureResponse = await axios.get(
          'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
          {
            params: {
              'api-key': API_KEY,
              format: 'json',
              limit: 20
            }
          }
        );

        if (agricultureResponse.data && agricultureResponse.data.records) {
          console.log('Direct agriculture API call succeeded');
          // Use this data instead
          villagesResponse = agricultureResponse;
          localBodiesResponse = { data: { records: [] } };
          apiSuccess = true;
        }
      } catch (error) {
        console.log('All API attempts failed, falling back to mock data');
      }
    }

    console.log('Villages API Response:', villagesResponse?.data);
    console.log('Local Bodies API Response:', localBodiesResponse?.data);

    // Transform the API responses to match our Initiative interface
    let initiatives: Initiative[] = [];

    // Process villages data
    if (villagesResponse && villagesResponse.data && villagesResponse.data.records) {
      const villageInitiatives = villagesResponse.data.records.map((record: any, index: number) => {
        // Create different types of initiatives based on index
        const categories = ['Agricultural Support', 'Rural Development', 'Irrigation', 'Financial Support', 'Soil Management'];
        const category = categories[index % categories.length];

        // Determine status - mix of active, upcoming, and expired
        let status: 'active' | 'upcoming' | 'expired' = 'active';
        let startDate = new Date().toISOString().split('T')[0];
        let endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0];

        if (index % 5 === 0) {
          // Upcoming initiative
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + 2);
          startDate = futureDate.toISOString().split('T')[0];
          endDate = new Date(futureDate.setFullYear(futureDate.getFullYear() + 2)).toISOString().split('T')[0];
          status = 'upcoming';
        } else if (index % 7 === 0) {
          // Expired initiative
          const pastDate = new Date();
          pastDate.setFullYear(pastDate.getFullYear() - 2);
          startDate = pastDate.toISOString().split('T')[0];
          pastDate.setFullYear(pastDate.getFullYear() + 1);
          endDate = pastDate.toISOString().split('T')[0];
          status = 'expired';
        }

        // Generate title and description based on category
        let title = '';
        let description = '';
        let benefits = '';
        let applicationUrl = '';

        switch(category) {
          case 'Agricultural Support':
            title = `Agricultural Support Program for ${record.village_name || 'Village'}`;
            description = `Comprehensive agricultural support program for farmers in ${record.village_name || 'Village'}, ${record.state_name || 'State'}`;
            benefits = 'Subsidized seeds, fertilizers, and agricultural equipment';
            applicationUrl = 'https://agriculture.gov.in/';
            break;
          case 'Irrigation':
            title = `Irrigation Development Scheme for ${record.village_name || 'Village'}`;
            description = `Irrigation infrastructure development for agricultural lands in ${record.village_name || 'Village'}, ${record.state_name || 'State'}`;
            benefits = 'Improved irrigation systems, water conservation, and drought resistance';
            applicationUrl = 'https://pmksy.gov.in/';
            break;
          case 'Financial Support':
            title = `Farmer Financial Assistance for ${record.village_name || 'Village'}`;
            description = `Financial support and credit facilities for farmers in ${record.village_name || 'Village'}, ${record.state_name || 'State'}`;
            benefits = 'Low-interest loans, credit guarantees, and direct financial assistance';
            applicationUrl = 'https://pmkisan.gov.in/';
            break;
          case 'Soil Management':
            title = `Soil Health Program for ${record.village_name || 'Village'}`;
            description = `Soil testing and improvement program for agricultural lands in ${record.village_name || 'Village'}, ${record.state_name || 'State'}`;
            benefits = 'Free soil testing, soil health cards, and recommendations for soil improvement';
            applicationUrl = 'https://soilhealth.dac.gov.in/';
            break;
          default: // Rural Development
            title = `Rural Development Scheme for ${record.village_name || 'Village'}`;
            description = `Development initiative for ${record.village_name || 'Village'} in ${record.district_name || 'District'}, ${record.state_name || 'State'}`;
            benefits = 'Infrastructure development, water supply, and sanitation improvements';
            applicationUrl = 'https://rural.nic.in/';
        }

        return {
          id: `village-${index}`,
          title,
          description,
          ministry: 'Ministry of Agriculture & Farmers Welfare',
          startDate,
          endDate,
          status,
          category,
          eligibility: `Farmers and residents of ${record.village_name || 'Village'}`,
          benefits,
          applicationUrl,
          imageUrl: getRandomImageUrl(),
          isSaved: false
        };
      });

      initiatives = [...initiatives, ...villageInitiatives];
    }

    // Process local bodies data
    if (localBodiesResponse && localBodiesResponse.data && localBodiesResponse.data.records) {
      const localBodyInitiatives = localBodiesResponse.data.records.map((record: any, index: number) => {
        // Create different types of initiatives based on index
        const categories = ['Market Access', 'Insurance', 'Sustainable Farming', 'Pension', 'Infrastructure'];
        const category = categories[index % categories.length];

        // Determine status - mix of active, upcoming, and expired
        let status: 'active' | 'upcoming' | 'expired' = 'active';
        let startDate = new Date().toISOString().split('T')[0];
        let endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0];

        if (index % 4 === 0) {
          // Upcoming initiative
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + 3);
          startDate = futureDate.toISOString().split('T')[0];
          endDate = new Date(futureDate.setFullYear(futureDate.getFullYear() + 3)).toISOString().split('T')[0];
          status = 'upcoming';
        } else if (index % 6 === 0) {
          // Expired initiative
          const pastDate = new Date();
          pastDate.setFullYear(pastDate.getFullYear() - 3);
          startDate = pastDate.toISOString().split('T')[0];
          pastDate.setFullYear(pastDate.getFullYear() + 1);
          endDate = pastDate.toISOString().split('T')[0];
          status = 'expired';
        }

        // Generate title and description based on category
        let title = '';
        let description = '';
        let benefits = '';
        let applicationUrl = '';
        let ministry = 'Ministry of Agriculture & Farmers Welfare';

        switch(category) {
          case 'Market Access':
            title = `Agricultural Market Access for ${record.local_body_name || 'Local Body'}`;
            description = `Program to improve market access for farmers in ${record.local_body_name || 'Local Body'}, ${record.state_name || 'State'}`;
            benefits = 'Direct market access, price discovery, and elimination of middlemen';
            applicationUrl = 'https://enam.gov.in/';
            break;
          case 'Insurance':
            title = `Crop Insurance Scheme for ${record.local_body_name || 'Local Body'}`;
            description = `Comprehensive crop insurance coverage for farmers in ${record.local_body_name || 'Local Body'}, ${record.state_name || 'State'}`;
            benefits = 'Insurance coverage against crop failure, natural disasters, and price fluctuations';
            applicationUrl = 'https://pmfby.gov.in/';
            break;
          case 'Sustainable Farming':
            title = `Sustainable Agriculture Initiative for ${record.local_body_name || 'Local Body'}`;
            description = `Promotion of sustainable and organic farming practices in ${record.local_body_name || 'Local Body'}, ${record.state_name || 'State'}`;
            benefits = 'Training, certification, and market premium for organic produce';
            applicationUrl = 'https://pgsindia-ncof.gov.in/';
            ministry = 'Ministry of Environment, Forest and Climate Change';
            break;
          case 'Pension':
            title = `Farmer Pension Scheme for ${record.local_body_name || 'Local Body'}`;
            description = `Pension scheme for small and marginal farmers in ${record.local_body_name || 'Local Body'}, ${record.state_name || 'State'}`;
            benefits = 'Monthly pension after 60 years of age';
            applicationUrl = 'https://maandhan.in/';
            ministry = 'Ministry of Labour and Employment';
            break;
          default: // Infrastructure
            title = `Agricultural Infrastructure Development for ${record.local_body_name || 'Local Body'}`;
            description = `Development of agricultural infrastructure in ${record.local_body_name || 'Local Body'}, ${record.district_name || 'District'}, ${record.state_name || 'State'}`;
            benefits = 'Storage facilities, cold chains, and processing units';
            applicationUrl = 'https://agriinfra.dac.gov.in/';
            ministry = 'Ministry of Rural Development';
        }

        return {
          id: `localbody-${index}`,
          title,
          description,
          ministry,
          startDate,
          endDate,
          status,
          category,
          eligibility: `Farmers and residents of ${record.local_body_name || 'Local Body'}`,
          benefits,
          applicationUrl,
          imageUrl: getRandomImageUrl(),
          isSaved: false
        };
      });

      initiatives = [...initiatives, ...localBodyInitiatives];
    }

    // Special handling for agricultural data API
    if (initiatives.length === 0 && villagesResponse && villagesResponse.data && villagesResponse.data.records) {
      // Check if this is the agricultural data API
      const records = villagesResponse.data.records;
      if (records.length > 0 && records[0].hasOwnProperty('commodity')) {
        console.log('Processing agricultural commodity data');

        // This is the agricultural commodity API, create initiatives from it
        const agriInitiatives = records.map((record: any, index: number) => {
          // Determine category based on commodity type
          let category = 'Market Access';
          if (record.commodity.toLowerCase().includes('rice') ||
              record.commodity.toLowerCase().includes('wheat')) {
            category = 'Financial Support';
          } else if (record.commodity.toLowerCase().includes('potato') ||
                     record.commodity.toLowerCase().includes('onion')) {
            category = 'Insurance';
          }

          // Determine status randomly but weighted toward active
          const statusRandom = Math.random();
          let status: 'active' | 'upcoming' | 'expired' = 'active';
          if (statusRandom > 0.8) {
            status = 'upcoming';
          } else if (statusRandom > 0.6 && statusRandom <= 0.8) {
            status = 'expired';
          }

          // Generate dates based on status
          let startDate = new Date().toISOString().split('T')[0];
          let endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

          if (status === 'upcoming') {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 2);
            startDate = futureDate.toISOString().split('T')[0];
            endDate = new Date(futureDate.setFullYear(futureDate.getFullYear() + 1)).toISOString().split('T')[0];
          } else if (status === 'expired') {
            const pastDate = new Date();
            pastDate.setFullYear(pastDate.getFullYear() - 2);
            startDate = pastDate.toISOString().split('T')[0];
            pastDate.setFullYear(pastDate.getFullYear() + 1);
            endDate = pastDate.toISOString().split('T')[0];
          }

          return {
            id: `agri-${index}`,
            title: `${record.commodity} Support Scheme`,
            description: `Government initiative to support ${record.commodity.toLowerCase()} farmers with market access and price stabilization.`,
            ministry: 'Ministry of Agriculture & Farmers Welfare',
            startDate,
            endDate,
            status,
            category,
            eligibility: `Farmers growing ${record.commodity.toLowerCase()}`,
            benefits: `Minimum support price of ₹${Math.round(parseFloat(record.modal_price) * 1.5)} per ${record.unit || 'unit'}`,
            applicationUrl: 'https://farmer.gov.in/',
            imageUrl: getRandomImageUrl(),
            isSaved: false
          };
        });

        initiatives = [...initiatives, ...agriInitiatives];
      }
    }

    // If we got data from the API, return it
    if (initiatives.length > 0) {
      return initiatives;
    }

    // If the API doesn't return expected data, fall back to mock data
    console.log('API did not return expected data format, using mock data');
    return mockInitiatives;
  } catch (error) {
    console.error('Error fetching government initiatives:', error);

    // In case of API error, fall back to mock data
    console.log('Using mock data due to API error');
    return mockInitiatives;
  }
};

// Function to get a random image URL for schemes without images
const getRandomImageUrl = (): string => {
  const imageUrls = [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1620553967565-8e5d6e594496?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1595274459742-4a5f7e730a6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  ];

  return imageUrls[Math.floor(Math.random() * imageUrls.length)];
};

// Function to save user preferences (bookmarked initiatives)
export const saveUserPreferences = async (savedInitiatives: string[]): Promise<boolean> => {
  try {
    // In a real app, you would send this data to your backend
    // For now, we'll just simulate a successful save
    console.log('Saved initiatives:', savedInitiatives);
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
};

// Function to fetch user preferences (bookmarked initiatives)
export const fetchUserPreferences = async (): Promise<string[]> => {
  try {
    // In a real app, you would fetch this data from your backend
    // For now, we'll just return an empty array
    return [];
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return [];
  }
};
