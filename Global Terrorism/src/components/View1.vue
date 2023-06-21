<!-- Your HTML goes here -->
<template>
  <div>
  <select  v-model="selected" >
    <option value="">All Years</option>
    <option v-for="option in options" v-bind:key="option" v-bind:value="option">
      {{ option }}
    </option>
  </select>
  <span>Selected: {{ selected }}</span>
  <div id="mapContainer" class="darkmap" width="1000" height="1000" ></div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl"
import * as d3 from "d3";

export default {
  name: "DarkMap",
  props: {
    dataset: {
      required: true,
      type: Array
    }

  },
    data() {
      return {
        accessToken: "pk.eyJ1IjoiY3Bvc3NpbmdlciIsImEiOiJja2tqMHV5bjExNHIzMnVudzc1bzJ4dWhoIn0.53g3xS17ONQ80xyG80Fzpw",
        map: null,
        container: null,
        svg: null,
        dots: null,
        filtered_dataset: this.dataset,
        element: null,
        selected: "2010",
        options: [...new Set(this.dataset.map(item => item.iyear))],
        brush: null
      };
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        mapboxgl.accessToken = this.accessToken;

        this.map = new mapboxgl.Map({
          container: "mapContainer",
          style: "mapbox://styles/cpossinger/ckkj3k7491coo17rx6ey9ga67",
          zoom: 2,
        });

        var self = this;
        this.map.on("viewreset", self.render);
        this.map.on("move", self.render);
        this.map.on("moveend", self.render);

        d3.selectAll(".mapboxgl-canvas")
            .style("opacity", 1)
            .style("position", "absolute")
            .style("z-index", 1)

        this.init2();

      },

      init2() {


        this.container = this.map.getCanvasContainer();

        d3.select("#mapContainer")
            .call( d3.brush()                     // Add the brush feature using the d3.brush function
                .extent( [ [0,0], [1000,1000] ] ));

        this.svg = d3
            .select(this.container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "2000")
            .style("position", "absolute")
            .style("z-index", 10);


        console.log(this.filtered_dataset);

        this.dots = this.svg
            .selectAll("circle")
            .data(this.filtered_dataset)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("r", d => d.nkill / 20)
            .style("opacity", 0.7)
            .style("fill", "#ff3636")


        this.render();
      },


      projection: function (d) {
        console.log("projection");
        var self = this;
        //var map = self.map;
        console.log(typeof d.longitude);
        return self.map.project(new mapboxgl.LngLat(d.longitude, d.latitude));
      },

      render() {
        var self = this;

        console.log("Rendered");
        d3.selectAll(".circle")
            .attr("cx", function (d) {
              return self.projection(d).x;
            })
            .attr("cy", function (d) {
              return self.projection(d).y;
            });

      },


    },
  }


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#mapContainer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 0;
}
</style>