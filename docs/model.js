export const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function coordinates(lat,lon){return finite(lat)&&finite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180}
export function parseAir(data,now=Date.now()/1000){
 const rows=data.aircraft??data.ac;if(!Array.isArray(rows)||rows.length>5000)throw Error('Invalid aircraft source');
 const t=data.now>1e11?data.now/1000:data.now;if(!finite(t)||Math.abs(now-t)>300)throw Error('Aircraft source timestamp stale');
 return rows.filter(x=>coordinates(x.lat,x.lon)&&finite(x.seen_pos)&&x.seen_pos>=0&&x.seen_pos<=120).map(x=>({id:String(x.hex).slice(0,12),name:String(x.flight||x.hex).trim().slice(0,30),lat:x.lat,lon:x.lon,alt:finite(x.alt_baro)?x.alt_baro*.0003048:0,speed:finite(x.gs)?x.gs:null,heading:finite(x.track)?x.track:0,time:t-x.seen_pos,kind:'air'}));
}
export function parseSea(data,now=Date.now()/1000){
 if(!Array.isArray(data.features)||data.features.length>20000)throw Error('Invalid AIS source');
 return data.features.filter(x=>x.geometry?.type==='Point'&&coordinates(x.geometry.coordinates[1],x.geometry.coordinates[0])&&finite(x.properties?.timestampExternal)&&now-x.properties.timestampExternal/1000<=600&&x.properties.timestampExternal/1000<=now+30).map(x=>({id:String(x.mmsi??x.properties.mmsi).slice(0,12),name:'MMSI '+String(x.mmsi??x.properties.mmsi).slice(0,12),lat:x.geometry.coordinates[1],lon:x.geometry.coordinates[0],alt:0,speed:finite(x.properties.sog)?x.properties.sog:null,heading:finite(x.properties.cog)?x.properties.cog:0,time:x.properties.timestampExternal/1000,kind:'sea'}));
}
export function parseSpace(x,now=Date.now()/1000){if(!coordinates(x.latitude,x.longitude)||!finite(x.timestamp)||Math.abs(now-x.timestamp)>120||!finite(x.altitude)||x.altitude<100||x.altitude>1000)throw Error('Invalid or stale ISS solution');return[{id:'25544',name:'ISS / calculated position',lat:x.latitude,lon:x.longitude,alt:x.altitude,speed:finite(x.velocity)?x.velocity:null,heading:0,time:x.timestamp,kind:'space'}]}
export function xyz(lat,lon,r=1){const a=lat*Math.PI/180,b=lon*Math.PI/180;return[Math.cos(a)*Math.sin(b)*r,Math.sin(a)*r,Math.cos(a)*Math.cos(b)*r]}
export function rotate(v,yaw,pitch){const[x,y,z]=v,c=Math.cos(yaw),s=Math.sin(yaw),a=Math.cos(pitch),b=Math.sin(pitch),xx=x*c-z*s,zz=x*s+z*c;return[xx,y*a-zz*b,y*b+zz*a]}
export function command(text){const s=text.toLowerCase().trim();if(/^(show|hide) (aircraft|ships|satellite)$/.test(s)){const[op,layer]=s.split(' ');return{type:'layer',key:{aircraft:'air',ships:'sea',satellite:'space'}[layer],show:op==='show'}}if(s==='focus baltic')return{type:'focus',key:'baltic'};if(s==='focus iss')return{type:'focus',key:'iss'};if(s==='reset view')return{type:'focus',key:'reset'};if(s==='refresh data')return{type:'refresh'};return null}
