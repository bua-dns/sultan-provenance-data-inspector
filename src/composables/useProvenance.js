import { TEMPLATE_IDS, PROPERTY_PREFIXES } from '@/config/api.config';

/**
 * Composable for provenance-related data operations
 */
export function useProvenance(itemsData, getDBLink) {
  /**
   * Get sort date from a provenance station
   */
  const getSortDate = (station) => {
    let date = '';
    if (station['pro:date'] && station['pro:date'][0]) {
      date = station['pro:date'][0]['@value'];
    } else if (station['pro:dateLatest'] && station['pro:dateLatest'][0]) {
      date = station['pro:dateLatest'][0]['@value'];
    }
    return date;
  };

  /**
   * Get owner information by ID
   */
  const getOwner = (id) => {
    const source = itemsData.value.find(item => item['o:id'] === id);
    if (!source) {
      return 'Owner not found';
    }
    return source['pro:caOwner'] && source['pro:caOwner'][0]
      ? source['pro:caOwner'][0]['@value']
      : 'Owner not found';
  };

  /**
   * Get station information
   */
  const getStationInfo = (station) => {
    let info = {
      'id': station['o:id'],
      'dbLink': getDBLink(station['o:id']),
      'infoSourceDate': station['pro:dateDisplay'][0]['@value'],
      'owner': getOwner(station['pro:infoSource'][0]['value_resource_id']),
    };
    return info;
  };

  /**
   * Get provenance stations for a cultural asset
   */
  const getProvenanceStations = (id) => {
    let stations = itemsData.value
      .filter(item => item['o:resource_template']['o:id'] === TEMPLATE_IDS.provenanceStation)
      .filter(item => item['pro:relatesToCulturalAsset'][0]['value_resource_id'] === id);
    
    if (!stations.length) {
      return 'No provenance stations found';
    }
    
    let mappedStations = stations.map(station => {
      return {
        'label': station['dcterms:title'][0]['@value'],
        'dbLink': getDBLink(station['o:id']),
        'sortDate': getSortDate(station),
        'stationInfo': getStationInfo(station),
      };
    });
    return mappedStations;
  };

  /**
   * Get related information units for a cultural asset
   */
  const getRelatedInformationUnits = (id) => {
    let relatedItems = itemsData.value
      .filter(item => item['o:resource_template']['o:id'] === TEMPLATE_IDS.informationUnit)
      .filter(item => item['pro:relatesToCulturalAsset'][0]['value_resource_id'] === id)
      .map(item => {
        let mappedItem = {};
        mappedItem['id'] = item['o:id'];
        mappedItem['dbLInk'] = getDBLink(item['o:id']);
        mappedItem['infoSource'] = item['pro:infoSource'][0]['@value'] || 'No info source';
        mappedItem['infoSourceDate'] = item['pro:infoSourceDate'][0]['@value'];
        mappedItem['label'] = item['o:title'];
        
        const provenanceProps = Object.keys(item).filter(key => key.startsWith(PROPERTY_PREFIXES.provenance));
        mappedItem['claims'] = provenanceProps
          .filter(prop => prop.startsWith(PROPERTY_PREFIXES.culturalAsset))
          .map(prop => {
            return {
              label: item[prop][0]['property_label'],
              value: item[prop][0]['@value'],
            };
          });
        return mappedItem;
      })
      .sort((a, b) => a.infoSourceDate.localeCompare(b.infoSourceDate));
    
    let claims = {};
    for (let item of relatedItems) {
      for (let claim of item.claims) {
        if (!claims[claim.label]) {
          claims[claim.label] = [];
        }
        claims[claim.label].push({
          value: claim.value,
          infoSourceDate: item.infoSourceDate,
          dbLink: item.dbLInk,
          source: item.infoSource,
        });
      }
    }
    
    for (let claim in claims) {
      claims[claim].sort((a, b) => a.infoSourceDate.localeCompare(b.infoSourceDate));
    }

    return claims;
  };

  return {
    getSortDate,
    getOwner,
    getStationInfo,
    getProvenanceStations,
    getRelatedInformationUnits,
  };
}
