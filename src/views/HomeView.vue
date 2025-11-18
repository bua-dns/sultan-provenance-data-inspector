<script setup>
import { onMounted } from 'vue';
import { SHORTCUTS } from '@/config/api.config';
import { useOmekaData } from '@/composables/useOmekaData';
import { useProvenance } from '@/composables/useProvenance';
import { useItemFilters } from '@/composables/useItemFilters';
import { useSearch } from '@/composables/useSearch';
import { useDossier } from '@/composables/useDossier';
import { useFormatters } from '@/composables/useFormatters';

// Initialize composables
const { itemsData, loading, error, getDBLink } = useOmekaData();

const { 
  getProvenanceStations, 
  getRelatedInformationUnits 
} = useProvenance(itemsData, getDBLink);

const { createJsonDossier, downloadJson, downloadMd } = useDossier();

const { items, getIllustrations } = useItemFilters(
  itemsData, 
  getDBLink, 
  getRelatedInformationUnits, 
  getProvenanceStations, 
  createJsonDossier
);

const { 
  currentInput, 
  selectedItem, 
  suggestions, 
  clearSearch, 
  selectItem, 
  initializeFromRoute 
} = useSearch(itemsData, items);

const { formatHeaderData } = useFormatters();

const shortcuts = SHORTCUTS;

// Initialize selected item from route on mount
onMounted(() => {
  // Wait for data to load before initializing route
  const unwatch = itemsData.value && itemsData.value.length > 0;
  if (unwatch) {
    initializeFromRoute();
  } else {
    // Watch for data to be loaded
    const checkData = setInterval(() => {
      if (itemsData.value && itemsData.value.length > 0) {
        initializeFromRoute();
        clearInterval(checkData);
      }
    }, 100);
  }
});

</script>

<template>
  <main>
    <div class="headings content-element">
      <h1>Provenienzforschung zur Sammlung Sultan</h1>
      <h2>Data Inspector</h2>
    </div>
    <div class="controls content-element">
      <div class="shortcuts">
        <a :href="shortcuts.culturalAssets" target="_blank" rel="noopener">Werke in der Datenbank<img src="@/assets/icons/edit.svg" alt="Edit" class="icon edit-icon"/></a>
      </div>
      <div class="search-control">
        <input type="text" class="search" v-model="currentInput" 
          placeholder="Werk suchen..."
        />
        <img src="@/assets/icons/x-circle.svg" alt="Edit" class="icon close-icon"
          @click="clearSearch()"
          v-if="currentInput || selectedItem"
        />
      </div>
      <div class="suggestions" v-if="currentInput && suggestions?.length">
        <div class="suggestion"
          v-for="item in suggestions"
          :key="item.label"
          @click="selectItem(item.id)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <div class="display">
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else>
        <div class="item content-element" v-if="selectedItem">
          <h3>{{ selectedItem.label }} <a :href="getDBLink(selectedItem.id)" target="_blank" rel="noopener">
              <img src="@/assets/icons/edit.svg" alt="Edit" class="icon edit-icon"/>
            </a>
          </h3>
          <button @click="downloadJson(selectedItem.dossierJson)">Download Werkdossier als JSON</button>
          <button @click="downloadMd(selectedItem.dossierJson)">Download Werkdossier als Markdown</button>
          <div class="content">
            <h3>Werkdaten</h3>
            <div class="header-data" v-html="formatHeaderData(selectedItem.headerData)" />            
            <template v-if="selectedItem?.related">
              <h3>Informationen aus der Provenienzrecherche</h3>
              <div class="field"
                v-for="(values, label) in selectedItem.related"
                :key="label"
              >
                <strong>{{ label }}</strong>
                <div class="value"
                  v-for="value in values"
                  :key="value.value"
                >
                  {{ value.value }}
                  <a :href="value.dbLink" target="_blank" rel="noopener">
                    <img src="@/assets/icons/edit.svg" alt="Edit" class="icon edit-icon"/>
                  </a>
                </div>
              </div>
            </template>
          </div>
          <div class="provenance-stations">
            <h4>Provenienzkette</h4>
            <div v-if="selectedItem.provenanceStations === 'No provenance stations found'">
              {{ selectedItem.provenanceStations }}
            </div>
            <div v-else>
              <div class="station value"
                v-for="station in selectedItem.provenanceStations"
                :key="station.label"
              >
                {{ station.stationInfo.infoSourceDate }}: {{ station.stationInfo.owner }}
                <a :href="station.stationInfo.dbLink" target="_blank" rel="noopener">
                    <img src="@/assets/icons/edit.svg" alt="Edit" class="icon edit-icon"/>
                  </a>
              </div>
            </div>
          </div>
          <div class="illustration" v-if="getIllustrations(selectItem.id)">
            <h4>Bildquellen</h4>
            <div class="thumbs">
              <div class="thumb"
                v-for="(illustration, index) in getIllustrations(selectedItem.id)"
                :key="`thumb-${index}`"
              >
                <img :src="illustration.url" alt="Illustration" />
                <a :href="illustration.dbLink" target="_blank" rel="noopener">
                  <img src="@/assets/icons/edit.svg" alt="Edit" class="icon edit-icon"/>
                </a>
              </div>
            </div>
            <pre v-if="false">
              
              {{ getIllustrations(selectedItem.id) }}</pre>
          </div>
        </div>
      </div>
  </div>
  <div class="data-output" v-if="false">
    <pre>{{ items }}</pre>
  </div>
</main>
</template>

<style scoped>
a {
  color: #0078d4;
  text-decoration: none;
}
.controls {
  position: relative;
}
.shortcuts {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}
.suggestions {
  position: absolute;
  top: 100%;
  left: 1rem;
  padding: 1rem;
  width: 40rem;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: 0;
  display: block;
}
.suggestion {
  cursor: pointer;
  letter-spacing: .015rem;
}
.suggestion:hover {
  font-weight: bold;
  letter-spacing: 0;
}
.search-control {
  display: flex;
  gap: .25rem;
  align-items: center;
}
.search {
  width: 24rem;
  padding: 0.5rem;
  font-size: 1rem;
} 

.content-element {
  padding: 1rem;
  margin-bottom: 0.75rem;
  background-color: #fff;
  border-radius: 0.5rem;
}
.display {
  display: block;
  margin-top: 2rem;
}
.data-output {
  margin-top: 2rem;
  background-color: #fff;
  padding: 1rem;
}
.icon {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
}
.close-icon {
  height: 2rem;
  width: 2rem;
  opacity: 0.5;
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
h4 {
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
}
.item {
  margin-bottom: 1rem;
}
.provenance-property {
  margin-left: 1rem;
  margin-bottom: 0.25rem;
}
.value-listing {
  margin-left: 1rem;
}
.value {
  display: flex;
  align-items: center;
  margin-left: 1rem;
}
.thumb {
  margin-bottom: 1rem;
}
</style>


