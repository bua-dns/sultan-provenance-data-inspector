<script setup>
import { useCmsData } from '@/composables/useCmsData';

// Initialize CMS data composable
const { 
  informationUnits, 
  culturalAssets, 
  publications, 
  loading, 
  error 
} = useCmsData();

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
          </ul>
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
</style>



