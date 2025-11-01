/**
 * Configuration and scene definitions for COVID-19 scrollytelling
 */

export const CONFIG = {
  // Map dimensions
  mapWidth: 960,
  mapHeight: 600,

  // Color scales
  colors: {
    ocean: '#1a1a2e',
    land: '#16213e',
    border: '#0f3460',
    noData: '#2a2a3e',
    casesScale: ['#fff7ec', '#fee8c8', '#fdd49e', '#fc8d59', '#e34a33', '#b30000'],
    vaccineScale: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c'],
  },

  // Data thresholds for color mapping
  casesPerMillionDomain: [1, 10, 100, 1000, 10000, 100000],
  vaccinationPercentDomain: [0, 10, 25, 50, 75, 90, 100],

  // Animation durations (ms)
  transitions: {
    default: 1000,
    fast: 500,
    slow: 2000,
  },

  // Paths
  data: {
    covidData: 'data/covid-data.json',
    worldMap: 'data/world-110m.json',
    timelineEvents: 'data/timeline-events.json',
  },
};

/**
 * Scroll scenes defining the narrative structure
 * Each scene corresponds to a scroll section and updates the map
 */
export const SCENES = [
  {
    index: 0,
    date: '2019-12-31',
    title: 'The Beginning',
    subtitle: 'December 2019',
    narrative: `
      In late December 2019, mysterious pneumonia cases emerged in Wuhan, China.
      The world was just beginning to take notice of what would become the most
      significant pandemic in a century.
    `,
    mapFocus: null, // null = global view
    showVaccinations: false,
  },
  {
    index: 1,
    date: '2020-02-29',
    title: 'Asian Spread',
    subtitle: 'February 2020',
    narrative: `
      The virus rapidly spread across Asia. South Korea, Japan, Iran, and Singapore
      reported growing outbreaks. Countries scrambled to implement testing and
      containment measures.
    `,
    mapFocus: 'Asia',
    showVaccinations: false,
  },
  {
    index: 2,
    date: '2020-03-15',
    title: 'Europe Becomes Epicenter',
    subtitle: 'March 2020',
    narrative: `
      In March, WHO declared COVID-19 a pandemic. Italy's healthcare system strained
      under pressure. Spain and France followed with exponential growth. Europe
      became the new epicenter.
    `,
    mapFocus: 'Europe',
    showVaccinations: false,
  },
  {
    index: 3,
    date: '2020-04-15',
    title: 'Global Lockdowns',
    subtitle: 'April 2020',
    narrative: `
      By April, over 3 billion people were under lockdown. The United States emerged
      as the hardest hit nation. Cities turned into ghost towns. The world stood still.
    `,
    mapFocus: null,
    showVaccinations: false,
  },
  {
    index: 4,
    date: '2020-07-01',
    title: 'Americas Crisis',
    subtitle: 'July 2020',
    narrative: `
      Summer brought devastation to the Americas. The United States, Brazil, and
      Mexico led the world in daily cases. Latin America struggled with overwhelmed
      healthcare systems.
    `,
    mapFocus: 'Americas',
    showVaccinations: false,
  },
  {
    index: 5,
    date: '2020-10-01',
    title: 'Second Wave',
    subtitle: 'October 2020',
    narrative: `
      As autumn arrived in the Northern Hemisphere, a second wave began. Europe
      faced renewed lockdowns. Global cases surpassed 40 million. The world braced
      for a dark winter.
    `,
    mapFocus: 'Europe',
    showVaccinations: false,
  },
  {
    index: 6,
    date: '2020-12-31',
    title: 'A Glimmer of Hope',
    subtitle: 'December 2020',
    narrative: `
      The year ended with cautious optimism. Vaccines showed remarkable efficacy.
      The UK and US began mass vaccination campaigns. But the virus continued
      its relentless spread.
    `,
    mapFocus: null,
    showVaccinations: false,
  },
  {
    index: 7,
    date: '2021-04-30',
    title: 'India\'s Crisis',
    subtitle: 'April 2021',
    narrative: `
      The Delta variant triggered a catastrophic surge in India. Over 400,000 daily
      cases overwhelmed hospitals. Oxygen shortages became critical. The world
      watched in horror.
    `,
    mapFocus: 'Asia',
    showVaccinations: false,
  },
  {
    index: 8,
    date: '2021-08-01',
    title: 'Delta Goes Global',
    subtitle: 'August 2021',
    narrative: `
      Delta spread globally, becoming the dominant variant. Even highly vaccinated
      countries saw breakthrough cases. The pandemic was far from over.
    `,
    mapFocus: null,
    showVaccinations: false,
  },
  {
    index: 9,
    date: '2021-12-15',
    title: 'Omicron Wave',
    subtitle: 'December 2021',
    narrative: `
      A new variant, Omicron, spread faster than anything before. Daily cases
      shattered records worldwide. But hospitalization rates remained lower.
      Vaccines provided crucial protection.
    `,
    mapFocus: null,
    showVaccinations: false,
  },
  {
    index: 10,
    date: '2022-06-01',
    title: 'Living With COVID',
    subtitle: 'Mid 2022',
    narrative: `
      By mid-2022, many countries shifted strategies. Vaccines and treatments
      became widely available. Life gradually returned to normal, though the
      virus remained a threat.
    `,
    mapFocus: null,
    showVaccinations: false,
  },
  {
    index: 11,
    date: '2023-05-05',
    title: 'Emergency Ends',
    subtitle: 'May 2023',
    narrative: `
      WHO declared an end to COVID-19 as a global health emergency. Over 6 million
      lives lost. Billions vaccinated. The pandemic transitioned to an endemic phase.
    `,
    mapFocus: null,
    showVaccinations: false,
  },
  {
    index: 12,
    date: '2024-01-01',
    title: 'Data Sources',
    subtitle: 'References',
    narrative: `
      This visualization is based on data from Our World in Data COVID-19 Dataset,
      the World Health Organization (WHO), and Natural Earth for map data.
      The timeline shows the global impact of COVID-19 from December 2019 through January 2024,
      tracking cases, deaths, and vaccination progress across 58 countries.
    `,
    mapFocus: null,
    showVaccinations: false,
  },
];

/**
 * ISO3 country code to name mapping (for TopoJSON matching)
 */
export const COUNTRY_NAMES = {
  USA: 'United States',
  GBR: 'United Kingdom',
  CHN: 'China',
  IND: 'India',
  BRA: 'Brazil',
  RUS: 'Russia',
  FRA: 'France',
  DEU: 'Germany',
  JPN: 'Japan',
  KOR: 'South Korea',
  ITA: 'Italy',
  ESP: 'Spain',
  CAN: 'Canada',
  AUS: 'Australia',
  MEX: 'Mexico',
  IDN: 'Indonesia',
  TUR: 'Turkey',
  SAU: 'Saudi Arabia',
  ARG: 'Argentina',
  ZAF: 'South Africa',
  // Add more as needed
};
