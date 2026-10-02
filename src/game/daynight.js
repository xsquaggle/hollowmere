/* ---------- Day and night ---------- */
const NIGHT={skyTop:'#0D1227',skyMid:'#1A2040',skyLow:'#2A2F52',skyHz:'#3A3F68',hillFar:'#2B2E4C',hillNear:'#1F2238',trees:'#141826',town:'#10131F',head:'#121626',
  w0:'#3A4066',w1:'#1E3448',w2:'#132A35',w3:'#0B1B22',cloudLit:'#4A4A70',cloudBase:'#2A2C48',glow:'#96AAE6',sunDisc:'#FFE3BF',
  sunX:.7,sunY:1.2,sunVis:0,moonVis:1,stars:1,win:1,beam:1,dark:.5,fly:1};
const PKEYS=[
 [0,NIGHT],
 [5,{skyTop:'#1A2142',skyMid:'#3D4072',skyLow:'#8A6E8E',skyHz:'#C99A98',hillFar:'#4A4A6E',hillNear:'#34364F',trees:'#1E2233',town:'#1A1D2E',head:'#1E2233',
   w0:'#6E6688',w1:'#344B60',w2:'#1B3842',w3:'#10242C',cloudLit:'#B08392',cloudBase:'#4A4870',glow:'#F0AA96',sunDisc:'#FFD9B0',
   sunX:.72,sunY:1.15,sunVis:0,moonVis:.35,stars:.5,win:.6,beam:.7,dark:.36,fly:.4}],
 [6.5,{skyTop:'#3A4A7A',skyMid:'#8E86B2',skyLow:'#F0AFA0',skyHz:'#F9D6A8',hillFar:'#7C7699',hillNear:'#5B5B7D',trees:'#333A55',town:'#2A2F48',head:'#2E3550',
   w0:'#B3A6C0',w1:'#587690',w2:'#2B5866',w3:'#173440',cloudLit:'#F5BFA6',cloudBase:'#9C8EB4',glow:'#FFC8A0',sunDisc:'#FFE0B8',
   sunX:.72,sunY:.95,sunVis:1,moonVis:0,stars:.1,win:.2,beam:.3,dark:.12,fly:0}],
 [9,{skyTop:'#5A97CF',skyMid:'#8CC0E4',skyLow:'#D4E9EF',skyHz:'#F2EEDC',hillFar:'#8FA7BE',hillNear:'#6F8BA3',trees:'#3E5561',town:'#3A4558',head:'#3A505C',
   w0:'#A5CBD8',w1:'#4A8DA1',w2:'#2A6475',w3:'#1A4250',cloudLit:'#FFFFFF',cloudBase:'#E3ECF3',glow:'#FFF5D7',sunDisc:'#FFF8E6',
   sunX:.66,sunY:.45,sunVis:1,moonVis:0,stars:0,win:0,beam:0,dark:0,fly:0}],
 [13,{skyTop:'#4A8BCB',skyMid:'#82BCE4',skyLow:'#CBE6F1',skyHz:'#EAF3EE',hillFar:'#8BA9C0',hillNear:'#6A8EA6',trees:'#3A5661',town:'#374456',head:'#38525E',
   w0:'#96C5D4',w1:'#3E8BA0',w2:'#23687A',w3:'#164453',cloudLit:'#FFFFFF',cloudBase:'#E8EFF5',glow:'#FFFAE6',sunDisc:'#FFFCF0',
   sunX:.5,sunY:.18,sunVis:1,moonVis:0,stars:0,win:0,beam:0,dark:0,fly:0}],
 [16.5,{skyTop:'#4D6FAA',skyMid:'#9EAACB',skyLow:'#F0CBA2',skyHz:'#F8DFB2',hillFar:'#8C88A7',hillNear:'#696C8C',trees:'#343C53',town:'#2C3247',head:'#30384E',
   w0:'#B8ACBB',w1:'#4F768B',w2:'#2C5A68',w3:'#183A46',cloudLit:'#FBD9B8',cloudBase:'#B9AFC8',glow:'#FFDCAA',sunDisc:'#FFEFD2',
   sunX:.36,sunY:.6,sunVis:1,moonVis:0,stars:0,win:.1,beam:.1,dark:.04,fly:.1}],
 [18.5,{skyTop:'#212A46',skyMid:'#56577F',skyLow:'#CF968A',skyHz:'#EFB98F',hillFar:'#6A6389',hillNear:'#4B4C6E',trees:'#283043',town:'#232842',head:'#2A3047',
   w0:'#8D86A6',w1:'#5A7389',w2:'#2E5C68',w3:'#173440',cloudLit:'#EEB09C',cloudBase:'#766894',glow:'#FFD6AA',sunDisc:'#FFE3BF',
   sunX:.3,sunY:1,sunVis:1,moonVis:0,stars:.5,win:1,beam:.8,dark:.12,fly:.8}],
 [20,{skyTop:'#141A33',skyMid:'#2D3260',skyLow:'#5E4E78',skyHz:'#8A6A86',hillFar:'#3B3A5E',hillNear:'#2B2D48',trees:'#1B2034',town:'#151827',head:'#1A1F31',
   w0:'#4E4D72',w1:'#2F4258',w2:'#1D3A47',w3:'#10262F',cloudLit:'#6A5A80',cloudBase:'#34355A',glow:'#C896AA',sunDisc:'#FFD0A8',
   sunX:.26,sunY:1.15,sunVis:0,moonVis:.6,stars:.85,win:1,beam:1,dark:.38,fly:1}],
 [22,NIGHT],[24,NIGHT]];
const PKEYS_C=PKEYS.map(([h,o])=>{ const c={}; for (const k in o){ const v=o[k]; c[k]=typeof v==='string'?[parseInt(v.slice(1,3),16),parseInt(v.slice(3,5),16),parseInt(v.slice(5,7),16)]:v; } return [h,c]; });
let PAL={};
function palAt(h){
  h=((h%24)+24)%24; let i=0; while (i<PKEYS_C.length-2 && PKEYS_C[i+1][0]<=h) i++;
  const [h0,a]=PKEYS_C[i], [h1,b]=PKEYS_C[i+1]; let t=(h-h0)/(h1-h0); t=t*t*(3-2*t);
  const o={};
  for (const k in a){ const va=a[k], vb=b[k];
    if (Array.isArray(va)){ const r=Math.round(lerp(va[0],vb[0],t)), g=Math.round(lerp(va[1],vb[1],t)), bl=Math.round(lerp(va[2],vb[2],t)); o[k]='rgb('+r+','+g+','+bl+')'; o[k+'R']=r+','+g+','+bl; }
    else o[k]=lerp(va,vb,t); }
  return o;
}
const PERIOD = h => h>=5&&h<11?'Morning':h>=11&&h<17?'Day':h>=17&&h<21?'Evening':'Night';
const isNight = h => h>=20||h<5;
function clockText(h){ const hh=Math.floor(h), mm=Math.floor((h-hh)*60/10)*10, h12=((hh+11)%12)+1; return h12+':'+String(mm).padStart(2,'0')+(hh<12?' AM':' PM'); }
