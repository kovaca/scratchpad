import * as d3 from "d3";

const jsonURL = 'https://raw.githubusercontent.com/BerriAI/litellm/refs/heads/main/model_prices_and_context_window.json';

const litellm = await d3.json(jsonURL);

const litellmdata = Object.keys(litellm).map( key => {
  return {
    id: key,
    ...litellm[key]
  };
}).slice(1); // slice to remove the first entry, which is a sample/example.

process.stdout.write(JSON.stringify(litellmdata));