export const fieldLabels = {
  // Cultural Asset Fields
  culturalAsset: {
    id: 'ID',
    label: 'Label',
    title: 'Titel',
    metadata: 'Metadaten',
    documentId: 'Document ID',
    createdAt: 'Erstellt am',
    updatedAt: 'Aktualisiert am',
    publishedAt: 'Veröffentlicht am',
  },

  // Information Unit Fields
  informationUnit: {
    id: 'ID',
    label: 'Label',
    title: 'Titel',
    documentId: 'Document ID',
    createdAt: 'Erstellt am',
    updatedAt: 'Aktualisiert am',
    publishedAt: 'Veröffentlicht am',
    cited_passage: 'Zitierte Passage',
    ca_title: 'Titel des Kulturguts',
    ca_creator: 'Künstler/Schöpfer',
    archival_recerence: 'Archivische Referenz',
    online_resource: 'Online-Ressource',
    reference_date: 'Referenzdatum',
    ca_date_display: 'Datierung (Anzeige)',
    ca_date_earliest: 'Frühestes Datum',
    ca_date_latest: 'Spätestes Datum',
    ca_materials_technique: 'Material/Technik',
    ca_dimensions: 'Maße',
    ca_signature: 'Signatur',
    ca_location: 'Standort',
    ca_owner: 'Eigentümer',
    ca_previous_owner: 'Vorbesitzer',
    ca_acquisition_type: 'Art des Erwerbs',
    reference_excerpt: 'Referenzauszug',
  },

  // Publication Fields
  publication: {
    id: 'ID',
    label: 'Label',
    documentId: 'Document ID',
    bibliographical_reference: 'Bibliographische Referenz',
    createdAt: 'Erstellt am',
    updatedAt: 'Aktualisiert am',
    publishedAt: 'Veröffentlicht am',
  },

  // Section Headers
  sections: {
    culturalAssets: 'Kulturgüter',
    informationUnits: 'Informationseinheiten',
    publications: 'Publikationen',
    aggregatedItems: 'Aggregierte Daten',
    dataSummary: 'Datenübersicht',
    publicationInfo: 'Publikation',
    noInfoUnits: 'Keine verlinkten Informationseinheiten gefunden',
    rawData: 'Rohdaten',
  },

  // UI Elements
  ui: {
    loading: 'Daten werden geladen...',
    downloadButton: 'Alle Daten als JSON herunterladen',
    itemsCount: 'Einträge',
  },
};

// Optional: Helper function to get label with fallback
export const getFieldLabel = (category, field, fallback = null) => {
  return fieldLabels[category]?.[field] || fallback || field;
};