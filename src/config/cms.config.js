/**
 * CMS Configuration
 * Contains all CMS API endpoints and configuration
 */

export const CMS_CONFIG = {
  baseUrl: 'https://cms.berlin-university-collections.de/sammlung-sultan',
  endpoints: {
    informationUnits: '/api/information-units',
    culturalAssets: '/api/cultural-assets',
    publications: '/api/publications',
  },
  // Strapi populate parameters for information-units
  populateParams: {
    informationUnits: 'populate[0]=cultural_assets&populate[1]=publication',
    culturalAssets: 'populate[0]=main_representation&populate[1]=representations',
  },
  // Default pagination settings
  pagination: {
    pageSize: 100, // Fetch 100 items per page
  },
};
