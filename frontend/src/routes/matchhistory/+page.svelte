<!-- ############################################################################################################### -->
<!-- ###################################################  Match history  ################################################### -->
<!-- ############################################################################################################### -->
<!--import API, { getMe } from "$lib/services/Api";-->

<script>
	import { onMount } from "svelte";
	import axios from "axios";
  import { PUBLIC_API_URL } from '$env/static/public';

	let matchHistory = [];


	onMount(async () => {
    try {
      const response = await axios.get(`${PUBLIC_API_URL}/matchhistory/matchhistory`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem(
              "access_token"
            )}, ${localStorage.getItem("refresh_token")}`,
          },
        }
      );
		matchHistory = response.data;
    } catch (error) {
      console.error('Error fetching matchHistory:', error);
    }

  });

</script>

<h1 class="text-4xl font-bold text-violet-800"> Match history </h1>
<br>
<h1 class="text-2xl font-bold text-violet-900"> Ranking </h1>
<p> ... TBD ...</p>
<br>
<h1 class="text-2xl font-bold text-violet-900"> Leaderboard </h1>
<p> ... TBD ...</p>
<br>
<h1 class="text-2xl font-bold text-violet-900"> Match history </h1>
<ul>
	{#each matchHistory as match}
	  <li>Match {match.id} - Player {match.idPlayer1} score {match.scorePlayer1} - Player {match.idPlayer2} score {match.scorePlayer2} - Winner player {match.idWinner}</li>
	{/each}
  </ul>

