---
title: LLM service cost scenarios
---
# LLM service cost scenarios

```js
const litellmcost = FileAttachment("data/litellmcost.json").json();
```
```js
const example = litellmcost
```
```js
// Parse URL query parameters for shareable state
const urlParams = new URLSearchParams(window.location.search);
const params = {
  sessions: urlParams.has("sessions") ? Number(urlParams.get("sessions")) : null,
  avgI: urlParams.has("avgI") ? Number(urlParams.get("avgI")) : null,
  avgO: urlParams.has("avgO") ? Number(urlParams.get("avgO")) : null,
  model: urlParams.get("model"),
  provider: urlParams.get("provider"),
  router1: urlParams.get("r1"),
  router2: urlParams.get("r2"),
  router3: urlParams.get("r3"),
  pct1: urlParams.has("p1") ? Number(urlParams.get("p1")) : null,
  pct2: urlParams.has("p2") ? Number(urlParams.get("p2")) : null,
  pct3: urlParams.has("p3") ? Number(urlParams.get("p3")) : null,
};
```

```js
let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function calc_litellm_cost(provider) {
  // Daily sessions already captures user x sessions; price is linear in tokens
  const tokensPerSessionInput = u.avgI;
  const tokensPerSessionOutput = u.avgO;
  const costPerSession = (tokensPerSessionInput * provider.input_cost_per_token)
    + (tokensPerSessionOutput * provider.output_cost_per_token);
  const costs = u.sessions * costPerSession;
  return costs
} 
```
```js
const allcostdata = example.map(d => {
  return {
  model: d.id,
  provider: d.litellm_provider,
  daily_cost: calc_litellm_cost(d)
  }
  })
```

```js
// Scenario presets with estimated token counts for typical usage
const scenarioPresets = [
  // Simple interactions
  { name: "Short Q&A", avgI: 50, avgO: 100, note: "Quick question, brief answer" },
  { name: "Text rewrite/rephrase", avgI: 200, avgO: 200, note: "Output ≈ input size" },
  { name: "Email drafting", avgI: 300, avgO: 400, note: "Context + compose response" },
  { name: "Translation", avgI: 400, avgO: 450, note: "Source text + translated output" },

  // Content generation
  { name: "Blog post generation", avgI: 500, avgO: 1500, note: "Brief prompt, ~1000 word article" },
  { name: "Creative writing", avgI: 800, avgO: 2500, note: "Story/fiction passages" },
  { name: "Marketing copy", avgI: 400, avgO: 600, note: "Product descriptions, ads" },
  { name: "Technical documentation", avgI: 1500, avgO: 2000, note: "API docs, guides" },

  // Analysis & summarization
  { name: "Paragraph summarization", avgI: 600, avgO: 150, note: "Condense short text" },
  { name: "Article summary", avgI: 3000, avgO: 400, note: "News/blog article" },
  { name: "Document analysis", avgI: 8000, avgO: 1000, note: "Full document review" },
  { name: "Contract/legal review", avgI: 15000, avgO: 2000, note: "Legal document analysis" },

  // Code tasks
  { name: "Function generation", avgI: 250, avgO: 400, note: "Small code snippets" },
  { name: "Code explanation", avgI: 800, avgO: 600, note: "Explain existing code" },
  { name: "File-level code review", avgI: 2500, avgO: 1200, note: "Review single file" },
  { name: "Bug fix assistance", avgI: 1500, avgO: 800, note: "Debug with context" },
  { name: "Multi-file refactor", avgI: 8000, avgO: 4000, note: "Cross-file changes" },

  // Chat & conversation
  { name: "Single-turn chat", avgI: 150, avgO: 300, note: "One question, one answer" },
  { name: "Multi-turn chat (~5 turns)", avgI: 2000, avgO: 400, note: "Accumulated context" },
  { name: "Long session (~15 turns)", avgI: 8000, avgO: 500, note: "Extended conversation" },

  // Reasoning & complex tasks
  { name: "Step-by-step reasoning", avgI: 500, avgO: 1500, note: "Chain-of-thought" },
  { name: "Data analysis", avgI: 3000, avgO: 1000, note: "Analyze structured data" },
  { name: "Research synthesis", avgI: 10000, avgO: 2500, note: "Multiple sources" },

  // Agentic & advanced
  { name: "Tool-use / function calling", avgI: 1000, avgO: 300, note: "API orchestration" },
  { name: "Agentic task (per step)", avgI: 4000, avgO: 1500, note: "Multi-step reasoning" },
  { name: "RAG query", avgI: 6000, avgO: 800, note: "Retrieved context + generation" },

  // Large context
  { name: "Book/corpus Q&A", avgI: 80000, avgO: 1500, note: "Long-context retrieval" },
  { name: "Codebase analysis", avgI: 50000, avgO: 3000, note: "Large repo understanding" },
  { name: "Full app generation", avgI: 5000, avgO: 25000, note: "Spec to implementation" }
];

// Custom placeholder for when tokens don't match any preset
const customPreset = { name: "Custom", avgI: null, avgO: null, note: "User-defined token values" };
const presetsWithCustom = [customPreset, ...scenarioPresets];

// Find initial preset that matches URL params (or default)
const initialPreset = (() => {
  if (params.avgI !== null && params.avgO !== null) {
    const match = scenarioPresets.find(p => p.avgI === params.avgI && p.avgO === params.avgO);
    return match || customPreset;
  }
  return scenarioPresets[0];
})();

// Preset selector - user picks a scenario
const selectedScenario = view(Inputs.select(presetsWithCustom, {
  label: "Scenario presets",
  format: s => s.name,
  value: initialPreset
}));
```
```js
// Determine token values: use preset values if a real preset is selected, otherwise use current/initial
const tokenValues = {
  avgI: (selectedScenario.name !== "Custom" && selectedScenario.avgI !== null)
    ? selectedScenario.avgI
    : (params.avgI ?? scenarioPresets[0].avgI),
  avgO: (selectedScenario.name !== "Custom" && selectedScenario.avgO !== null)
    ? selectedScenario.avgO
    : (params.avgO ?? scenarioPresets[0].avgO)
};

const usage = Inputs.form({
  sessions: Inputs.range([1,500000], {value: params.sessions ?? 2600, transform: Math.log10, step: 1, label: "daily sessions"}),
  avgI: Inputs.range([1, 1000000], {value: tokenValues.avgI, step: 1, transform: Math.log10, label: "avg input tokens"}),
  avgO: Inputs.range([1, 1000000], {value: tokenValues.avgO, step: 1, transform: Math.log10, label: "avg output tokens"}),
});
const u = view(usage);
```
```js
// Derive display preset based on actual token values (for status text)
const currentPreset = (() => {
  const match = scenarioPresets.find(p => p.avgI === Math.round(u.avgI) && p.avgO === Math.round(u.avgO));
  return match || customPreset;
})();
```

