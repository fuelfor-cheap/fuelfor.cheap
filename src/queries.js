import { gql } from 'apollo-boost';

export const QUERY_PRICES = gql`
query PRICES($date: timestamptz) {
  price_history(where: {datetime: {_gt: $date}}, order_by: {datetime: asc}) {
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
query MyQuery($date: timestamptz) {
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
subscription MySubscription {
  price_history {
    price
    datetime
    fuelTypeByFuelType {
      name
    }
  }
}
`;