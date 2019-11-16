<script>
  export let submittedValue;
  export let onSubmit;
  import NumericInputv2 from "./NumericInputv2.svelte";
  import { VoiceInput } from "../speech/VoiceInput";

  const voiceInput = new VoiceInput();

  console.log("new VoiceInput()");

  voiceInput.startAfter(50);
  voiceInput.onResult(result => {
    inputValue = result;
  });

  let inputValue;
  $: console.log(inputValue);
  let isFocused;

  const handleInput = e => {
    if (isNaN(parseInt(e.data))) {
      inputValue = inputValue.slice(0, inputValue.length - 1);
    }
  };

  const handleSubmit = () => {
    console.log(inputValue);
    onSubmit(inputValue);
    inputValue = "";
    voiceInput.stop();
  };
</script>

<style>

</style>

<div>
  <NumericInputv2 maxLength={3} {onSubmit} submittedValue={inputValue} />
</div>
