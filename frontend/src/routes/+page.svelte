<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { getMe } from "../lib/services/Api";
  import NavbarHomeScreen from "../components/NavbarHomeScreen.svelte";
  import { io, type Socket } from "socket.io-client";
  import { Confetti } from "svelte-confetti";
  import { DateTime } from "luxon";

  let user: User;
  let isLogged = false;

  onMount(async () => {
    if (browser) {
      try {
        user = await getMe();
        if (user) {
          if (user.firstLogin) {
            await goto("/welcome");
          }
          isLogged = true;
        } else {
          await goto("/auth");
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
</script>

{#if isLogged}
  <NavbarHomeScreen />
  <div class="flex h-[75vh] justify-center items-center">
    <div class="text-center">
      <h1
        class="text-[#f7ed14] text-9xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)] py-10"
      >
        CYBERPONG
      </h1>
      <button
        class="button"
        on:click={() => {
          goto("/waitingroom");
        }}
      >
        <div class="flex items-center">
          <svg
            width="23"
            height="26"
            viewBox="0 0 23 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.3223 14.732C22.6556 13.9622 22.6556 12.0378 21.3223 11.2679L3.32226 0.875643C1.98893 0.105843 0.322266 1.06809 0.322266 2.60769L0.322266 23.3923C0.322266 24.9319 1.98893 25.8942 3.32227 25.1244L21.3223 14.732Z"
              fill="#242424"
            />
          </svg>
          <p class="ml-3">Play</p>
        </div>
      </button>
    </div>
  </div>
{:else}
  <div class=" flex justify-center pt-52">
    <img src="loading.svg" alt="loading" class=" h-72 w-72" />
  </div>
{/if}

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
