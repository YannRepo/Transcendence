<script lang="ts">
  import { page } from "$app/stores";
  import FriendProfile from "../../../components/FriendProfile.svelte";
  import Navbar from "../../../components/Navbar.svelte";
</script>

<Navbar backPath={`/wsp `} />
<FriendProfile friendId={$page.params.friendId} />
