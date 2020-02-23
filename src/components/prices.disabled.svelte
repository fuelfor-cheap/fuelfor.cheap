<script>
  import { onMount } from 'svelte';
  import { getClient, query, mutate, subscribe } from 'svelte-apollo';
  import { SubscriptionClient } from 'subscriptions-transport-ws';
  import Chartist from 'chartist';
  import 'chartist-plugin-axistitle';
  import 'chartist-plugin-pointlabels';
  import { GET_PRICE_HISTORY, NEW_PRICES } from './../queries';

  const client = getClient();
  const numberOfDays = 2;
  // construct a timestamp that was (numberOfDays) ago
  const epoch = Math.round(new Date().getTime() / 1000);
  const backToTheFuture = epoch - (24 * numberOfDays * 3600);
  const thePast = new Date(backToTheFuture * 1000).toISOString();

  let fuelTypes = [];
  function render(data) {
    // create our labels over the last 72 hours...
    const base = Array(24 * numberOfDays);
    const columns = Array.apply(null, base).map((_, index) => index); // number of hours * number of days
    
    // break down all the dates from the data into their respective hours
    // the order of the data comes pre-sorted by the datetime in ascending format
    // that means old to new...

    // we also need to filter all the datetimes for uniqueness because we have one datetime
    // per fuel type
    const datetimes = data.price_history.map(p => p.datetime)
      .filter((el, i, a) => i === a.indexOf(el));
    let series = fuelTypes.map(fuel => {
      const days = datetimes.reduce((obj, d) => {
        obj[new Date(d).getDate()] = Array.apply(null, Array(24)).map(() => null);
        return obj;
      }, {});

      // filter the price history for prices of the current fuel type we're iterating over
      const points = data.price_history.filter(p => p.fuelTypeByFuelType.name === fuel);
      points.forEach(p => {
        const date = new Date(p.datetime).getDate();
        const array = days[date];
        const hour = new Date(p.datetime).getHours();
        array[hour] = p.price;
      });

      return Object.values(days).flat();
    });

    // remove columns that we don't have data for
    const days = datetimes.map(d => new Date(d).getDate())
      .filter((el, i, a) => i === a.indexOf(el));
    const lastDate = days[days.length-1];
    const lastDatetimes = datetimes.filter(d => new Date(d).getDate() ===  lastDate);
    const biggestLastDate = lastDatetimes[lastDatetimes.length-1];
    const lastHour = new Date(biggestLastDate).getHours();
    
    // now that we know the hour that the most recent datetime is
    // we need to change the length of the columns and series by taking 24 hours
    // (23 because 0 indexed) and subtracting that last hour
    // columns.length = columns.length - (23 - lastHour);
    // series = series.map(s => {
    //   s.length = s.length - (23 - lastHour);
    //   return s;
    // });
    return [columns.map(() => 1), series];
  }

  let options = {
    labels: [],
    series: []
  };
  const opts = {
    fullWidth: true,
    lineSmooth: Chartist.Interpolation.cardinal({
      fillHoles: true,
      tension: 0
    }),
    axisX: {
      showGrid: false,
      showLabel: false
    },
    chartPadding: {
      right: 50
    },
    plugins: [
      Chartist.plugins.ctAxisTitle({
        axisY: {
          axisTitle: 'Price (cents)',
          axisClass: 'ct-axis-title',
          textAnchor: 'middle',
          flipTitle: false
        }
      }),
      Chartist.plugins.ctPointLabels({
        textAnchor: 'right',
        labelClass: 'ct-label',
        labelOffset: {
          x: 10,
          y: 4
        }
      })
    ]
  }
  let chart = null;

  onMount(async () => {
    chart = new Chartist.Line('#price-chart', options, opts);
  });

  (async () => {
    // with our past timestamp, we'll pass that to graphql so we get results back from the last
    // (numberOfDays) days
    const prices = await query(client, { query: GET_PRICE_HISTORY, variables: { date: thePast } });
    let data = await prices.result();
    data = data.data;
    fuelTypes = data.fuel_types.map(f => f.name);

    const [ columns, series ] = render(data);
    options = {
      labels: columns,
      series: series
    };
    chart = new Chartist.Line('#price-chart', options, opts);
  })()
    .then(() => {
      // subscribe for updates
      const updated = subscribe(client, { query: NEW_PRICES });
      updated.subscribe(async fetch => {
        let data = await fetch;
        data = data.data;

        // add an extra key that the subscription lacks against the initial query
        const fuels = data.price_history.map(p => p.fuelTypeByFuelType.name)
          .filter((el, i, a) => i === a.indexOf(el))
          .map(f => ({ name: f }));
        data.fuel_types = fuels;

        // filter the prices that's between now and our maximum past date
        // data.price_history = data.price_history.filter(p => new Date(p.datetime).getTime() > new Date(thePast).getTime());

        console.log(data);

        const [ columns, series ] = render(data);
        options = {
          labels: columns,
          series: series
        };
        chart = new Chartist.Line('#price-chart', options, opts);
      });
    });
</script>

<div id="price-chart" class="ct-chart ct-perfect-fourth" />
