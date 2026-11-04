// A fixed regional read proxy, never a caller-selected URL or open proxy.
let snapshot=null,expires=0,inFlight=null,blocked=false;
export default async function handler(req,res){
 res.setHeader('Cache-Control','public, max-age=30, s-maxage=60, stale-while-revalidate=30');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'GET only'})}
 if(blocked)return res.status(503).json({error:'Aircraft provider stopped. No automatic retries; maintainers must review access.'});
 try{if(snapshot&&Date.now()<expires)return res.status(200).json(snapshot);
 if(!inFlight)inFlight=(async()=>{const r=await fetch('https://opendata.adsb.fi/api/v3/lat/60.16/lon/24.94/dist/150',{signal:AbortSignal.timeout(10000),headers:{Accept:'application/json'}});if(!r.ok){blocked=true;throw Error('Aircraft source HTTP '+r.status)}const text=await r.text();if(text.length>2000000)throw Error('Aircraft payload too large');const data=JSON.parse(text);if(!Array.isArray(data.aircraft)&&!Array.isArray(data.ac))throw Error('Invalid aircraft response');snapshot=data;expires=Date.now()+60000;return data})().finally(()=>{inFlight=null});
 return res.status(200).json(await inFlight);
 }catch(e){res.setHeader('Cache-Control','no-store');return res.status(503).json({error:'Aircraft data unavailable. No simulated substitute.'})}
}
