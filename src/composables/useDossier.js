/**
 * Composable for creating and downloading dossier files
 */
export function useDossier() {
  /**
   * Create JSON dossier structure
   */
  const createJsonDossier = (item) => {
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
  };

  /**
   * Create Markdown dossier from JSON
   */
  const createMdDossier = (dossier) => {
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
  };

  /**
   * Download JSON dossier
   */
  const downloadJson = (jsonContent) => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dossier.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Download Markdown dossier
   */
  const downloadMd = (jsonContent) => {
    const mdContent = createMdDossier(jsonContent);
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dossier.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    createJsonDossier,
    createMdDossier,
    downloadJson,
    downloadMd,
  };
}
