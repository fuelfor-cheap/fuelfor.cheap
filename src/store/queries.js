import { gql } from 'apollo-boost';

export const QUERY_PRICES = gql`
query PRICES($date: timestamptz) {
  price_history(order_by: {datetime: desc}, limit: 6) {
    price
    datetime
    fuel_type
  }
}
`;

export const QUERY_FUEL_TYPES = gql`
query FUELTYPES {
  fuel_types {
    name
    id
  }
}
`;

export const GET_PRICE_HISTORY = gql`
query PRICE_HISTORY($date: timestamptz) {
  price_history(where: {datetime: {_gt: $date}}, order_by: {datetime: asc}) {
    price
    datetime
    fuelTypeByFuelType {
      name
    }
  }
  fuel_types {
    name
  }
}
`;

export const NEW_PRICES = gql`
subscription NEW_PRICES {
  price_history {
    price
    datetime
    fuelTypeByFuelType {
      name
    }
  }
}
`;

export const FUEL_PRICE_TO_POSTCODE = gql`
query FUEL_PRICE_TO_POSTCODE($date: timestamptz, $fuelType: uuid) {
  price_history(where: {datetime: {_eq: $date}, fuel_type: {_eq: $fuelType}}, limit: 1) {
    price
    datetime
    postCodeToLocation {
      longitude
      latitude
    }
  }
}
`;

export const QUERY_PRICE_TREND_FOR_FUEL_TYPE = gql`
query QUERY_PRICE_TREND_FOR_FUEL_TYPE($date: timestamptz, $fuelType: uuid) {
  price_history(where: {datetime: {_gt: $date}, fuel_type: {_eq: $fuelType}}) {
    price
    datetime
  }
}
`;
