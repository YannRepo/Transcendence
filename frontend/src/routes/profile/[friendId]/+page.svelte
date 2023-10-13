<script lang="ts">
  import Navbar from "../../../components/Navbar.svelte";
  import { page } from "$app/stores";
  import FriendProfile from "../../../components/FriendProfile.svelte";
</script>

<Navbar backPath={`/profile `} />
<FriendProfile friendId={$page.params.friendId} />
