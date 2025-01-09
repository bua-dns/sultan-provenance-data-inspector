<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // Import useRouter and useRoute

const router = useRouter(); // Get the router instance
const route = useRoute(); // Access the current route

const itemsData = ref([]);
const loading = ref(true);
const error = ref(null);

const shortcuts = {
  'culturalAssets': 'https://omeka-s-t1.berlin-university-collections.de/admin/item?sort_order=desc&resource_template_id%5B%5D=6&numeric%5Bts%5D%5Bgte%5D%5Bpid%5D=&numeric%5Bts%5D%5Bgte%5D%5Bval%5D=&year=&month=&day=&hour=&minute=&second=&offset=&numeric%5Bts%5D%5Blte%5D%5Bpid%5D=&numeric%5Bts%5D%5Blte%5D%5Bval%5D=&year=&month=&day=&hour=&minute=&second=&offset=&numeric%5Bdur%5D%5Bgt%5D%5Bpid%5D=&numeric%5Bdur%5D%5Bgt%5D%5Bval%5D=&years=&months=&days=&hours=&minutes=&seconds=&numeric%5Bdur%5D%5Blt%5D%5Bpid%5D=&numeric%5Bdur%5D%5Blt%5D%5Bval%5D=&years=&months=&days=&hours=&minutes=&seconds=&numeric%5Bivl%5D%5Bpid%5D=&numeric%5Bivl%5D%5Bval%5D=&year=&month=&day=&hour=&minute=&second=&offset=&numeric%5Bint%5D%5Bgt%5D%5Bpid%5D=&numeric%5Bint%5D%5Bgt%5D%5Bval%5D=&integer=&numeric%5Bint%5D%5Blt%5D%5Bpid%5D=&numeric%5Bint%5D%5Blt%5D%5Bval%5D=&integer=',
}

