const development = {
  GRAPHQL_API_HOST: '192.168.99.100:8080',
  IS_PROD: false
};
const production = {
  GRAPHQL_API_HOST: 'api.fuelfor.cheap',
  IS_PROD: true
};
const c = IS_PRODUCTION ? production : development;

export const IS_PROD = c.IS_PROD;
export const GRAPHQL_API_HOST = c.GRAPHQL_API_HOST;