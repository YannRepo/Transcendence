<script lang="ts">
  import API from "$lib/services/Api";
  import SvelteOtp from "@k4ung/svelte-otp";
  import axios from "axios";

  let dialog; // HTMLDialogElement
  let value = "";
  let qrCodeUrl = "";
  let wrongCode = ".";

  export let showModal2FA: boolean;
  export let isVerification: boolean = false;

  $: if (showModal2FA) {
    if (isVerification) {
      getQRCode();
    }
    if (dialog) dialog.showModal();
  }

  async function getQRCode() {
    const qrCode = await API.get("/auth/get2FACode");
    if (qrCode) {
      qrCodeUrl = qrCode;
    }
  }

  async function handle2FAVerification() {
    try {
      const body = {
        validationCode: value,
      };
      const res = await API.post("/auth/verify2FACode", body);
      if (res) {
        API.put("/auth/activate2FA", {});
        showModal2FA = false;
        dialog.close();
      } else {
        wrongCode = "Wrong code, please try again";
      }
    } catch (error) {
      console.error("Erreur lors du changement de nom d'utilisateur", error);
    }
  }

  async function handle2FAValidation() {
    try {
      const body = {
        validationCode: value,
      };
      const res = await API.post("/auth/validate2FACode", body);
    } catch (error) {
      console.error("Erreur lors du changement de nom d'utilisateur", error);
    }
  }

  async function handleOTP() {
    if (isVerification) {
      handle2FAVerification();
    } else {
      handle2FAValidation();
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal2FA = false)}
  on:click|self={() => dialog.close()}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <div class="flex justify-center items-center">
      <form class="form">
        <div class="info">
          <span class="title">Two-Factor Verification</span>
          <p class="description">
            Enter the two-factor authentication code provided by the
            authenticator app
          </p>
        </div>

        {#if isVerification}
          {#if qrCodeUrl}
            <img
              src={qrCodeUrl}
              alt="QR Code"
              class="rounded-xl"
              style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
            />
            <div class="flex flex-col items-center pt-5">
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
                <button on:click={() => handleOTP()} class="verify"
                  >Verify</button
                >
                <button on:click={() => (value = "")} class="clear"
                  >Clear</button
                >
              </div>
            </div>
          {:else}
            <div class="">
              <img src="../loading.svg" alt="loading" class="h-50 w-50" />
            </div>
          {/if}
        {/if}
      </form>
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: full;
    padding: 40px 30px;
    background: #00000000;
    border-radius: 10px;
    border-width: 2px;
    border-color: #dde1e700;
    box-shadow: -3px -3px 20px #dde1e700, 2px 2px 20px #dde1e700;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.65);
  }
  dialog > div {
    padding: 1em;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  button {
    display: block;
  }

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
</style>
