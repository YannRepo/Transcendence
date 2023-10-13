<script lang="ts">
  import axios from "axios";
  import { onMount } from "svelte";
  import SvelteOtp from "@k4ung/svelte-otp";
  import API from "$lib/services/Api";
  import { goto } from "$app/navigation";

  let value = "";
  let wrongCode = ".";

  async function handle2FAValidation() {
    try {
      const body = {
        validationCode: value,
      };
      const res = await API.post("/auth/validate2FACode", body);
      if (res) goto("/");
      else wrongCode = "Wrong code, please try again";
    } catch (error) {
      console.error("Erreur lors du changement de nom d'utilisateur", error);
    }
  }

  onMount(async () => {
    value = "";
  });
</script>

<div class="flex h-screen justify-center items-center">
  <form class="form">
    <div class="info">
      <span class="title">Two-Factor Verification</span>
      <p class="description">
        Enter the two-factor authentication code provided by the authenticator
        app
      </p>
    </div>

    <div class="flex flex-col items-center">
      <SvelteOtp
        numberOnly
        bind:value
        inputClass="rounded-md bg-gray-200 text-gray-900 w-12 h-12 text-center text-3xl font-bold"
        separatorClass="border-blue-700 text-3xl font-bold"
        onlyShowMiddleSeparator={true}
        separator=" "
        wrapperStyle="flex justify-center items-center"
      />
      {#if wrongCode === "."}
        <div class="p-3">
          <p class="text-red-500 opacity-0">{wrongCode}</p>
        </div>
      {:else}
        <div class="p-3">
          <p class="text-red-500">{wrongCode}</p>
        </div>
      {/if}
      <div class="action-btns">
        <button on:click={() => handle2FAValidation()} class="verify"
          >Verify</button
        >
        <button on:click={() => (value = "")} class="clear">Clear</button>
      </div>
    </div>
  </form>
</div>

<style>
  .form {
    --black: #000000;
    --ch-black: #141414;
    --eer-black: #1b1b1b;
    --night-rider: #2e2e2e;
    --white: #ffffff;
    --af-white: #f3f3f3;
    --ch-white: #9f9f9f;
    --tomato: #fa5656;
    font-family: Helvetica, sans-serif;
    padding: 2rem /* 32px */;
    display: flex;
    max-width: 520px;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    color: var(--af-white);
    background-color: rgba(20, 18, 32, 0.5);
    border-radius: 18px;
    border-width: 2px;
    position: relative;
    box-shadow: 0px 0px 30px 2px #3c79d8;
    border-color: rgba(255, 255, 255, 0.15);
    --tw-bg-opacity: 0.5;
    --tw-backdrop-blur: blur(100px);
    backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
      var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
      var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
      var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
      var(--tw-backdrop-sepia);
    --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color),
      0 2px 4px -2px var(--tw-shadow-color);
    /* box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
      var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow); */
  }

  /*----heading and description-----*/

  .info {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 900;
  }

  .description {
    margin-top: 10px;
    font-size: 1rem;
  }

  /*----input-fields------*/

  .form .input-fields {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .form .input-fields input {
    height: 2.5em;
    width: 2.5em;
    outline: none;
    text-align: center;
    font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
      "Lucida Sans", Arial, sans-serif;
    font-size: 1.5rem;
    color: var(--af-white);
    border-radius: 5px;
    border: 2.5px solid var(--eer-black);
    background-color: var(--eer-black);
    border: 1px solid var(--ch-white);
  }

  .form .input-fields input:focus {
    border: 1px solid var(--af-white);
    box-shadow: inset 10px 10px 10px rgba(0, 0, 0, 0.15);
    transform: scale(1.05);
    transition: 0.5s;
  }

  /*-----verify and clear buttons-----*/

  .action-btns {
    display: flex;
    margin-top: 20px;
    gap: 0.5rem;
  }

  .verify {
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 500;
    color: var(--night-rider);
    text-shadow: none;
    background: var(--af-white);
    box-shadow: transparent;
    border: 1px solid var(--af-white);
    transition: 0.3s ease;
    user-select: none;
  }

  .verify:hover,
  .verify:focus {
    color: var(--night-rider);
    background: var(--white);
  }

  .clear {
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 500;
    color: var(--ch-white);
    text-shadow: none;
    background: transparent;
    border: 1px solid var(--ch-white);
    transition: 0.3s ease;
    user-select: none;
  }

  .clear:hover,
  .clear:focus {
    color: var(--tomato);
    background-color: transparent;
    border: 1px solid var(--tomato);
  }

  /*-----close button------*/

  .close {
    position: absolute;
    right: 10px;
    top: 10px;
    background-color: var(--night-rider);
    color: var(--ch-white);
    height: 30px;
    width: 30px;
    display: grid;
    place-items: center;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    transition: 0.5s ease;
  }

  .close:hover {
    background-color: var(--tomato);
    color: var(--white);
  }
</style>
