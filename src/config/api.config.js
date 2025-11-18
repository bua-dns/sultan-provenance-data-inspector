/**
 * API Configuration
 * Contains all API endpoints, resource template IDs, and external shortcuts
 */

export const API_CONFIG = {
  baseUrl: 'https://omeka-s-t1.berlin-university-collections.de',
  endpoints: {
    items: '/api/items',
    adminItem: '/admin/item',
  },
};

/**
 * Resource Template IDs used in the Omeka-S database
 */
export const TEMPLATE_IDS = {
  culturalAsset: 6,
  informationUnit: 7,
  provenanceStation: 8,
  illustration: 9,
};

/**
 * External shortcuts and deep links
 */
export const SHORTCUTS = {
  culturalAssets: 'https://omeka-s-t1.berlin-university-collections.de/admin/item?sort_order=desc&resource_template_id%5B%5D=6&numeric%5Bts%5D%5Bgte%5D%5Bpid%5D=&numeric%5Bts%5D%5Bgte%5D%5Bval%5D=&year=&month=&day=&hour=&minute=&second=&offset=&numeric%5Bts%5D%5Blte%5D%5Bpid%5D=&numeric%5Bts%5D%5Blte%5D%5Bval%5D=&year=&month=&day=&hour=&minute=&second=&offset=&numeric%5Bdur%5D%5Bgt%5D%5Bpid%5D=&numeric%5Bdur%5D%5Bgt%5D%5Bval%5D=&years=&months=&days=&hours=&minutes=&seconds=&numeric%5Bdur%5D%5Blt%5D%5Bpid%5D=&numeric%5Bdur%5D%5Blt%5D%5Bval%5D=&years=&months=&days=&hours=&minutes=&seconds=&numeric%5Bivl%5D%5Bpid%5D=&numeric%5Bivl%5D%5Bval%5D=&year=&month=&day=&hour=&minute=&second=&offset=&numeric%5Bint%5D%5Bgt%5D%5Bpid%5D=&numeric%5Bint%5D%5Bgt%5D%5Bval%5D=&integer=&numeric%5Bint%5D%5Blt%5D%5Bpid%5D=&numeric%5Bint%5D%5Blt%5D%5Bval%5D=&integer=',
};

/**
 * Property prefixes used for filtering
 */
export const PROPERTY_PREFIXES = {
  provenance: 'pro:',
  culturalAsset: 'pro:ca',
  dcTerms: 'dcterms:',
};