${currentPreset.name !== "Custom" ? `${currentPreset.name} — ${currentPreset.note}` : `Custom: ${d3.format(",")(Math.round(u.avgI))} input / ${d3.format(",")(Math.round(u.avgO))} output tokens`}
```js
const defaultModel = (() => {
  if (params.model) {
    const found = example.find(d => d.id === params.model && (!params.provider || d.litellm_provider === params.provider));
    if (found) return found;
  }
  const fallbackIndex = example.findIndex(d => d.id === "gpt-5.1" && d.litellm_provider === "openai");
  return example[fallbackIndex] || example[0];
})();

const modelSelection = view(Inputs.select(example, {label: "Select a model", format: x => x.id + ' (' + x.litellm_provider + ')', value: defaultModel}))
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

<details open>
  <summary>carbon</summary>

Enter your assumed rate of energy consumption (kWh per million tokens) and grid emission factor (grams of CO₂ equivalent per kWh) to produce a back-of-the-envelope estimate of carbon emissions from model inference.

- Daily ${d3.format(",.2f")((u.sessions)*(u.avgI+u.avgO)/1e6*energy*co2/1e3)} kgCO₂e
- Annual ${d3.format(",.2f")((u.sessions)*(u.avgI+u.avgO)/1e6*energy*co2/1e3*365)} kgCO₂e

${d3.format(",.0f")((u.sessions)*(u.avgI+u.avgO)/1e6*365)} million tokens and ${d3.format(",.0f")((u.sessions)*(u.avgI+u.avgO)/1e6*energy*365)} kWh per year


```js
const energy = view(Inputs.range([0.01,30],{value: 1.11, transform: Math.sqrt, step: 0.01, label: "kWh/Mtok"}));
const co2 = view(Inputs.range([0,970],{value: 375, transform: Math.sqrt, step: 1, label: "gCO₂e/kWh"}));
```


<details>
<summary>kWh/Mtok references</summary>

| Study / model | kWh/Mtok | Context | Original metric | Source |
| --- | --- | --- | --- | --- |
| GPT-3 175B (GPT-3 paper) | **~13** | GPT-3 on 2020 infra | 0.4 kWh per 100 pages (~30k tokens) | [GPT-3 paper](https://arxiv.org/abs/2005.14165) |
| Husom et al. (older ChatGPT) | **~9** | GPT-3-era ChatGPT | ~9 mWh/token | [Husom et al. summary](https://github.com/kmaasrud/ai-ecosystem-carbon-footprint) |
| LLaMA-65B — Samsi et al. | **~0.8–1.1**| LLaMA-65B on V100/A100 | ~3–4 J/token | [From Words to Watts](https://arxiv.org/abs/2309.04360) |
| Local Llama-3 8B (Baquero) | **~0.17** | 8B model on Apple M3 | <200 J for ~333 tokens | [Baquero CACM blog](https://cacm.acm.org/blogcacm/the-energy-footprint-of-humans-and-large-language-models/) |
| Llama-3.3-70B (Lin 2025) | **~0.11** | 8×H100, FP8, batch 128 | 0.39 J/token | [llm-tracker entry](https://www.llm-tracker.info/) |
| Generic 4×H100 node (Arthur) | **~2.7–5.2** (best); **~10–20** (worst) | 4×H100; batch size affects J/token | 9.6–72 J/token | [Arthur writeup](https://www.architect.ai/p/another-look-at-per-token-energy) |
| GPT-4o (Epoch AI) | **~0.375** | 0.3 Wh/query, 800-token assumption | 0.3 Wh per typical GPT-4o query | [Epoch AI](https://epochai.org/blog/how-much-energy-does-chatgpt-use) |
| ChatGPT average query (Altman) | **~0.425** | 0.34 Wh/query, 800-token assumption | 0.34 Wh per ChatGPT query | [Altman – Gentle Singularity](https://blog.samaltman.com/the-gentle-singularity) |
| Gemini Apps – full stack | **~0.30** | 0.24 Wh per prompt, 800-token assumption | 0.24 Wh median text prompt | [Google Cloud blog](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference) |
| Gemini Apps – active chips only | **~0.125** | 0.10 Wh per prompt, 800-token assumption | 0.10 Wh median prompt | [Google Cloud blog](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference) |
| Mistral Large 2 (LCA) | **~7–11** | Lifecycle analysis; CO₂-based | 1.14 gCO₂e per 400-token response | [Mistral LCA](https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai/) |
| DitchCarbon H100 example | **~23** | Single H100, no batching | 0.008 kWh per ~350 tokens | [DitchCarbon blog](https://ditchcarbon.com/blog/the-real-carbon-cost-of-an-ai-token/) |
| Older “3 Wh per ChatGPT response” estimate | **~3.75** | 3 Wh/query, 800-token assumption | 3 Wh per response | [kmaasrud summary](https://github.com/kmaasrud/ai-ecosystem-carbon-footprint) |

</details>

<details>
<summary>Grid Emission Factors (gCO₂e/kWh)</summary>

Location-based scope 2

### Location-Based Grid Factors (Lifecycle-ish)

| Grid Type              | Practical Estimate (gCO₂e/kWh) | Notes |
|------------------------|-------------------------------|-------|
| Very clean grid        | **~50**                       | Hydro / nuclear / high-renewable grids (e.g., Nordics, France, Quebec) |
| Typical rich-country   | **350–450**                   | OECD averages; mixed gas + renewables + some coal |
| Coal-heavy grid        | **700–800**                   | India, South Africa, SE Asia regions; close to coal plant lifecycle values |

### Fuel-Specific Lifecycle “Best Estimate” Factors

| Fuel / Technology      | Best Estimate (gCO₂e/kWh)     | Notes |
|------------------------|-------------------------------|-------|
| 100% coal              | **~900**                       | Conventional coal plant fleet (median lifecycle) |
| 100% natural gas (NGCC)| **~450**                       | Modern combined-cycle gas plants |
| Coal with CCS          | **~250–350**                  | Depends heavily on configuration & capture rate |
| NGCC with CCS          | **~130–200**                  | Lifecycle; assumes effective methane control |
| Wind / Solar / Nuclear | **≤50**                        | Representative lifecycle numbers for high-quality clean generation |


| Cloud Region | Approx. Grid EF (gCO₂e/kWh) | Location / Grid Basis                         | 
| ------------ | --------------------------- | --------------------------------------------- | 
| GCP us-central1  | ≈**350**                    | Iowa, US (state grid mix)                     |
| GCP europe-west1 | ≈**110**                    | Belgium (country average)                     |
| GCP us-east1     | ≈**255**                    | South Carolina, US (state grid mix)           |
| AWS us-west-2    | ≈**135**                    | Oregon, US (state grid mix)                   |
| AWS us-east-1    | ≈**270**                    | Northern Virginia, US (state grid mix) |
| AWS eu-central-1 | ≈**420**                    | Frankfurt, Germany (national grid mix)        | 




</details>

</details>

<details>
  <summary>model router</summary>

Simulate a model router that distributes traffic across multiple models. Adjust the traffic percentage for each model to calculate blended costs.

```js
const routerDefaults = {
  model1: params.router1 ? example.find(d => d.id === params.router1) : example.find(d => d.id === "gpt-5.1"),
  model2: params.router2 ? example.find(d => d.id === params.router2) : null,
  model3: params.router3 ? example.find(d => d.id === params.router3) : null
};

