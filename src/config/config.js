const development = {
  GRAPHQL_API_HOST: '192.168.99.100:8081/v1/graphql',
  IS_PROD: false,
  FFC_API_HOST: 'localhost:1337/api/v1'
};
const production = {
  GRAPHQL_API_HOST: 'api.fuelfor.cheap/v1/graphql',
  IS_PROD: true,
  FFC_API_HOST: 'api.fuelfor.cheap/api/v1'
};
const c = IS_PRODUCTION ? production : development;

export const IS_PROD = c.IS_PROD;
export const GRAPHQL_API_HOST = c.GRAPHQL_API_HOST;
export const FFC_API_HOST = c.FFC_API_HOST;