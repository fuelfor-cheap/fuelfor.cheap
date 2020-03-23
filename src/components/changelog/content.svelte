<script>
  // read the changelog
  // and create each version as a new line
  import changelog from 'store/changelog';
</script>

<h3>Changelog</h3>
{#each changelog as log}
  <p>
    {log}
  </p>
{/each}