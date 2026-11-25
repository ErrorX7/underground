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
    sessions: {}
  });
  let state;
  try { state = JSON.parse(localStorage.getItem(key)) || initial(); }
  catch { state = initial(); }
  let active = state.artists[0]?.id;
  let mode = 'songs';
  let hiddenShows = new Set();
  let replacing = false;
  let storageWarning = '';
  function enterBattle() {
    mode = 'songs';
    hiddenShows.clear();
    replacing = false;
  }
  const artist = () => state.artists.find(person=>person.id===active);
  const songScope = () => 'songs-'+active;
  function save() {
    try { localStorage.setItem(key,JSON.stringify(state)); storageWarning=''; }
    catch { storageWarning='浏览器未能保存，这次选择仅在当前页面有效。'; }
    const status=document.querySelector('#hall-storage');
    if(status)status.textContent=storageWarning||'榜单与对决保存在此浏览器';
  }
  function fieldFor(id) {
    if (id==='live') return records.filter(r=>!hiddenShows.has(r.id)).map(r=>({id:r.id,label:r.artist+' · '+r.title+' · '+r.date}));
    const songs=artist()?.songs || '';
    const lines=[...new Set(songs.split(/\r?\n/).map(s=>s.trim()).filter(Boolean))];
    return lines.map((label,i)=>({id:String(i),label}));
  }
  function panel() {
    const person=artist();
    const rows=state.artists.map((a,i)=>'<div class="rankline"><button data-pickartist="'+esc(a.id)+'" class="rankname '+(a.id===active?'selected':'')+'"><small>'+String(i+1).padStart(2,'0')+'</small><b>'+esc(a.name)+'</b></button><button data-move="-1" data-id="'+esc(a.id)+'" aria-label="上移 '+esc(a.name)+'" '+(i===0?'disabled':'')+'>↑</button><button data-move="1" data-id="'+esc(a.id)+'" aria-label="下移 '+esc(a.name)+'" '+(i===state.artists.length-1?'disabled':'')+'>↓</button></div>').join('');
    const archive=person && (names.includes(person.name)||records.some(r=>r.artist===person.name))?repertoire(person.name):'';
    return '<div class="hall-user"><section><div class="mono">ARTIST RANKING</div><h2>我的艺人榜</h2><form id="add-hall-artist"><label class="sr" for="hall-name">艺人名字</label><input id="hall-name" required placeholder="输入艺人名字"><button class="outline">＋ 添加</button></form>'+rows+'</section><section><div class="mono">ARTIST ARCHIVE</div><h2>'+esc(person?.name||'艺人档案')+'</h2>'+(archive||'<p>还没有收录这位艺人的专辑或演出。</p>')+'</section></div>';
  }
  function treeView(result) {
    return '<div class="tree-scroll" tabindex="0" aria-label="晋级树，可横向滚动"><div class="bracket-tree">'+result.rounds.map((round,i)=>'<section><h4>第 '+(i+1)+' 轮</h4><div class="branch-col">'+round.map(m=>'<div class="branch-slot"><div class="branch-pair">'+[m.a,m.b].map(x=>'<span class="'+(x&&x===m.winner?'won':'')+'">'+esc(x?x.label:x===null?'轮空':'待晋级')+'</span>').join('')+'</div></div>').join('')+'</div></section>').join('')+'<section><h4>冠军</h4><div class="branch-col"><b class="branch-final">'+esc(result.champion?.label||'待决出')+'</b></div></section></div></div>';
  }
  const scope = () => mode==='songs' ? songScope() : 'live';
  function battlePanel() {
    const person=artist(), session=state.sessions[scope()];
    const field=fieldFor(scope());
    const controls='<div class="arena-modes" role="group" aria-label="选择对决类型">'+
      [['songs','歌曲对决'],['live','演出对决']].map(([id,label])=>'<button data-battle-mode="'+id+'" aria-pressed="'+(mode===id)+'">'+label+'</button>').join('')+'</div>';
    const roster=mode==='songs'?
      '<label for="battle-artist">选择艺人</label><select id="battle-artist">'+state.artists.map(a=>'<option value="'+esc(a.id)+'" '+(a.id===active?'selected':'')+'>'+esc(a.name)+'</option>').join('')+'</select>'+
      (person?'<details class="battle-roster" '+(!field.length&&!session?'open':'')+'><summary>候选歌单 · <span data-field-count>'+field.length+'</span> 首</summary><label for="hall-songs">每行一首，开赛时自动抽签配对</label><textarea id="hall-songs" rows="5">'+esc(person.songs)+'</textarea></details>':''):
      '<details class="battle-roster"><summary>参赛现场 · <span data-field-count>'+field.length+'</span> / '+records.length+' 场</summary><div class="livechoices">'+records.map(r=>'<label><input type="checkbox" data-live-id="'+esc(r.id)+'" '+(hiddenShows.has(r.id)?'':'checked')+'> '+esc(r.artist)+' · '+esc(r.title)+'</label>').join('')+'</div></details>';
    let body='';
    if(!session||replacing){
      body='<button class="btn hot" data-fight="begin" '+(field.length<2?'disabled':'')+'>'+ (replacing?'确认重开':'抽签开赛')+' ↗</button><p class="battle-hint" data-minimum '+(field.length>=2?'hidden':'')+'>'+ (mode==='songs'?'填入至少两首歌即可开赛。':'至少需要两场演出。')+'</p>'+
        (replacing?'<button class="outline" data-fight="cancel">保留原赛果</button>':'');
    }else{
      const result=bracket(session), next=result.next;
      body=result.champion?'<div class="winnercard"><small>我的第一名</small><h2>'+esc(result.champion.label)+'</h2></div>':
        '<h2 class="match-heading">第 '+next.round+' 轮 · 你更喜欢哪一个？</h2><div class="versus">'+[next.a,next.b].map((x,i)=>'<button data-vote="'+esc(x.id)+'"><small>'+ (i?'B':'A') +' 面</small><b>'+esc(x.label)+'</b></button>').join('<i>VS</i>')+'</div>';
      body+=treeView(result)+'<div class="actions"><button class="outline" data-fight="undo" '+(!session.picks.length?'disabled':'')+'>撤回上一票</button><button class="outline" data-fight="restart">重新抽签</button></div>';
    }
    return '<div class="arena">'+controls+'<div class="arena-setup">'+roster+'</div><section class="arena-match" aria-label="本次对决">'+body+'</section><p class="battle-hint" id="hall-storage">'+esc(storageWarning||'榜单与对决保存在此浏览器')+'</p></div>';
  }
  function updateCount(){
    const n=fieldFor(scope()).length;
    document.querySelector('[data-field-count]').textContent=n;
    const begin=document.querySelector('[data-fight="begin"]');
    if(begin){begin.disabled=n<2;document.querySelector('[data-minimum]').hidden=n>=2;}
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
    if(e.target.id==='hall-songs'){artist().songs=e.target.value;save();updateCount();}
  });
  document.addEventListener('change',e=>{
    const id=e.target.dataset.liveId;
    if(id){if(e.target.checked)hiddenShows.delete(id);else hiddenShows.add(id);updateCount();}
    if(e.target.id==='battle-artist'){active=e.target.value;replacing=false;render();document.querySelector('#battle-artist').focus();}

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
    if(d.battleMode){
      if(mode!==d.battleMode){mode=d.battleMode;hiddenShows.clear();replacing=false;render();document.querySelector('[data-battle-mode="'+mode+'"]').focus();}
      return;
    }
    if(!d.fight && d.vote===undefined)return;
    if(d.fight==='restart')replacing=true;
    if(d.fight==='cancel')replacing=false;
    if(d.fight==='begin'){
      const field=fieldFor(scope());if(field.length<2)return;
      for(let i=field.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[field[i],field[j]]=[field[j],field[i]];}
      state.sessions[scope()]={field,picks:[]};replacing=false;
    }
    const session=state.sessions[scope()];
    if(d.fight==='undo')session?.picks.pop();
    if(d.vote!==undefined&&session){
      const next=bracket(session).next;
      if(next&&[next.a.id,next.b.id].includes(d.vote))session.picks.push(d.vote);
    }
    save();render();
    document.querySelector('[data-vote], [data-fight="begin"], [data-fight="undo"]')?.focus({preventScroll:true});
  });
  return {panel,battlePanel,enterBattle};
}
