import { query, subscribe } from 'svelte-apollo';
import { QUERY_PRICES, QUERY_FUEL_TYPES } from './queries';
import { prices, fuels } from './stores';
import { client } from './graphql';

export const getDataWithTimestamp = async (datetime) => {
  let graph = await query(client, { query: QUERY_PRICES, variables: { date: datetime } });
  const priceHistory = (await graph.result()).data.price_history;
  prices.set(priceHistory);
};

export const getFuelTypes = async () => {
  let graph = await query(client, { query: QUERY_FUEL_TYPES });
  const fuelTypes = (await graph.result()).data.fuel_types;
  const obj = fuelTypes.reduce((o, type) => {
    o[type.id] = type;
    return o;
  }, {});
  fuels.set(obj);
};
