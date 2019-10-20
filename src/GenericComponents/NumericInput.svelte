<script>
  export let onSubmit;
  let inputValue = "";

  function handleInput(e) {
    inputValue = e.target.value;
    console.log("validating: ", inputValue);
  }

  function handleSubmit(e) {
    onSubmit(e.target.value);
  }
</script>

<style>
  input {
    border: none;
    width: 100%;
    height: 100%;
    text-align: center;
    margin: 0;
  }
</style>

<input
  type="text"
  value={inputValue}
  on:input={handleInput}
  on:change={handleSubmit} />
