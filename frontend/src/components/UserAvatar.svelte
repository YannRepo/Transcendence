<script lang="ts">
  import { getAvatar } from "$lib/services/Api";
  import { PUBLIC_API_URL } from "$env/static/public";

  export let avatarId: string;
</script>

{#if !avatarId}
  <img
    src="/avatars/defautAvatar.jpg"
    alt="Vignette par défaut"
    class="text-center rounded-full"
  />
{:else}
  {#await getAvatar(avatarId) then avatar}
    {#if avatar?.url42}
      <img
        src={avatar?.url42}
        alt="Avatar 42"
        class="text-center rounded-full w-full h-full"
      />
    {:else}
      <img
        src={`${PUBLIC_API_URL}/avatar/data/${avatarId}`}
        alt="Avatar personnalisé"
        class="text-center rounded-full w-full h-full"
      />
    {/if}
  {/await}
{/if}
