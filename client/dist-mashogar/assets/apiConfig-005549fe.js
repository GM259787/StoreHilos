import{l as t}from"./index-37571f63.js";const i=async()=>{try{return(await t()).apiUrl||window.location.origin}catch(o){return console.error("Error loading config for API URL, using fallback:",o),"http://localhost:5175"}},c=async o=>{const r=await i(),n=o.startsWith("/")?o:`/${o}`;return`${r}${n}`};export{c as buildApiUrl,i as getApiBaseUrl};
//# sourceMappingURL=apiConfig-005549fe.js.map
