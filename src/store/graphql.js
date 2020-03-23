import ApolloClient from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { IS_PROD, GRAPHQL_API_HOST } from 'config/config';

// setup the graphql client
const httpLink = new HttpLink({
  uri: `${IS_PROD ? 'https' : 'http'}://${GRAPHQL_API_HOST}`
});
const wsLink = new WebSocketLink({
  uri: `${IS_PROD ? 'wss' : 'ws'}://${GRAPHQL_API_HOST}`,
  options: {
    reconnect: true
  }
});
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});