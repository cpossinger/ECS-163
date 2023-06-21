<!-- This file will be used to layout and connect your views -->
<template>
  <div id="app">
      <!-- This is only a basic setup to display your views. Use HTML and CSS to create your layout using these basic commands -->
      <LineChart v-if="line_data" class="linechart" :line_data="line_data"  @radial_data="radial_data_const"
                 @selection="radial_selection_const" @selection_arrive_depart="radial_selection_arriv_depart_const" :width="400" :height="470"/>
      <RadialChart v-if="radial_data" class="radialChart" :radial_data="radial_data" :radial_selection="radial_selection"
                   :width="200" :height="215" :innerRadius="50" :outerRadius="100" :radial_selection_arrive_depart="radial_selection_arrive_depart" />
  </div>
</template>

<script>
import * as d3 from "d3";


// Try to use descriptive names like 'OverviewScatterPlot' or 'DetailLineChart'
import LineChart from "@/components/View1";
import RadialChart from "@/components/View2";

export default {
  name: 'App',
  components: {
    RadialChart,
    LineChart,
  },
  data() {
    return {
      line_data: null,
      radial_data: null,
      radial_selection: null,
      radial_selection_arrive_depart: null
    }
  },
  created() {
    d3.csv("/data/Los_Angeles_International_Airport_-_Passenger_Traffic_By_Terminal (2).csv", d3.autoType)
        .then((data) => {
      this.line_data = d3.map(data, (d) => {
        return Object.assign(d, {
          ReportPeriod: d.ReportPeriod,
          Arrival_Departure: d.Arrival_Departure,
          Passenger_Count: +d.Passenger_Count,
          Domestic_International: d.Domestic_International,
          Terminal: d.Terminal
        })
      })
    });
  },
  methods: {
radial_data_const(data) {
  this.radial_data = data;
},
    radial_selection_const(selection) {
  this.radial_selection = selection;
    },
    radial_selection_arriv_depart_const(selection) {
      this.radial_selection_arrive_depart = selection;
    }
  }

}


</script>

<style>
#app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: hsl(210, 29%, 24%);
        background-color: darkgrey;
        display: grid;
        grid-template-rows: 5vh 120vh auto;
        grid-template-columns: 1fr 15fr 15fr 1fr;
        grid-template-areas:
    ". . . ."
    ". overview detail ."
    ". . . .";
      }
.linechart {
  grid-area: overview;
}
.radialChart {
  grid-area: detail;
}


</style>