const items = computed(() => {
  return itemsData.value
  .filter(item => item['o:resource_template']['o:id'] === 6 )
  .map(item => {
      let mappedItem = {};
      mappedItem['id'] = item['o:id'];
      mappedItem['label'] = item['o:title'];
      mappedItem['headerData'] = item['pro:headerData'] && item['pro:headerData'][0]
        ? item['pro:headerData'][0]['@value']
        : 'No header data';
      const provenanceProps = Object.keys(item).filter(key => key.startsWith('pro:'));
      provenanceProps.forEach(prop => {
        mappedItem[prop] = item[prop];
      });
      mappedItem['related'] = getRelatedInformationUnits(item['o:id']);
      // mappedItem['provenanceStations'] = getProvenanceStations(item['o:id']);
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
function createJsonDossier(item) {
  let dossier = {
    title: `Provenance Research Dossier for ${item.label}`,
    onlinePresentation: `https://omeka-s-t1.berlin-university-collections.de/item/${item.id}`,
    work: item.headerData,
    provenance_related_information: {},
    provenanceStations: item.provenanceStations && Array.isArray(item.provenanceStations)
      ? item.provenanceStations.map(station => ({
        date: station.stationInfo.infoSourceDate,
        owner: station.stationInfo.owner,
      }))
      : [],
  };

  // Map related information
  for (const [label, entries] of Object.entries(item.related)) {
    dossier.provenance_related_information[label] = entries.map(entry => ({
      value: entry.value,
      source: entry.source,
    }));
  }
  return JSON.stringify(dossier, null, 2);
}
function createMdDossier(dossier) {
  dossier = JSON.parse(dossier);
  const { title, onlinePresentation, work, provenance_related_information, provenanceStations } = dossier;

  let md = `# ${title}\n\n`;
  md += `## Online Presentation\n[View the item](${onlinePresentation})\n\n`;
  md += `## Work Information\n${work}\n\n`;

  md += `## Provenance Related Information\n`;
  for (const [label, entries] of Object.entries(provenance_related_information)) {
    md += `### ${label}\n`;
    md += `| Value | Source |\n`;
    md += `|-------|--------|\n`;
    entries.forEach(entry => {
      md += `| ${entry.value} | ${entry.source} |\n`;
    });
    md += `\n`;
  }

  md += `## Provenance Stations\n`;
  md += `| Date | Owner |\n`;
  md += `|------|-------|\n`;
  provenanceStations.forEach(station => {
    md += `| ${station.date} | ${station.owner} |\n`;
  });

  return md;
}



function getSortDate(station) {
  let date = '';
  if (station['pro:date'] && station['pro:date'][0]) {
    date = station['pro:date'][0]['@value'];
  } else if (station['pro:dateLatest'] && station['pro:dateLatest'][0]) {
    date = station['pro:dateLatest'][0]['@value'];
  }
  return date;
}

function getOwner(id) {
  const source = itemsData.value
    .find(item => item['o:id'] === id);
  if (!source) {
    return 'Owner not found';
  }
  // return source['pro:owner'][0]['@value'];
  return source['pro:caOwner'] && source['pro:caOwner'][0]
    ? source['pro:caOwner'][0]['@value']
    : 'Owner not found';
}

function getStationInfo(station) {
  let info = {
    'id': station['o:id'],
    'dbLink': getDBLink(station['o:id']),
    'infoSourceDate': station['pro:dateDisplay'][0]['@value'],
    'owner': getOwner(station['pro:infoSource'][0]['value_resource_id']),
  };
  return info;
}

function getProvenanceStations(id) {
  let stations = itemsData.value
    .filter(item => item['o:resource_template']['o:id'] === 8)
    .filter(item => item['pro:relatesToCulturalAsset'][0]['value_resource_id'] === id)
  if (!stations.length) {
    return 'No provenance stations found';
  }
  let mappedStations = stations.map(station => {
    return {
      'label': station['dcterms:title'][0]['@value'],
      'dbLink': getDBLink(station['o:id']),
      'sortDate': getSortDate(station),
      'stationInfo': getStationInfo(station),
    }
  });
    return mappedStations;
}

function getRelatedInformationUnits(id) {
  let relatedItems = itemsData.value
    .filter(item => item['o:resource_template']['o:id'] === 7)
    .filter(item => item['pro:relatesToCulturalAsset'][0]['value_resource_id'] === id)
    .map(item => {
      let mappedItem = {};
      mappedItem['id'] = item['o:id'];
      mappedItem['dbLInk'] = getDBLink(item['o:id']);
      mappedItem['infoSource'] = item['pro:infoSource'][0]['@value'] || 'No info source';
      mappedItem['infoSourceDate'] = item['pro:infoSourceDate'][0]['@value'];
      mappedItem['label'] = item['o:title'];
      const provenanceProps = Object.keys(item).filter(key => key.startsWith('pro:'));
      mappedItem['claims'] = provenanceProps
        .filter(prop => prop.startsWith('pro:ca'))
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
      }) ;
    }
  }
  for (let claim in claims) {
    claims[claim].sort((a, b) => a.infoSourceDate.localeCompare(b.infoSourceDate));
  }

  return claims
  // return relatedItems;
}


function getDBLink(id) {
  return `https://omeka-s-t1.berlin-university-collections.de/admin/item/${id}`;
}
const currentInput = ref('');
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
function clearSearch() {
  currentInput.value = '';
  selectedItem.value = null;
  router.push({ query: { ...route.query, item: null } });
}
const selectedItem = ref(null);
function selectItem(id) {
  const item = items.value.find(item => item.id === id);
  if (item) {
    selectedItem.value = item; // Set the selected item
    currentInput.value = ''; // Clear the input
    router.push({ query: { ...route.query, item: id } }); // Add ?item=id to the route
  }
}
function getIllustrations(id) {
  let illustrations = itemsData.value
    .filter(item => item['o:resource_template']['o:id'] === 9)
    .filter(item => item['pro:relatesToCulturalAsset'][0]['value_resource_id'] === id)
    .map(item => {
      return {
        'label': item['dcterms:title'][0]['@value'],
        'dbLink': getDBLink(item['o:id']),
        'url': item['thumbnail_display_urls']['large'],
      }
    });
  return illustrations;
}
function downloadJson(jsonContent) {
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dossier.json';
  a.click();
  URL.revokeObjectURL(url);
}
function downloadMd(jsonContent) {
  const mdContent = createMdDossier(jsonContent);
  const blob = new Blob([mdContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dossier.md';
  a.click();
  URL.revokeObjectURL(url);
}

function formatHeaderData(headerData) {
  return headerData.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

// Automatically select item based on query parameter
onMounted(async () => {
  try {
    const response = await fetch('https://omeka-s-t1.berlin-university-collections.de/api/items');
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    itemsData.value = await response.json();

    const queryItemId = route.query.item;
    if (queryItemId) {
      selectItem(Number(queryItemId)); // Select the item if ?item=<id> exists
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    loading.value = false;
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


