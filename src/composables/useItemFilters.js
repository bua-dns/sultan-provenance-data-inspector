import { computed } from 'vue';
import { TEMPLATE_IDS, PROPERTY_PREFIXES } from '@/config/api.config';

/**
 * Composable for filtering and transforming items data
 */
export function useItemFilters(itemsData, getDBLink, getRelatedInformationUnits, getProvenanceStations, createJsonDossier) {
  /**
   * Filter and map cultural assets
   */
  const items = computed(() => {
    return itemsData.value
      .filter(item => item['o:resource_template']['o:id'] === TEMPLATE_IDS.culturalAsset)
      .map(item => {
        let mappedItem = {};
        mappedItem['id'] = item['o:id'];
        mappedItem['label'] = item['o:title'];
        mappedItem['headerData'] = item['pro:headerData'] && item['pro:headerData'][0]
          ? item['pro:headerData'][0]['@value']
          : 'No header data';
        
        const provenanceProps = Object.keys(item).filter(key => key.startsWith(PROPERTY_PREFIXES.provenance));
        provenanceProps.forEach(prop => {
          mappedItem[prop] = item[prop];
        });
        
        mappedItem['related'] = getRelatedInformationUnits(item['o:id']);
        mappedItem['provenanceStations'] = getProvenanceStations(item['o:id']);
        return mappedItem;
      })
      .map(item => {
        return {
          ...item,
          dossierJson: createJsonDossier(item),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  /**
   * Get illustrations for a cultural asset
   */
  const getIllustrations = (id) => {
    let illustrations = itemsData.value
      .filter(item => item['o:resource_template']['o:id'] === TEMPLATE_IDS.illustration)
      .filter(item => item['pro:relatesToCulturalAsset'][0]['value_resource_id'] === id)
      .map(item => {
        return {
          'label': item['dcterms:title'][0]['@value'],
          'dbLink': getDBLink(item['o:id']),
          'url': item['thumbnail_display_urls']['large'],
        };
      });
    return illustrations;
  };

  return {
    items,
    getIllustrations,
  };
}
