import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {INSTRUCTIONS,apiInput} from './dist/analyzer.js';
const port=Number(process.env.PORT||8787);
const allowed=new Map([['/',['index.html','text/html; charset=utf-8']],['/index.html',['index.html','text/html; charset=utf-8']],['/style.css',['style.css','text/css; charset=utf-8']],['/fonts.css',['fonts.css','text/css; charset=utf-8']],['/app.js',['app.js','text/javascript; charset=utf-8']],['/analyzer.js',['analyzer.js','text/javascript; charset=utf-8']]]);
const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
let inFlight=false;
export const server=http.createServer(async(req,res)=>{
 try{
 if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host)){send(res,403,{error:'허용되지 않은 호스트입니다.'});return;}
 const url=new URL(req.url,'http://127.0.0.1:'+port);
 if(url.pathname==='/api/config'&&req.method==='GET'){send(res,200,{enabled:!!(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL),model:process.env.OPENAI_MODEL||null});return;}
 if(url.pathname==='/api/analyze'){
  if(req.method!=='POST'){send(res,405,{error:'POST 요청이 필요합니다.'});return;}
  if(![`http://127.0.0.1:${port}`,`http://localhost:${port}`].includes(req.headers.origin)){send(res,403,{error:'로컬 화면에서 요청하세요.'});return;}
  if(!req.headers['content-type']?.startsWith('application/json')){send(res,415,{error:'JSON 요청이 필요합니다.'});return;}
  if(!process.env.OPENAI_API_KEY||!process.env.OPENAI_MODEL){send(res,503,{error:'서버의 OPENAI_API_KEY와 OPENAI_MODEL 설정이 필요합니다.'});return;}
  if(inFlight){send(res,429,{error:'이전 분석이 진행 중입니다.'});return;}
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>180000){send(res,413,{error:'요청이 너무 큽니다.'});return;}chunks.push(chunk);}
  let body;try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{send(res,400,{error:'잘못된 JSON입니다.'});return;}
  if(typeof body.prompt!=='string'||!body.prompt.trim()||body.prompt.length>40000){send(res,400,{error:'분석 요청은 1~40,000자여야 합니다.'});return;}
  inFlight=true;const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),85000);const disconnected=()=>{if(!res.writableEnded)abort.abort();};res.on('close',disconnected);
  try{const upstream=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+process.env.OPENAI_API_KEY},body:JSON.stringify({model:process.env.OPENAI_MODEL,instructions:INSTRUCTIONS,input:apiInput(body.prompt),store:false,max_output_tokens:4000}),signal:abort.signal});if(!upstream.ok){if(upstream.body)await upstream.body.cancel().catch(()=>{});const message=upstream.status===401?'OpenAI API 인증에 실패했습니다. 서버의 키를 확인하세요.':upstream.status===429?'OpenAI API 사용량 또는 요청 한도에 도달했습니다.':`OpenAI API 요청 실패 (HTTP ${upstream.status}). 모델 설정과 API 권한을 확인하세요.`;send(res,502,{error:message});return;}const data=await upstream.json();if(data.status==='incomplete'){send(res,502,{error:'모델 출력이 한도 내에 완료되지 않았습니다. 더 짧은 맥락으로 다시 요청하세요.'});return;}const text=(data.output??[]).filter(o=>o.type==='message').flatMap(o=>o.content??[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\n');if(!text)throw Error('empty');send(res,200,{text,model:data.model,usage:data.usage});}catch(err){if(!res.destroyed)send(res,502,{error:err.name==='AbortError'?'LLM 요청이 취소되었거나 대기 시간을 초과했습니다.':'LLM 응답을 받지 못했습니다. 네트워크와 모델 설정을 확인하세요.'});}finally{clearTimeout(timer);res.off('close',disconnected);inFlight=false;}return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){send(res,405,{error:'지원하지 않는 요청입니다.'});return;}
 const font=url.pathname.match(/^\/fonts\/([a-z0-9-]+\.woff2)$/);const asset=font?['fonts/'+font[1],'font/woff2']:allowed.get(url.pathname);if(!asset){send(res,404,{error:'찾을 수 없습니다.'});return;}
 const bytes=await readFile(fileURLToPath(new URL('./dist/'+asset[0],import.meta.url)));res.writeHead(200,{'Content-Type':asset[1],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{if(!res.headersSent)send(res,500,{error:'서버 처리 오류입니다.'});else res.end();}
});
server.listen(port,'127.0.0.1',()=>console.log(`ROS Log Doctor: http://127.0.0.1:${port}`));
