const $ = id => document.getElementById(id);
const cv = $('lake'), ctx = cv.getContext('2d');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a,b) => a + Math.random()*(b-a);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a + (b-a)*t;
const angLerp = (a,b,t) => { let d = ((b-a+Math.PI*3)%(Math.PI*2))-Math.PI; return a + d*clamp(t,0,1); };
/** "a rare crate", "an epic crate": the article for a word. */
const aOrAn = w => (/^[aeiou]/i.test(w)?'an ':'a ')+w;
/** A number for display, at most two decimals: 2, 1.5, 0.35. */
const trimNum = v => (Math.round(v*100)/100).toString();
const pickW = w => { let s=0; for (const k in w) s+=w[k]; let r=Math.random()*s; for (const k in w){ r-=w[k]; if (r<=0) return k; } return Object.keys(w)[0]; };

const INK='#2B2A33', PAPER='#F3EAD7', BRASS='#C9A15A', DANGER='#D9614C', GOOD='#7FB069';
