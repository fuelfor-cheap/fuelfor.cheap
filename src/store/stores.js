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
    name: 'Last month',
    timestamp: () => new Date(2020, 0),
    days: 31
  }
]);
export const selectedFuelForLockDefault = { id: '', datetime: '', price: 0 };
export const selectedFuelForLock = writable(selectedFuelForLockDefault);

export const fuelAPIAccessToken = writable(localStorage.getItem('api_access_token'));
export const fuelAPIAccountName = writable(localStorage.getItem('api_account_name'));
export const fuelAPIDeviceID = writable(localStorage.getItem('api_device_id'));
export const fuelAPIDeviceSecret = writable(localStorage.getItem('api_device_secret'));
export const fuelAPIAccountId = writable(localStorage.getItem('api_account_id'));
export const fuelAPILockFuelType = writable(localStorage.getItem('api_lock_fuel_type'));
export const fuelAPILockCentsPer = writable(localStorage.getItem('api_lock_cents_per'));
export const fuelAPILockExpires = writable(localStorage.getItem('api_lock_expires'));
