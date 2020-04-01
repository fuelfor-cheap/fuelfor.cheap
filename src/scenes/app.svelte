<div class="content">
	<div class="row around-xs">
		<div class="col-lg-4 col-md-5 col-sm-6 col-xs-11">
			<div class="wrap-right-panel">
				<FuelTypes />
				<br />
				<br />
				<Login />
			</div>
		</div>
	</div>

	<div class="floating-version">
		<div class="changelog-modal">
			<Modal closeButton={false}>
				<ChangelogToggle />
			</Modal>
		</div>
		&nbsp;
		v{'VERSION'}
	</div>
</div>

<style>
	.content {
		margin: 4.5rem .2rem;
	}

	.wrap-right-panel {
		margin-top: 1rem;
	}

	.floating-version {
		position: absolute;
		bottom: 0;
		right: 0;
	}

	.changelog-modal {
		display: inline-block;
	}

	/* Dropdown */
	.dropdown {
		display: inline-block;
		position: relative;
		color: var(--text-color-secondary);
	}
	.dropdown.overlay {
		float: right;
		right: -4px;
		z-index: 2;
	}

	.dd-button {
		display: inline-block;
		border: 2px solid white;
		border-radius: 4px;
		padding: 10px 30px 10px 20px;
		background-color: var(--nvidia);
		cursor: pointer;
		white-space: nowrap;
	}

	.dd-button:after {
		content: '';
		position: absolute;
		top: 50%;
		right: 15px;
		transform: translateY(-50%);
		width: 0; 
		height: 0; 
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 5px solid black;
	}

	/* .dd-button:hover {
		background-color: #eeeeee;
	} */


	.dd-input {
		display: none;
	}

	.dd-menu {
		position: absolute;
		top: 100%;
		border: 2px solid white;
		border-radius: 4px;
		padding: 0;
		margin: 2px 0 0 0;
		box-shadow: 0 0 6px 0 rgba(0,0,0,0.1);
		background-color: #ffffff;
		list-style-type: none;
		z-index: 11;
	}

	.dd-input + .dd-menu {
		display: none;
	} 

	.dd-input:checked + .dd-menu {
		display: block;
	} 

	.dd-menu li {
		padding: 10px 20px;
		cursor: pointer;
		white-space: nowrap;
	}

	.dd-menu li:hover {
		background-color: #f6f6f6;
	}

	.dd-menu li a {
		display: block;
		margin: -10px -20px;
		padding: 10px 20px;
	}

	.dd-menu li.divider{
		padding: 0;
		border-bottom: 1px solid #cccccc;
	}
</style>

<script>
	import { writable, get } from 'svelte/store';
	import { priceChartRange, chartRanges } from 'store/stores';
	import { getDataWithTimestamp } from 'store/data';
	const ranges = get(chartRanges);
	const changePriceChartRange = (index) => {
		return ($event) => {
			priceChartRange.set(index);

			// get new data based on the timestamp
			const timestamp = ranges[index].timestamp();
			getDataWithTimestamp(timestamp.toISOString());
		}
	};
	import { onMount, onDestroy } from 'svelte';
	let rangeIndex = get(priceChartRange);
	const rangeUnsub = priceChartRange.subscribe(value => rangeIndex = value);
	onDestroy(rangeUnsub);


	import { setClient } from 'svelte-apollo';
	import { client } from 'store/graphql';
	onMount(() => {
		setClient(client);

		const timestamp = ranges[rangeIndex].timestamp();
		getDataWithTimestamp(timestamp.toISOString());
	});

	// components
	// import PriceChart from 'components/price-chart';
	import FuelTypes from 'components/fuels';
	import Login from 'components/login';
	import Modal from 'svelte-simple-modal';
	import ChangelogToggle from 'components/changelog/toggle';
</script>
