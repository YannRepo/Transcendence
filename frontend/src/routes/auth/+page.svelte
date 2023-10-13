<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { getMe } from "../../lib/services/Api";
  import Modal2Fa from "../../components/Modal2FA.svelte";
  import { io, type Socket } from "socket.io-client";
  import { Confetti } from "svelte-confetti";
  import { DateTime } from "luxon";

  let user: User;
  let isWaiting = true;
  let showModal2FA: boolean = false;

  onMount(async () => {
    if (browser) {
      try {
        user = await getMe();
        if (user) {
          goto("/");
        }
      } catch (error) {
        console.log(error);
      }
    }
    isWaiting = false;
  });
</script>

{#if !isWaiting}
  <div class="flex h-screen justify-center items-center">
    <div class="text-center">
      <h1
        class="text-[#f7ed14] text-9xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)] py-10"
      >
        CYBERPONG
      </h1>

      <button
        class="button mr-20"
        on:click={() => {
          goto("/auth/login");
        }}
      >
        <div class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512"
          >
            <style>
              svg {
                fill: #000000;
              }
            </style><path
              d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"
            /></svg
          >
          <p class="ml-3">Log in</p>
        </div>
      </button>
      <button
        class="button"
        on:click={() => {
          goto("/auth/signup");
        }}
      >
        <div class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512"
          >
            <style>
              svg {
                fill: #000000;
              }
            </style><path
              d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
            /></svg
          >
          <p class="ml-3">Sign up</p>
        </div>
      </button>
    </div>
  </div>
{:else}
  <div class=" flex justify-center pt-52">
    <img src="loading.svg" alt="loading" class=" h-72 w-72" />
  </div>
{/if}

<Modal2Fa bind:showModal2FA />

<style>
  @keyframes glowing-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    }

    70% {
      box-shadow: 0 0 0 30px rgba(255, 255, 255, 0);
    }

    100% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
  }

  .button {
    position: relative;
    display: inline-block;
    background: linear-gradient(to right, #ffb900, #f7ed14);
    border: none;
    border-radius: 25px;
    color: black;
    padding: 10px 20px;
    font-size: 24px;
    text-transform: uppercase;
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    animation: glowing-pulse 2s infinite;
  }

  .button::before {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 30px;
    box-shadow: 0 0 20px #f7ed14;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .button:hover::before {
    opacity: 1;
  }
</style>
