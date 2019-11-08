<script>
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  import { quizStore } from "./stores/quizStore";
  import { scoreStore } from "./stores/scoreStore";

  import Header from "./Layout//Header.svelte";
  import ControlBar from "./Layout/ControlBar.svelte";
  import QuizDisplay from "./Layout/QuizDisplay.svelte";

  setContext("quizStore", quizStore);
  quizStore.subscribe(val => {
    // console.log(quizStore.getCurrentQuiz());
    console.log(quizStore.getAllIDs());
  });
  setContext("scoreStore", scoreStore);
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
  }

  .footer {
    height: 20vh;
    width: 100%;
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
    <ControlBar options={quizStore.getAllIDs()} />
  </footer>

</div>
