# Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HomeView.vue                            │
│                    (Orchestration Layer)                        │
│                           ~58 lines                             │
└────────────┬───────────────────────────────────────────────────┘
             │
             │ imports & uses
             │
┌────────────▼────────────────────────────────────────────────────┐
│                      COMPOSABLES LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  useOmekaData    │  │  useProvenance   │                   │
│  │  - API fetching  │  │  - Stations      │                   │
│  │  - Loading state │  │  - Related info  │                   │
│  │  - Error state   │  │  - Owner logic   │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ useItemFilters   │  │   useSearch      │                   │
│  │ - Filter assets  │  │ - Input handling │                   │
│  │ - Transform data │  │ - Suggestions    │                   │
│  │ - Illustrations  │  │ - Selection      │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   useDossier     │  │  useFormatters   │                   │
│  │ - JSON creation  │  │ - Data format    │                   │
│  │ - MD creation    │  │ - Display utils  │                   │
│  │ - Downloads      │  │                  │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ reads from
             │
┌────────────▼────────────────────────────────────────────────────┐
│                    CONFIGURATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  api.config.js                                                  │
│  ├─ API_CONFIG (endpoints, base URL)                           │
│  ├─ TEMPLATE_IDS (resource templates)                          │
│  ├─ SHORTCUTS (external links)                                 │
│  └─ PROPERTY_PREFIXES (filtering prefixes)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


DATA FLOW
=========

┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ Omeka-S  │────▶│ useOmekaData │────▶│ useProvenance│────▶│HomeView  │
│   API    │     │  (fetch)     │     │  (process)   │     │(display) │
└──────────┘     └──────────────┘     └──────────────┘     └──────────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │useItemFilters│
                                      │  (transform) │
                                      └──────────────┘


DEPENDENCY INJECTION PATTERN
=============================

useOmekaData()
    │
    ├─▶ itemsData (ref)
    └─▶ getDBLink()
         │
         ├─▶ useProvenance(itemsData, getDBLink)
         │       │
         │       ├─▶ getProvenanceStations()
         │       └─▶ getRelatedInformationUnits()
         │
         └─▶ useItemFilters(itemsData, getDBLink, ...)
                 │
                 └─▶ items (computed)


BENEFITS
========

✓ Single Responsibility Principle
✓ Dependency Injection
✓ Testable Units
✓ Reusable Logic
✓ Centralized Configuration
✓ Clear Data Flow
✓ Maintainable Code
```
