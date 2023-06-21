<template>
  <div>
    <svg class="bar-container"  id="barchart" :viewBox='viewBox' v-on:clicked="processStreamClick" >
      <g transform="translate(0,5)">
        <g :transform="'translate(' + buffer + ', 0)'" class='bar-vertical'></g>

        <g :transform="'translate(' + buffer + ',' + (height-buffer/2) + ')'" class='bar-horizontal'></g>
        <g class="bars"></g>
      </g>
      <text class="text" id="horizontal-label" > </text>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
const buffer = 100
export default {
  name: 'BarChart', // Feel free to rename this and the file
  props: {
    dataset: {
      required: true
    },
    width: {
      required: true
    },
    height: {
      required: true
    },
    attribX: {
      type: String,
      required: true
    },
    attribY: {
      type: String,
      required: true
    },
    streamGroup: {
      type: String,
      required: true
    },
    selectedGroupStream: {
      required: true
    },
    setFilter: {
      type: Function,
      required: true
    },
    yearRange: {
      type: Array,
      required:true
    }
  },
  data() {
    return {
      vertical: null,
      horizontal: null,
      selection: [],
      fixed_data: [],
      summmed_label: "",
      buffer: 100
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    viewBox() {
      return `0 0 ${this.width} ${this.height}`;
    },
  },
  methods: {
    processStreamClick(data) {
      console.log("process stream click", data)
      this.selectedGroupStream = data
    },
    renderData() {

      this.total = 0
      this.fixed_data = []
      let group = null
      console.log("Bar Chart Year Range", this.yearRange)
      if (this.yearRange != null) {
        if(this.yearRange[0] <= this.yearRange[1]){
          this.dataset = this.dataset.filter(d => d[this.attribX] != 0 && d.Year.getUTCFullYear() >= this.yearRange[0] && d.Year.getUTCFullYear() <= this.yearRange[1])
        }else{
          this.dataset = this.dataset.filter(d => d[this.attribX] != 0 && d.Year.getUTCFullYear() <= this.yearRange[0] && d.Year.getUTCFullYear() >= this.yearRange[1])
        }
      }


      if (this.selectedGroupStream == "" || this.streamGroup == "" || this.selectedGroupStream == null || this.streamGroup == null) {
        group = d3.group(this.dataset, d => d[this.attribX])
      } else {
        console.log("Filtering bar chart based on ", this.selectedGroupStream)
        group = d3.group(this.dataset.filter(d => d[this.streamGroup] == this.selectedGroupStream), d=> {
          return d[this.attribX]
        })
      }
      group.forEach(
          value => {
            let sum = 0;
            for (let i = 0; i < value.length; i++) {
              sum += value[i][this.attribY]
            }
            let bar = value[0][this.attribX]
            if (bar == null) {
              return
            }
            if (bar.length > 10) {
              // Several of the producers and developers have names that are much too long
              bar = bar.replace(" Computer Entertainment", "")
                .replace(" Entertainment", "")
                .replace(" Software, Inc.", "")
                .replace("SCE San Diego Studio", "SCE Studios")
                .replace(" Creations", "")
                .replace(" Interactive", "")
                .replace(" / Lexis Numerique", "")
                .replace("EA Redwood Shores", "EA Redwood")
                .replace(" Software", "")
                .replace(" Productions", "")
                .replace(" Ltd.", "") 
                .replace("Developments", "Dev.")
                .replace(" Game Studios", "")
                .replace(" Games", "")   
            }
            this.fixed_data.push({bar: bar, data:sum})
            this.total += sum
          }
      )
      this.fixed_data = this.fixed_data.filter(d => d.data/this.total >= 0.01)
        //.sort((a,b) => a.bar.localeCompare(b.bar))
        .sort((a,b) => b.data - a.data)
      console.log("bar chart fixed data: ",this.fixed_data);
      const initSelect = this.selection.length
      for (let i = 0; i < this.selection.length; i++) {
        if (this.fixed_data.map(d => d.bar).includes(this.selection[i])){
          this.selection.splice(i, 1)
          i--
        }
      }
      this.horizontal = d3.scaleLinear().domain([0, 1.1* d3.max(this.fixed_data, d=>d.data)]).range([0, this.width - buffer*2]).nice() 
      this.vertical = d3.scaleBand(this.fixed_data.map(d => d.bar), [5, this.height - buffer/2])
      this.renderBars()
      if (initSelect != this.selection.length) {
        // Need to update the other components with the knowledge to not filter with these columns
        this.setFilter(this.attribX, this.selection) 
      }
    },
    renderBars() {
      d3.select(".bars").selectAll("*").remove()
      let bars = d3.select(".bars")
      for (let i = 0; i < this.fixed_data.length; i++) {
        let d = this.fixed_data[i]
        let sel = this.selection.length == 0 || this.selection.includes(d.bar)
        bars.append("rect")
            .attr("class", "bar")
            .attr("y", this.vertical(d.bar) + 0.1 * this.vertical.bandwidth())
            .attr("height", 0.8 * this.vertical.bandwidth())
            .attr("x", buffer)
            .attr("width", this.horizontal(d.data))
            .attr("data", d.bar)
            .attr("val", d.data)
            .on("click", d => {
              let clicked = d3.select(d.target).attr("data")
              let index = this.selection.indexOf(clicked)
              if (index != -1) {
                this.selection.splice(index, 1)
              } else {
                this.selection.push(clicked)
              }
              this.renderBars()
              this.setFilter(this.attribX, this.selection)
            })
            .on("mouseover", d => {
              let bar = d3.select(d.target).attr("data")
              let value = d3.select(d.target).attr("val")
              d3.select(".bar-container")
                  .append("text")
                  .attr("class", "bar-hover")
                  .attr("y", this.vertical(bar) + this.vertical.bandwidth()/2 + 9)
                  .attr("x", this.horizontal(value) + 4 + buffer)
                  .attr("font-size", "x-small")
                  .text(parseFloat(value).toFixed(2))
            })
            .on("mouseout", () => d3.selectAll(".bar-hover").remove())
            .attr("fill", "#CCC")
            .filter(() => sel)
            .attr("fill", "#377db6")
      }
    },
    renderAxes() {
      let vert = d3.axisLeft(this.vertical).tickSize(0)
      d3.select(".bar-vertical").call(vert)
      let hori = d3.axisBottom(this.horizontal).ticks((this.width - 2*buffer)/50)
      d3.select(".bar-horizontal").call(hori)
    },
    init() {
      console.log("bar chart", this.attribX, this.attribY)
      //d3.select(".barchart").attr("width", ).attr("height", this.height)
      this.renderData()
      this.renderAxes()
      let horizontal_label = d3.select("#horizontal-label")
      horizontal_label.text(this.attribY.replace("_", " "))
          .attr("x", 0.5 * this.width) // this.width
          .attr("y", this.height) // this.height
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "bottom")
    }
  },
  watch: {
    data() {
      // Chart data was updated by main
      // Must check that every column in selection is still in the dataset, or remove it otherwise.
      console.log("bar data changed")
      
      this.init()
    },
    attribX() {
      console.log("bar attribX", this.attribX)
      // None of the selection can be kept as we are using completely different variables
      this.selection = []
      this.init()
    },
    attribY() {
      console.log("bar attribY", this.attribY)
      // Keep selection
      this.init()
    },
    selectedGroupStream() {
      console.log("bar selectedGroupStream", this.selectedGroupStream)
      this.init()
    },
    yearRange() {
      this.init()
    }
    // StreamGroup will in any healthy idea be associated with a change in the selectedGroupStream
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
/* Add your CSS here */
</style>
