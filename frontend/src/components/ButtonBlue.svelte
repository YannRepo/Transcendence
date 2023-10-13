<script lang="ts">
  import { goto } from "$app/navigation";

  export let href: string = "/";
  export let buttonText: string = "Button Text";
</script>

<button
  on:click={() => {
    goto(href);
  }}
  class="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white rounded-md shadow-2xl group"
>
  <!-- {href} -->
  <span
    class="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-[#3C79D8] to-[#0B041F] group-hover:opacity-100"
  />
  <!-- Top glass gradient -->
  <span
    class="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-5 h-1/3"
  />
  <!-- Bottom gradient -->
  <span
    class="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent opacity-5"
  />
  <!-- Left gradient -->
  <span
    class="absolute bottom-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent opacity-5"
  />
  <!-- Right gradient -->
  <span
    class="absolute bottom-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent opacity-5"
  />
  <span
    class="absolute inset-0 w-full h-full border border-white rounded-md opacity-10"
  />
  <span
    class="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-5"
  />
  <span class="relative text-2xl">{buttonText}</span>
</button>
