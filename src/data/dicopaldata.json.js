import * as dicopal from "dicopal";

const div = dicopal.getPalettes({ type: "diverging", number: 7 });
const seq = dicopal.getPalettes({ type: "sequential", number: 7 });
const custom = [
  {"type":"sequential","colors":["#E4EEC6","#C3E0A7","#8DCB81","#64AD66","#378C4D","#296634","#1C401F"]},
  {"type":"sequential","colors":["#D9E9F5","#BACCE8","#8D9CCD","#6678B8","#3C59A6","#214080","#001C5E"]},
  {"type":"sequential","colors":["#E1F0DC","#BCE1D0","#94D2C4","#5EB4B4","#0098A6","#03707D","#054957"]},
  {"type":"sequential","colors":["#FEE1D6","#FEC0BF","#F496A0","#E16E87","#C64974","#A32A64","#77184F"]},
  {"type":"sequential","colors":["#FAECB7","#FDD881","#FCB817","#F49D21","#EA8026","#BA4F28","#8B1B26"]},
  {"type":"diverging","colors":["#8B1B26","#BA4F28","#F08E23","#FCDD8E","#FBF7EA","#B6DED2","#6CAFAC","#07717D","#054957"]},
  {"type":"diverging","colors":["#5A0C0C","#A03035","#E1746F","#F9C5BC","#FBF7EA","#CFDBE8","#90A2D1","#3A56A3","#001C5E"]},
  {"type":"diverging","colors":["#5C1339","#A33166","#D783A0","#FCD5D2","#FBF7EA","#E5E8B3","#84C77B","#2F8749","#1C401F"]}
]

const cmaps = [...custom, ...seq, ...div]



process.stdout.write(JSON.stringify(cmaps));