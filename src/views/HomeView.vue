<script setup>
import { computed } from 'vue';
import { useCmsData } from '@/composables/useCmsData';
import { fieldLabels, getFieldLabel } from '@/config/fields.config';

// Initialize CMS data composable
const { 
  informationUnits, 
  culturalAssets, 
  publications, 
  loading, 
  error 
} = useCmsData();

// Aggregate cultural assets with their linked information units
const aggregatedItems = computed(() => {
  if (!culturalAssets.value || !informationUnits.value) {
    return [];
  }

  console.log('Cultural Assets:', culturalAssets.value);
  console.log('Information Units:', informationUnits.value);

  return culturalAssets.value.map(asset => {
    // Find all information units linked to this cultural asset
    const linkedInfoUnits = informationUnits.value.filter(infoUnit => {
      // In the CMS data, cultural_assets is directly at the root level, not nested in attributes
      const culturalAssetsRel = infoUnit.cultural_assets;
      console.log(`Checking info unit ${infoUnit.id}:`, culturalAssetsRel);
      if (!culturalAssetsRel || !Array.isArray(culturalAssetsRel)) {
        return false;
      }
      const matches = culturalAssetsRel.some(ca => ca.id === asset.id);
      if (matches) {
        console.log(`✓ Info unit ${infoUnit.id} matches asset ${asset.id}`);
      }
      return matches;
    });

    // Return aggregated item
    return {
      id: asset.id,
      ...asset,
      informationUnits: linkedInfoUnits,
    };
  });
});

// Base URL for representation images
const IMAGES_BASE_URL = 'https://files.berlin-university-collections.de/sultan/';

// Helper function to compose full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  return IMAGES_BASE_URL + imageUrl;
};

// Download all data as JSON
const downloadAllData = () => {
  const allData = {
    informationUnits: informationUnits.value,
    culturalAssets: culturalAssets.value,
    publications: publications.value,
    aggregatedItems: aggregatedItems.value,
  };
  
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cms-data-export.json';
  a.click();
  URL.revokeObjectURL(url);
};

</script>

