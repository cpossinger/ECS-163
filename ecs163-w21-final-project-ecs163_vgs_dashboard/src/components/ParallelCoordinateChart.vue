<template>
  <div>
    <div class='tooltip'></div>
    <svg class='pc-container' :viewBox='viewBox'>
      <g class='pc-lines'></g>
      <g class='pc-axes'></g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  name: 'ParallelCoordinateChart', // Feel free to rename this and the file
  props: {
    dataset: {
      required: true
    },
    attrVal: {
      required: true
    },
    groupVal: {
      required: true
    },
    selectedGroupStream: {
      required: true
    },
    selectedGroupsBar: {
      required: true
    },
    width: {
      required: true
    },
    height: {
      required: true
    },
    yearRange: {
      required: true
    }
  },
  data() {
    return {
        filtered: null,
      keys: null,
      selected: null,
      groupSelected: false,
      margin: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    }
  },
  watch: {
    selectedGroupStream() {
      this.groupSelected = true
      this.update()
      this.groupSelected = false
    },
    selectedGroupsBar() {
      this.groupSelected = true
      this.update()
      this.groupSelected = false
    },
    yearRange() {
      this.update();
    },
    attrVal(){
      this.update();
    }
  },
  mounted() {
    console.log('attempting to initialize')
    this.init()
  },
  computed: {
    viewBox() {
      return `0 0 ${this.width} ${this.height}`;
    },
  },
  methods: {
    init() {
        this.filtered = d3.filter(this.dataset, d => d.User_Score > 0 && d.Critic_Score > 0)
      this.init_val = true;
      console.log('this.init called')
      console.log(this.filtered)
      this.x = null
      this.y = d3.scalePoint()
      this.brush = d3.brushX()
      // Selector. To be implemented at later point.
      // this.z = d3.scaleSequential()
      this.line = d3.line()
      this.update()
    },
    update() {
        this.filtered = d3.filter(this.dataset, d => d.User_Score > 0 & d.Critic_Score > 0)
      //this.filtered = this.dataset;
      console.log('this.update called')

      console.log("PC year range", this.yearRange);
      // add columns manually
      let columns = ['Critic_Score', 'User_Score', 'Total_Shipped', 'Global_Sales']
      console.log(this.attrVal);
    // this.filtered = d3.filter(this.filtered, d => d[this.attrVal] != 0);

      console.log("PC data: ", this.filtered);

      if (this.selectedGroupStream) {
        this.filtered = d3.filter(this.filtered, d => d[this.groupVal] == this.selectedGroupStream)
      }
      if (!(this.selectedGroupsBar == null) && this.selectedGroupsBar.values.length != 0) {
        this.filtered = this.filtered.filter(d => this.selectedGroupsBar.values.includes(d[this.selectedGroupsBar.attrib]))
      }
      if (this.yearRange != null) {
        if(this.yearRange[0] <= this.yearRange[1]){
          console.log(this.yearRange[0], "<=", this.yearRange[1]);
          this.filtered = d3.filter(this.filtered, d =>  d.Year.getUTCFullYear() >= this.yearRange[0] && d.Year.getUTCFullYear() <= this.yearRange[1])
        }else {
          this.filtered = d3.filter(this.filtered, d =>  d.Year.getUTCFullYear() <= this.yearRange[0] && d.Year.getUTCFullYear() >= this.yearRange[1])
        }
      }

      this.filtered = Object.assign(this.filtered, {columns})
      this.keys = this.filtered.columns
      this.selections = new Map()
      this.x = new Map(Array.from(this.keys, key => [key, d3.scaleLinear(d3.extent(this.filtered, d => d[key]),
          [this.margin.left, this.width - this.margin.right])]))
      this.y = d3.scalePoint(this.keys, [this.margin.top, this.height - this.margin.bottom])
      this.brush = d3.brushX()
          .extent([
            [this.margin.left, -(20 / 2)],
            [this.width - this.margin.right, 20 / 2]
          ])
          .on("start brush end", this.brushed);
      d3.select('.pc_container')
          .call(this.brush)
      // this.z =
      this.line = d3.line()
          .defined(([, value]) => value != null)
          .x(([key, value]) => this.x.get(key)(value))
          .y(([key]) => this.y(key))
      this.render_lines()
        this.render_axes()
    },
    render_axes() {
      d3.select(".pc-axes").selectAll("*").remove()
      d3.select('.pc-axes')
          .selectAll('g')
          .data(this.keys)
          .join('g')
          .attr("transform", d => `translate(0,${this.y(d)})`)
          .each((d, i, nodes) => {
            // This is where the issue is.
            console.log("Issue", d, i, nodes, d3.select(nodes[i]), this.x.get(d))
            d3.select(nodes[i]).call(d3.axisBottom(this.x.get(d)).ticks(this.width/60));
          })
          .call(g => g.append("text")
              .attr("x", this.margin.left)
              .attr("y", -6)
              .attr("text-anchor", "start")
              .text(d => this.axis_text(d)))
          /*
          .call(g => g.selectAll("text")
              .clone(true).lower()
              .attr("fill", "none")
              .attr("stroke-width", 5)
              .attr("stroke-linejoin", "round")
              .attr("stroke", "black"))
           */
          .call(this.brush)
    },
    render_lines() {
      d3.select('.pc-lines')
          .attr('fill', 'none')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.4)
          .selectAll('path')
          .data(this.filtered)
          .join("path")
          .attr("stroke", 'steelblue')
          .attr("d", d => this.line(d3.cross(this.keys, [d], (key, d) => [key, d[key]])))
          .append("title")
          .text(d => d.name);
      d3.select('.pc-lines')
          .selectAll('path')
          .on('mouseover', function (e, d) {
            d3.select('.tooltip')
                .html(
                    `<div>
                    Name: ${d.Name}<br>
                    Platform: ${d.Platform}<br>
                    Released: ${d.Year.getUTCFullYear()}
                    </div>`)
                .style('visibility', 'visible');
            d3.select(this)
                .attr('stroke-width', 4)
          })
          .on('mousemove', function (e) {
            d3.select('.tooltip')
                .style('top', e.pageY - 50 + 'px')
                .style('left', e.pageX + 10 + 'px');
          })
          .on('mouseout', function () {
            d3.select('.tooltip')
                .html(``).style('visibility', 'hidden');
            d3.select(this)
                .attr('stroke-width', 1.5)
          });
    },
    axis_text(s) {
      let labels = {Critic_Score:'Critic Score', User_Score:'User Score', Total_Shipped:'Total Shipped (m)', Global_Sales:'Global Sales (m)'}

      return labels[s]
    },
    // brushed function taken from brushable scatterplot located at https://observablehq.com/@d3/brushable-parallel-coordinates
    brushed({selection}, key) {
      if (selection === null) this.selections.delete(key);
      else this.selections.set(key, selection.map(this.x.get(key).invert));
      const selected = [];
      d3.select('.pc-lines')
          .selectAll('path')
          .each((d, i, nodes) => {
            const active = Array.from(this.selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
            d3.select(nodes[i]).style("stroke", active ? 'steelblue' : '#ddd');
            if (active) {
              d3.select(nodes[i]).raise();
              selected.push(d);
            }
          })
          .property("value", selected).dispatch("input");
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Add your CSS here */
.tooltip {
  font-family: sans-serif;
  font-size: 16;
  position: absolute;
  z-index: 10;
  visibility: hidden;
  padding: 10px;
  background: rgba(0,0,0,0.6);
  border-radius: 4px;
  color: currentColor;
  fill: currentColor;
}
</style>
