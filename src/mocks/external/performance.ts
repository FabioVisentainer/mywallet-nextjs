// Simulates a third-party market-data provider (portfolio value history + benchmark index).
// Swap this module for a real fetch() to a market-data API without touching callers.

export const months = [
  "Sep 24", "Oct 24", "Nov 24", "Dec 24", "Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25", "Jun 25", "Jul 25", "Aug 25",
  "Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26",
];

export const series = [71.2, 73.4, 72.1, 75.6, 78.3, 77.0, 80.6, 83.7, 82.4, 86.3, 89.4, 87.9, 92.4, 95.2, 93.4, 98.7, 102.5, 100.6, 106.0, 110.3, 108.1, 113.3, 117.9, 122.7];

export const benchSeries = [71.2, 72.0, 70.8, 72.9, 74.1, 73.5, 75.8, 77.2, 76.4, 78.9, 80.3, 79.1, 81.6, 83.0, 82.1, 84.8, 86.9, 85.6, 88.4, 90.7, 89.3, 92.0, 94.6, 97.1];
