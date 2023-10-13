<script lang="ts">
  import { logOut } from "$lib/services/Api";
  import ButtonBlue from "./ButtonBlue.svelte";

  let isHovered = false;
</script>

<div class="sticky top-0 flex p-7 justify-end">
  <div class="pr-10">
    <ButtonBlue href="/wsp" buttonText="Messages" />
  </div>

  <div class="pr-10">
    <ButtonBlue href="/ranking" buttonText="Ranking" />
  </div>

  <div class="pr-10">
    <ButtonBlue href="/profile" buttonText="Profile" />
  </div>

  <button
    on:mouseenter={() => (isHovered = true)}
    on:mouseleave={() => (isHovered = false)}
    on:click={() => logOut()}
  >
    <p
      class={isHovered
        ? "text-red-600 text-xl text-shadow-transition text-shadow-hover"
        : "text-red-600 text-xl text-shadow-transition text-shadow-initial"}
    >
      Log out
    </p>
  </button>
</div>

<style>
  /* Define a CSS class for the slow text shadow effect */
  .text-shadow-transition {
    transition: text-shadow 0.5s ease; /* Adjust the duration as needed */
  }

  /* Define the initial text shadow */
  .text-shadow-initial {
    text-shadow: none;
  }

  /* Define the hover state text shadow */
  .text-shadow-hover:hover {
    text-shadow: 2px 5px 10px rgba(220, 38, 38, 0.6);
  }
</style>
