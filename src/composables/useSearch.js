import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

/**
 * Composable for search functionality
 */
export function useSearch(itemsData, items) {
  const router = useRouter();
  const route = useRoute();
  
  const currentInput = ref('');
  const selectedItem = ref(null);

  /**
   * Generate search suggestions based on current input
   */
  const suggestions = computed(() => {
    if (!currentInput.value || currentInput.value.length < 2) {
      return [];
    }
    return itemsData.value
      .filter(item => item['@type'].includes('pro:CulturalAsset'))
      .filter(item => item['o:title'].toLowerCase().includes(currentInput.value.toLowerCase()))
      .map(item => {
        return {
          label: item['o:title'],
          id: item['o:id'],
        };
      });
  });

  /**
   * Clear search input and selection
   */
  const clearSearch = () => {
    currentInput.value = '';
    selectedItem.value = null;
    router.push({ query: { ...route.query, item: null } });
  };

  /**
   * Select an item from search results
   */
  const selectItem = (id) => {
    const item = items.value.find(item => item.id === id);
    if (item) {
      selectedItem.value = item;
      currentInput.value = '';
      router.push({ query: { ...route.query, item: id } });
    }
  };

  /**
   * Initialize selected item from route query parameter
   */
  const initializeFromRoute = () => {
    const queryItemId = route.query.item;
    if (queryItemId) {
      selectItem(Number(queryItemId));
    }
  };

  return {
    currentInput,
    selectedItem,
    suggestions,
    clearSearch,
    selectItem,
    initializeFromRoute,
  };
}
