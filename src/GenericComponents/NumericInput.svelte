<script>
  export let onSubmit;
  export let onNavigate;
  export let isFocused;

  let inputValue = "";
  let inputNode;

  $: isFocused && inputNode && inputNode.focus();

  function handleInput(e) {
    inputValue = e.target.value;
    console.log("validating: ", inputValue);
  }

  function handleSubmit(e) {
    onSubmit(e.target.value);
  }

  function keydownHandler(e) {
    onNavigate(e.key);
  }
</script>

<style>
  input {
    border: none;
    width: 100%;
    height: 100%;
    text-align: center;
    margin: 0;
    color: blue;
  }
</style>

<input
  type="text"
  bind:this={inputNode}
  value={inputValue}
  on:input={handleInput}
  on:change={handleSubmit}
  on:keydown={keydownHandler} />
