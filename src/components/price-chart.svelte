<script>
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import Chartist from 'chartist';
  import ctAxisTitle from 'chartist-plugin-axistitle';
  import ctPointLabels from 'chartist-plugin-pointlabels';
  import legend from 'chartist-plugin-legend';

  import { prices as allPrices, fuels } from 'store/stores';
  let fuelTypes = {};
  let history = [];
  const fuelUnsub = fuels.subscribe(value => fuelTypes = value);
  const pricesUnsub = allPrices.subscribe(value => history = value);
  onDestroy(() => {
    fuelUnsub();
    pricesUnsub();
  });

  // let days = [];
  let labels = [];
  let series = [];
  // $: days = new Array(24 * range.days);
  // $: labels = Array.apply(null, days).map((_, index) => index);
  // $: if (Object.values(fuelTypes).length > 0) {
  //   const type = Object.values(fuelTypes)[0];
  //   labels = history.filter(p => p.fuel_type === type.id).map(p => p.datetime);
  //   console.log(labels);
  // }
  $: series = Object.values(fuelTypes).map(fuel => {
    // filter the prices for the current fuel
    const prices = history.filter(p => p.fuel_type === fuel.id);
    // const smallestDate = prices.reduce((date, p) => {
    //   const d = new Date(p.datetime);
    //   if (d.getTime() < date.getTime()) {
    //     return d;
    //   }

    //   return date;
    // }, new Date());
    // console.log('smallestDate', smallestDate);
    // const uniqueHours = prices.reduce((obj, price) => {
    //   const time = new Date(price.datetime);
    //   const date = time.getDate(); // dates are 0 indexed
    //   const hour = time.getHours();
    //   const dateOffset = time.getTime() - smallestDate.getTime();
    //   obj[hour + (dateOffset * 24)] = price.price;
    // }, {});
    // console.log('uniqueHours', uniqueHours);

    const name = fuel.name.toLowerCase().replace(/ /g, '-');
    return { name, data: prices.map(p => p.price) };
  });

  let options = {};
  let opts = {};
  $: options = {
    labels,
    series
  };
  $: opts = {
    fullWidth: true,
    series: Object.values(fuelTypes).reduce((obj, fuelType) => {
      const key = fuelType.name.toLowerCase().replace(/ /g, '-');
      obj[key] = {};
      return obj;
    }, {}),
    lineSmooth: Chartist.Interpolation.cardinal({
      tension: 0
    }),
    axisX: {
      showGrid: false,
      showLabel: false
    },
    chartPadding: {
      top: 75,
      right: 50
    },
    plugins: [
      // legend({
      //   legendNames: Object.values(fuelTypes).map(f => f.name),
      //   classNames: Object.values(fuelTypes)
      //     .map(f => `fueltype-chart-${f.name.toLowerCase().replace(/ /g, '-')}`),
      //   position: 'top'
      // }),
      // ctAxisTitle({
      //   axisY: {
      //     axisTitle: 'Price (cents)',
      //     axisClass: 'ct-axis-title',
      //     textAnchor: 'middle',
      //     flipTitle: false
      //   }
      // }),
      // ctPointLabels({
      //   textAnchor: 'right',
      //   labelClass: 'ct-label ct-label-inline',
      //   labelOffset: {
      //     x: 10,
      //     y: 4
      //   }
      // })
    ]
  }

  $: if (series.length > 0) {
    new Chartist.Line('#price-chart', options, opts);
  }

  onMount(async () => {
    new Chartist.Line('#price-chart', options, opts);
  });
</script>

<!-- <h3>{range.name}</h3> -->
<div id="price-chart" class="ct-chart ct-perfect-fourth limit-chart-height" />

<style>
  .limit-chart-height {
		height: 75%;
	}
</style>