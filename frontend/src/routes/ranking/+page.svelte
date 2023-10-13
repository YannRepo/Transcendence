<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "../../components/Navbar.svelte";
  import API, { getMe } from "$lib/services/Api";
  import UserAvatar from "../../components/UserAvatar.svelte";

  let user: User;
  let userlist: User[] = [];

  onMount(async () => {
    user = await getMe();
    userlist = await API.get("/user/sortedByScore");
    userlist.forEach((user, index) => {
      user.rank = index + 1;
    });

    // console.log(userlist);
  });
</script>

<Navbar backPath="/" />

<div
  class="w-2/3 h-[86vh] mx-auto rounded-[18px] p-8 border-2 border-opacity-15 bg-opacity-50 backdrop-blur-[100px] shadow-md"
  style="border-color: rgba(255, 255, 255, 0.15); background-color: rgba(20, 18, 32, 0.50); box-shadow: 0px 0px 30px 2px #3C79D8;"
>
  <div class="text-center flex flex-col h-full">
    <div class="">
      <div class="col-span-1 flex flex-col items-center">
        <h1
          class="text-[#ffffff] text-6xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)]"
        >
          Ranking
        </h1>
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      {#each userlist as list}
        <div class="flex items-center justify-between my-5">
          <div class="flex justify-center items-center">
            <div class=" w-24">
            <div class="text-3xl">
              #{list?.rank}
            </div>
          </div>
            <div class="border-2 rounded-full border-black w-12 h-12 mx-3">
              <UserAvatar avatarId={list?.avatarId} />
            </div>
            <div class="text-3xl">
              {list?.username}
            </div>
          </div>
          <div class="text-3xl">
            {list?.score}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
