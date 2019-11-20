<script>
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  import { quizStore } from "./stores/quizStore";
  import { scoreStore } from "./stores/scoreStore";
  import { controllerStore } from "./stores/controllerStore";
  import { inputStore } from "./stores/inputStore";

  import { APP_PREFIX } from "./quizzes/constants";

  import Header from "./Layout//Header.svelte";
  import ControlBar from "./Layout/ControlBar.svelte";
  import QuizDisplay from "./Layout/QuizDisplay.svelte";
  import ToggleIconButton from "./GenericComponents/ToggleIconButton.svelte";

  import { fetchData, submitQuizzes } from "./api/api";

  setContext("quizStore", quizStore);
  setContext("scoreStore", scoreStore);
  setContext("controllerStore", controllerStore);
  setContext("inputStore", inputStore);
</script>

<style>
  :global(body, html) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: #e8ebeb;
  }

  .header {
    /* margin-top: 10px; */
  }

  .main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  .footer {
    min-height: 30vh;
    width: 100%;
    padding-bottom: 5vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>

<div class="app">

  <header class="header">
    <Header />
  </header>

  <main class="main">
    <QuizDisplay />
  </main>

  <footer class="footer">
    <ControlBar appPrefix={APP_PREFIX} />
    <ToggleIconButton
      turnOn={controllerStore.turnMicrophoneOn}
      turnOff={controllerStore.turnMicrophoneOff} />
  </footer>

</div>
