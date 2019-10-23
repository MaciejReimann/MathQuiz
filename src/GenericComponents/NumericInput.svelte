<script>
  export let onSubmit;
  export let onNavigate;
  export let isFocused;

  let inputNode;
  let inputValue = "";
  let isInvalid = false;

  $: isFocused && inputNode && inputNode.focus();
  $: isInvalid = inputValue && isNaN(parseInt(inputValue));

  function handleSubmit(e) {
    onSubmit(e.target.value);
  }

  function keydownHandler(e) {
    onNavigate(e.key);
  }

  function handleInput() {
    isInvalid && console.log("It's invalid!!!");
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
  .invalid {
    background-color: pink;
  }
</style>

<input
  type="text"
  maxlength="2"
  class:invalid={isInvalid}
  bind:this={inputNode}
  bind:value={inputValue}
  on:input={handleInput}
  on:change={handleSubmit}
  on:keydown={keydownHandler} />
