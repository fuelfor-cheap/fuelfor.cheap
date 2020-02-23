import { writable, readable } from 'svelte/store';
const msInAMinute = 60000;

export const prices = writable([]);
export const fuels = writable({});
export const priceChartRange = writable(0);
export const chartRanges = readable([
  {
    name: 'Last 24 hours',
    timestamp: () => new Date(new Date() - 24 * 60 * msInAMinute),
    days: 1
  },
  {
    name: 'Last 48 hours',
    timestamp: () => new Date(new Date() - 48 * 60 * msInAMinute),
    days: 2
  },
  {
    name: 'Last 72 hours',
    timestamp: () => new Date(new Date() - 72 * 60 * msInAMinute),
    days: 3
  },
  {
    name: 'All time',
    timestamp: () => new Date(2020, 0),
    days: 31 // it's really just monthly actually
  }
]);
export const selectedFuelForLock = writable(null);