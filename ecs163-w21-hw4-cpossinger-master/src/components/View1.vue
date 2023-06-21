<!-- Your HTML goes here -->
<template>
  <div>

    <h1 style="color: white; text-align: left">LAX Passenger Data</h1>
    <div id="svg-container"></div>
    <input type="radio" id="Departures" value="Departure" name="arrive_depart_select" v-model="selected_value" @change="init" >
    <label for="Departures">Departures</label>
    <input type="radio" id="Arrivals" value="Arrival" name="arrive_depart_select" v-model="selected_value" @change="init">
    <label for="Arrivals">Arrivals</label>
    <br>
    <input type="radio" id="Both" value="Both" name="inter_dom_select" v-model="selected_value_int_arr" @change="init">
    <label for="Both">Both</label>
    <input type="radio" id="International" value="International" name="inter_dom_select" v-model="selected_value_int_arr" @change="init">
    <label for="International">International</label>
    <input type="radio" id="Domestic" value="Domestic" name="inter_dom_select" v-model="selected_value_int_arr" @change="init">
    <label for="Domestic">Domestic</label>
    <br>

  </div>
</template>

<script>
//import * as d3 from 'd3'
import * as d3 from "d3";

export default {
  name: 'LineChart', // Feel free to rename this and the file
  props: {
    line_data: {
      required: true,
      type: Array
    },
    width: {
      required: true,
      type: Number
    },
    height: {
      required: true,
      type: Number
    },

  },
  data() {
    return {
      dataset_group: null,
      passengers: null,
      selected_value: "Departure",
      selected_value_int_arr: "Both",
      xScale: null,
      yScale: null,
      dimensions: ({
        marginTop: 20,
        marginLeft: 55,
        marginRight: 20
      }),
      international_line: null,
      domestic_line: null,
      xAxis: null,
      yAxis: null,





    }
  },
  mounted() {
      this.init()
  },
  methods: {
      init() {
        this.dataset_group = d3.rollup(this.line_data, v => d3.sum(v,d => d.Passenger_Count),d => d.ReportPeriod,d => d.Arrival_Departure,d => d.Domestic_International);

        var arr = [];
        var parseTime = d3.utcParse("%x %X");
        for (const [key,value] of this.dataset_group.entries()) {
          arr.push({
            ReportPeriod: parseTime(key),
            Domestic: value.get(this.selected_value).get("Domestic"),
            International: value.get(this.selected_value).get("International")
          });
        }

        this.passengers = arr;

        this.$emit("radial_data",this.passengers)
        this.$emit("selection",this.selected_value_int_arr)
        this.$emit("selection_arrive_depart",this.selected_value)

        this.xScale = d3.scaleTime()
            .domain([d3.min(this.passengers, d => d.ReportPeriod),
              d3.max(this.passengers, d => d.ReportPeriod)])
            .range([this.dimensions.marginLeft, this.width + this.dimensions.marginLeft]);

        this.yScale = d3.scaleLinear()
            .domain([d3.min(this.passengers, d => d.International),
              d3.max(this.passengers, d => d.Domestic)])
            .range([this.height + this.dimensions.marginTop, this.dimensions.marginTop]);





        this.create_lines();
      },
    create_lines() {
      this.domestic_line = d3.line()
          .x(d => this.xScale(d.ReportPeriod))
          .y(d => this.yScale(d.Domestic))

      this.international_line = d3.line()
          .x(d => this.xScale(d.ReportPeriod))
          .y(d => this.yScale(d.International))
       this.create_axes()
    },
    create_axes() {
      this.xAxis = g => g
          .attr("transform", `translate(0,${this.height + this.dimensions.marginTop})`)
          .call(d3.axisBottom(this.xScale).ticks(this.width / 80).tickSizeOuter(0))

      this.yAxis = g => g
          .attr("transform", `translate(${this.dimensions.marginLeft},0)`)
          .call(d3.axisLeft(this.yScale).ticks(this.height / 40))

       this.add_to_svg()
    },

    add_to_svg() {
      d3.select("svg").remove()
      let svg_line = d3.select("#svg-container")
          .append("svg")
          .attr('font-family', 'sans-serif')
          .attr('font-size', 10)
          .attr('viewBox', [0,
            0,
            this.width+this.dimensions.marginLeft*3,
            this.height+this.dimensions.marginTop*3])
      if(this.selected_value_int_arr === "Domestic"){
      svg_line.append('path')
          .attr('fill', 'none')
          .attr('stroke', '#9063CD')
          .attr('stroke-width', '1.5')
          .attr('stroke-miterlimit', '1')
          .attr('d', this.domestic_line(this.passengers))
      }
      else if (this.selected_value_int_arr === "International") {
        svg_line.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#fdfd96')
            .attr('stroke-width', '1.5')
            .attr('stroke-miterlimit', '1')
            .attr('d', this.international_line(this.passengers))
      }
      else{

        svg_line.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#9063CD')
            .attr('stroke-width', '1.5')
            .attr('stroke-miterlimit', '1')
            .attr('d', this.domestic_line(this.passengers))

        svg_line.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#fdfd96')
            .attr('stroke-width', '1.5')
            .attr('stroke-miterlimit', '1')
            .attr('d', this.international_line(this.passengers))
      }

      svg_line.append('g')
          .call(this.xAxis)

      svg_line.append('g')
          .call(this.yAxis)


      svg_line.append("circle").attr("cx",120).attr("cy",50).attr("r", 6).style("fill", "#9063CD")
      svg_line.append("circle").attr("cx",120).attr("cy",70).attr("r", 6).style("fill", "#fdfd96")
      svg_line.append("text").attr("x", 135).attr("y", 50).text("Domestic").style("font-size", "15px").attr("alignment-baseline","middle").attr("fill","white")
      svg_line.append("text").attr("x", 135).attr("y", 70).text("International").style("font-size", "15px").attr("alignment-baseline","middle").attr("fill","white")


    },

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
input[type="radio"] + label[for^=Departures] {
  color: #ffffff;
}
input[type="radio"] + label[for^=Arrivals] {
  color: #ffffff;
}
input[type="radio"] + label[for^=Both] {
  color: #ffffff;
}
input[type="radio"] + label[for^=International] {

   color: #ffffff;
 }
input[type="radio"] + label[for^=Domestic] {

  color: #ffffff;
}

</style>