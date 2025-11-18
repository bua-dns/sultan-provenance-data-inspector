<script setup>
import { computed } from 'vue';
import { useCmsData } from '@/composables/useCmsData';

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
      <div v-if="loading" class="content-element">Loading data from CMS...</div>
      <div v-else-if="error" class="content-element error">{{ error }}</div>
      <div v-else>
        <div class="content-element">
          <h3>Data Summary</h3>
          <ul>
            <li><strong>Information Units:</strong> {{ informationUnits.length }} items</li>
            <li><strong>Cultural Assets:</strong> {{ culturalAssets.length }} items</li>
            <li><strong>Publications:</strong> {{ publications.length }} items</li>
            <li><strong>Aggregated Items:</strong> {{ aggregatedItems.length }} items</li>
          </ul>
          <button @click="downloadAllData" class="download-btn">Download All Data as JSON</button>
        </div>

        <div class="content-element">
          <h3>Aggregated Items (Cultural Assets + Information Units)</h3>
          <pre v-if="true">{{ aggregatedItems }}</pre>
        </div>

        <div class="content-element">
          <h3>Information Units</h3>
          <pre v-if="true">{{ informationUnits }}</pre>
        </div>

        <div class="content-element">
          <h3>Cultural Assets</h3>
          <pre v-if="true">{{ culturalAssets }}</pre>
        </div>

        <div class="content-element">
          <h3>Publications</h3>
          <pre v-if="true">{{ publications }}</pre>
        </div>
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
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
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
</style>