<template>
  <v-container fill-height fluid>
    <v-row>
      <v-col lg="true">

        <v-row>
          <v-col>
            <v-select
                v-model="groupValStream"
                label="Select Stream Graph Group "
                :items="groupValStreamItems"
                hide-details
                :menu-props="{top: true, offsetY: true,}"
                filled
                rounded
            ></v-select>
          </v-col>
          <v-col>
          <v-autocomplete
              v-model="autoVal"
              :items="autoItems"
              :label="autoLabel"
              rounded
              filled
              clearable
              @click:clear="resetAutoVal"
          >
          </v-autocomplete>
          </v-col>
        </v-row>

        <StreamGraph
            class='stream-graph'
            v-if='dataset'
            :dataset='dataset'
            :width='500'
            :height='150'
            :attrVal="attrVal"
            :groupVal="groupValStream"
            :setClicked='setClickedStreamVal'
            :selectedGroupsBar="selectedGroupsBar"
            :streamAutoVal="autoVal"
        />

        <v-select
            v-model="groupValBar"
            label="Select Bar Chart Group"
            :items="groupValBarItems"
            item-text="label"
            item-value="value"
            hide-details
            :menu-props="{top: true, offsetY: true}"
            filled
            rounded
        ></v-select>


        <BarChart
            class="pa-md-4 mx-lg-auto"
            v-if='dataset'
            :dataset='dataset'
            :width='500'
            :height='200'
            :attribY= 'attrVal'
            :attribX='groupValBar'
            :streamGroup='groupValStream'
            :selectedGroupStream="selectedGroupStream"
            :setFilter="barChartFiltering"
            :yearRange="yearRange"
            />
      </v-col>
<v-col>
  <v-row>
  <v-col cols="2">
        <v-range-slider
            v-model="initYearRange"
            @end="setYearRange"
            max="2019"
            min="1980"
            vertical
            thumb-label="always"
            ticks
        ></v-range-slider>
  </v-col>

  <v-col lg="true">
        <ParallelCoordinateChart
            class='pc-chart'
            v-if='dataset'
            :dataset='dataset'
            :attrVal="attrVal"
            :groupVal="groupValStream"
            :selectedGroupStream='selectedGroupStream'
            :selectedGroupsBar='selectedGroupsBar'
            width='250'
            height='250'
            :yearRange="yearRange"
            />
  </v-col>
  </v-row>
</v-col>
    </v-row>
  </v-container>

</template>

<script>
import StreamGraph from "@/components/StreamGraph";
import ParallelCoordinateChart from "@/components/ParallelCoordinateChart";
import BarChart from "@/components/BarChart";
export default {
  name: 'Main',
  props: {
    dataset: {
      required: true
    },
    attrVal: {
      required: true
    },
    /*
    selectedGroupStream: {
      required: true
    },
   */

    /*
    barChartFiltering: {
      required: true
    },
    /*
    setClickedStreamVal: {
      required: true
    },
     */
    /*
    selectedGroupsBar: {
      type: Object
    },
     */
  },
  watch: {
    attrVal: {
      handler: function (val){
        this.attrVal = val;
        this.updateAuto();
      },
    },
    dataset: {
      handler: function (){
        this.updateAuto();
      },
    },
    autoVal: {
      handler: function (val){
        this.autoVal = val;
      },
    },
    groupValBar: {
      handler: function (val){
        this.groupValBar = val;
      },
    },
    groupValStream: {
      handler: function (val){
        this.groupValStream = val;
        this.updateAuto();
        this.updateBarItems();

      },
    },
    selectedGroupStream: {
      handler: function (val){
        this.selectedGroupStream = val;
        console.log("main selectedGroupStream: ",this.selectedGroupStream)
      },
    },

  },
  components: {
    StreamGraph,
    ParallelCoordinateChart,
    BarChart
  },
  data: () => ({
    selectedGroup: null,
    initYearRange: [1980,2019],
    yearRange: [1980,2019],
    autoVal:  "",
    autoLabel: "",
    autoItems: [],
    groupValStream: "Genre",
    groupValBar: "Platform",
    groupValStreamItems: ["Genre","Platform","Publisher","Developer"],
    groupValBarItems: ["Platform","Publisher","Developer"],
    selectedGroupStream: "",
    selectedGroupsBar: {attrib: "Platform", values: []},


  }),
  mounted() {
    console.log("main mounted", this.selectedGroupsStream)
    this.updateAuto();
  },
  methods: {
    init() {
      console.log("main.vue selectedgroupsstream", this.selectedGroupsStream)
    },
    resetAutoVal(){
     this.autoVal = "";
    },
    updateAuto() {
      console.log("main update auto");
      this.autoLabel = "Select" + " " + this.groupValStream;
      let data = this.dataset.filter( obj => obj[this.attrVal] != 0)
      this.autoItems =   [...new Set(data.map(item => item[this.groupValStream]))].filter(str => str != null);
    },
    updateBarItems(){
      console.log("update bar items");
      if(this.groupValStream === "Genre"){
        this.groupValBarItems = ["Platform","Publisher","Developer"]
      } else if(this.groupValStream === "Platform"){
        this.groupValBarItems = ["Genre","Publisher","Developer"]
      }else if(this.groupValStream === "Publisher"){
        this.groupValBarItems = ["Genre","Platform","Developer"]
      } else if(this.groupValStream === "Developer"){
        this.groupValBarItems = ["Genre","Platform","Publisher"]
      }

    },
    setClickedStreamVal(val){
      console.log('setClicked called')
      this.selectedGroupStream = val;
      this.autoVal = val;
    },
    barChartFiltering(attribX, selected) {
      console.log("The bar chart said to filter the data on column", attribX, "with values", selected)
      this.selectedGroupsBar = {attrib: attribX, values: selected}
    },
    setYearRange(val){
      this.yearRange = val;
    }


  }
};
</script>

<style >

</style>
