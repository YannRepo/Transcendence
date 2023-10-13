<script lang="ts">
  import { getUserById } from "$lib/services/Api";
  import type { Socket } from "socket.io-client";
  import { onMount } from "svelte";

  let dialog; // HTMLDialogElement
  let user: User;

  export let showModal; // boolean
  export let socket: Socket;
  export let invitedUserId;
  export let invitedSocketId;
  export let invitedUser: User;

  $: if (dialog && showModal) dialog.showModal();

  // onMount(async () => {
  // user = await getUserById(invitedUserId);
  // });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <!-- <slot name="header" /> -->
    <!-- <hr /> -->
    <slot />
    <div class="content">
      <div class="text">{invitedUser?.username} whants to play with you!</div>

      <button
        class="button"
        on:click={async () => {
          // console.log(invitedUserId);
          socket.emit("event_acceptInvitationToPlay", {
            fromUserId: invitedUserId,
            fromSocket: invitedSocketId,
          });
        }}
        >yes
      </button>
      <button class="button" on:click={() => dialog.close()}>no </button>
    </div>
    <!-- <hr /> -->
    <!-- svelte-ignore a11y-autofocus -->
    <!-- <button autofocus on:click={() => dialog.close()}>close modal</button> -->
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
  /* dialog > div {
    padding: 1em;
  } */
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

  .content .text {
    font-size: 33px;
    font-weight: 600;
    color: #595959;
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
