import { query, subscribe } from 'svelte-apollo';
import {
  QUERY_PRICES, QUERY_FUEL_TYPES, FUEL_PRICE_TO_POSTCODE,
  QUERY_PRICE_TREND_FOR_FUEL_TYPE,
} from './queries';
import { prices, fuels } from './stores';
import { client } from './graphql';

export const getDataWithTimestamp = async (datetime) => {
  const graph = await query(client, { query: QUERY_PRICES });
  const priceHistory = (await graph.result()).data.price_history;
  prices.set(priceHistory);
};

export const getFuelTypes = async () => {
  const graph = await query(client, { query: QUERY_FUEL_TYPES });
  const fuelTypes = (await graph.result()).data.fuel_types;
  const obj = fuelTypes.reduce((o, type) => {
    o[type.id] = type;
    return o;
  }, {});
  fuels.set(obj);
};

export const getLatLongFromFuelPrice = async (datetime, fuelType) => {
  const graph = await query(client, {
    query: FUEL_PRICE_TO_POSTCODE,
    variables: { date: datetime, fuelType }
  });
  const latLongFuelPrice = (await graph.result()).data.price_history[0];
  return latLongFuelPrice;
}

export const getFuelTypePriceTrendForTimePeriod = async (datetime, fuelType) => {
  const graph = await query(client, {
    query: QUERY_PRICE_TREND_FOR_FUEL_TYPE,
    variables: { date: datetime, fuelType }
  });
  const data = (await graph.result()).data.price_history;
  return data;
}
