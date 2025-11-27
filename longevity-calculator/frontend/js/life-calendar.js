/**
 * Life Calendar Visualization
 * Visual representation of life in weeks - inspired by "Wait But Why"
 * Shows lived weeks vs. remaining weeks in a grid format
 */

class LifeCalendar {
  constructor(containerId, currentAge, lifeExpectancy) {
    this.container = document.getElementById(containerId);
    this.currentAge = currentAge;
    this.lifeExpectancy = Math.ceil(lifeExpectancy);
    this.weeksPerYear = 26;
    this.currentWeek = Math.floor(currentAge * this.weeksPerYear);
    this.totalWeeks = Math.ceil(this.lifeExpectancy * this.weeksPerYear);
  }

  /**
   * Render life calendar grid
   */
  render() {
    this.container.innerHTML = '';

    // Create year markers every 10 years
    const maxYears = Math.ceil(this.totalWeeks / this.weeksPerYear);

    // Add year labels
    const yearLabelsRow = document.createElement('div');
    yearLabelsRow.className = 'year-labels';
    yearLabelsRow.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${this.weeksPerYear}, 1fr);
      gap: 2px;
      padding: 0.5rem 1rem;
      font-size: 0.625rem;
      color: var(--gb-dark);
      font-family: 'Press Start 2P', monospace;
    `;

    // Add year label every 10 years
    for (let year = 0; year <= maxYears; year += 10) {
      const label = document.createElement('div');
      label.textContent = `${year}y`;
      label.style.gridColumn = `1 / span ${this.weeksPerYear}`;
      label.style.textAlign = 'left';
      yearLabelsRow.appendChild(label);

      // Add the grid rows for these 10 years
      for (let y = year; y < year + 10 && y <= maxYears; y++) {
        const weekRow = this.createYearRow(y);
        this.container.appendChild(weekRow);
      }
    }

    // Add tooltip div if doesn't exist
    this.createTooltip();
  }

  /**
   * Create a single year row (52 weeks)
   */
  createYearRow(year) {
    const row = document.createElement('div');
    row.className = 'calendar-year-row';
    row.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${this.weeksPerYear}, 1fr);
      gap: 2px;
    `;

    for (let week = 0; week < this.weeksPerYear; week++) {
      const absoluteWeek = year * this.weeksPerYear + week;

      if (absoluteWeek >= this.totalWeeks) {
        break;
      }

      const cell = document.createElement('div');
      cell.className = absoluteWeek < this.currentWeek ? 'week-cell lived' : 'week-cell remaining';
      cell.dataset.week = absoluteWeek;
      cell.dataset.year = year;
      cell.dataset.weekInYear = week;

      // Add hover effect
      cell.addEventListener('mouseenter', (e) => this.showWeekTooltip(e, year, week, absoluteWeek));
      cell.addEventListener('mouseleave', () => this.hideWeekTooltip());

      row.appendChild(cell);
    }

    return row;
  }

  /**
   * Create tooltip element
   */
  createTooltip() {
    let tooltip = document.getElementById('week-tooltip');

    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'week-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        padding: 0.5rem 0.75rem;
        background-color: var(--gb-darkest);
        color: var(--screen-bg);
        border-radius: 4px;
        font-size: 0.75rem;
        font-family: 'Courier New', monospace;
        pointer-events: none;
        z-index: 1000;
        display: none;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      `;
      document.body.appendChild(tooltip);
    }

    this.tooltip = tooltip;
  }

  /**
   * Show tooltip on week hover
   */
  showWeekTooltip(event, year, weekInYear, absoluteWeek) {
    const tooltip = this.tooltip;
    const isLived = absoluteWeek < this.currentWeek;

    const ageAtWeek = (absoluteWeek / this.weeksPerYear).toFixed(1);
    const status = isLived ? 'Lived' : 'Remaining';

    tooltip.innerHTML = `
      <strong>Year ${year}, Week ${weekInYear + 1}</strong><br>
      Age: ${ageAtWeek} years<br>
      Status: ${status}
    `;

    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 15}px`;
    tooltip.style.top = `${event.pageY - 10}px`;
  }

  /**
   * Hide tooltip
   */
  hideWeekTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }
}

export { LifeCalendar };
