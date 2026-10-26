import { Resvg } from '@resvg/resvg-js'
import { mkdirSync, writeFileSync } from 'node:fs'
const dir = new URL('../src/static/icons/', import.meta.url); mkdirSync(dir, { recursive: true })
const paths = {
  leaf: '<path d="M20 4c-1 9-4 15-10 15a6 6 0 0 1-6-6C4 7 10 4 20 4Z"/><path d="m4 21 10-10"/>',
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  bowl: '<path d="M3 12h18a9 9 0 0 1-18 0ZM8 21h8M8 3v5m4-6v6m4-5v5"/>',
  dumbbell: '<path d="m6 7 11 11M4 4l3 3m10 10 3 3M3 7l4-4m10 18 4-4M2 11l9-9m2 20 9-9M6 13l7-7m-2 12 7-7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  camera: '<path d="M3 7h4l2-3h6l2 3h4v13H3Z"/><circle cx="12" cy="13" r="4"/>',
  star: '<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="3"/><path d="M16 8V3H3v13h5"/>',
  scale: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M7 8a7 7 0 0 1 10 0l-5 5Z"/>',
  chart: '<path d="M3 3v18h18M6 15l5-5 4 3 6-7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v5m10-5v5M3 11h18M7 15h2m3 0h2m3 0h1"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  edit: '<path d="m14 5 5 5M4 20l1-6L17 2l5 5-12 12Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.5"/>',
  shield: '<path d="m12 2 9 4v7c0 5-9 9-9 9S3 18 3 13V6Z"/><path d="m8 12 3 3 5-6"/>',
  fire: '<path d="M12 2c3 5 0 7 4 9 1-2 2-3 2-3 7 9 1 14-6 14S0 17 6 9c0 4 3 4 3 4s-2-6 3-11Z"/>',
  book: '<path d="M12 5c-4-3-8-2-10-1v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Zm0 0v15"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  heart: '<path d="M12 21 3 12C-4 3 9-1 12 7c3-8 16-4 9 5Z"/>'
}
for (const [name, path] of Object.entries(paths)) for (const [tone, color] of Object.entries({green:'#176539',white:'#ffffff',muted:'#939d90',orange:'#e58a36',ink:'#213b2c'})) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`
  writeFileSync(new URL(`${name}-${tone}.png`,dir), new Resvg(svg).render().asPng())
}
const artdir = new URL('../src/static/food/', import.meta.url); mkdirSync(artdir,{recursive:true})
const bowl = '<ellipse cx="140" cy="145" rx="107" ry="91" fill="#000" opacity=".07"/><ellipse cx="140" cy="130" rx="107" ry="91" fill="#fcfcf6"/><ellipse cx="140" cy="128" rx="92" ry="76" fill="#eae4d6"/>'
const oats = '<ellipse cx="140" cy="130" rx="86" ry="69" fill="#d7bb84"/>'+Array.from({length:24},(_,i)=>`<ellipse cx="${70+(i*29)%140}" cy="${76+(i*37)%100}" rx="9" ry="4" transform="rotate(${i*17} ${70+(i*29)%140} ${76+(i*37)%100})" fill="#f0dba9"/>`).join('')+'<ellipse cx="169" cy="117" rx="35" ry="41" fill="white"/><circle cx="169" cy="118" r="21" fill="#ecae32"/><path d="M67 161c30-29 33-27 39-3" stroke="#648957" stroke-width="11" fill="none"/>'
const chicken = '<path d="M58 128q8-59 59-49l43 55q9 33-25 40Z" fill="#c78745"/><path d="m70 111 56 48m-45-64 56 48m-41-62 52 47" stroke="#f2c27d" stroke-width="9" stroke-linecap="round"/><ellipse cx="176" cy="164" rx="40" ry="22" fill="#f7eed7"/>'+[[174,87],[196,105],[181,118],[205,129]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="20" fill="#577b3c"/><circle cx="${x-5}" cy="${y-4}" r="13" fill="#7e9a4a"/>`).join('')
const berries = '<ellipse cx="140" cy="130" rx="85" ry="68" fill="#fbf6ed"/>'+Array.from({length:11},(_,i)=>`<circle cx="${80+(i*31)%126}" cy="${86+(i*29)%89}" r="13" fill="${i%2?'#4a5573':'#77809a'}"/><circle cx="${77+(i*31)%126}" cy="${82+(i*29)%89}" r="4" fill="#b1b5bd" opacity=".6"/>`).join('')+'<path d="M118 112c-45-37-50 18-20 46 32-6 54-27 20-46Z" fill="#c85446"/><path d="m95 110 12-21 7 21 20-6-10 15" fill="#6e8d4d"/>'
const salad = '<ellipse cx="140" cy="130" rx="85" ry="68" fill="#d4ddba"/>'+Array.from({length:12},(_,i)=>`<ellipse cx="${80+(i*31)%120}" cy="${84+(i*33)%90}" rx="27" ry="18" transform="rotate(${i*31} ${80+(i*31)%120} ${84+(i*33)%90})" fill="${i%2?'#9caf62':'#678a48'}"/>`).join('')+'<circle cx="108" cy="108" r="18" fill="#d76c4f"/><circle cx="176" cy="147" r="19" fill="#cf664b"/><circle cx="118" cy="166" r="16" fill="#e7c86c"/>'
const yogurt = '<ellipse cx="140" cy="130" rx="85" ry="68" fill="#fcfbf9"/><path d="M69 110c34-20 37 57 74 34s49-10 63 2" fill="none" stroke="#ede9e1" stroke-width="8"/>'+Array.from({length:10},(_,i)=>`<ellipse cx="${98+(i*27)%85}" cy="${83+(i*21)%53}" rx="10" ry="5" fill="#bb945b" transform="rotate(${i*34} ${98+(i*27)%85} ${83+(i*21)%53})"/>`).join('')+'<circle cx="96" cy="153" r="13" fill="#60677b"/><circle cx="119" cy="162" r="13" fill="#475871"/><circle cx="106" cy="174" r="11" fill="#78819c"/>'
const nuts = '<ellipse cx="140" cy="130" rx="85" ry="68" fill="#e7d8ba"/>'+Array.from({length:15},(_,i)=>`<ellipse cx="${79+(i*31)%124}" cy="${82+(i*27)%95}" rx="12" ry="20" transform="rotate(${i*43} ${79+(i*31)%124} ${82+(i*27)%95})" fill="${i%2?'#b58c50':'#d2b279'}" stroke="#a67e4d" stroke-width="2"/>`).join('')
const drink = '<ellipse cx="141" cy="163" rx="70" ry="37" fill="#e4dfd3"/><path d="M183 94c57-5 51 63-5 53" fill="none" stroke="#f9f8f3" stroke-width="15"/><path d="M79 89h109l-10 77q-44 31-87 0Z" fill="#fcfbf6"/><ellipse cx="133" cy="89" rx="55" ry="20" fill="#d7c7aa"/><ellipse cx="133" cy="88" rx="47" ry="15" fill="#685345"/><path d="M115 57q-15-16 0-30m25 30q-15-16 0-30" fill="none" stroke="#ddd9cd" stroke-width="5" stroke-linecap="round"/>'
for (const [name,content] of Object.entries({oats,chicken,berries,salad,yogurt,nuts,drink})) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="480" viewBox="0 0 280 240"><rect width="280" height="240" fill="#e9e5d9"/><path d="m0 0 280 240M-70 0l280 240M70 0l280 240" stroke="#f4f0e6" stroke-width="35" opacity=".45"/>${name==='drink'?'':bowl}${content}</svg>`
  writeFileSync(new URL(`${name}.png`,artdir),new Resvg(svg).render().asPng())
}
console.log('图标及7组食物插画已生成。')
