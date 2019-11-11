<script>
  export let name, id, handleClick, isSelected;
  import { getContext } from "svelte";
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

<div
  on:click={() => handleClick(id)}
  class:selected={isSelected}
  class="wrapper">
  {name}
</div>
