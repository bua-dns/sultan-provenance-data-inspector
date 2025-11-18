import { ref, onMounted } from 'vue';
import { API_CONFIG } from '@/config/api.config';

/**
 * Composable for fetching and managing Omeka-S data
 */
export function useOmekaData() {
  const itemsData = ref([]);
  const loading = ref(true);
  const error = ref(null);

  /**
   * Fetch items from the Omeka-S API
   */
  const fetchItems = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.items}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      itemsData.value = await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Generate database link for an item
   */
  const getDBLink = (id) => {
    return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.adminItem}/${id}`;
  };

  // Auto-fetch on mount
  onMounted(fetchItems);

  return {
    itemsData,
    loading,
    error,
    fetchItems,
    getDBLink,
  };
}
