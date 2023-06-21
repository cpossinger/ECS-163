<!-- Your HTML goes here -->
<template>
  <div>
    <select v-model="selected_year" @change="init" >
      <option v-for="option in options" v-bind:key="option" v-bind:value="option">
        {{ option }}
      </option>
    </select>

    <div id="radial-container" ></div>

  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'RadialChart', // Feel free to rename this and the file
  props: {
    radial_data: {
      required: true,
      type: Array
    },
    radial_selection: {
      required: true,
      type: String
    },
    radial_selection_arrive_depart: {
      required: true,
      type: String
    },
    width: {
      required: true,
      type: Number
    },
    height: {
      required: true,
      type: Number
    },
    innerRadius: {
      required: true,
      type: Number
    },
    outerRadius: {
      required: true,
      type: Number
    }
  },
  watch: {
    radial_selection: {
      handler: function (val) {
        this.radial_selection = val;

      },
      deep: true
    },
    radial_selection_arrive_depart: {
      handler: function (val) {
        this.radial_selection_arrive_depart = val;
      },
      deep: true
    },
    radial_data: {
      handler: function (val) {
        this.radial_data = val;
        this.init();
      },
      deep: true
    }
},
  data() {
    return{
      options: [...new Set(this.radial_data.map(item => item.ReportPeriod.getUTCFullYear()))],
      selected_year: "2018",
      filtered_data: this.radial_data,
      z: null,
      y: null,
      x: null,
      yAxis: null,
      xAxis: null,
      legend: null,
      arc: null,
      svg: null
    }
  },
  mounted() {
      this.init()
  },
  methods: {
      init() {
        d3.select("#radial-container").select("svg").remove();
        this.filtered_data = this.radial_data.filter(d => d.ReportPeriod.getUTCFullYear() == this.selected_year)
        .map(d => ({
          ReportPeriod: d.ReportPeriod.toUTCString().substring(8,11),
          Domestic: d.Domestic,
          International: d.International}));

        this.z = d3.scaleOrdinal()
            .domain([this.radial_selection])
            .range(["purple","green"]);

        this.x = d3.scaleBand()
            .domain(this.filtered_data.map(d => d.ReportPeriod))
            .range([0, 2 * Math.PI])
            .align(0)

        if(this.radial_selection === "International") {
          this.y = d3.scaleRadial()
              .domain([0, d3.max(this.filtered_data, d => d.International)*1.2])
              .range([this.innerRadius, this.outerRadius]);
        }
        else if (this.radial_selection === "Domestic"){
          this.y = d3.scaleRadial()
              .domain([0, d3.max(this.filtered_data, d => d.Domestic)*1.2])
              .range([this.innerRadius, this.outerRadius]);
        }

        this.arc = d3.arc()
            .innerRadius(d => this.y(d[0]))
            .outerRadius(d => this.y(d[1]))
            .startAngle(d => this.x(d.data.ReportPeriod))
            .endAngle(d => this.x(d.data.ReportPeriod) + this.x.bandwidth())
            .padAngle(0.01)
            .padRadius(this.innerRadius)

       this.createAxes();

      },
    createAxes() {
      this.yAxis = g => g
          .attr("text-anchor", "middle")
          .call(g => g.append("text")
              // eslint-disable-next-line no-unused-vars
              .attr("y", d => -this.y(this.y.ticks(5).pop()))
              .attr("dy", "-1em")
              .text(""))
          .call(g => g.selectAll("g")
              .data(this.y.ticks(5).slice(1))
              .join("g")
              .attr("fill", "none")
              .call(g => g.append("circle")
                  .attr("stroke", "#000")
                  .attr("stroke-opacity", 0.5)
                  .attr("r", this.y))
              .call(g => g.append("text")
                  .attr("y", d => -this.y(d))
                  .attr("dy", "0.35em")
                  .attr("stroke", "#a9a9a9")
                  .attr("stroke-width", 3)
                  .text(this.y.tickFormat(5, "s"))
                  .clone(true)
                  .attr("fill", "white")
                  .attr("stroke", "none")))

      this.xAxis = g => g
          .attr("text-anchor", "middle")
          .call(g => g.selectAll("g")
              .data(this.filtered_data)
              .join("g")
              .attr("transform", d => `
          rotate(${((this.x(d.ReportPeriod) + this.x.bandwidth() / 2) * 180 / Math.PI - 90)})
          translate(${this.innerRadius},0)`)
              .call(g => g.append("line")
                  .attr("x2", -5)
                  .attr("stroke", "#000"))
              .call(g => g.append("text")
                  .attr("transform", d => (this.x(d.ReportPeriod) + this.x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                      ? "rotate(90)translate(0,16)"
                      : "rotate(-90)translate(0,-9)")
                  .text(d => d.ReportPeriod)))
      this.createLegend();
    },
    createLegend() {
if(this.radial_selection === "International") {
  this.legend = g => g.append("g")
      .selectAll("g")
      .data([this.radial_selection_arrive_depart+" "+this.radial_selection+" "+"Passengers"+" "+this.selected_year.toString() ])
      .join("g")
      .attr("transform",  "translate(-10,-10)")
      .call(g => g.append("rect")
          .attr("width", 9)
          .attr("height", 9)
          .attr("x", 6)
          .attr("y",20)
          .attr("fill", "#fdfd96"))
      .call(g => g.append("text")
          .attr("x", -35)
          .attr("y", 10)
          .attr("dy", "0.35em")
          .text(d => d))
}
else if (this.radial_selection === "Domestic") {
  this.legend = g => g.append("g")
      .selectAll("g")
      .data([this.radial_selection_arrive_depart+" "+this.radial_selection+" "+"Passengers"+" "+this.selected_year.toString() ])
      .join("g")
      .attr("transform", "translate(-10,-10")
      .call(g => g.append("rect")
          .attr("width", 9)
          .attr("height", 9)
          .attr("x", -5)
          .attr("y",10)
          .attr("fill", "#9063CD"))
      .call(g => g.append("text")
          .attr("x", -40)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .text(d => d))
}
else{
  this.legend = null;
}


      this.createSVG();

    },
    createSVG() {
      this.svg = d3.select("#radial-container")
           .append("svg")
          .attr("viewBox", `${-this.width / 2} ${-this.height  / 2} ${this.width} ${this.height}`)
          .style("width", "100%")
          .style("height", "100%")
          .style("font", "5px sans-serif")
          .style("fill","white");

if(this.radial_selection === "International"){
  this.svg.append("g")
      .selectAll("g")
      .data(d3.stack().keys([this.radial_selection])(this.filtered_data))
      .join("g")
      .attr("fill", "#fdfd96")
      .selectAll("path")
      .data(d => d)
      .join("path")
      .attr("d", this.arc );

}
else if (this.radial_selection === "Domestic"){
  this.svg.append("g")
      .selectAll("g")
      .data(d3.stack().keys([this.radial_selection])(this.filtered_data))
      .join("g")
      .attr("fill","#9063CD")
      .selectAll("path")
      .data(d => d)
      .join("path")
      .attr("d", this.arc );
}

      this.svg.append("g")
          .call(this.xAxis);

      this.svg.append("g")
          .call(this.yAxis);

      this.svg.append("g")
          .call(this.legend);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>