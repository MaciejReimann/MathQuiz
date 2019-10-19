<script>
  export let submitAnswerHandler;
  let inputValue = "";

  function handleInput(e) {
    inputValue = e.target.value;
    console.log("validating: ", inputValue);
  }

  function handleSubmit(e) {
    submitAnswerHandler(e.target.value);
  }
</script>

<style>
  input {
    border: none;
    width: 100%;
    height: 100%;
    text-align: center;
  }
</style>

<input
  type="text"
  value={inputValue}
  on:input={handleInput}
  on:change={handleSubmit} />
