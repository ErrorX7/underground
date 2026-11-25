const shots = {
  door: ['地下入口','狗 DJ 抬爪落针','黑白闪光灯照亮粗毛小狗。桌面比狗的脸更靠近镜头，后墙只亮一截红色灯管。','点狗或「落针进场」。前爪往回擦碟两下，电平跳起。声音由访客打开，同一标签页再次进入默认去唱片墙。','约 0.9 秒。盘面从俯视的椭圆收成圆形，落到唱片墙第一只 CD 盒的右侧。'],
  wall: ['唱片墙','从架子上抽一张','暖白底上摆透明 CD 盒。半露的银盘反光，封面用大字和现场近景。搜索和类型筛选占同一排。','点任意一盒，打开对应场次。用「新建演出」放入一张自己的封面。','封面从盒内放大为详情主图，场名随封套移动。'],
  detail: ['演出详情','把封套翻到背面','主图下先读 Personal Note，再沿竖线看演出前、中、后。交通行程收在对应节点里。','点「翻开折页」切换到这场的手翻书；也可改演出资料或直接进时间线编辑。','从详情进入折页时，封面缩成左页的入场券。回到详情仍然是同一场。'],
  book: ['手翻书','从纸里打开那一晚','左页是入场券和随记，右页是一张向内折的场地示意。示意图只表达第一人称视角。','点红点「我在这儿」展开舞台，让白边相片从书缝滑出来；点「看背面」读散场瞬间。左右翻页换场。','展纸 0.52 秒，相片晚半拍滑出后停住。翻场只动半页。手机上可轻扫，系统减少动态时直接换画面。'],
  entry: ['新建 / 编辑演出','印一张唱片内页','表单用纸白底。封面预览随输入变成一张标签，票价、购票方式等次要资料归在折叠区。','上传封面、填写场次后保存。本次审稿的表单只修改这次打开的示例。','保存后在详情页看到刚填的封面和文字，减少从头找场次的动作。'],
  edit: ['时间线编辑','把一段路夹进节点','节点沿竖线排开。记录文字下面是行程卡，再往下贴照片。车次或航班号像票面印字。','点节点修改时间、阶段或文字。可添加多段行程和照片，保存后去折页看到变化。','展开行程像抽出票夹。桌面左右分栏，手机先选节点再编辑。'],
  map: ['地图记忆','按城市翻找现场','沿用中国地图和城市记录，右侧像车站到发板。切换年份看那一年的场次。','点城市或站牌看该城记录，再点场名回到详情。「足迹」连接按日期排列的演出城市。','选站时目的地文字替换、站点亮起。真实乘车或航班信息仍取自该场的行程卡。'],
  hall: ['名人堂 / 里程碑','散场后的后台走廊','黑底名单像后台门上的名牌。左侧红色握麦近景借用 battle 传麦的意象。','点艺人名字，展开看过的场次。底部纪念章取自记录里的第一场、第一场 Livehouse 等。','点纪念章直接回到那晚的详情。让每个章都能翻到具体的一页。']
};
const keys=Object.keys(shots), phases=['演出前','演出中','演出后'];
const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const types={livehouse:'Livehouse',bar:'酒吧商演',arena:'体育馆'};
const modes={rail:'列车',flight:'航班',car:'汽车',transit:'市内交通',other:'其他'};
const coords={杭州:[120.1551,30.2741,'浙江省'],上海:[121.4737,31.2304,'上海市'],南京:[118.7969,32.0603,'江苏省'],常州:[119.9741,31.8112,'江苏省'],北京:[116.4074,39.9042,'北京市'],成都:[104.0665,30.5728,'四川省']};
const art=name=>'art/'+name+'.webp';
const sourceArt=['mic','crowd','train','crowd','after','mic'];
const selector=document.querySelector('#scene'), dialog=$('#drawer');
const [records,geo]=await Promise.all(['records.json','map.json'].map(async path=>{const r=await fetch(path);if(!r.ok)throw Error(path);return r.json()}));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let current='', selectedId=records[0].id, filter='all',query='', bookSide='closed',sound=false, entering=false,year='all',city='杭州',route=false,artist=records[0].artist,entryMode='new',entryCover='',timelineDraft=[],nodeIndex=0,entryDraft=null;
let releaseTimer=0;
const rec=()=>records.find(r=>r.id===selectedId)||records[0];
const coverOf=r=>r.cover?.startsWith('blob:')?r.cover:art(sourceArt[Number(r.cover?.replace('covers',''))]||'mic');
const phaseArt=item=>item?.image?.startsWith('blob:')?item.image:art(['train','crowd','after'][phases.indexOf(item?.phase)]||'crowd');
const tag=(s)=>'<div class="kicker">'+s+'</div>';
const title=(t)=>'<h1 class="title">'+escape(t)+'</h1>';
const section=(body,cls='')=>'<section class="page '+cls+'">'+body+'</section>';
const back=(page,text)=>'<button class="back" data-go="'+page+'">← '+text+'</button>';
const button=(label,page,cls='outline')=>'<button class="'+cls+'" data-go="'+page+'">'+label+'</button>';
const num=()=>pad(keys.indexOf(current)+1);
const recButton=(r,label)=>'<button data-record="'+escape(r.id)+'">'+(label||escape(r.title)+' ↗')+'</button>';
function routeHash(key,id=selectedId){return '#'+key+(['detail','book','edit'].includes(key)?'/'+encodeURIComponent(id):'')}
function readRoute(){const [key,raw]=location.hash.slice(1).split('/');if(raw){try{const id=decodeURIComponent(raw);if(records.some(r=>r.id===id))selectedId=id}catch{}}if(keys.includes(key))return key;try{return sessionStorage.getItem('ug-review-entered')?'wall':'door'}catch{return 'door'}}
function loadScreen(key){
  current=key;if(key==='book')bookSide='closed';
  if(key==='edit'){timelineDraft=structuredClone(rec().timeline);nodeIndex=0}
  if(key==='entry'){entryDraft=entryMode==='edit'?structuredClone(rec()):{title:'',artist:'',guest:'',date:'',time:'',city:'',venue:'',type:'livehouse',price:'',line:'',ticketMethod:'',ticketSource:'',actualPrice:''};entryCover=entryMode==='edit'&&rec().cover?.startsWith('blob:')?rec().cover:''}
  render();window.scrollTo({top:0,behavior:'instant'});selector.focus({preventScroll:true});
}
function sharedObjects(key){
  if(key==='wall'){
    const card=Array.from(document.querySelectorAll('.casebtn')).find(element=>element.dataset.record===selectedId);
    return [card?.querySelector('.cover'),card?.querySelector('.rackfoot strong')];
  }
  if(key==='detail')return [$('.detailart'),$('.detailCopy h1')];
  if(key==='book')return [$('.ticketstub'),$('.bookhead h1')];
  return [];
}
function nameTransitionObjects(objects){
  document.querySelectorAll('[data-morph]').forEach(el=>{el.style.viewTransitionName='';delete el.dataset.morph});
  objects.forEach((el,index)=>{if(el){el.style.viewTransitionName=index?'show-title':'sleeve';el.dataset.morph='true'}});
}
function navigate(key,{transition=true,replace=false}={}){
  if(!keys.includes(key))return;
  if(dialog.open)dialog.close();
  if(key==='entry'&&current!=='detail')entryMode='new';
  const url=routeHash(key);
  if(location.hash!==url)history[replace?'replaceState':'pushState'](null,'',url);
  const oldObjects=sharedObjects(current);
  const related=['wall','detail','book'].includes(key)&&['wall','detail','book'].includes(current);
  if(related)nameTransitionObjects(oldObjects);
  const run=()=>{loadScreen(key);if(related)nameTransitionObjects(sharedObjects(key))};
  if(transition&&!reduced()&&document.startViewTransition)document.startViewTransition(run);else run();
}
window.addEventListener('popstate',()=>loadScreen(readRoute()));
function render(){
  selector.innerHTML=({door:doorScreen,wall:wallScreen,detail:detailScreen,book:bookScreen,entry:entryScreen,edit:editScreen,map:mapScreen,hall:hallScreen})[current]();
  $('#shot-count').textContent=num()+' / '+pad(keys.length);
  $('#prev-shot').disabled=current===keys[0];$('#next-shot').disabled=current===keys.at(-1);
  document.querySelectorAll('header nav button').forEach(b=>{if(b.dataset.go===current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  document.title=shots[current][0]+' · UNDERGROUND 分镜';
}
function showDrawer(notes=false){const n=shots[current];$('#drawer-body').innerHTML=notes?
  '<h2 id="drawer-title">'+num()+' · '+n[0]+'</h2>'+['画面','试一试','衔接'].map((label,i)=>'<div class="noteitem"><b>'+label+'</b><p>'+n[i+2]+'</p></div>').join('')+'<button class="outline" data-index>全部分镜</button>':
  '<h2 id="drawer-title">分镜目录</h2>'+keys.map((k,i)=>'<button class="storyrow '+(current===k?'active':'')+'" data-go="'+k+'"><span class="mono">'+pad(i+1)+'</span><b>'+shots[k][0]+'</b><span>↗</span></button>').join('')+'<p class="readhint">审稿原型 · 六场仓库示例，配图为概念创作。预览中的编辑只在本次打开时有效。</p>';
  if(!dialog.open)dialog.showModal();
}
function doorScreen(){return '<section class="door"><div class="doorMain"><div class="doorCopy">'+tag('B1 / LIVEHOUSE 入口')+'<h1 lang="en"><span>NEEDLE</span><span>DROP<b>.</b></span></h1><h2>地下演出档案馆</h2><div class="actions"><button class="btn hot press" data-start>▶　落针进场</button><button class="quiet" data-skip>跳过开场</button></div></div><button class="artplate" data-start aria-label="点狗 DJ 开始打碟并进入唱片墙"><span class="djpic"></span><span class="platterFx"></span><span class="djpaw"></span><span class="plateid">BOOTH CAM / B1</span><span class="playdot" aria-hidden="true">▶</span><span class="meter">'+[6,9,15,22,17,11,16,8].map((h,i)=>'<b style="--h:'+h+'px;--d:-'+i*.022+'s"></b>').join('')+'</span></button></div><div class="doorfoot"><span class="mono">地下入口　/　01</span><button class="sound" data-sound aria-pressed="'+sound+'">声音 <span>'+ (sound?'开':'关')+'</span></button></div></section>'}
function cueSound(){
  try{const ctx=new AudioContext(),source=ctx.createBufferSource(),buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.32),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/data.length*4);source.buffer=buffer;const filter=ctx.createBiquadFilter(),gain=ctx.createGain();filter.type='bandpass';filter.frequency.setValueAtTime(1500,ctx.currentTime);filter.frequency.exponentialRampToValueAtTime(320,ctx.currentTime+.3);gain.gain.value=.16;source.connect(filter).connect(gain).connect(ctx.destination);source.onended=()=>ctx.close();ctx.resume().then(()=>source.start()).catch(()=>ctx.close())}catch{}
}
function enter(skip=false){
  if(entering)return;entering=true;try{sessionStorage.setItem('ug-review-entered','1')}catch{}
  if(!skip&&sound)cueSound();const plate=$('.artplate'),box=plate.getBoundingClientRect();plate.classList.add('playing');
  const timer=skip||reduced()?0:540;clearTimeout(releaseTimer);releaseTimer=setTimeout(()=>{
    entering=false;if(current!=='door')return;navigate('wall',{transition:false});
    if(skip||reduced())return;
    const target=$('.disc');if(!target)return;const end=target.getBoundingClientRect(),d=document.createElement('i');d.className='transition-cd';const w=box.width*.44;
    Object.assign(d.style,{width:w+'px',height:w+'px',left:box.left+box.width*.38-w/2+'px',top:box.top+box.height*.77-w/2+'px'});document.body.append(d);
    const start=d.getBoundingClientRect(),dx=end.x+end.width/2-start.x-w/2,dy=end.y+end.height/2-start.y-w/2;
    const a=d.animate([{transform:'scaleY(.33) rotate(-45deg)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale('+end.width/w+') rotate(135deg)',opacity:0}],{duration:440,easing:'cubic-bezier(.24,.7,.22,1)',fill:'both'});a.onfinish=()=>d.remove();
  },timer)
}
function jewel(r){return '<span class="jewel"><span class="disc"></span><span class="cover" style="background-image:url('+coverOf(r)+')"><b>'+escape(r.artist)+'</b><small>'+escape(r.date)+' / '+escape(r.city)+'</small></span></span>'}
function rack(){const items=records.filter(r=>(filter==='all'||r.type===filter)&&[r.title,r.artist,r.city,r.venue].join(' ').toLowerCase().includes(query.toLowerCase()));
return items.length?items.map(r=>'<button class="casebtn" data-record="'+escape(r.id)+'">'+jewel(r)+'<span class="rackfoot"><strong>'+escape(r.title)+'</strong><span class="mono">'+escape(r.date.replaceAll('-','.'))+'</span></span><span class="caption">'+escape(r.city)+'　/　'+escape(r.venue)+'</span></button>').join(''):'<p class="empty">这个条件下还没有唱片。</p>'}
function wallScreen(){return section('<div class="rowhead"><div>'+tag('A 面 / RECORD SHELF')+title('唱片陈列室')+'<p class="sub">'+pad(records.length)+' 场演出　/　'+pad(new Set(records.map(r=>r.city)).size)+' 座城市</p></div>'+button('＋ 新建演出','entry','btn')+'</div><div class="walltools"><div class="chips">'+Object.entries({all:'全部',...types}).map(([k,v])=>'<button class="chip '+(filter===k?'on':'')+'" data-filter="'+k+'">'+v+'</button>').join('')+'</div><input class="search" id="search" placeholder="搜索演出、艺人或城市" aria-label="搜索演出、艺人或城市" value="'+escape(query)+'"></div><div class="shelf" id="rack">'+rack()+'</div>')}
function journey(j){return '<details><summary>'+escape(modes[j.mode]||'行程')+'　'+escape(j.from||'出发地')+' → '+escape(j.to||'目的地')+'</summary><div class="ticketbox">'+escape([j.serviceNumber,j.departureDate,j.departureTime,'→',j.arrivalDate,j.arrivalTime].filter(Boolean).join(' '))+(j.ticketImage?.startsWith('blob:')?'<img class="thumb" src="'+escape(j.ticketImage)+'" alt="车票或机票">':'')+'</div></details>'}
function detailScreen(){const r=rec();return section(back('wall','唱片墙')+tag('LINER NOTES / 演出详情')+'<div class="detailTop"><div class="detailart"><img src="'+coverOf(r)+'" alt="演出封面"></div><div class="detailCopy"><span class="type">'+escape(r.date)+' / '+escape(types[r.type])+'</span>'+title(r.title)+'<p>'+escape(r.artist)+'　·　'+escape(r.city)+'</p><p class="sub">'+escape(r.venue)+'　'+escape(r.time)+'　/　¥'+escape(r.price||0)+'</p><div class="actions">'+button('翻开折页 ↗','book','btn hot')+'<button class="outline" data-edit-info>编辑资料</button></div></div></div><div class="personal"><div><div class="mono red">PERSONAL NOTE</div><h2>这一晚，我想记住</h2></div><p>'+escape(r.note||r.line||'还没有写下这场随记。')+'</p></div><div class="timeline"><div class="rowhead"><h2>演出时间线</h2>'+button('编辑时间线','edit')+'</div>'+r.timeline.map(i=>'<article class="event"><time>'+escape(i.time||'—')+'</time><div class="eventinc"><span>'+escape(i.date||r.date)+' / '+escape(i.phase)+'</span><h3>'+escape(i.emoji)+' '+escape(i.title)+'</h3><p class="sub">'+escape(i.content)+'</p>'+(i.transportJourneys||[]).map(journey).join('')+'</div></article>').join('')+'</div>')}
function bookScreen(){const r=rec(),before=r.timeline.find(i=>i.phase===phases[0]),mid=r.timeline.find(i=>i.phase===phases[1]),end=r.timeline.filter(i=>i.phase===phases[2]).at(-1),opened=bookSide==='open',reverse=bookSide==='reverse',i=records.indexOf(r);
const photo=mid?.image?phaseArt(mid):coverOf(r);
const trip=r.timeline.flatMap(n=>n.transportJourneys||[])[0];const prints=[before,end].filter(n=>n?.image);
return section(back('detail','这场演出的详情')+'<div class="bookhead"><div>'+tag('B 面 / FOLDOUT')+'<h1>'+escape(r.title)+'</h1></div><span class="folio">'+pad(i+1)+' / '+pad(records.length)+'</span></div><div class="desk '+(opened?'opened':'')+'" id="desk"><div class="book"><div class="paper left"><span class="marginlabel">ADMIT ONE / 入场券</span><div class="ticketstub"><small>'+escape(r.date)+'</small><b>'+escape(r.artist)+'</b><small>'+escape(r.city)+'<br>'+escape(r.venue)+'</small><div class="barcode"></div></div><p class="booknote">'+escape(r.note||r.line||'本页留给散场后想写下的话。')+'</p><span class="marginlabel">UG — '+pad(i+1)+'</span></div><div class="paper right"><span class="marginlabel">'+(reverse?'REVERSE / 散场以后':'FROM THE FLOOR / 场内视角')+'</span>'+(reverse?((end?.image?'<div class="afterPrint"><img src="'+phaseArt(end)+'" alt="散场瞬间概念配图"></div>':'')+'<div class="booktext"><b>'+escape(end?.time||'')+' '+escape(end?.title||'散场以后')+'</b><p>'+escape(end?.content||'还没有演出后的记录。')+'</p></div>'):'<div class="foldSurface"><div class="inside"><img src="'+photo+'" alt="展开后的舞台"></div><button class="flap" data-unfold '+(opened?'tabindex="-1" aria-hidden="true"':'')+'><i></i><small>STAGE / 舞台</small><b>我在这儿</b><small>示意图 · 点此展开</small></button></div><div class="booktext"><b>'+escape(opened?(mid?.time||'')+' '+(mid?.title||'现场'):(before?.time||'')+' '+(before?.title||'演出前'))+'</b><p>'+escape(opened?mid?.content||'这一页等你写下现场。':trip?[modes[trip.mode],trip.from+' → '+trip.to].join('　'):before?.content||'沿折痕翻开现场。')+'</p></div>')+'</div></div>'+(!reverse?prints.map((n,k)=>'<figure class="print '+(k?'two':'')+'"><img src="'+phaseArt(n)+'" alt=""></figure>').join(''):'')+'</div><div class="bookctrl"><button data-turn="-1" '+(i===0?'disabled':'')+'>← 上一场</button><button data-unfold>'+(opened?'合上折页':'展开舞台')+'</button><button data-reverse>'+(reverse?'回到正面':'看背面')+'</button><button data-turn="1" '+(i===records.length-1?'disabled':'')+'>下一场 →</button></div>','bookPage dark')}
function updateBook(side){const was=bookSide;bookSide=side;if((was==='closed'&&side==='open')||(was==='open'&&side==='closed')){const d=$('#desk');d.classList.toggle('opened',side==='open');const flap=d.querySelector('.flap');flap.tabIndex=side==='open'?-1:0;flap.setAttribute('aria-hidden',String(side==='open'));const scratch=document.createElement('template');scratch.innerHTML=bookScreen();d.querySelector('.booktext').replaceWith(scratch.content.querySelector('.booktext'));$('.bookctrl [data-unfold]').textContent=side==='open'?'合上折页':'展开舞台';if(side==='open')$('.bookctrl [data-unfold]').focus({preventScroll:true})}else render()}
function turn(dir){const i=records.indexOf(rec())+dir;if(i<0||i>=records.length)return;selectedId=records[i].id;bookSide='closed';history.replaceState(null,'',routeHash('book'));render();if(!reduced()){const el=document.createElement('div');el.className='pageTurn';if(dir<0){el.style.inset='0 50% 0 0';el.style.transformOrigin='right';el.style.animationDirection='reverse'}$('.book').append(el);el.addEventListener('animationend',()=>el.remove())}$('#announce').textContent=rec().title}
function field(label,key,value,type='text',required=false){return '<label>'+label+'<input type="'+type+'" name="'+key+'" value="'+escape(value)+'" '+(required?'required':'')+(type==='number'?' min="0" step="0.01"':'')+'></label>'}
function options(obj,v){return Object.entries(obj).map(([k,n])=>'<option value="'+escape(k)+'" '+(v===k?'selected':'')+'>'+escape(n)+'</option>').join('')}
function entryScreen(){const r=entryDraft,heading=entryMode==='edit'?'编辑演出资料':'新建演出记录';return section(back(entryMode==='edit'?'detail':'wall','返回')+tag('LABEL PRESS / 档案内页')+title(heading)+'<form id="entry-form" class="formgrid"><div class="formbox">'+field('演出名称','title',r.title,'text',true)+field('艺人','artist',r.artist,'text',true)+field('嘉宾','guest',r.guest)+field('日期','date',r.date,'date',true)+field('时间','time',r.time,'time')+field('城市','city',r.city,'text',true)+field('场馆','venue',r.venue,'text',true)+'<label>演出类型<select name="type">'+options(types,r.type)+'</select></label><details class="wide"><summary>票务资料</summary><div class="formbox">'+field('票面价','price',r.price,'number')+field('实付价','actualPrice',r.actualPrice,'number')+'<label>购票方式<select name="ticketMethod">'+options({'':'未填写',official:'官方购票',proxy:'代拍',resale:'二手转票',scalper:'黄牛收票',gift:'赠票',other:'其他'},r.ticketMethod)+'</select></label>'+field('票源','ticketSource',r.ticketSource)+'</div></details><label class="wide">一句话记录<textarea name="line">'+escape(r.line)+'</textarea></label><label class="wide">Personal Note<textarea name="note">'+escape(r.note||'')+'</textarea></label><label class="wide filelabel">封面图片<input type="file" accept="image/*" id="entry-image"></label><div class="actions wide"><button class="btn" type="submit">保存预览 ↗</button><span class="readhint">改动仅在本次预览有效</span></div></div><aside class="sideprint"><div class="formcover"><img id="form-photo" src="'+(entryCover||(entryMode==='edit'?coverOf(rec()):art('mic'))) +'" alt="封面预览"></div><h2 id="form-title">'+escape(r.title||'新唱片')+'</h2><span id="form-caption" class="sub">'+escape([r.artist,r.city].filter(Boolean).join(' / '))+'</span></aside></form>')}
function newNode(){return {phase:phases[0],date:rec().date,time:'',emoji:'',title:'',content:'',transportJourneys:[]}}
function tripFields(j,k){return '<details class="journeyedit" '+(!j.from?'open':'')+' data-trip="'+k+'"><summary>'+escape(modes[j.mode]||'交通')+'　'+escape(j.from||'出发地')+' → '+escape(j.to||'目的地')+'</summary><div class="formbox"><label>交通方式<select name="mode">'+options(modes,j.mode)+'</select></label>'+field('车次 / 航班号','serviceNumber',j.serviceNumber)+field('出发地','from',j.from)+field('目的地','to',j.to)+field('出发日期','departureDate',j.departureDate,'date')+field('出发时间','departureTime',j.departureTime,'time')+field('抵达日期','arrivalDate',j.arrivalDate,'date')+field('抵达时间','arrivalTime',j.arrivalTime,'time')+'<label class="filelabel wide">票据图片<input type="file" accept="image/*" data-ticket="'+k+'">'+(j.ticketImage?.startsWith('blob:')?'<img class="thumb" src="'+j.ticketImage+'" alt="票据预览">':'')+'</label></div><button class="chip" data-remove-trip="'+k+'">移除本段行程</button></details>'}
function editScreen(){const n=timelineDraft[nodeIndex],r=rec();return section(back('detail','演出详情')+tag('SESSION LOG / 时间线')+'<div class="rowhead"><div>'+title('编辑时间线')+'<p class="sub">'+escape(r.title)+'</p></div><button class="btn" data-save-time>保存本次预览 ↗</button></div><div class="edt"><aside>'+timelineDraft.map((i,k)=>'<button class="nodepick '+(k===nodeIndex?'on':'')+'" data-node="'+k+'"><span>'+pad(k+1)+' / '+escape(i.phase)+'</span><b>'+escape(i.title||'新节点')+'</b></button>').join('')+'<button class="outline" data-add-node>＋ 节点</button></aside><div>'+(n?'<div class="formbox" id="node-fields"><label>阶段<select name="phase">'+options(Object.fromEntries(phases.map(p=>[p,p])),n.phase)+'</select></label>'+field('Emoji 标签','emoji',n.emoji)+field('日期','date',n.date||r.date,'date')+field('时间','time',n.time,'time')+'<div class="wide">'+field('标题','title',n.title)+'</div><label class="wide">记录<textarea name="content">'+escape(n.content)+'</textarea></label></div><div class="control" style="margin:15px 0 10px"><button class="outline" data-add-trip>＋ 添加交通行程</button></div>'+(n.transportJourneys||[]).map(tripFields).join('')+'<label class="filelabel" style="display:block;margin:12px 0">节点照片 <input id="node-image" type="file" accept="image/*">'+(n.image?'<img class="thumb" src="'+phaseArt(n)+'" alt="节点照片预览">':'')+'</label><button class="chip" data-remove-node>移除这个示例节点</button>':'<p class="empty">时间线是空的，点「＋ 节点」开始。</p>')+'</div></div>')}
function mapScreen(){const years=[...new Set(records.map(r=>r.date.slice(0,4)))].sort().reverse(),items=records.filter(r=>year==='all'||r.date.startsWith(year)),cities=[...new Set(items.map(r=>r.city))];if(!cities.includes(city))city=cities[0]||'';const hits=items.filter(r=>r.city===city).sort((a,b)=>a.date.localeCompare(b.date));
const project=([x,y])=>[24+(x-72)/64*712,24+(54.5-y)/38.5*492];const position=n=>project(coords[n]).map(v=>v.toFixed(1));const locs=cities.filter(c=>coords[c]);const activeProvinces=new Set(locs.map(c=>coords[c][2]));
const shapes=geo.map(p=>'<path d="'+p.d+'" fill="'+(activeProvinces.has(p.n)?'#c89c81':'#d9d6c8')+'" stroke="#fcfaf1" stroke-width=".85"/>').join('');
const stops=items.slice().sort((a,b)=>a.date.localeCompare(b.date)).filter(r=>coords[r.city]).map(r=>position(r.city).join(',')).join(' ');
const dots=locs.map(c=>{const [x,y]=position(c);return '<g role="button" tabindex="0" data-city="'+escape(c)+'" aria-label="'+escape(c)+'"><title>'+escape(c)+'</title><circle cx="'+x+'" cy="'+y+'" r="8" fill="transparent"/><circle cx="'+x+'" cy="'+y+'" r="'+(c===city?5.6:3.1)+'" stroke="#faf6df" stroke-width="1.5" fill="'+(c===city?'#ba3722':'#282820')+'"/></g>'}).join('');
return section(tag('ON THE ROAD / 城市足迹')+'<div class="rowhead"><div>'+title('地图记忆')+'<p class="sub">点亮一座城，找回在那里看过的演出。</p></div><div class="actions"><select class="field" style="width:auto" id="year" aria-label="选择年份">'+options({all:'全部年份',...Object.fromEntries(years.map(y=>[y,y]))},year)+'</select><button class="chip '+(route?'on':'')+'" data-route aria-pressed="'+route+'">足迹 '+(route?'开':'关')+'</button></div></div><div class="mapgrid"><div class="mapcanvas"><svg viewBox="0 0 760 580" role="group" aria-label="中国演出城市地图">'+shapes+(route?'<polyline points="'+stops+'" fill="none" stroke="#ac3b25" stroke-width="2" stroke-dasharray="6 5"/>':'')+dots+'</svg><small><a href="MAP_DATA_ATTRIBUTION.md">地图来源 · Map of Us</a></small></div><aside class="station"><div class="mono">STATION BOARD / 到站</div><h2>'+escape(city||'暂无城市')+'</h2><p class="sub">'+pad(hits.length)+' 场　/　'+(hits[0]?escape(hits[0].date)+' 首次打卡':'')+'</p><div class="shows">'+hits.map(r=>recButton(r)).join('')+'</div>'+cities.map(c=>'<button class="cityrow '+(c===city?'on':'')+'" data-city="'+escape(c)+'"><span>●</span><b>'+escape(c)+'</b><span class="mono">'+pad(items.filter(r=>r.city===c).length)+'</span></button>').join('')+'</aside></div>')}
function hallScreen(){const names=[...new Set(records.map(r=>r.artist).filter(Boolean))];if(artist&&!names.includes(artist))artist=names[0];const chron=records.slice().sort((a,b)=>a.date.localeCompare(b.date));const milestones=[['第一次演出打卡',chron[0]],['第一场 Livehouse',chron.find(r=>r.type==='livehouse')],['第一次跨城行程',chron.find(r=>r.timeline.some(n=>n.transportJourneys?.some(j=>j.from&&j.to&&j.from!==j.to)))]];return section(tag('BACKSTAGE / 艺人名册')+title('我的名人堂')+'<div class="hallgrid"><div class="hallpic"><img src="'+art('mic')+'" alt="递向舞台的一支麦克风"><b>PASS<br>THE MIC.</b></div><div>'+names.map((a,i)=>'<button class="artistrow '+(a===artist?'on':'')+'" data-artist="'+escape(a)+'" aria-expanded="'+(a===artist)+'"><span class="mono">'+pad(i+1)+'</span><b>'+escape(a)+'</b><span>↗</span></button>'+(a===artist?'<div class="shows">'+records.filter(r=>r.artist===a).map(r=>recButton(r)).join('')+'</div>':'')).join('')+'</div></div><div class="milestones">'+milestones.filter(([,r])=>r).map(([l,r])=>'<button class="ms" data-record="'+escape(r.id)+'"><span>'+escape(r.date)+'</span><strong>'+l+'</strong>'+escape(r.city)+' ↗</button>').join('')+'</div>','dark')}
function chooseRecord(id){const r=records.find(v=>v.id===id);if(!r)return;selectedId=id;navigate('detail')}
function moveShot(dir){const next=keys[keys.indexOf(current)+dir];if(next)navigate(next)}
function saveForm(form){const data=Object.fromEntries(new FormData(form));for(const k of ['title','artist','city','venue']){data[k]=String(data[k]||'').trim();if(!data[k]){form.elements[k].focus();return}}data.price=Number(data.price||0);data.actualPrice=data.actualPrice?Number(data.actualPrice):undefined;
if(entryMode==='edit'){const r=rec();Object.assign(r,data);if(entryCover)r.cover=entryCover}else{const id=crypto.randomUUID();records.unshift({...data,id,cover:entryCover||'covers0',media:[],timeline:[]});selectedId=id}entryMode='new';navigate('detail')}
function handleInput(event){const t=event.target;
if(t.id==='search'){query=t.value;$('#rack').innerHTML=rack();return}
if(t.closest('#entry-form')&&t.name){entryDraft[t.name]=t.value;$('#form-title').textContent=entryDraft.title||'新唱片';$('#form-caption').textContent=[entryDraft.artist,entryDraft.city].filter(Boolean).join(' / ')}
if(current==='edit'&&timelineDraft[nodeIndex]&&t.name){const trip=t.closest('[data-trip]');const item=trip?timelineDraft[nodeIndex].transportJourneys[Number(trip.dataset.trip)]:timelineDraft[nodeIndex];item[t.name]=t.value;
if(!trip&&['title','phase'].includes(t.name)){$('.nodepick.on b').textContent=item.title||'新节点';$('.nodepick.on span').textContent=pad(nodeIndex+1)+' / '+item.phase}}
}
document.addEventListener('input',handleInput);
document.addEventListener('change',e=>{const t=e.target;if(t.id==='year'){year=t.value;render();return}if(t.type!=='file'||!t.files?.[0])return;const file=t.files[0];if(!file.type.startsWith('image/'))return;const url=URL.createObjectURL(file);if(t.id==='entry-image'){entryCover=url;$('#form-photo').src=url}else if(t.id==='node-image'){timelineDraft[nodeIndex].image=url;render()}else if(t.hasAttribute('data-ticket')){timelineDraft[nodeIndex].transportJourneys[+t.dataset.ticket].ticketImage=url;render()}});
document.addEventListener('submit',e=>{if(e.target.id==='entry-form'){e.preventDefault();saveForm(e.target)}});
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-city]');if(!b)return;const d=b.dataset;
if('start'in d){enter();return}if('skip'in d){enter(true);return}if('sound'in d){sound=!sound;render();return}
if('go'in d){if(d.go==='entry')entryMode='new';navigate(d.go);return}if('record'in d){chooseRecord(d.record);return}
if(b.id==='open-index'||'index'in d){showDrawer();return}if(b.id==='notes-btn'){showDrawer(true);return}if(b.id==='close-drawer'){dialog.close();return}
if(b.id==='prev-shot'||b.id==='next-shot'){moveShot(b.id==='prev-shot'?-1:1);return}
if('filter'in d){filter=d.filter;render();return}
if('unfold'in d){updateBook(bookSide==='open'?'closed':'open');return}if('reverse'in d){updateBook(bookSide==='reverse'?'closed':'reverse');return}if('turn'in d){turn(Number(d.turn));return}
if('editInfo'in d){entryMode='edit';navigate('entry');return}if('node'in d){nodeIndex=+d.node;render();return}
if('saveTime'in d){rec().timeline=structuredClone(timelineDraft);navigate('detail');return}if('addNode'in d){timelineDraft.push(newNode());nodeIndex=timelineDraft.length-1;render();return}
if('removeNode'in d){timelineDraft.splice(nodeIndex,1);nodeIndex=Math.max(0,Math.min(timelineDraft.length-1,nodeIndex));render();return}
if('addTrip'in d){const n=timelineDraft[nodeIndex];(n.transportJourneys??=[]).push({id:crypto.randomUUID(),mode:'rail',from:'',to:'',departureDate:n.date||rec().date,arrivalDate:n.date||rec().date,departureTime:'',arrivalTime:''});render();return}
if('removeTrip'in d){timelineDraft[nodeIndex].transportJourneys.splice(+d.removeTrip,1);render();return}
if('city'in d){city=d.city;render();return}if('route'in d){route=!route;render();return}if('artist'in d){artist=artist===d.artist?'':d.artist;render();return}
});
let swipe;
selector.addEventListener('touchstart',e=>{if(current==='book'&&e.target.closest('#desk'))swipe=[e.changedTouches[0].clientX,e.changedTouches[0].clientY];else swipe=null},{passive:true});
selector.addEventListener('touchend',e=>{if(!swipe||current!=='book')return;const dx=e.changedTouches[0].clientX-swipe[0],dy=e.changedTouches[0].clientY-swipe[1];if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy))turn(dx<0?1:-1);swipe=null},{passive:true});
document.addEventListener('keydown',e=>{if(dialog.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const cityEl=e.target.closest('g[data-city]');if(cityEl&&['Enter',' '].includes(e.key)){e.preventDefault();city=cityEl.dataset.city;render();return}if(current==='book'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();turn(e.key==='ArrowLeft'?-1:1)}});
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.x||e.clientX>b.right||e.clientY<b.y||e.clientY>b.bottom)dialog.close()}});
loadScreen(readRoute());
