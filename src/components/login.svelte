<div class="text-center">
  <!-- login form -->
  {#if !isCurrentlyLoggedIn}
    <form class="pure-form pure-form-stacked">
      <input
        type="email"
        class="pure-input-1"
        placeholder="Email"
        required
        bind:value={email}
      />
      <input
        type="password"
        class="pure-input-1"
        placeholder="Password"
        required
        bind:value={password}
      />
      <button
        type="button"
        class="pure-button pure-button-block"
        on:click={login}
      >
        Login
      </button>
    </form>

  <!-- buttons -->
  {:else}
    <div class="row around-xs">
      {#if lockFuelType !== 'null' && lockFuelType !== null}
        <div class="col-xs-12">
          <p>
            Your fuel lock expires in {formatFuelLockExpiry()}
          </p>
        </div>
      {/if}

      <div class="col-xs">
        <button
          type="button"
          class="pure-button pure-button-block"
          disabled={selectedFuelType === null || lockFuelType !== 'null' && lockFuelType !== null}
          on:click={lock}
        >
          Lock
          {#if selectedFuelTypeID !== null}
            @ {selectedFuelPrice} per L?
          {/if}
        </button>
      </div>
      <div class="col-xs-4">
        <button
          type="button"
          class="pure-button pure-button-block"
          on:click={logout}
        >
          Logout
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  input {
    color: var(--background-color);
  }

  .pure-button-block {
    width: 100%;
    background-color: var(--nvidia);
  }
</style>

<script>
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { IS_PROD, FFC_API_HOST } from 'config/config';
  import {
    fuelAPIAccessToken, fuelAPIAccountName,
    fuelAPIDeviceID, fuelAPIDeviceSecret,
    fuelAPIAccountId, fuelAPILockFuelType,
    fuelAPILockCentsPer, fuelAPILockExpires,
    selectedFuelForLock,
    fuels as fuelsSub,
  } from 'store/stores';
  import { getLatLongFromFuelPrice } from 'store/data';
  import moment from 'moment';

  let email = '';
  let password = '';

  let selectedFuelTypeID = null;
  let selectedFuelPrice = 0;
  let selectedFuelDatetime = new Date().toISOString();

  let deviceID = '';
  const deviceIDUnsub = fuelAPIDeviceID.subscribe(id => {
    deviceID = id;
    localStorage.setItem('api_device_id', id);
  });

  let token = null;
  const accessTokenUnsub = fuelAPIAccessToken.subscribe(accessToken => {
    token = accessToken;
    localStorage.setItem('api_access_token', accessToken);
  });

  let deviceSecret = '';
  const deviceSecretUnsub = fuelAPIDeviceSecret.subscribe(secret => {
    deviceSecret = secret;
    localStorage.setItem('api_device_secret', secret);
  });

  let accountId = '';
  const accountIdUnsub = fuelAPIAccountId.subscribe(id => {
    accountId = id;
    localStorage.setItem('api_account_id', id);
  });

  let fuels = {};
  const fuelsUnsub = fuelsSub.subscribe(fuelTypes => {
    fuels = fuelTypes;
  });

  const accountNameUnsub = fuelAPIAccountName.subscribe(name => {
    localStorage.setItem('api_account_name', name);
  });

  const selectedFuelUnsub = selectedFuelForLock.subscribe(fuel => {
    selectedFuelTypeID = fuel.id;
    selectedFuelPrice = fuel.price;
    selectedFuelDatetime = fuel.datetime;
  });

  let lockFuelType = '';
  const lockFuelTypeUnsub = fuelAPILockFuelType.subscribe(type => {
    lockFuelType = type;
    localStorage.setItem('api_lock_fuel_type', type);
  });

  const lockFuelCentsUnsub = fuelAPILockCentsPer.subscribe(cents => {
    localStorage.setItem('api_lock_cents_per', cents);
  });

  let lockExpiry = '';
  const lockFuelExpiryUnsub = fuelAPILockExpires.subscribe(expires => {
    lockExpiry = expires;
    localStorage.setItem('api_lock_expires', expires);
  });

  async function login() {
    let payload = { email, password };
    if (deviceID !== 'null' && deviceID !== null) {
      payload.device_id = deviceID;
    }

    const resp = await fetch(`${IS_PROD ? 'https' : 'http'}://${FFC_API_HOST}/sessions/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    fuelAPIAccessToken.update(() => resp.headers.get('X-Accesstoken'));
    fuelAPIDeviceID.update(() => resp.headers.get('X-DeviceID'));

    const details = await resp.json();
    fuelAPIAccountName.update(() => details.FirstName);
    fuelAPIDeviceSecret.update(() => details.DeviceSecretToken);
    fuelAPIAccountId.update(() => details.AccountId);

    getLock();
  }
  
  async function lock() {
    // lock in the fuel price by sending a request to the api
    // with the needed details like, fuel type, postcode location, etc.
    // with the users access token

    // query graphql to get the latitude/longitude of the fuel price
    const fuelPriceDetails = await getLatLongFromFuelPrice(selectedFuelDatetime, selectedFuelTypeID);
    console.log(fuelPriceDetails);

    // construct the payload
    const payload = {
      longitude: fuelPriceDetails.postCodeToLocation.longitude,
      latitude: fuelPriceDetails.postCodeToLocation.latitude,
      access_token: token,
      device_id: deviceID,
      device_secret: deviceSecret,
      fuel_type: selectedFuelTypeID,
      account_id: accountId,
    }

    const resp = await fetch(`${IS_PROD ? 'https' : 'http'}://${FFC_API_HOST}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const fuelLock = await resp.json();

    fuelAPILockFuelType.update(() => fuelLock.fuel_type);
    fuelAPILockCentsPer.update(() => fuelLock.cents_per_litre);
    fuelAPILockExpires.update(() => fuelLock.expires);
  }

  async function getLock() {
    const payload = {
      access_token: token,
      device_id: deviceID,
      device_secret: deviceSecret,
    };

    const resp = await fetch(`${IS_PROD ? 'https' : 'http'}://${FFC_API_HOST}/lock/existing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const fuelLocks = await resp.json();

    // set the lock values to null as there is no fuel lock available now
    if (fuelLocks.length === 0) {
      fuelAPILockFuelType.update(() => null);
      fuelAPILockCentsPer.update(() => null);
      fuelAPILockExpires.update(() => null);

      return;
    }

    const now = new Date().getTime();
    // filter locks that have expired
    let locks = fuelLocks.filter(l => new Date(l.expires).getTime() > now);
    // filter locks that have been redeemed
    locks = locks.filter(l => !l.has_redeemed);
    console.log(locks);

    if (locks.length === 0) {
      fuelAPILockFuelType.update(() => null);
      fuelAPILockCentsPer.update(() => null);
      fuelAPILockExpires.update(() => null);

      return;
    }

    if (locks.length === 1) {
      const fuelLock = locks[0];

      // update the low values (and localstorage with it) with the lock info returned from the api
      fuelAPILockFuelType.update(() => fuelLock.fuel_type);
      fuelAPILockCentsPer.update(() => fuelLock.cents_per_litre);
      fuelAPILockExpires.update(() => fuelLock.expires);
    }
  }

  function logout() {
    // just update the accesstoken and userinfo stores back to their default again
    fuelAPIAccessToken.update(() => null);
    fuelAPIAccountName.update(() => null);
    fuelAPIDeviceID.update(() => null);
    fuelAPIDeviceSecret.update(() => null);
    fuelAPIAccountId.update(() => null);
    fuelAPILockFuelType.update(() => null);
    fuelAPILockCentsPer.update(() => null);
    fuelAPILockExpires.update(() => null);
  }

  function formatFuelLockExpiry() {
    if (lockExpiry === 'null' || lockExpiry === null) {
      return null;
    }

    const d = moment(lockExpiry);
    return d.fromNow(true);
  }

  onMount(() => {
    // fetch the access token, device secret and id from the stores
    // if they're all available and not invalid/null
    // then we send a request to the api to get any current fuel lock
    if (token !== 'null' && token !== null) {
      if (deviceID !== 'null' && deviceID !== null) {
        if (deviceSecret !== 'null' && deviceSecret !== null) {
          getLock();
        }
      }
    }
  });

  onDestroy(() => {
    fuelsUnsub();
    accessTokenUnsub();
    accountNameUnsub();
    selectedFuelUnsub();
    deviceIDUnsub();
    deviceSecretUnsub();
    accountIdUnsub();
    lockFuelTypeUnsub();
    lockFuelCentsUnsub();
    lockFuelExpiryUnsub();
  });

  let selectedFuelType = null;
  $: if (fuels[selectedFuelTypeID] !== undefined) {
    selectedFuelType = fuels[selectedFuelTypeID].name;
  }
  // everything stored in localstorage is a "string"
  // unless the key doesn't exist, then it's null
  $: isCurrentlyLoggedIn = token !== 'null' && token !== null;
</script>
