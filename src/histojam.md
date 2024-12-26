---
title: Gdaldem histojam
---
# gdaldem histojam

Making `gdaldem color-relief` color configuration files by hand can be a drag. Jam on some histogrammatic colormap file creation workflows instead.  

Calculate a histogram passing the `-hist` option to `gdalinfo` for your geotiff, write the output to a new json file, and upload it with the file selection option below. 
```md
gdalinfo -json -hist file.tif > info.json
```
Pick your colors and adjust the options to suit your needs, then copy the color configuration results to a text file for your next g'damn gdaldem color-relief attempt. 
```js
const histFile = FileAttachment("data/histexample.json").json();
```
```js
const dicopalFile = FileAttachment("data/dicopaldata.json").json();
```

```js
const jsonfile = view(Inputs.file({label: "gdalinfo JSON file", accept: ".json"}));
```

```js
const histData = jsonfile != null ? jsonfile.json() : histFile
```
```js
const bandOpts = histData.bands.map((d, i)=> [d.band, i])
```
```js
const band = view(Inputs.select(
  new Map(bandOpts), {label: "Band selection"}
))
```

```js
const dataMin = histData.bands[band].min
const dataMax = histData.bands[band].max
const dataMean = histData.bands[band].mean
const histBinMin = histData.bands[band].histogram.min
const histBinMax = histData.bands[band].histogram.max
const histBinCount = histData.bands[band].histogram.count
const histBuckets = histData.bands[band].histogram.buckets
const minMax = [Math.floor(dataMin), Math.ceil(dataMax)]

```
```js
const cIn = Inputs.textarea({label: "Colors", rows: 2, value: 'purple,#ED2A24'}); 
const cView = view(cIn)
```

```js
const colorVals = cView.split(',')
```

```js
const unoReverse = view(Inputs.button("Flip", {label:"Reverse colors",reduce:prestoChangeo}))

```
```js
const linspace = function (start, stop, nsteps) {
  const delta = (stop - start) / (nsteps - 1);
  return d3.range(nsteps).map((i) => start + i * delta);
}

function prestoChangeo() {
  cIn.value = colorVals.reverse().join(',');
  cIn.dispatchEvent(new Event("input"));
};

function ramp(palette, n = 128) {
  let color = d3.piecewise(d3.interpolateLab,palette);
  const canvas = document.createElement("canvas");
  d3.select(canvas).attr("width", n).attr("height", 1);
  const context = canvas.getContext("2d");
  canvas.style.margin = "2px";
  canvas.style.width = "20px";
  canvas.style.height = "20px";
  canvas.style.imageRendering = "-moz-crisp-edges";
  canvas.style.imageRendering = "pixelated";
  canvas.style.cursor = "pointer";
  canvas.onclick = (e) => {
    if (!e.bubbles) return;
    cIn.value = palette;
    cIn.dispatchEvent(new Event("input"));
  }
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}

```

<details>
  <summary>Common colormaps</summary>
  
 
```js
const cmapFilter = view(Inputs.checkbox(["sequential","diverging"],{label:"Filter colormaps",value:["sequential","diverging"]}))
```
```js
const selection = dicopalFile.filter(d => cmapFilter.includes(d.type))
```
```js
{
  const m = document.createElement("div")
  selection.forEach(d => m.appendChild(ramp(d.colors)))
  display(m);
}
```

</details>


```js
const colorScheme = colorVals
```
```js
const colorMin = view(Inputs.range(minMax, {label: "Color min", value: minMax[0], step: 0.01}));
const colorMax = view(Inputs.range(minMax, {label: "Color max", value: minMax[1], step: 0.01}));

const interpolator = view(Inputs.select(
  new Map([
    ["rgb", d3.interpolateRgb],
    ["lab", d3.interpolateLab],
    ["hcl", d3.interpolateHcl],
    ["hcl-long", d3.interpolateHclLong]
  ]),
  {
    label: "Color interpolator",
    value: d3.interpolateHcl
    }));

```
```js
const color = ({
  label: "min: " + colorMin + ", max: " + colorMax,
  range: colorScheme,
  domain: linspace(colorMin, colorMax, colorScheme.length),
  legend: true,
  type: "linear",
  interpolate: interpolator,
  clamp: true
})
```

```js
const binW = (histBinMax - histBinMin) / histBinCount

const binnedData = histBuckets.map((d,i)=>({
    value:d,
    i:i,
    x1: histBinMin + i * binW,
    x2: histBinMin + (i+1) * binW
    }))
```

```js
Plot.plot({
  y: {
    clamp: false,
    label:"count",
    tickFormat:'s'
  },
  color: { ...color, legend: false },
  marks: [
    Plot.ruleX([dataMin, dataMax,dataMean], { strokeOpacity:0.5 }),
    Plot.rectY(
      binnedData,{x1: "x1", x2: "x2", y2: "value", insetLeft: -0.2,insetRight: -0.2, fill:"x1"}
    ),
    Plot.text(
      [
        [colorMin, "min"],
        [colorMax, "max"],
        [dataMean ,"x̄"],
        //[dataMin,"min"],
        //[dataMax,"max"]
      ],
      {
        x: "0",
        y: 0,
        text: (d) => d[1] + ": " + d[0],
        textAnchor: "start",
        dx: 5,
        dy: -150
      }
    ),
    Plot.ruleX([colorMin, colorMax], { strokeDasharray: "2,2" })
  ],
  height: 200,
  width: width,
  marginRight: 50,
  //marginLeft: 10
})

```


```js
const steps = view(Inputs.range([2,256], {label: "Steps",transform: Math.sqrt, value: 11, step: 1}));
const alpha = view(Inputs.toggle({label:"Transparent nodata", value:true}))
```


```js
const outVals = linspace(colorMin, colorMax,steps)
const outColors = d3.quantize(d3.piecewise(interpolator,colorVals),steps) 

let vrgba = outColors.map((d, i) => d3.format(".4")(outVals[i]) + ', ' + d.replace("rgb(", "").replace(")", ", 255"))
if (alpha) {
  if (!vrgba.includes("nv, 0, 0, 0, 0")) {
    vrgba.unshift("nv, 0, 0, 0, 0")
  }
} else {
  vrgba = vrgba.filter( d => d!=="nv, 0, 0, 0, 0")
}

let formattedCmap = vrgba.join('\n')
document.getElementById("txtout").innerHTML = formattedCmap
```

<pre id="txtout"></pre>

Special thanks to the [gdal `gdaldem color-relief`](https://gdal.org/en/latest/programs/gdaldem.html#color-relief) function for bringing color to the world, and to [dicopal.js](https://github.com/riatelab/dicopal.js) for making it easy to pull in a broad collection of color palettes.  