<template>
  <main>
    <div class="headings content-element">
      <h1>Provenienzforschung zur Sammlung Sultan</h1>
      <h2>Data Inspector - New CMS Data Source</h2>
    </div>

    <div class="display">
      <div v-if="loading" class="content-element">{{ fieldLabels.ui.loading }}</div>
      <div v-else-if="error" class="content-element error">{{ error }}</div>
      <div v-else>
        <div class="content-element">
          <h3>{{ fieldLabels.sections.dataSummary }}</h3>
          <ul>
            <li><strong>{{ fieldLabels.sections.informationUnits }}:</strong> {{ informationUnits.length }} {{ fieldLabels.ui.itemsCount }}</li>
            <li><strong>{{ fieldLabels.sections.culturalAssets }}:</strong> {{ culturalAssets.length }} {{ fieldLabels.ui.itemsCount }}</li>
            <li><strong>{{ fieldLabels.sections.publications }}:</strong> {{ publications.length }} {{ fieldLabels.ui.itemsCount }}</li>
            <li><strong>{{ fieldLabels.sections.aggregatedItems }}:</strong> {{ aggregatedItems.length }} {{ fieldLabels.ui.itemsCount }}</li>
          </ul>
          <button @click="downloadAllData" class="download-btn">{{ fieldLabels.ui.downloadButton }}</button>
        </div>

        <!-- Aggregated Items Display -->
        <div v-for="item in aggregatedItems" :key="item.id" class="cultural-asset-card">
          <div class="asset-header">
            <h3>{{ item.label || item.title }}</h3>
            <span class="asset-id">{{ fieldLabels.culturalAsset.id }}: {{ item.id }}</span>
          </div>

          <!-- Main Representation Image -->
          <div v-if="item.main_representation && item.main_representation.image_url" class="main-image">
            <img 
              :src="getImageUrl(item.main_representation.image_url)" 
              :alt="item.main_representation.label || item.main_representation.title || item.label" 
            />
            <div class="image-caption" v-if="item.main_representation.label || item.main_representation.title">
              {{ item.main_representation.label || item.main_representation.title }}
            </div>
          </div>
          
          <div class="asset-metadata" v-if="item.metadata">
            <pre class="metadata-text">{{ item.metadata }}</pre>
          </div>

          <!-- Main Representation -->
          <div v-if="item.main_representation" class="main-representation">
            <h4>{{ fieldLabels.culturalAsset.main_representation }}</h4>
            <div class="representation-card main">
              <div class="representation-header">
                <strong>{{ item.main_representation.label || item.main_representation.title }}</strong>
                <span class="representation-id">{{ fieldLabels.representation.id }}: {{ item.main_representation.id }}</span>
              </div>
              <div class="representation-details">
                <div v-if="item.main_representation.image_url" class="representation-image">
                  <img :src="getImageUrl(item.main_representation.image_url)" :alt="item.main_representation.label || item.main_representation.title" />
                </div>
                <div v-if="item.main_representation.cited_passage" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.cited_passage }}:</span>
                  <span class="detail-value">{{ item.main_representation.cited_passage }}</span>
                </div>
                <div v-if="item.main_representation.source_date" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.source_date }}:</span>
                  <span class="detail-value">{{ item.main_representation.source_date }}</span>
                </div>
                <div v-if="item.main_representation.caption" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.caption }}:</span>
                  <span class="detail-value">{{ item.main_representation.caption }}</span>
                </div>
                <div v-if="item.main_representation.copyright_status" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.copyright_status }}:</span>
                  <span class="detail-value">{{ item.main_representation.copyright_status }}</span>
                </div>
                <div v-if="item.main_representation.archival_recerence" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.archival_recerence }}:</span>
                  <span class="detail-value archival">{{ item.main_representation.archival_recerence }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Representations -->
          <div v-if="item.representations && item.representations.length > 0" class="representations">
            <h4>{{ fieldLabels.culturalAsset.representations }} ({{ item.representations.length }})</h4>
            <div v-for="rep in item.representations" :key="rep.id" class="representation-card">
              <div class="representation-header">
                <strong>{{ rep.label || rep.title }}</strong>
                <span class="representation-id">{{ fieldLabels.representation.id }}: {{ rep.id }}</span>
              </div>
              <div class="representation-details">
                <div v-if="rep.image_url" class="representation-image">
                  <img :src="getImageUrl(rep.image_url)" :alt="rep.label || rep.title" />
                </div>
                <div v-if="rep.cited_passage" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.cited_passage }}:</span>
                  <span class="detail-value">{{ rep.cited_passage }}</span>
                </div>
                <div v-if="rep.source_date" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.source_date }}:</span>
                  <span class="detail-value">{{ rep.source_date }}</span>
                </div>
                <div v-if="rep.caption" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.caption }}:</span>
                  <span class="detail-value">{{ rep.caption }}</span>
                </div>
                <div v-if="rep.copyright_status" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.copyright_status }}:</span>
                  <span class="detail-value">{{ rep.copyright_status }}</span>
                </div>
                <div v-if="rep.archival_recerence" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.representation.archival_recerence }}:</span>
                  <span class="detail-value archival">{{ rep.archival_recerence }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="item.informationUnits && item.informationUnits.length > 0" class="information-units">
            <h4>{{ fieldLabels.sections.informationUnits }} ({{ item.informationUnits.length }})</h4>
            
            <div v-for="infoUnit in item.informationUnits" :key="infoUnit.id" class="info-unit-card">
              <div class="info-unit-header">
                <strong>{{ infoUnit.label || infoUnit.title }}</strong>
                <span class="info-unit-id">{{ fieldLabels.informationUnit.id }}: {{ infoUnit.id }}</span>
              </div>

              <div class="info-unit-details">
                <div v-if="infoUnit.cited_passage" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.cited_passage }}:</span>
                  <span class="detail-value">{{ infoUnit.cited_passage }}</span>
                </div>

                <div v-if="infoUnit.reference_date" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.reference_date }}:</span>
                  <span class="detail-value">{{ infoUnit.reference_date }}</span>
                </div>

                <div v-if="infoUnit.ca_title" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.ca_title }}:</span>
                  <span class="detail-value">{{ infoUnit.ca_title }}</span>
                </div>

                <div v-if="infoUnit.ca_dimensions" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.ca_dimensions }}:</span>
                  <span class="detail-value">{{ infoUnit.ca_dimensions }}</span>
                </div>

                <div v-if="infoUnit.ca_owner" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.ca_owner }}:</span>
                  <span class="detail-value">{{ infoUnit.ca_owner }}</span>
                </div>

                <div v-if="infoUnit.ca_previous_owner" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.ca_previous_owner }}:</span>
                  <span class="detail-value">{{ infoUnit.ca_previous_owner }}</span>
                </div>

                <div v-if="infoUnit.ca_location" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.ca_location }}:</span>
                  <span class="detail-value">{{ infoUnit.ca_location }}</span>
                </div>

                <div v-if="infoUnit.archival_recerence" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.archival_recerence }}:</span>
                  <span class="detail-value archival">{{ infoUnit.archival_recerence }}</span>
                </div>

                <div v-if="infoUnit.online_resource" class="detail-row">
                  <span class="detail-label">{{ fieldLabels.informationUnit.online_resource }}:</span>
                  <span class="detail-value">{{ infoUnit.online_resource }}</span>
                </div>

                <div v-if="infoUnit.publication" class="publication-info">
                  <strong>{{ fieldLabels.sections.publicationInfo }}:</strong>
                  <div class="publication-text">{{ infoUnit.publication.label }}</div>
                  <div v-if="infoUnit.publication.bibliographical_reference" class="publication-ref">
                    {{ infoUnit.publication.bibliographical_reference }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-info-units">
            {{ fieldLabels.sections.noInfoUnits }}
          </div>
        </div>

        <!-- Raw Data Sections (Collapsible) -->
        <details class="content-element">
          <summary>{{ fieldLabels.sections.rawData }}: {{ fieldLabels.sections.informationUnits }}</summary>
          <pre>{{ informationUnits }}</pre>
        </details>

        <details class="content-element">
          <summary>{{ fieldLabels.sections.rawData }}: {{ fieldLabels.sections.culturalAssets }}</summary>
          <pre>{{ culturalAssets }}</pre>
        </details>

        <details class="content-element">
          <summary>{{ fieldLabels.sections.rawData }}: {{ fieldLabels.sections.publications }}</summary>
          <pre>{{ publications }}</pre>
        </details>
      </div>
    </div>
  </main>
</template>

<style scoped>
a {
  color: #0078d4;
  text-decoration: none;
}

.content-element {
  padding: 1rem;
  margin-bottom: 0.75rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error {
  color: #d13438;
  font-weight: bold;
}

.display {
  display: block;
  margin-top: 2rem;
}

h2 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  color: #2c3e50;
}

h4 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #34495e;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  max-height: 500px;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
}

