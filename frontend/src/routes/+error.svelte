<script lang="ts">
  import { goto } from "$app/navigation";
  import { logOut } from "$lib/services/Api";
</script>

<div class="sticky top-0 flex p-5 justify-between">
  <div>
    <button>
      <!-- <img src="/arrow-back.svg" alt="arrow-back" class="w-10 h-10" /> -->
    </button>
  </div>
  <div>
    <button on:click={() => logOut()}>
      <p class=" text-red-600 text-xl">Log out</p>
    </button>
  </div>
</div>

<div
  class="w-2/3 h-[86vh] mx-auto rounded-[18px] p-8 border-2 border-opacity-15 bg-opacity-50 backdrop-blur-[100px] shadow-md"
  style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
>
  <div class="flex flex-col w-full h-full items-center justify-center">
    <p
      class="text-[#f7ed14] text-9xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)] py-10"
    >
      404
    </p>
    <p class="text-4xl m-3">Something's missing.</p>
    <p class=" mb-28">
      Sorry, we can't find that page. You'll find lots to explore on the home
      page.
    </p>

    <button
      on:click={async () => {
        goto("/");
      }}
      class="relative inline-flex items-center px-8 py-1 overflow-hidden text-md font-medium text-[#f7ed14] border-2 border-[#f7ed14] rounded-md hover:text-black group hover:bg-gray-50"
    >
      <span
        class="absolute left-0 block w-full h-0 transition-all bg-[#f7ed14] opacity-100 group-hover:h-full top-1/2 group-hover:top-0 duration-400 ease"
      />
      <span
        class=" absolute right-0 flex items-center justify-start w-6 h-10 duration-300 transform translate-x-full group-hover:translate-x-0 ease"
      >
        {"<"}
      </span>
      <span class="relative">Go Home!</span>
    </button>
  </div>
</div>
