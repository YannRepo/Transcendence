<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import axios from "axios";
  import { getMe } from "$lib/services/Api";
  import UserAvatar from "../../../components/UserAvatar.svelte";
  import { PUBLIC_API_URL } from "$env/static/public";

  // let avatarId = "";
  let avatar = "";
  let fileInput = "";
  let newUsername = "";
  let user: User;
  let isLogged = false;

  onMount(async () => {
    if (browser) {
      await goto("/");
      try {
        user = await getMe();
        if (user) isLogged = true;
        else goto("/auth");
      } catch (error) {
        console.log(error);
      }
    }
  });

  async function Activate2FA() {
    try {
      const response = await axios.put(
        `${PUBLIC_API_URL}/auth/activate2FA`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "access_token"
            )}, ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
      // console.log(response.data);
      user.IstwoFactorAuth = response.data;
    } catch (error) {
      console.error("Erreur lors du changement de nom d'utilisateur", error);
    }
  }

  async function changeUsername() {
    try {
      const response = await axios.put(
        `${PUBLIC_API_URL}/user/updateUsername`,
        { username: newUsername },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem(
              "access_token"
            )}, ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
      // console.log("Changement de nom d'utilisateur réussi", response.data);
      user.username = newUsername;
    } catch (error) {
      console.error("Erreur lors du changement de nom d'utilisateur", error);
    }
  }

  let selectedFile: string | Blob | null = null;
  function handleFileChange(event) {
    selectedFile = event.target.files[0];
  }

  async function uploadAvatar() {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      // console.log("formData>>>>>>>>>>>>>>>>>>", formData);
      const response = await axios.post(
        `${PUBLIC_API_URL}/avatar/uploadAvatar`,
        formData,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem(
              "access_token"
            )}, ${localStorage.getItem("refresh_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log("Avatar id:", response.data);
      user.avatarId = response.data;
    }
  }
</script>

<div class="text-center">
  <h1
    class="text-[#f7ed14] text-6xl font-audiowide [text-shadow:_2px_5px_10px_rgb(253_224_71_/_60%)] py-10"
  >
    Profil
  </h1>
  <div class="pt-10">
    ID: {user?.id}
    <br />
    Username: {user?.username}
    <br />
    <br />
    <br />
    <div class="user-box">
      <input type="text" name="" required={true} bind:value={newUsername} />
      <label for="">Enter new username</label>
    </div>
    <button class="border-2 w-52 p-1 rounded-md" on:click={changeUsername}
      >Change Username</button
    >
    <br />
    <br />
    Email: {user?.email}
    <br />
    <br />
    Avatar: {user?.avatar}
    <br />
    <div
      class="w-24 h-24 mx-auto my-auto rounded-full overflow-hidden border-2 border-gray-300"
    >
      <UserAvatar avatarId={user?.avatarId} />
    </div>
    <br />
    <br />
    <input type="file" on:change={handleFileChange} />
    <button on:click={uploadAvatar}>Télécharger l'avatar</button>

    <br />
    <br />
    IsSigninWith42: {user?.IsSigninWith42}
    <br />
    IstwoFactorAuth: {user?.IstwoFactorAuth}
    <br />
    <br />
    <button class="border-2 w-52 p-1 rounded-md" on:click={Activate2FA}>
      {#if user?.IstwoFactorAuth}
        Desactivate 2FA
      {:else}
        Activate 2FA
      {/if}
    </button>
  </div>
</div>
