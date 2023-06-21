<!-- This file will be used to layout and connect your views -->
<template>
  <div id="app">
      <!-- This is only a basic setup to display your views. Use HTML and CSS to create your layout using these basic commands -->

      <DarkMap
          v-if="dataset"
          :dataset="dataset"
          />
      <BarChart
          class="bar-chart"
          v-if="datasetSelected"
          chartId="terror_summary"
          :title="`Details about ${datasetSelected.name}`"
          :dataset="datasetSelected.entries"
          attribX="name"
          attribY="value"
          labelY="Stat Strength"
          :width="800"
          :height="500"
      />
  </div>
</template>

<script>
import * as d3 from 'd3';
// Try to use descriptive names like 'OverviewScatterPlot' or 'DetailLineChart'
import DarkMap from './components/View1.vue'
import BarChart from "@/components/View2";

export default {
  name: 'App',
  components: {
    BarChart,
    DarkMap,
  },
  data() {
    return {
      dataset: null,

      datasetSelected: null

   };
  },
  created() {
    d3.csv("Data/global_terrorism.csv",d3.autoType)
      .then((data) => {
        this.dataset = d3.map(data,(d) => {
          return Object.assign(d,{
            eventid: d.eventid,
            longitude: d.longitude,
            latitude: d.latitude,
            year: d.iyear,
            summary: d.summary,
            success: d.success,
            suicide: d.suicide,
            attack_type: d.attacktype1_txt,
            target_type: d.targtype1_txt,
            weapon_type: d.weaptype1_txt,
            kills: d.nkill
          })
        });
      });
    },
  methods: {
    pokemonSelected(p) {
      if (p == null) {
        this.datasetSelected = null
        return
      }
      let pokemon = d3.filter(this.dataset, d => d.Number == p.Number)[0]

      let entries = []
      for (const stat of ['HP', 'Attack', 'Defense', 'Sp_Atk', 'Sp_Def', 'Speed']) {
        entries.push({
          name: stat,
          value: pokemon[stat]
        })
      }
      this.datasetSelected = {
        name: pokemon.Name,
        entries: entries
      }
    }
  }
};


</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: hsl(210, 29%, 24%);
  display: grid;
  grid-template-rows: 5vh 60vh auto;
  grid-template-columns: 1fr 10fr 10fr 1fr;
  grid-template-areas:
    ". . . ."
    ". overview detail ."
    ". . . .";
}
 .darkmap {
  grid-area: overview;
}
.bar-chart {
  grid-area: detail;
}

</style>

