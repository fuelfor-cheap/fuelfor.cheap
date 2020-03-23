<script>
  import { getContext } from 'svelte';
  import Content from './content';

  const { open } = getContext('simple-modal');

  // const showSurprise = () => {
  //   open(Surprise, { message: "It's a modal!" });
  // };
  function toggleModal() {
    open(Content);
  }
</script>

<a href="#" on:click={toggleModal}>
  changelog
</a>

<style>
  a {
    text-decoration: none;
  }

  a:visited {
    color: inherit;
  }
</style>