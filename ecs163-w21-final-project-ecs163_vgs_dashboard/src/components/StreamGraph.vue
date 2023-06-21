<template>

  <div class="svg-container">
    <v-btn text rounded @click="reset"> Reset Zoom</v-btn>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: 'StreamGraph',
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
    attrVal: {
      required: true
    },
    groupVal: {
      required: true
    },
    setClicked: {
      type: Function,
      required: true
    },
    selectedGroupsBar: {
      type: Object
    },
    streamAutoVal: {
    },
  },
  watch: {
    attrVal: {
      handler: function (val){
        console.log("watch: attrval")
        this.attrVal = val;
        this.init();
      },
    },
    groupVal: {
      handler: function (val){
        console.log("watch: groupVal")
        this.groupVal = val;
        this.init();
      }
    },
      streamAutoVal: {
        handler: function (val) {
          this.streamAutoVal = val;
          console.log("stream autoval changed", this.streamAutoVal);
          this.selectedVal = this.streamAutoVal;
          this.autoSelectVal();
        },
      },
    selectedGroupsBar: {
      handler: function (val) {
        console.log("watch: selectedGroupsBar", val)
        this.selectedGroupsBar = val
        console.log("bar click", this.click)
        /*
        if(this.click === true){
          this.click = !this.click;
        }
         */
        this.click = !this.click;
        this.init();
        this.autoSelectVal();
          //this.reselectVal();
      },
    }
  },
  data: () =>  ({
    zoom: null,
    svg: null,
    gx: null,
    xAxis: null,
    area: null,
    x: null,
    y: null,
    areas: null,
    Tooltip: null,
    data: null,
    margin: null,
    color: null,
    click: false,
    selectedVal: null
  }),
  created() {
    this.margin = ({top: 0, right: 20, bottom: 30, left: 20});
    this.xAxis = (g,x) => g
        .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
        .call(d3.axisBottom(x).ticks(this.width / 80).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
    this.area = (data,x) => d3.area()
        .x(d => x(d.data.date))
        .y0(d =>  this.y(d[0]))
        .y1(d => this.y(d[1]))
    this.zoom = d3.zoom()
        .scaleExtent([1, 32])
        .extent([[this.margin.left, 0], [this.width - this.margin.right, this.height]])
        .translateExtent([[this.margin.left, -Infinity], [this.width - this.margin.right, Infinity]])
        .on("zoom", this.zoomed);
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      console.log("stream init");
      this.data = this.dataset.filter(obj => obj[this.groupVal] != 0 && obj[this.attrVal] != 0);
      if (!(this.selectedGroupsBar == null) && this.selectedGroupsBar.values.length != 0) {
        this.data = this.data.filter(obj => this.selectedGroupsBar.values.includes(obj[this.selectedGroupsBar.attrib]))
      }
      let genre_sales = null;
      if(this.attrVal.includes("Score") === true){
        genre_sales = d3.rollup(this.data,v => d3.mean(v, d =>  d[this.attrVal]), d => d.Year, d => d[this.groupVal]);
      }else{
        genre_sales = d3.rollup(this.data, v => d3.sum(v, d => d[this.attrVal]), d => d.Year, d => d[this.groupVal]);
      }
      let series_data = [];
      this.series_keys = [];
      for(const map of genre_sales.values()){
        for(const key of map.keys()){
          if(this.series_keys.includes(key) === false){
            this.series_keys.push(key);
          }
        }
      }
      for(const [key,value] of genre_sales){
        let push_obj = ({date: key});
        for(const cat of this.series_keys){
          if(value.get(cat) === undefined){
            push_obj[cat] = 0;
          }else{
            push_obj[cat] = value.get(cat);
          }
        }
        series_data.push(push_obj);
      }
      series_data.sort(function (a,b){
        return a.date - b.date;
      });
      const series_const = d3.stack()
          .keys(this.series_keys)
          .offset(d3.stackOffsetWiggle)
          .order(d3.stackOrderInsideOut)
      this.series = series_const(series_data);
      console.log(this.series)
      this.x =  d3.scaleUtc()
          .domain(d3.extent(this.data, d => d.Year))
          .range([this.margin.left, this.width - this.margin.right]);
      this.y = d3.scaleLinear()
          .domain([d3.min(this.series, d => d3.min(d, d => d[0])), d3.max(this.series, d => d3.max(d, d => d[1]))])
          .range([this.height - this.margin.bottom, this.margin.top]);
      this.color = d3.scaleOrdinal()
          .domain(Object.keys(this.data[0]))
          .range(d3.schemeCategory10);
      this.constrStream();
    },
    constrStream(){
      d3.select(".streamGraph").remove();
      this.svg = d3.select(".svg-container")
          .append("svg")
          .attr("class","streamGraph")
          .style("overflow","visible")
          .attr("viewBox", [0, 0, this.width, this.height]);
      this.svg
          .append("defs")
          .append("clipPath")
          .attr("id","clip")
          .append("rect")
          .attr("width",this.width)
          .attr("height",this.height);
      this.Tooltip = this.svg
          .append("text")
          .attr("x", 0)
          .attr("y", 20)
          .style("opacity", 0)
          .style("font-size", 10)
      this.areas = this.svg.append("g")
          .selectAll("path")
          .data(this.series)
          .join("path")
          .on("mouseover",this.over)
          .on("mousemove",this.moved)
          .on("mouseleave",this.leave)
          .on("click",this.clicked)
          .attr("fill", ({key}) => this.color(key))
          .attr("text", ({key}) => key)
          .attr("class","area")
          .attr("clip-path","url(#clip)")
          .attr("d", this.area(this.series,this.x));
      this.svg.call(this.zoom)
      this.gx = this.svg.append("g")
          .call(this.xAxis, this.x);
    },
    moved(event,d){
      if(!this.click){
        this.Tooltip.text(d.key);
      }
    },
    over(event){
      if(!this.click){
        this.Tooltip.style("opacity", 1);
        d3.selectAll(".area").style("opacity", .2)
        d3.select(event.currentTarget)
            .style("stroke", "black")
            .style("opacity", 1);
      }

    },
    leave(){
      if(!this.click){
        this.Tooltip.style("opacity", 0)
        d3.selectAll(".area").style("opacity", 1).style("stroke", "none")
      }
    },
    clicked(event,d){
      console.log("clicked streamgraph");
      if(this.click === true){
        this.selectedVal = "";
        this.setClicked(this.selectedVal);
      }else{
        this.selectedVal = d.key;
        this.setClicked(this.selectedVal);
      }


    },
    autoSelectVal(){
      console.log("auto select");
      if(this.selectedVal === null || this.selectedVal ===""){
        this.click = !this.click;
        console.log("auto selected val",this.selectedVal);
        console.log("autoselect stream auto val", this.streamAutoVal)
        console.log("auto click value", this.click);
        this.Tooltip.style("opacity", 0)
        d3.selectAll(".area").style("opacity", 1).style("stroke", "none")
        this.setClicked(this.selectedVal);
      }else{
        console.log("autoselect stream auto val", this.streamAutoVal)
        console.log("autoselect selected ", this.selectedVal)

        this.click = !this.click;
        console.log("auto click val", this.click);
        let autoVal = this.streamAutoVal;
        this.Tooltip.style("opacity", 1);
        this.Tooltip.text(this.streamAutoVal);
        d3.selectAll(".area").style("opacity", .2)
        d3.selectAll(".area")
            .filter(function(){ return d3.select(this)._groups[0][0].attributes[1].textContent === autoVal })
            .style("stroke", "black")
            .style("opacity", 1);
        this.selectedVal = this.streamAutoVal;
        this.setClicked(this.selectedVal);
      }



    },
    reselectVal(){
      console.log("reselect: ",this.selectedVal);
      //if(this.selectedVal != null || this.selectedVal != ""){

      this.click = !this.click;
      let val = this.selectedVal;
      this.Tooltip.style("opacity", 1);
      this.Tooltip.text(this.selectedVal);
      d3.selectAll(".area").style("opacity", .2)
      d3.selectAll(".area")
          .filter(function(){ return d3.select(this)._groups[0][0].attributes[1].textContent === val })
          .style("stroke", "black")
          .style("opacity", 1);
      this.setClicked(this.selectedVal);
      //}



    },
    zoomed(event) {
      const xz = event.transform.rescaleX(this.x);
      this.svg.selectAll("path")
          .attr("d", this.area(this.series,xz))
      this.gx.call(this.xAxis, xz);
    },
    reset(){
      this.svg.transition()
          .duration(750)
          .call(this.zoom.transform, d3.zoomIdentity);
    }
  }
}
</script>

<style>
</style>
