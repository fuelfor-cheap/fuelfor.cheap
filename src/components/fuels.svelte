<script>
  import { onDestroy } from 'svelte';
  import { fuels, prices as allPrices } from './../stores';
  let fuelTypes = {};
  let prices = [];

  const fuelUnsub = fuels.subscribe(value => fuelTypes = value);
  const pricesUnsub = allPrices.subscribe(value => prices = value);
  onDestroy(() => {
    fuelUnsub();
    pricesUnsub();
  });

  // transform the object structure into an array
  // and find our latest price for the respective fuel type
  $: types = Object.values(fuelTypes).map(type => {
    const matchingFuelTypes = prices.filter(price => price.fuel_type === type.id);
    const now = new Date();
    matchingFuelTypes.sort((a, b) => {
      var distancea = Math.abs(now - new Date(a.datetime));
      var distanceb = Math.abs(now - new Date(b.datetime));
      return distancea - distanceb; // sort a before b when the distance is smaller
    });

    if (matchingFuelTypes.length === 0) {
      return {};
    }

    const price = matchingFuelTypes[0].price;
    // figure out the lowest price in all our history
    const lowestPrice = matchingFuelTypes.reduce((lowest, entry) => {
      if (entry.price <= lowest) {
        return entry.price;
      }

      return lowest;
    }, price);

    return { price, ...type, lowest: lowestPrice };
  });
  // run a check to catch for an array of empty objects...
  $: if (types.length > 0 && Object.keys(types[0]).length === 0) {
    types = [];
  }
</script>

<div class="text-center">
  <div class="table table--cols3 table-striped text-left">
    <div class="cell header fuel-colour"></div>
    <div class="cell header">Fuel Type</div>
    <div class="cell header">
      Price&nbsp;/&nbsp;
      <span
        class="price-header-lowest"
        title="Lowest price in range"
      >
        Lowest
      </span>
    </div>

    {#each types as { id, name, price, lowest }}
      <div class="cell fuel-colour">
        <div class={`colour-square fuel-${id}`} />
      </div>
      <div class="cell fuel-name">{name}</div>
      <div class="cell fuel-price">
        <span>{price}</span>
        &nbsp;/&nbsp;
        <span class="fuel-price-lowest">{lowest}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .table {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    border-collapse: collapse;
  }

  .cell {
    box-sizing: border-box;
    flex-grow: 1;
    width: 100%;
    padding: .8rem 1rem;
    overflow: hidden;
    list-style: none;
    font-size: 1.1rem;
  }

  .table--cols2 > .cell {
    width: 50%;
  }

  .table--cols3 > .cell.fuel-colour {
    width: 10%;
  }
  .table--cols3 > .cell:not(.fuel-colour) {
    width: 45%;
  }

  .fuel-price {
    font-weight: 600;
  }

  .fuel-price-lowest {
    font-weight: 400;
    color: var(--nvidia);
  }

  .price-header-lowest {
    font-size: .8rem;
    color: var(--nvidia);
  }

  .table-striped .cell:not(.header):nth-child(6n+1),
  .table-striped .cell:not(.header):nth-child(6n+2),
  .table-striped .cell:not(.header):nth-child(6n+3) {
    background-color: rgb(23, 26, 26);
  }

  .colour-square {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 3px;

    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }

  .fuel-300b4ebb-2b7e-45ba-8724-95c82b425815 {
    background-color: var(--special-unleaded-91);
  }

  .fuel-f5bf8658-027a-4849-8822-564838bf0a7b {
    background-color: var(--extra-95);
  }

  .fuel-357a46c7-94e7-4d2b-9df3-1ac634d7cfd6 {
    background-color: var(--supreme-98);
  }

  .fuel-ae2c694e-4594-421b-ac9f-3f9c581724d0 {
    background-color: var(--special-e10-94);
  }

  .fuel-91e3012e-76d7-4634-9119-979504b98db4 {
    background-color: var(--special-diesel);
  }

  .fuel-c4f5e04b-4d42-4050-b7f7-ab1481275bf2 {
    background-color: var(--lpg);
  }
</style>