/**
 * Map rendering module using D3.js
 * Handles world map rendering, country coloring, and tooltips
 */

import { CONFIG } from './config.js';
import { DataLoader } from './dataLoader.js';

export class MapRenderer {
  constructor(containerId, dataLoader) {
    this.container = d3.select(containerId);
    this.dataLoader = dataLoader;
    this.svg = null;
    this.g = null;
    this.projection = null;
    this.path = null;
    this.countries = null;
    this.colorScale = null;
    this.vaccineColorScale = null;
    this.currentDate = null;
    this.tooltip = null;

    // Initialize
    this.init();
  }

  /**
   * Initialize SVG, projection, and scales
   */
  init() {
    // Create SVG
    const width = this.container.node().clientWidth;
    const height = this.container.node().clientHeight;

    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create main group
    this.g = this.svg.append('g');

    // Setup projection (Mercator centered on world)
    this.projection = d3
      .geoMercator()
      .scale(150)
      .translate([width / 2, height / 2 + 50]);

    this.path = d3.geoPath().projection(this.projection);

    // Create color scales
    this.colorScale = d3
      .scaleLog()
      .domain(CONFIG.casesPerMillionDomain)
      .range(CONFIG.colors.casesScale)
      .clamp(true);

    this.vaccineColorScale = d3
      .scaleLinear()
      .domain(CONFIG.vaccinationPercentDomain)
      .range(CONFIG.colors.vaccineScale)
      .clamp(true);

    // Create tooltip
    this.createTooltip();

    console.log('✓ Map renderer initialized');
  }

  /**
   * Render world map from TopoJSON data
   */
  renderMap() {
    const worldData = this.dataLoader.worldMap;

    // Convert TopoJSON to GeoJSON
    const countries = topojson.feature(worldData, worldData.objects.countries);

    console.log('Rendering world map with', countries.features.length, 'countries');

    // Draw countries
    this.countries = this.g
      .selectAll('.country')
      .data(countries.features)
      .join('path')
      .attr('class', 'country')
      .attr('d', this.path)
      .attr('fill', CONFIG.colors.land)
      .attr('stroke', CONFIG.colors.border)
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => this.onCountryMouseEnter(event, d))
      .on('mousemove', (event, d) => this.onCountryMouseMove(event, d))
      .on('mouseleave', (event, d) => this.onCountryMouseLeave(event, d));

