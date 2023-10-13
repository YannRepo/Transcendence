<script lang="ts">
  import { goto } from "$app/navigation";
  import { logOut } from "$lib/services/Api";

  export let backPath: string = "/";
  export let logOutButton: boolean = true;
</script>

<div class="sticky top-0 flex p-5 justify-between">
  <div>
    <button on:click={() => goto(backPath)}>
      <img src="/arrow-back.svg" alt="arrow-back" class="w-10 h-10" />
    </button>
  </div>
  {#if logOutButton}
    <div>
      <button on:click={() => logOut()}>
        <p class=" text-red-600 text-xl">Log out</p>
      </button>
    </div>
  {/if}
</div>
