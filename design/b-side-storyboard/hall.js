// A session stores its original field and the decisions in match order.
// Replaying the decisions rebuilds the same bracket after an undo or refresh.
export function bracket(session) {
  const field = session.field;
  let capacity = 2;
  while (capacity < field.length) capacity *= 2;
  const byes = capacity - field.length;
  let entrant = 0;
  let previous = [];
  for (let pair = 0; pair < capacity / 2; pair++) {
    previous.push(field[entrant++], pair < byes ? null : field[entrant++]);
  }
  const rounds = [];
  let decision = 0;
  let next = null;
  while (previous.length > 1) {
    const matches = [];
    for (let index = 0; index < previous.length; index += 2) {
      const a = previous[index], b = previous[index + 1];
      let winner;
      if (b === null) winner = a;
      else if (a && b) {
        const picked = session.picks[decision];
        if (picked === a.id || picked === b.id) {
          winner = picked === a.id ? a : b;
          decision++;
        } else if (!next) next = { a, b, round: rounds.length + 1 };
      }
      matches.push({a, b, winner});
    }
    rounds.push(matches);
    previous = matches.map(match => match.winner);
  }
  return {rounds, next, champion: previous[0]};
}

export function setupHall({records, names, esc, repertoire, render}) {
  const key = 'underground-personal-hall-v1';
  const initial = () => ({
    artists: names.map((name,i) => ({id:'initial-'+i, name, songs:''})),
    sessions: {}, hiddenShows: []
  });
  let state;
  try { state = JSON.parse(localStorage.getItem(key)) || initial(); }
  catch { state = initial(); }
  let active = state.artists[0]?.id;
  let scope = '';
  let replacing = false;
  let storageWarning = '';
  const popup = document.createElement('dialog');
  popup.className = 'battlebox';
  popup.setAttribute('aria-labelledby','battle-heading');
  document.body.append(popup);
  const artist = () => state.artists.find(person=>person.id===active);
  const songScope = () => 'songs-'+active;
  function save() {
    try { localStorage.setItem(key,JSON.stringify(state)); storageWarning=''; }
    catch { storageWarning='浏览器未能保存，这次选择仅在当前页面有效。'; }
    const status=document.querySelector('#hall-storage');
    if(status)status.textContent=storageWarning||'榜单与对决保存在此浏览器';
  }
  function fieldFor(id) {
    if (id==='live') return records.filter(r=>!state.hiddenShows.includes(r.id)).map(r=>({id:r.id,label:r.artist+' · '+r.title+' · '+r.date}));
    const songs=artist()?.songs || '';
    const lines=[...new Set(songs.split(/\r?\n/).map(s=>s.trim()).filter(Boolean))];
    return lines.map((label,i)=>({id:String(i),label}));
  }
  function launchButton(id,label) {
    const session=state.sessions[id];
    const winner=session&&bracket(session).champion;
    const caption=winner?'查看晋级树':session?'继续对决':label;
    return (winner?'<p class="hall-win">我的第一名 · '+esc(winner.label)+'</p>':'')+
      '<button class="btn hot" data-duel="'+esc(id)+'">'+caption+' ↗</button>';
  }
  function panel() {
    const person=artist();
    const rows=state.artists.map((a,i)=>'<div class="rankline"><button data-pickartist="'+esc(a.id)+'" class="rankname '+(a.id===active?'selected':'')+'"><small>'+String(i+1).padStart(2,'0')+'</small><b>'+esc(a.name)+'</b></button><button data-move="-1" data-id="'+esc(a.id)+'" aria-label="上移 '+esc(a.name)+'" '+(i===0?'disabled':'')+'>↑</button><button data-move="1" data-id="'+esc(a.id)+'" aria-label="下移 '+esc(a.name)+'" '+(i===state.artists.length-1?'disabled':'')+'>↓</button></div>').join('');
    const archive=person && (names.includes(person.name)||records.some(r=>r.artist===person.name))?repertoire(person.name):'';
    return '<div class="hall-user"><section><div class="mono">ARTIST RANKING</div><h2>我的艺人榜</h2><form id="add-hall-artist"><label class="sr" for="hall-name">艺人名字</label><input id="hall-name" required placeholder="输入艺人名字"><button class="outline">＋ 添加</button></form>'+rows+'</section><section class="songpanel"><div class="mono">SONG BATTLE</div><h2>'+esc(person?.name||'')+' 的歌曲对决</h2>'+(person?'<label for="hall-songs">候选歌单 · 每行一首</label><textarea id="hall-songs" rows="4" placeholder="填入至少两首想比较的歌">'+esc(person.songs)+'</textarea>'+launchButton(songScope(),'开始歌曲 Battle')+archive:'先添加一位艺人。')+'</section></div><section class="livepanel"><div class="mono">LIVE BATTLE</div><h2>最喜欢的现场</h2><div class="livechoices">'+records.map(r=>'<label><input type="checkbox" data-live-id="'+esc(r.id)+'" '+(state.hiddenShows.includes(r.id)?'':'checked')+'> '+esc(r.artist)+' · '+esc(r.title)+'</label>').join('')+'</div>'+launchButton('live','开始演出 Battle')+'</section><p id="hall-storage">'+esc(storageWarning||'榜单与对决保存在此浏览器')+'</p>';
  }
  function treeView(result) {
    return '<div class="tree-scroll" tabindex="0" aria-label="晋级树，可横向滚动"><div class="bracket-tree">'+result.rounds.map((round,i)=>'<section><h4>第 '+(i+1)+' 轮</h4><div class="branch-col">'+round.map(m=>'<div class="branch-slot"><div class="branch-pair">'+[m.a,m.b].map(x=>'<span class="'+(x&&x===m.winner?'won':'')+'">'+esc(x?x.label:x===null?'轮空':'待晋级')+'</span>').join('')+'</div></div>').join('')+'</div></section>').join('')+'<section><h4>冠军</h4><div class="branch-col"><b class="branch-final">'+esc(result.champion?.label||'待决出')+'</b></div></section></div></div>';
  }
  function drawPopup() {
    const session=state.sessions[scope];
    const name=scope==='live'?'最喜欢的现场':(artist()?.name||'')+' 的第一首歌';
    let content='';
    if(!session||replacing){
      const count=fieldFor(scope).length;
      content='<p>'+ (count<2?'至少选两项才能开赛。歌曲可在歌单中逐行添加，演出可在列表中勾选。':'本轮有 '+count+' 个候选，按列表顺序配对。'+(replacing?'开始后会替换上一次赛果。':''))+'</p>'+(count>=2?'<button class="btn hot" data-fight="begin">开始本轮</button>':'')+(replacing?'<button class="outline" data-fight="cancel">保留原赛果</button>':'');
    }else{
      const result=bracket(session), next=result.next;
      content=result.champion?'<div class="winnercard"><small>我的第一名</small><h3>'+esc(result.champion.label)+'</h3></div>':
        '<p>第 '+next.round+' 轮 · 选你更喜欢的一项</p><div class="versus">'+[next.a,next.b].map((x,i)=>'<button data-vote="'+esc(x.id)+'"><small>'+ (i?'B':'A') +' 面</small><b>'+esc(x.label)+'</b></button>').join('<i>VS</i>')+'</div>';
      content+=treeView(result)+'<div class="actions"><button class="outline" data-fight="undo" '+(!session.picks.length?'disabled':'')+'>撤回上一票</button><button class="outline" data-fight="restart">重开对决</button></div>';
    }
    popup.innerHTML='<div class="drawerhead"><span class="mono red">UNDERGROUND / BATTLE</span><button class="close" data-fight="close" aria-label="关闭对决">×</button></div><h2 id="battle-heading">'+esc(name)+'</h2>'+content;
    if(!popup.open)popup.showModal();
    popup.querySelector('[data-vote], [data-fight="begin"], [data-fight="close"]')?.focus({preventScroll:true});
  }
  document.addEventListener('submit',e=>{
    if(e.target.id!=='add-hall-artist')return;
    e.preventDefault();
    const input=e.target.querySelector('input'), name=input.value.trim();
    if(!name)return;
    let person=state.artists.find(a=>a.name.toLowerCase()===name.toLowerCase());
    if(!person){person={id:crypto.randomUUID(),name,songs:''};state.artists.push(person);}
    active=person.id; save();render();
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='hall-songs'){artist().songs=e.target.value;save();}
  });
  document.addEventListener('change',e=>{
    const id=e.target.dataset.liveId;
    if(id){state.hiddenShows=state.hiddenShows.filter(value=>value!==id);if(!e.target.checked)state.hiddenShows.push(id);save();}
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const d=b.dataset;
    if(d.pickartist){active=d.pickartist;render();}
    if(d.move){
      const from=state.artists.findIndex(a=>a.id===d.id),to=from+Number(d.move);
      if(from<0||to<0||to>=state.artists.length)return;
      [state.artists[from],state.artists[to]]=[state.artists[to],state.artists[from]];
      save();render();
    }
    if(d.duel){scope=d.duel;replacing=false;drawPopup();}
    if(!popup.contains(b))return;
    if(d.fight==='close'){popup.close();return;}
    if(d.fight==='restart')replacing=true;
    if(d.fight==='cancel')replacing=false;
    if(d.fight==='begin'){
      const field=fieldFor(scope);if(field.length<2)return;
      state.sessions[scope]={field,picks:[]};replacing=false;
    }
    const session=state.sessions[scope];
    if(d.fight==='undo')session?.picks.pop();
    if(d.vote!==undefined&&session){
      const next=bracket(session).next;
      if(next&&[next.a.id,next.b.id].includes(d.vote))session.picks.push(d.vote);
    }
    save();render();drawPopup();
  });
  return panel;
}
