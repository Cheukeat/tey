const $ = id => document.getElementById(id);
const audio = $('audio');
let tracks = [], current = -1, liked = new Set(), playlists = {}, currentPlaylist = 'all', shuffle = false, repeat = false;
const coverGradients = [
 'linear-gradient(145deg,#587d3b,#18291b)','linear-gradient(145deg,#5a497c,#1c1b35)',
 'linear-gradient(145deg,#a15c45,#35201b)','linear-gradient(145deg,#347d7b,#142c30)',
 'linear-gradient(145deg,#927238,#302716)','linear-gradient(145deg,#8b4d75,#311a2b)'
];
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2200)}
function fmt(s){if(!Number.isFinite(s)||s<0)return '0:00';return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')}
function activeTracks(){if(currentPlaylist==='liked')return tracks.filter(t=>liked.has(t.id));if(playlists[currentPlaylist])return tracks.filter(t=>playlists[currentPlaylist].has(t.id));return tracks}
function renderTracks(){
 const list=activeTracks();$('trackCount').textContent=list.length+' track'+(list.length===1?'':'s');
 const grid=$('trackGrid');
 if(!list.length){grid.innerHTML='<div class="empty-card"><div class="empty-icon">♫</div><h3>'+ (currentPlaylist==='liked'?'No liked songs yet':'Your next favorite starts here')+'</h3><p>Add audio files from your device to start listening. Your files stay in this browser session.</p><button class="btn-light" id="emptyUpload2">Choose audio files</button></div>';$('emptyUpload2').onclick=chooseFiles;return}
 grid.innerHTML=list.map((t,i)=>`<article class="track-card" data-id="${t.id}"><div class="cover" style="background:${coverGradients[t.color%coverGradients.length]}">♪</div><button class="card-play" data-play="${t.id}" aria-label="Play ${esc(t.name)}">▶</button><h3>${esc(t.name)}</h3><p>${esc(t.artist)}</p></article>`).join('');
 grid.querySelectorAll('.track-card').forEach(card=>card.addEventListener('click',e=>{if(!e.target.closest('.card-play'))playId(card.dataset.id)}));
 grid.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();playId(b.dataset.play)}));
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderPlaylists(){
 const el=$('playlistList');
 el.innerHTML='<button class="playlist-link" data-playlist="liked">♥ &nbsp; Liked Songs</button>'+Object.keys(playlists).map(name=>`<button class="playlist-link" data-playlist="${esc(name)}">▤ &nbsp; ${esc(name)}</button>`).join('');
 el.querySelectorAll('[data-playlist]').forEach(b=>b.addEventListener('click',()=>{currentPlaylist=b.dataset.playlist;renderTracks();document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));}));
}
function updateNow(){
 const t=tracks[current];
 if(!t)return;
 $('playerTitle').textContent=t.name;$('playerArtist').textContent=t.artist;$('sideTitle').textContent=t.name;$('sideArtist').textContent=t.artist;
 $('tinyCover').style.background=coverGradients[t.color\%coverGradients.length];$('largeCover').style.background=coverGradients[t.color%coverGradients.length];
 $('likeBtn').textContent=liked.has(t.id)?'♥':'♡';$('likeBtn').classList.toggle('liked',liked.has(t.id));
 $('lyricsInput').value=t.lyrics\vert{}\vert{}'';$('lyricsText').textContent=t.lyrics||"Lyrics aren't automatically available for local files. Add your own lyrics below if you have them.";
 $('playBtn').textContent=audio.paused?'▶':'Ⅱ';$('duration').textContent=fmt(audio.duration);
 renderQueue();
}
function playId(id){const index=tracks.findIndex(t=>t.id===id);if(index<0)return;current=index;audio.src=tracks[index].url;audio.load();audio.play().then(()=>{$('playBtn').textContent='Ⅱ';}).catch(()=>toast('Tap play to start this track'));updateNow();renderTracks()}
function next(){if(!tracks.length)return;let idx;if(shuffle){idx=Math.floor(Math.random()*tracks.length)}else{idx=(current+1)%tracks.length}playId(tracks[idx].id)}
function prev(){if(!tracks.length)return;if(audio.currentTime>3){audio.currentTime=0;return}playId(tracks[(current-1+tracks.length)%tracks.length].id)}
function chooseFiles(){$('fileInput').click()}
function importFiles(files){let added=0;[...files].filter(f=>f.type.startsWith('audio/')).forEach(f=>{const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);tracks.push({id,name:f.name.replace(/\.[^.]+$/,''),artist:'Local audio',file:f,url:URL.createObjectURL(f),color:tracks.length,lyrics:''});added++});if(added){currentPlaylist='all';renderTracks();toast('Added '+added+' track'+(added===1?'':'s'));if(current<0)playId(tracks[0].id)}else toast('Choose supported audio files');$('fileInput').value=''}$('fileInput').addEventListener('change',e=>importFiles(e.target.files));
['uploadTop','heroUpload','emptyUpload','calloutUpload'].forEach(id=>$(id).addEventListener('click',chooseFiles));$('demoBtn').addEventListener('click',()=>{document.querySelector('.section-title').scrollIntoView({behavior:'smooth'});toast('Add your own tracks to begin listening')});
$('playBtn').addEventListener('click',()=>{if(current<0){chooseFiles();return}if(audio.paused)audio.play().then(()=>{$('playBtn').textContent='Ⅱ'}).catch(()=>toast('Choose a track first'));else audio.pause()});
audio.addEventListener('play',()=>{$('playBtn').textContent='Ⅱ'});
audio.addEventListener('pause',()=>{$('playBtn').textContent='▶'});
audio.addEventListener('ended',()=>{if(repeat){audio.currentTime=0;audio.play()}else next()});
audio.addEventListener('timeupdate',()=>{if(Number.isFinite(audio.duration))$('seekBar').value=audio.currentTime/audio.duration*100;$('currentTime').textContent=fmt(audio.currentTime);$('duration').textContent=fmt(audio.duration)});
$('seekBar').addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number($('seekBar').value)/100});
$('volumeBar').addEventListener('input',()=>audio.volume=Number($('volumeBar').value));audio.volume=.8;
$('nextBtn').addEventListener('click',next);$('prevBtn').addEventListener('click',prev);$('shuffleBtn').addEventListener('click',()=>{shuffle=!shuffle;$('shuffleBtn').classList.toggle('selected',shuffle);toast('Shuffle '+(shuffle?'on':'off'))});$('repeatBtn').addEventListener('click',()=>{repeat=!repeat;$('repeatBtn').classList.toggle('selected',repeat);toast('Repeat '+(repeat?'on':'off'))});$('likeBtn').addEventListener('click',()=>{if(current<0)return;const id=tracks[current].id;if(liked.has(id))liked.delete(id);else liked.add(id);updateNow();renderTracks()});
$('newPlaylist').addEventListener('click',()=>{const name=prompt('Name your playlist');if(!name\vert{}\vert{}!name.trim())return;if(playlists[name.trim()]){toast('That playlist already exists');return}playlists[name.trim()]=new Set();renderPlaylists();toast('Playlist created')});$('saveLyrics').addEventListener('click',()=>{if(current<0){toast('Play a track first');return}tracks[current].lyrics=$('lyricsInput').value;$('lyricsText').textContent=tracks[current].lyrics||'No lyrics saved yet.';toast('Lyrics saved for this session')});
function renderQueue(){const upcoming=tracks.filter((t,i)=>i!==current);$('queueCount').textContent=upcoming.length+' tracks';$('queueList').innerHTML=upcoming.length?upcoming.slice(0,8).map(t=>`<div class="queue-item" data-id="${t.id}"><div class="queue-mini">♪</div><div><b>${esc(t.name)}</b><span>${esc(t.artist)}</span></div></div>`).join(''):'<p class="muted-text">Your queue is empty.</p>';$('queueList').querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',()=>playId(el.dataset.id)))}
$('queueToggle').addEventListener('click',()=>{const panel=$('rightPanel');panel.style.display=panel.style.display==='block'?'none':'block';if(panel.style.display==='block'){panel.style.position='fixed';panel.style.zIndex='6';panel.style.width='280px';panel.style.top='0';panel.style.bottom='90px';panel.style.boxShadow='-20px 0 60px #0009'}});
$('lyricsToggle').addEventListener('click',()=>{$('rightPanel').style.display='block';$('rightPanel').scrollIntoView({behavior:'smooth'});toast('Lyrics panel opened')});
$('closePanel').addEventListener('click',()=>{$('rightPanel').style.display='none'});
document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b===btn));if(btn.dataset.view==='home'){currentPlaylist='all';renderTracks()}else if(btn.dataset.view==='library'){currentPlaylist='all';renderTracks();toast('Your local library')}else{const query=prompt('Search your imported tracks');if(query!==null){const q=query.toLowerCase();document.querySelectorAll('.track-card').forEach(c=>c.style.display=c.textContent.toLowerCase().includes(q)?'':'none');toast('Search results for: '+query)}}}));
$('backBtn').addEventListener('click',()=>{currentPlaylist='all';renderTracks()});$('forwardBtn').addEventListener('click',()=>toast('You are on the latest page'));
renderTracks();renderPlaylists();renderQueue();
