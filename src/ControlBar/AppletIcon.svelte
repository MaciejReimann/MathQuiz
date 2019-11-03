<script>
  export let name;

  import { getContext } from "svelte";
  const appStore = getContext("appStore");

  let selectedAppletID;
  $: isSelected = selectedAppletID === name;

  appStore.subscribe(value => {
    selectedAppletID = value;
  });

  const handleClick = () => {
    appStore.set(name);
  };
</script>

<style>
  .wrapper {
    width: 150px;
    height: 70px;

    display: flex;
    justify-content: center;
    align-items: center;

    border: 1px solid black;
    background-color: transparent;
  }

  .wrapper:hover {
    cursor: pointer;
    background-color: white;
  }

  .selected {
    background-color: white;
  }
</style>

<div on:click={handleClick} class:selected={isSelected} class="wrapper">
  {name}
</div>