    console.log('✓ World map rendered');
  }

  /**
   * Update map colors based on current date and scene
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {boolean} showVaccinations - Whether to show vaccination data
   */
  updateMap(date, showVaccinations = false) {
    this.currentDate = date;
    const data = this.dataLoader.getDataForDate(date);

    console.log(`Updating map for ${date}, vaccination mode: ${showVaccinations}`);

    // Update country colors with transition
    this.countries
      .transition()
      .duration(CONFIG.transitions.default)
      .attr('fill', (d) => {
        // Get country code from feature properties
        const countryCode = this.getCountryCode(d);
        const countryData = data[countryCode];

        if (!countryData) {
          return CONFIG.colors.noData;
        }

        if (showVaccinations && countryData.peopleFullyVaccinated > 0) {
          // Show vaccination percentage
          const vaccinationPct = (countryData.peopleFullyVaccinated / countryData.population) * 100;
          return this.vaccineColorScale(vaccinationPct);
        } else {
          // Show cases per million (red gradient)
          if (countryData.casesPerMillion === 0) {
            return CONFIG.colors.land;
          }
          return this.colorScale(countryData.casesPerMillion);
        }
      })
      .attr('opacity', (d) => {
        const countryCode = this.getCountryCode(d);
        const countryData = data[countryCode];
        return countryData ? 1 : 0.3;
      });
  }

  /**
   * Update map smoothly without transitions (for progress-based scrolling)
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {boolean} showVaccinations - Whether to show vaccination data
   */
  updateMapSmooth(date, showVaccinations = false) {
    this.currentDate = date;
    const data = this.dataLoader.getDataForDate(date);

    // Update country colors instantly (no transition)
    this.countries
      .attr('fill', (d) => {
        const countryCode = this.getCountryCode(d);
        const countryData = data[countryCode];

        if (!countryData) {
          return CONFIG.colors.noData;
        }

        if (showVaccinations && countryData.peopleFullyVaccinated > 0) {
          const vaccinationPct = (countryData.peopleFullyVaccinated / countryData.population) * 100;
          return this.vaccineColorScale(vaccinationPct);
        } else {
          if (countryData.casesPerMillion === 0) {
            return CONFIG.colors.land;
          }
          return this.colorScale(countryData.casesPerMillion);
        }
      })
      .attr('opacity', (d) => {
        const countryCode = this.getCountryCode(d);
        const countryData = data[countryCode];
        return countryData ? 1 : 0.3;
      });
  }

  /**
   * Get country code from GeoJSON feature
   * @param {Object} feature - GeoJSON feature
   * @returns {string} ISO3 country code
   */
  getCountryCode(feature) {
    // TopoJSON countries-110m uses numeric IDs (ISO 3166-1 numeric codes)
    // Map these to ISO3 alpha codes used in our data
    const idToCode = {
      // Major Countries
      840: 'USA', // United States
      156: 'CHN', // China
      356: 'IND', // India
      76: 'BRA', // Brazil
      643: 'RUS', // Russia
      250: 'FRA', // France
      276: 'DEU', // Germany
      380: 'ITA', // Italy
      724: 'ESP', // Spain
      826: 'GBR', // United Kingdom
      124: 'CAN', // Canada
      392: 'JPN', // Japan
      410: 'KOR', // South Korea
      36: 'AUS', // Australia
      484: 'MEX', // Mexico
      360: 'IDN', // Indonesia
      792: 'TUR', // Turkey
      682: 'SAU', // Saudi Arabia
      32: 'ARG', // Argentina

      // Africa
      710: 'ZAF', // South Africa
      818: 'EGY', // Egypt
      566: 'NGA', // Nigeria
      404: 'KEN', // Kenya
      504: 'MAR', // Morocco
      231: 'ETH', // Ethiopia
      12: 'DZA', // Algeria
      788: 'TUN', // Tunisia
      24: 'AGO', // Angola
      72: 'BWA', // Botswana
      854: 'BFA', // Burkina Faso
      108: 'BDI', // Burundi
      120: 'CMR', // Cameroon
      140: 'CAF', // Central African Republic
      148: 'TCD', // Chad
      178: 'COG', // Congo
      180: 'COD', // Democratic Republic of Congo
      384: 'CIV', // Côte d'Ivoire
      262: 'DJI', // Djibouti
      226: 'GNQ', // Equatorial Guinea
      232: 'ERI', // Eritrea
      266: 'GAB', // Gabon
      270: 'GMB', // Gambia
      288: 'GHA', // Ghana
      324: 'GIN', // Guinea
      624: 'GNB', // Guinea-Bissau
      430: 'LBR', // Liberia
      434: 'LBY', // Libya
      450: 'MDG', // Madagascar
      454: 'MWI', // Malawi
      466: 'MLI', // Mali
      478: 'MRT', // Mauritania
      480: 'MUS', // Mauritius
      508: 'MOZ', // Mozambique
      516: 'NAM', // Namibia
      562: 'NER', // Niger
      646: 'RWA', // Rwanda
      678: 'STP', // São Tomé and Príncipe
      686: 'SEN', // Senegal
      694: 'SLE', // Sierra Leone
      706: 'SOM', // Somalia
      728: 'SSD', // South Sudan
      729: 'SDN', // Sudan
      748: 'SWZ', // Eswatini (Swaziland)
      834: 'TZA', // Tanzania
      768: 'TGO', // Togo
      800: 'UGA', // Uganda
      894: 'ZMB', // Zambia
      716: 'ZWE', // Zimbabwe

      // Europe
      528: 'NLD', // Netherlands
      56: 'BEL', // Belgium
      756: 'CHE', // Switzerland
      40: 'AUT', // Austria
      752: 'SWE', // Sweden
      578: 'NOR', // Norway
      208: 'DNK', // Denmark
      246: 'FIN', // Finland
      616: 'POL', // Poland
      203: 'CZE', // Czech Republic
      620: 'PRT', // Portugal
      300: 'GRC', // Greece
      642: 'ROU', // Romania
      372: 'IRL', // Ireland
      804: 'UKR', // Ukraine
      348: 'HUN', // Hungary
      688: 'SRB', // Serbia
      191: 'HRV', // Croatia
      100: 'BGR', // Bulgaria
      703: 'SVK', // Slovakia
      705: 'SVN', // Slovenia
      70: 'BIH', // Bosnia and Herzegovina
      8: 'ALB', // Albania
      191: 'HRV', // Croatia
      498: 'MDA', // Moldova
      112: 'BLR', // Belarus
      440: 'LTU', // Lithuania
      428: 'LVA', // Latvia
      233: 'EST', // Estonia
      807: 'MKD', // North Macedonia
      499: 'MNE', // Montenegro

      // Asia
      364: 'IRN', // Iran
      376: 'ISR', // Israel
      784: 'ARE', // United Arab Emirates
      764: 'THA', // Thailand
      702: 'SGP', // Singapore
      458: 'MYS', // Malaysia
      608: 'PHL', // Philippines
      704: 'VNM', // Vietnam
      586: 'PAK', // Pakistan
      50: 'BGD', // Bangladesh
      4: 'AFG', // Afghanistan
      368: 'IRQ', // Iraq
      414: 'KWT', // Kuwait
      422: 'LBN', // Lebanon
      512: 'OMN', // Oman
      634: 'QAT', // Qatar
      760: 'SYR', // Syria
      887: 'YEM', // Yemen
      400: 'JOR', // Jordan
      116: 'KHM', // Cambodia
      418: 'LAO', // Laos
      104: 'MMR', // Myanmar
      524: 'NPL', // Nepal
      144: 'LKA', // Sri Lanka
      462: 'MDV', // Maldives
      96: 'BRN', // Brunei
      626: 'TLS', // Timor-Leste

      // Americas
      152: 'CHL', // Chile
      170: 'COL', // Colombia
      604: 'PER', // Peru
      218: 'ECU', // Ecuador
      188: 'CRI', // Costa Rica
      858: 'URY', // Uruguay
      862: 'VEN', // Venezuela
      68: 'BOL', // Bolivia
      600: 'PRY', // Paraguay
      320: 'GTM', // Guatemala
      340: 'HND', // Honduras
      558: 'NIC', // Nicaragua
      591: 'PAN', // Panama
      222: 'SLV', // El Salvador
      192: 'CUB', // Cuba
      214: 'DOM', // Dominican Republic
      332: 'HTI', // Haiti
      388: 'JAM', // Jamaica

      // Oceania
      554: 'NZL', // New Zealand
      242: 'FJI', // Fiji
      598: 'PNG', // Papua New Guinea
      90: 'SLB', // Solomon Islands
      548: 'VUT', // Vanuatu
      296: 'KIR', // Kiribati
      584: 'MHL', // Marshall Islands
      583: 'FSM', // Micronesia
      520: 'NRU', // Nauru
      585: 'PLW', // Palau
      882: 'WSM', // Samoa
      776: 'TON', // Tonga
      798: 'TUV', // Tuvalu
    };

    return idToCode[feature.id] || null;
  }

  /**
   * Create tooltip element
   */
  createTooltip() {
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'map-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.9)')
      .style('color', '#fff')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.3)')
      .style('max-width', '250px');
  }

  /**
   * Handle country mouse enter
   */
  onCountryMouseEnter(event, feature) {
    const countryCode = this.getCountryCode(feature);
    if (!countryCode) return;

    const data = this.dataLoader.getDataForDate(this.currentDate);
    const countryData = data[countryCode];

    if (!countryData) return;

    // Highlight country
    d3.select(event.target)
      .transition()
      .duration(100)
      .attr('stroke-width', 2)
      .attr('stroke', '#fff');

    // Build tooltip content
    const vaccinationPct = countryData.population > 0
      ? ((countryData.peopleFullyVaccinated / countryData.population) * 100).toFixed(1)
      : 0;

    let html = `
      <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
        ${countryData.name}
      </div>
      <div style="margin-bottom: 4px;">
        <strong>Cases:</strong> ${DataLoader.formatNumber(countryData.totalCases)}
      </div>
      <div style="margin-bottom: 4px;">
        <strong>Deaths:</strong> ${DataLoader.formatNumber(countryData.totalDeaths)}
      </div>
      <div style="margin-bottom: 4px;">
        <strong>Cases per million:</strong> ${countryData.casesPerMillion.toFixed(0)}
      </div>
    `;

    if (countryData.peopleFullyVaccinated > 0) {
      html += `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
          <div style="margin-bottom: 4px;">
            <strong>Vaccinated:</strong> ${DataLoader.formatNumber(countryData.peopleFullyVaccinated)}
          </div>
          <div>
            <strong>% Population:</strong> ${vaccinationPct}%
          </div>
        </div>
      `;
    }

    this.tooltip.html(html).style('visibility', 'visible');
  }

  /**
   * Handle country mouse move
   */
  onCountryMouseMove(event, feature) {
    this.tooltip
      .style('top', event.pageY + 10 + 'px')
      .style('left', event.pageX + 10 + 'px');
  }

  /**
   * Handle country mouse leave
   */
  onCountryMouseLeave(event, feature) {
    // Reset stroke
    d3.select(event.target)
      .transition()
      .duration(100)
      .attr('stroke-width', 0.5)
      .attr('stroke', CONFIG.colors.border);

    this.tooltip.style('visibility', 'hidden');
  }

  /**
   * Resize map (call on window resize)
   */
  resize() {
    const width = this.container.node().clientWidth;
    const height = this.container.node().clientHeight;

    this.svg.attr('viewBox', `0 0 ${width} ${height}`);
    this.projection.translate([width / 2, height / 2 + 50]);

    // Redraw paths
    this.countries.attr('d', this.path);
  }
}
