export default class Tooltip {
    constructor(xScale, yScale) {
        this.xScale = xScale
        this.yScale = yScale
        this.ResponseRate = <text y="-22" fill='white'></text>
        this.International = <text y="-12" fill='white'></text>
        this.node = <g pointer-events='none' display='none' font-family='sans-serif' font-size='10' text-anchor='middle'>
                  <rect x='-32' width='65' y='-35' height='30' rx='5' fill='rgba(0,0,0,0.75)'></rect>
                  ${this.ResponseRate}
                  ${this.International}
                  <circle r='2.5'></circle>
                </g>
    }
    show(d) {
        this.node.removeAttribute('display')
        this.node.setAttribute('transform', `translate(${this.xScale(d.ResponseRate)},${this.yScale(d.International)})`)
        this.ResponseRate.textContent = `Year: ${d.ResponseRate}`
        this.International.textContent = `Life Exp.: ${d.International}`
    }
    hide() {
        this.node.setAttribute('display', 'none')
    }
}