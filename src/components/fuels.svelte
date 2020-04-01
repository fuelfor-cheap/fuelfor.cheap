<div class="text-center">
  <h2>{title}</h2>
  {#if accountName && accountName !== 'null'}
    <p>Click/Tap to select a fuel type below. Lock it in with the button below that...</p>
  {/if}
  <div class="table table--cols3 table-striped text-left">
    <div class="cell header fuel-colour"></div>
    <div class="cell header">Fuel Type</div>
    <div class="cell header">Cheapest Price</div>

    {#each types as { id, name, price, datetime }}
      <div
        class="cell fuel-colour border-left"
        class:selected-border={selectedFuelType.id === id}
        on:click={selectFuelTypeForLock(id, price, datetime)}
      >
        <div class={`colour-square fuel-${id}`} />
      </div>
      <div
        class="cell fuel-name border-mid"
        class:selected={selectedFuelType.id === id}
        class:selected-border={selectedFuelType.id === id}
        on:click={selectFuelTypeForLock(id, price, datetime)}
      >
        {#if lockFuelType !== 'null' && lockFuelType !== null && lockFuelType === id}
          LOCKED:
        {/if}
        {name}
      </div>
      <div
        class="cell fuel-price border-right"
        class:selected-border={selectedFuelType.id === id}
        on:click={selectFuelTypeForLock(id, price, datetime)}
      >
        <div class="row around-xs middle-xs">
          <div class="col-xs-6 align-right">
            <span class:green={lockFuelType === id}>
              {#if lockFuelType !== 'null' && lockFuelType !== null && lockFuelType === id}
                {lockCentsPer}<span class="lock-price-current">&nbsp;/&nbsp;{price}</span>
              {:else}
                {price}
              {/if}
            </span>
          </div>
          {#if Object.keys(fuelPriceChange).includes(id) && !(lockFuelType !== 'null' && lockFuelType !== null && lockFuelType === id)}
            <div class="col-xs-4">
              <span>
                {#if fuelPriceChange[id] > 0}
                  <Icon icon={faLongArrowAltUp} class="red" />
                {:else if fuelPriceChange[id] === 0}
                  <Icon icon={faMinus} />
                {:else}
                  <Icon icon={faLongArrowAltDown} class="green" />
                {/if}
              </span>
            </div>
            <div class="col-xs-2">
              <span class="price-change" style="min-width:1rem;">
                {#if fuelPriceChange[id] > 0}
                  +{fuelPriceChange[id].toFixed(2)}
                {:else}
                  {fuelPriceChange[id].toFixed(2)}
                {/if}
              </span>
            </div>
          {/if}
        </div>
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

  .header {
    text-align: center;
  }

  .fuel-price {
    font-weight: 600;
  }

  span.price-change {
    font-weight: 400;
    font-size: .95rem;
  }

  .fuel-price-lowest {
    font-weight: 400;
    color: var(--nvidia);
  }

  .price-header-lowest {
    font-size: .8rem;
    color: var(--nvidia);
  }

  .table-striped .cell:nth-child(6n+4),
  .table-striped .cell:nth-child(6n+5),
  .table-striped .cell:nth-child(6n+6) {
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

  .selected {
    color: var(--nvidia);
    font-weight: 600;
  }

  .fuel-colour, .fuel-name, .fuel-price {
    cursor: pointer;
  }

  .selected-border.border-mid {
    border-top: 1px solid var(--nvidia);
    border-bottom: 1px solid var(--nvidia);
  }
  .selected-border.border-left {
    border-top: 1px solid var(--nvidia);
    border-left: 1px solid var(--nvidia);
    border-bottom: 1px solid var(--nvidia);
  }
  .selected-border.border-right {
    border-top: 1px solid var(--nvidia);
    border-right: 1px solid var(--nvidia);
    border-bottom: 1px solid var(--nvidia);
  }

  .price-change {
    float: right;
  }

  :global(.green) {
    color: var(--nvidia);
  }

  :global(.red) {
    color: var(--supreme-98);
  }

  .lock-price-current {
    color: var(--text-color);
  }

  .align-right {
    text-align: right;
  }
</style>

<script>
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import {
    fuels,
    prices as allPrices,
    selectedFuelForLock,
    fuelAPIAccountName, fuelAPILockFuelType,
    fuelAPILockCentsPer, fuelAPILockExpires,
  } from 'store/stores';
  import { getFuelTypes, getFuelTypePriceTrendForTimePeriod } from 'store/data';
  
  import Icon from 'fa-svelte';
  import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
  import { faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons/faLongArrowAltUp';
  import { faLongArrowAltDown } from '@fortawesome/free-solid-svg-icons/faLongArrowAltDown';

  let fuelTypes = {};
  let prices = [];

  const fuelUnsub = fuels.subscribe(value => fuelTypes = value);
  const pricesUnsub = allPrices.subscribe(value => prices = value);

  let selectedFuelType = null;
  const fuelLockUnsub = selectedFuelForLock.subscribe(fuelType => {
    selectedFuelType = fuelType;
  });

  let accountName = '';
  const accountNameUnsub = fuelAPIAccountName.subscribe(name => {
    accountName = name;
  });

  let lockFuelType = '';
  const lockFuelTypeUnsub = fuelAPILockFuelType.subscribe(type => {
    lockFuelType = type;

    if (type !== 'null' && type !== null) {
      selectedFuelForLock.update(() => ({
        id: lockFuelType,
        price: 0,
        datetime: '',
      }));
      return;
    }

    selectedFuelForLock.update(() => ({
        id: '',
        price: 0,
        datetime: '',
      }));
  });

  let lockCentsPer = 0;
  const lockFuelCentsUnsub = fuelAPILockCentsPer.subscribe(cents => {
    lockCentsPer = cents;
  });

  let lockExpiry = '';
  const lockFuelExpiryUnsub = fuelAPILockExpires.subscribe(expires => {
    lockExpiry = expires;
  });

  onMount(() => {
    // fetch the fuel types on mount
    getFuelTypes();

    // set the selected fuel type to the our lock if applicable
    // if (lockFuelType !== 'null' && lockFuelType !== null) {
    //   selectedFuelForLock.update(() => ({
    //     id: lockFuelType,
    //     price: 0,
    //     datetime: '',
    //   }));
    // }
  });

  onDestroy(() => {
    fuelUnsub();
    pricesUnsub();
    fuelLockUnsub();
    accountNameUnsub();
    lockFuelTypeUnsub();
    lockFuelCentsUnsub();
    lockFuelExpiryUnsub();
  });

  $: selectFuelTypeForLock = (fuelType, price, datetime) => {
    // return an empty function for selecting fuel types
    // we're gonna take control and show the current fuel type locked in...
    if (lockExpiry !== 'null' && lockExpiry !== null) {
      return () => {};
    }

    return () => {
      selectedFuelForLock.update(() => ({ id: fuelType, price, datetime }));
    };
  }

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
      return type;
    }

    const price = matchingFuelTypes[0].price;
    const datetime = matchingFuelTypes[0].datetime;
    // figure out the lowest price in all our history
    const lowest = matchingFuelTypes.reduce((lowest, entry) => {
      if (entry.price <= lowest) {
        return entry.price;
      }

      return lowest;
    }, price);

    return { ...type, price, datetime, lowest };
  });
  $: {
    if (types.length > 0 && types[0].price === undefined) {
      types = [];
    }
  }

  // when the types are available, we need to loop over them all and figure out their difference
  let fuelPriceChange = {};
  $: {
    if (types.length > 0 && Object.keys(fuelPriceChange).length === 0) {
      // calculate our trend
      const lastWeek = new Date();
      // const daysInSeconds = (7) * 24 * 3600000;
      const daysInSeconds = (1) * 24 * 3600000;
      lastWeek.setTime(lastWeek.getTime() - daysInSeconds);
      types.forEach(async (type) => {
        // ignore this iteration if there's no price available...
        if (type.price === undefined) {
          return;
        }

        const id = type.id;
        const price = type.price;

        const weekPrices = await getFuelTypePriceTrendForTimePeriod(lastWeek.toISOString(), id);
        const average = weekPrices.map(p => p.price).reduce((a, b) => a + b, 0) / weekPrices.length;
        // figure out the change from our current price
        const change = average.toFixed(1) - price;

        // reset
        if (change === NaN) {
          fuelPriceChange = {};
          types = [];
          return;
        }

        fuelPriceChange[id] = -change;
      });
    }
  }

  $: title = 'Fuel lock';
  $: console.log(accountName);
  $: if (accountName && accountName !== 'null') {
    title = `Hi there ${accountName}`;
  } else {
    title = 'Fuel lock';
  }
</script>