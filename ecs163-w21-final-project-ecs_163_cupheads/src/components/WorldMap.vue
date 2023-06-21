<!-- Your HTML goes here -->
<template>
    <div>
        <h1>{{ title }}</h1>
        <svg class="`world-map-svg-${chartId}`" :viewBox = 'myViewBox'>
            <g :transform = "`translate(${margin.left}, ${margin.top})`">
                <g class = "World_Map">
                    <!-- Your map goes here! -->
                </g>
            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from 'd3'
const topojson = require('topojson-client')

export default {
  name: 'WorldMap', // Feel free to rename this and the file
  props: {
    data:{
        required:true,
        type:Array
    },
    height:{
          required:true,
          type:Number
    },
    width:{
        required:true,
        type:Number
    }
  },
   data(){
      return{
          x:null,
          y: null,
          margin: {
              left:0,
              top: 0,
              right: 0,
              bottom: 0,
          }
      }
    },
  mounted() {
      this.init()
  },
  watch: {
      data(){
          this.renderMap()
      }
  },
  methods: {
      init() {
          this.renderMap()
      },
      renderMap(){
        //   let dataColor = this.data;
        //   console.log(dataColor)
          let countryArr = []
          let color = d3.scaleLinear().range(["#a6aeba","brown"]).domain([0,30])
          let myMap = d3.json("/maps/countries-110m.json")
          let worldMap = myMap.then(function(data){
              return topojson.feature(data, data.objects.countries).features
          })
          let self = this
          async function createMap(){
              let projection = d3.geoMercator()
              .scale(100)
              let path = d3.geoPath().projection(projection)
              let dataColor = await self.data;
              let country_data = await worldMap;
              const plot_items =
              d3.select('.World_Map')
              .selectAll(".country")
              .data(country_data)
              .enter()
              .append("path")
              .attr("fill", function(d,i){
                   for (let j = 0; j < dataColor.length; j++){
                       if (dataColor[j].name == d.properties.name){
                           return color(dataColor[j].bean_count)
                       }
                   }
                   return "#a6aeba"
               })
              .attr("class","country")
              .attr("d", path)
              .on('click',clicked)
              .on('dblclick',unclicked)
              .on('mouseover',mouseOver)
                  //console.log(self)
              .on('mouseout', data=>
              d3.select('.World_Map')
              .selectAll("#Pop_up_name")
              .remove())
              function countriesSelected(myCountries){
                  self.$emit('countries_selected',myCountries)
              }
              function unclicked(event,d){
                // Remove from array
                d3.select(this).attr("fill",function(d,i){
                    for(let j = 0; j <dataColor.length; j++){
                        if (dataColor[j].name == d.properties.name){
                            return color(dataColor[j].bean_count)
                        }
                    }
                    return "#a6aeba"
                })
                if(countryArr.length >= 1){
                  for (let i = 0; i < countryArr.length; i++){
                    if (countryArr[i] == d.properties.name){
                        countryArr.splice(i,1)
                        }
                    }
                    countriesSelected(countryArr)
                 }
              }
              function clicked(event,d){
                  if (countryArr.length <= 2 && countryArr.includes(d.properties.name)== false){
                      d3.select(this).attr("fill","yellow")
                      countryArr.push(d.properties.name)
                      countriesSelected(countryArr)
                  }else{
                      console.log("De-select a country first!")
                  }
              }
              function mouseOver(event,d){
                let mouseLoc = d3.pointer(event)
                let country_name = d.properties.name
                let group = d3.select('.World_Map').append('g');
                let coffee_bean_count = 0
                for(let i = 0; i < dataColor.length; i++){
                    if(dataColor[i].name == country_name){
                        coffee_bean_count = dataColor[i].bean_count
                    }
                }
                group.append("text")
                .text("Country Name: " + country_name)
                .attr('font-size',15)
                .attr("x",mouseLoc[0])
                .attr("y",mouseLoc[1])
                .attr("transform", `translate(0,0)`)
                .attr("fill","white")
                .attr("id","Pop_up_name")
                .attr("opacity",1)
                group.append("text")
                .text("Bean Count: " + coffee_bean_count)
                .attr('font-size',15)
                .attr("x",mouseLoc[0])
                .attr("y",mouseLoc[1])
                .attr("transform", `translate(1,15)`)
                .attr("fill","white")
                .attr("id","Pop_up_name")
                .attr("opacity",1)
              }
          }
          let newMap = createMap()
      },

  },
  computed: {
      myViewBox(){
          return `0 0 ${this.width} ${this.height}`
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
text{
   outline-style: none;
}
</style>