ul li {
  padding: 0.25rem 0;
}

.download-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #0078d4;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background-color: #005a9e;
}

/* Cultural Asset Card Styles */
.cultural-asset-card {
  background-color: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #0078d4;
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.asset-id {
  font-size: 0.875rem;
  color: #7f8c8d;
  background-color: #ecf0f1;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
}

/* Main Image Styles */
.main-image {
  margin: 1.5rem 0;
  text-align: center;
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e0e0e0;
}

.main-image img {
  max-width: 100%;
  max-height: 600px;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: block;
  margin: 0 auto;
}

.image-caption {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #555;
  font-style: italic;
  text-align: center;
}

.asset-metadata {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.metadata-text {
  margin: 0;
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #2c3e50;
  background: none;
  padding: 0;
  max-height: none;
}

/* Representations Styles */
.main-representation,
.representations {
  margin-top: 1.5rem;
}

.representation-card {
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e0e0e0;
}

.representation-card.main {
  background-color: #e8f4fd;
  border: 2px solid #0078d4;
}

.representation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #d0d0d0;
}

.representation-id {
  font-size: 0.75rem;
  color: #95a5a6;
  background-color: #ecf0f1;
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
}

.representation-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.representation-image {
  margin: 1rem 0;
  text-align: center;
}

.representation-image img {
  max-width: 100%;
  max-height: 400px;
  height: auto;
  border-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Information Units Styles */
.information-units {
  margin-top: 1.5rem;
}

.info-unit-card {
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e0e0e0;
}

.info-unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #d0d0d0;
}

.info-unit-id {
  font-size: 0.75rem;
  color: #95a5a6;
  background-color: #ecf0f1;
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
}

.info-unit-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1rem;
  padding: 0.5rem 0;
}

.detail-label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.detail-value {
  color: #2c3e50;
  font-size: 0.9rem;
}

.detail-value.archival {
  font-size: 0.85rem;
  font-style: italic;
}

.publication-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 0.25rem;
  border: 1px solid #d0d0d0;
}

.publication-text {
  margin-top: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.publication-ref {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #555;
  font-style: italic;
}

.no-info-units {
  padding: 1rem;
  text-align: center;
  color: #95a5a6;
  font-style: italic;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  margin-top: 1rem;
}

/* Collapsible Details Styles */
details {
  cursor: pointer;
}

details summary {
  font-weight: 600;
  padding: 0.5rem;
  background-color: #f0f0f0;
  border-radius: 0.25rem;
  user-select: none;
}

details summary:hover {
  background-color: #e0e0e0;
}

details[open] summary {
  margin-bottom: 1rem;
}
</style>