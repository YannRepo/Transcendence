<script lang="ts">
  import { Confetti } from "svelte-confetti";

  let dialog; // HTMLDialogElement
  let user: User;

  export let showAchievementChatModal: boolean; // boolean

  $: if (dialog && showAchievementChatModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showAchievementChatModal = false)}
  on:click|self={() => dialog.close()}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <slot />
    <div class="content">
      <Confetti
        x={[-5, 5]}
        y={[0, 0.1]}
        delay={[500, 2000]}
        infinite
        duration="5000"
        amount="200"
        fallDistance="100vh"
      />
      <Confetti x={[-1, -0.25]} y={[0, 0.5]} delay={[0, 1500]} />
      <Confetti x={[0.25, 1]} y={[0, 0.5]} delay={[0, 1500]} />
      <div
        class="flex border-2 border-gray-600 rounded-lg items-center justify-center"
      >
        <div class="border-2 rounded-lg border-gray-600 p-3 m-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            class="h-12 fill-[#4b5563]"
          >
            <style>
              svg {
                fill: #4b5563;
              }
            </style><path
              d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"
            /></svg
          >
        </div>
        <div>
          <div class=" text-left text-3xl pt-2 px-1 text-[#4b5563]">
            Chat Maestro!
          </div>
          <div class=" text-left pb-2 px-1 text-gray-600">
            You've to send over 5 messages in our chat, showcasing your
            exceptional communication skills and dedication. Keep the
            conversation flowing and continue to connect with others!
          </div>
        </div>
      </div>
      <Confetti x={[0.25, 1]} y={[0, 0.5]} delay={[0, 1500]} />
      <Confetti x={[-1, -0.25]} y={[0, 0.5]} delay={[0, 1500]} />
      <button class="button" on:click={() => dialog.close()}>Close</button>
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: full;
    padding: 40px 30px;
    background: #dde1e7;
    border-radius: 10px;
    border-width: 2px;
    border-color: #dde1e7;
    box-shadow: -3px -3px 20px #dde1e7, 2px 2px 20px #dde1e7;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
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

  /* ----------------------------------- */

  .content {
    width: full;
    padding: 40px 30px;
    background: #dde1e7;
    border-radius: 10px;
    border-width: 2px;
    border-color: #dde1e7;
    box-shadow: -3px -3px 20px #dde1e7, 2px 2px 20px #dde1e7;
  }

  .button {
    margin: 15px 0;
    width: 100%;
    height: 50px;
    font-size: 18px;
    line-height: 50px;
    font-weight: 600;
    background: #dde1e7;
    border-radius: 25px;
    border: none;
    outline: none;
    cursor: pointer;
    color: #595959;
    box-shadow: 2px 2px 5px #babecc, -5px -5px 10px #ffffff73;
  }

  .button:focus {
    color: #3498db;
    box-shadow: inset 2px 2px 5px #babecc, inset -5px -5px 10px #ffffff73;
  }
</style>
