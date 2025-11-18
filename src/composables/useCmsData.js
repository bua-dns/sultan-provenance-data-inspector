import { ref, onMounted } from 'vue';
import { CMS_CONFIG } from '@/config/cms.config';

/**
 * Composable for fetching data from the CMS with pagination support
 */
export function useCmsData() {
  const informationUnits = ref([]);
  const culturalAssets = ref([]);
  const publications = ref([]);
  const loading = ref(true);
  const error = ref(null);

  /**
   * Fetch all pages for a given endpoint
   * @param {string} endpoint - The API endpoint
   * @param {string} populateParams - Optional populate parameters
   * @returns {Promise<Array>} - All fetched items
   */
  const fetchAllPages = async (endpoint, populateParams = '') => {
    let allData = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const separator = populateParams ? '&' : '?';
        const paginationParams = `pagination[page]=${page}&pagination[pageSize]=${CMS_CONFIG.pagination.pageSize}`;
        const url = `${CMS_CONFIG.baseUrl}${endpoint}?${populateParams}${separator}${paginationParams}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error fetching ${endpoint}: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        const items = json.data || [];
        allData = allData.concat(items);

        // Check if there are more pages
        const pagination = json.meta?.pagination;
        if (pagination) {
          hasMore = page < pagination.pageCount;
          page++;
        } else {
          hasMore = false;
        }
      } catch (err) {
        throw err;
      }
    }

    return allData;
  };

  /**
   * Fetch all data from all endpoints
   */
  const fetchAllData = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Fetch all collections in parallel
      const [infoUnits, assets, pubs] = await Promise.all([
        fetchAllPages(
          CMS_CONFIG.endpoints.informationUnits,
          CMS_CONFIG.populateParams.informationUnits
        ),
        fetchAllPages(CMS_CONFIG.endpoints.culturalAssets),
        fetchAllPages(CMS_CONFIG.endpoints.publications),
      ]);

      informationUnits.value = infoUnits;
      culturalAssets.value = assets;
      publications.value = pubs;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching CMS data:', err);
    } finally {
      loading.value = false;
    }
  };

  // Auto-fetch on mount
  onMounted(fetchAllData);

  return {
    informationUnits,
    culturalAssets,
    publications,
    loading,
    error,
    fetchAllData,
  };
}
