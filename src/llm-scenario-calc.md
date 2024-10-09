---
title: LLM service cost scenarios
---
# LLM service cost scenarios

```js
const jsonURL = 'https://raw.githubusercontent.com/BerriAI/litellm/refs/heads/main/model_prices_and_context_window.json'
const litellm =  d3.json(jsonURL)
```

```js
const example = Object.keys(litellm).map( key => {
  return {
    id: key,
    ...litellm[key]
  };
}).slice(1); // slice to remove the first entry, which is a sample/example.

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function calc_litellm_cost(provider) {
  var costs = u.users * ((u.calls*u.avgI *provider.input_cost_per_token) + (u.calls*u.avgO *provider.output_cost_per_token))
  return costs
} 

const allcostdata = example.map(d => {
  return {
  model: d.id,
  provider: d.litellm_provider,
  daily_cost: calc_litellm_cost(d)
  }
  })
```

```js
const usage = Inputs.form({
  users: Inputs.range([1,10000],{value: 2600, transform: Math.sqrt, step: 1, label: "daily users"}),
  calls: Inputs.range([1, 600], {value: 30, step: 1, label: "API calls/session"}),
  avgI: Inputs.range([1, 10000], {value: 500, step: 1,transform: Math.sqrt, label: "avg input tokens"}),
  avgO: Inputs.range([1, 10000], {value: 500,step: 1,transform: Math.sqrt, label: "avg output tokens"}),
});
const u = view(usage);
```
```js
const scenarioOptions = view(Inputs.bind(Inputs.button([
  ["hello worlds", value => ({"users":2600, "calls":1, "avgI":3, "avgO":40})],
  ["Light chat", value => ({"users":1000, "calls":30, "avgI":25, "avgO":120})],
  ["Heavy RAG", value => ({"users":500, "calls":6, "avgI":6000, "avgO":500})],
  ["Image inference", value => ({"users":100, "calls":1, "avgI":2322, "avgO":500})],
  ["Basic agentic", value => ({"users":250, "calls":3, "avgI":400, "avgO":200})],
  ["Complex agentic", value => ({"users":250, "calls":6, "avgI":6000, "avgO":600})],
  ["Q&A session", value => ({"users":200, "calls":2, "avgI":1500, "avgO":400})]
], {value: null, label: "Scenario presets"}), usage))
```

```js
const modelSelection = view(Inputs.select(example, {label: "Select a model", format: x => x.id + ' (' + x.litellm_provider + ')'}))
```

Based on crowdsourced cost data from [LiteLLM](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) for **${modelSelection.id}** (${modelSelection.litellm_provider})  
- Daily **${USDollar.format(calc_litellm_cost(modelSelection))}**  
- Annual **${USDollar.format(calc_litellm_cost(modelSelection)*365)}**  

```js
const chart = Plot.plot({
  x: {type: "log", label:"daily cost", tickFormat: "$,.0r"}, marginBottom:40, marginRight:60, marginLeft:60,
  title: "Model and provider cost range",
  subtitle:"log scale",
  marks: [
    Plot.ruleX(allcostdata,{x: "daily_cost", channels: {
      model: "model", provider:"provider"},
      stroke: (d) => d.provider == modelSelection.litellm_provider ? "var(--theme-foreground-focus)": "transparent",
      strokeWidth: (d) => d.model == modelSelection.id ? 6: 1,
      }),
    Plot.dot(allcostdata,{x: "daily_cost", channels: {
      model: "model", provider:"provider"},
      stroke: "currentColor",
      strokeOpacity: (d) => d.model == modelSelection.id ? 1: 0.3, 
      fill: (d) => (d.model == modelSelection.id) ? "var( --theme-red)": "transparent",
      stroke: (d) => (d.model == modelSelection.id) ? "var( --theme-red)": "var(--theme-foreground)",
      r: (d) => (d.model == modelSelection.id) ? 3.9 : 4,
      tip: {anchor: "top",
        format: {
        model: true,
        provider: true,
        strokeWidth: false,
        strokeOpacity: false,
        r: false
    }}}),
  ]
})
display(chart)
```