const routerModels = view(Inputs.form({
  model1: Inputs.select(example, {
    label: "Model 1",
    format: x => x.id + " (" + x.litellm_provider + ")",
    value: routerDefaults.model1 || example[0]
  }),
  pct1: Inputs.range([0, 100], {label: "Traffic %", value: params.pct1 ?? 60, step: 5}),
  model2: Inputs.select([null, ...example], {
    label: "Model 2",
    format: x => x ? x.id + " (" + x.litellm_provider + ")" : "None",
    value: routerDefaults.model2 || null
  }),
  pct2: Inputs.range([0, 100], {label: "Traffic %", value: params.pct2 ?? 30, step: 5}),
  model3: Inputs.select([null, ...example], {
    label: "Model 3",
    format: x => x ? x.id + " (" + x.litellm_provider + ")" : "None",
    value: routerDefaults.model3 || null
  }),
  pct3: Inputs.range([0, 100], {label: "Traffic %", value: params.pct3 ?? 10, step: 5}),
}));
```

```js
const routerCost = (() => {
  const rawTotal = routerModels.pct1 + routerModels.pct2 + routerModels.pct3;
  const total = rawTotal > 0 ? rawTotal : 1;
  const costs = [];

  if (routerModels.model1) {
    const pct = routerModels.pct1 / total;
    costs.push({
      model: routerModels.model1.id,
      provider: routerModels.model1.litellm_provider,
      pct: pct,
      dailyCost: calc_litellm_cost(routerModels.model1) * pct
    });
  }
  if (routerModels.model2) {
    const pct = routerModels.pct2 / total;
    costs.push({
      model: routerModels.model2.id,
      provider: routerModels.model2.litellm_provider,
      pct: pct,
      dailyCost: calc_litellm_cost(routerModels.model2) * pct
    });
  }
  if (routerModels.model3) {
    const pct = routerModels.pct3 / total;
    costs.push({
      model: routerModels.model3.id,
      provider: routerModels.model3.litellm_provider,
      pct: pct,
      dailyCost: calc_litellm_cost(routerModels.model3) * pct
    });
  }

  return {
    models: costs,
    totalDaily: d3.sum(costs, d => d.dailyCost),
    totalAnnual: d3.sum(costs, d => d.dailyCost) * 365
  };
})();
```

**Blended Cost**
- Daily: **${USDollar.format(routerCost.totalDaily)}**
- Annual: **${USDollar.format(routerCost.totalAnnual)}**

```js
Plot.plot({
  height: 80,
  marginLeft: 80,
  marginRight: 80,
  x: {label: "Daily cost contribution", tickFormat: "$,.2r"},
  y: {label: null, domain: ["Blended"]},
  color: {legend: true, domain: routerCost.models.map(m => m.model)},
  marks: [
    Plot.barX(routerCost.models, Plot.stackX({
      x: "dailyCost",
      y: () => "Blended",
      fill: "model",
      tip: {
        format: {
          x: false,
          fill: false
        },
        channels: {
          Model: "model",
          Provider: "provider",
          "Traffic": d => (d.pct * 100).toFixed(0) + "%",
          "Daily cost": d => USDollar.format(d.dailyCost)
        }
      }
    })),
  ]
})
```

```js
Inputs.table(routerCost.models.map(m => ({
  Model: m.model,
  Provider: m.provider,
  Traffic: (m.pct * 100).toFixed(0) + "%",
  "Daily Cost": USDollar.format(m.dailyCost)
})), {
  columns: ["Model", "Provider", "Traffic", "Daily Cost"],
  rows: 3
})
```

</details>

---

```js
const shareUrl = (() => {
  const p = new URLSearchParams();
  p.set("sessions", Math.round(u.sessions));
  p.set("avgI", Math.round(u.avgI));
  p.set("avgO", Math.round(u.avgO));
  p.set("model", modelSelection.id);
  p.set("provider", modelSelection.litellm_provider);
  if (routerModels.model1) {
    p.set("r1", routerModels.model1.id);
    p.set("p1", routerModels.pct1);
  }
  if (routerModels.model2) {
    p.set("r2", routerModels.model2.id);
    p.set("p2", routerModels.pct2);
  }
  if (routerModels.model3) {
    p.set("r3", routerModels.model3.id);
    p.set("p3", routerModels.pct3);
  }
  return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
})();

// Update browser URL as user makes changes (without reload)
history.replaceState(null, "", shareUrl);

const copyButton = Inputs.button("Copy share link", {
  reduce: () => {
    navigator.clipboard.writeText(shareUrl);
    return "Copied!";
  }
});
view(copyButton);
```