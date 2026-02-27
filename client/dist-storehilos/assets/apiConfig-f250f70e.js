import{l as t}from"./index-97ba732a.js";const i=async()=>{try{return(await t()).apiUrl||window.location.origin}catch(o){return console.error("Error loading config for API URL, using fallback:",o),"http://localhost:5175"}},c=async o=>{const r=await i(),n=o.startsWith("/")?o:`/${o}`;return`${r}${n}`};export{c as buildApiUrl,i as getApiBaseUrl};
//# sourceMappingURL=apiConfig-f250f70e.js.map
