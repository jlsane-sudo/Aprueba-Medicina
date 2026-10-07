const fs=require('fs'),vm=require('vm'),zlib=require('zlib'),assert=require('assert');
const path=require('path'),root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app.html'),'utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
const b64=Array.from({length:13},(_,i)=>fs.readFileSync(path.join(root,`data/fisio.parts/part_${String(i+1).padStart(2,'0')}.txt`),'utf8')).join('').trim();
const bank=JSON.parse(zlib.gunzipSync(Buffer.from(b64,'base64')));
const starts=[1,8,14,23,37,46,52,56,59,68,76,106,125,149,164,168,172];
const topics=starts.map((page_start,i)=>({id:`fis${String(i+1).padStart(2,'0')}`,subject:'fisiologia',page_start,page_end:starts[i+1]?starts[i+1]-1:175}));
assert(bank.length>0);
assert.equal(new Set(bank.map(q=>q.prompt)).size,bank.length);
assert.equal(new Set(bank.map(q=>q.external_key||q.id)).size,bank.length);
const c={bank,topics,FISIOLOGIA_MANUAL_FILE:'fisiologia-manual.pdf',subjects:[{id:'fisiologia',name:'Fisiología I'}],openPrivatePdf:async(...args)=>c.opened=args,$:()=>null,startQuiz:qs=>c.quiz=qs};
vm.createContext(c);
for(const name of ['locatorPage','questionSourceTarget','openPdf','openQuestionSource','qForTopic','shuffle','startTopic','startGlobal']){
 const line=html.split('\n').find(x=>new RegExp(`^(async )?function ${name}\\(`).test(x));assert(line,name);vm.runInContext(line,c);
}
(async()=>{
for(const t of topics){
 const qs=bank.filter(q=>q.topic_id===t.id);assert(qs.length>0 && qs.length<=50);
 await c.openPdf(t.id);assert.equal(c.opened[0],'fisiologia-manual.pdf');assert.equal(c.opened[1],t.page_start);
 await c.startTopic(t.id);assert.equal(c.quiz.length,qs.length);
 assert.equal(c.questionSourceTarget({},t).page,t.page_start);
 assert.equal(c.questionSourceTarget({source_locator:'página 42'},t).page,42);
 for(const q of qs){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(q.explanation&&q.source_locator);const target=c.questionSourceTarget(q,t);assert(target.page>=t.page_start&&target.page<=t.page_end,`${q.id}: ${target.page}`);await c.openQuestionSource(q);assert.equal(c.opened[1],target.page);assert.equal(c.opened[0],'fisiologia-manual.pdf');}
}
c.startGlobal('fisiologia',50);assert.equal(c.quiz.length,100);assert.equal(new Set(c.quiz.map(q=>q.id)).size,100);
console.log(JSON.stringify({questions:bank.length,topics:17,perTopic:topics.map(t=>bank.filter(q=>q.topic_id===t.id).length),global:100,explanationsAndReferences:bank.length,topicLinks:17,questionLinks:bank.length,syntax:'OK',sample:bank[0]},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});

