(() => {
const C = window.EASYGO, app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = (s, r = document) => r.querySelector(s);

// ---------- language (UI preference only; real data lives in Supabase) ----------
const I18N = {
 en:{login:'Log in',signup:'Create shop account',forgot:'Forgot password?',email:'Email',password:'Password',shopName:'Shop name',ownerName:'Owner name',phone:'Phone number',address:'Shop address',
  logout:'Log out',back:'Back to log in',send:'Send reset link',resetSent:'Reset link sent. Check your email.',newPw:'New password',savePw:'Save password',
  signedUp:'Account created. Confirm your email, then wait for Admin approval.',pendingT:'Waiting for approval',pendingM:'Your account is waiting for Admin approval.',
  suspM:'Your account is suspended or deactivated. Contact EASY GO.',setupAdmin:'Set up first Admin',adminOk:'Admin created. Welcome!',
  welcome:'Welcome',role:'Role',soon:'This page is built in the next parts.',notes:'Notifications',noNotes:'No notifications yet',readAll:'Mark all read',
  fullName:'Full name',save:'Save',saved:'Saved',chgPw:'Change password',pwShort:'Password must be at least 8 characters.',cfg:'App is not connected yet. Paste Project URL and anon key into js/config.js.',
  n_overview:'Overview',n_history:'Data History',n_entry:'Data Entry',n_create:'Create Delivery',n_assign:'Rider Assignment',n_waycheck:'Way Check',n_shops:'Online Shops',n_riders:'Rider Management',
  n_staff:'Staff Management',n_perms:'Staff Permissions',n_finance:'Finance',n_reports:'Reports',n_notifications:'Notifications',n_settings:'Settings',n_dashboard:'Dashboard',
  n_deliveries:'My Deliveries',n_ways:'My Assigned Ways',n_parcels:'My Parcels',n_account:'My Account'},
 my:{login:'ဝင်ရန်',signup:'ဆိုင်အကောင့်ဖွင့်ရန်',forgot:'စကားဝှက်မေ့နေလား?',email:'အီးမေးလ်',password:'စကားဝှက်',shopName:'ဆိုင်အမည်',ownerName:'ပိုင်ရှင်အမည်',phone:'ဖုန်းနံပါတ်',address:'ဆိုင်လိပ်စာ',
  logout:'ထွက်ရန်',back:'ဝင်ရန်စာမျက်နှာသို့',send:'Reset link ပို့ရန်',resetSent:'Reset link ပို့ပြီးပါပြီ။ အီးမေးလ်ကို စစ်ပါ။',newPw:'စကားဝှက်အသစ်',savePw:'စကားဝှက်သိမ်းရန်',
  signedUp:'အကောင့်ဖွင့်ပြီးပါပြီ။ အီးမေးလ်အတည်ပြုပြီး Admin ခွင့်ပြုချက်ကို စောင့်ပါ။',pendingT:'ခွင့်ပြုချက် စောင့်နေသည်',pendingM:'သင့်အကောင့်သည် Admin ခွင့်ပြုချက်ကို စောင့်နေပါသည်။',
  suspM:'သင့်အကောင့်ကို ရပ်ဆိုင်း/ပိတ်ထားပါသည်။ EASY GO ကို ဆက်သွယ်ပါ။',setupAdmin:'ပထမ Admin သတ်မှတ်ရန်',adminOk:'Admin ဖန်တီးပြီးပါပြီ။',
  welcome:'ကြိုဆိုပါတယ်',role:'အဆင့်',soon:'ဤစာမျက်နှာကို နောက်အပိုင်းများတွင် ဆောက်ပါမည်။',notes:'အသိပေးချက်များ',noNotes:'အသိပေးချက် မရှိသေးပါ',readAll:'အားလုံး ဖတ်ပြီးမှတ်ရန်',
  fullName:'အမည်အပြည့်အစုံ',save:'သိမ်းရန်',saved:'သိမ်းပြီးပါပြီ',chgPw:'စကားဝှက်ပြောင်းရန်',pwShort:'စကားဝှက်သည် အနည်းဆုံး ၈ လုံး ရှိရမည်။',cfg:'App ကို မချိတ်ရသေးပါ။ js/config.js ထဲ Project URL နှင့် anon key ထည့်ပါ။',
  n_overview:'ခြုံငုံကြည့်ရန်',n_history:'မှတ်တမ်းဟောင်း',n_entry:'ဒေတာထည့်ရန်',n_create:'ပို့ဆောင်မှုဖန်တီးရန်',n_assign:'Rider သတ်မှတ်ရန်',n_waycheck:'Way စစ်ရန်',n_shops:'အွန်လိုင်းဆိုင်များ',n_riders:'Rider စီမံခန့်ခွဲမှု',
  n_staff:'ဝန်ထမ်းစီမံခန့်ခွဲမှု',n_perms:'ဝန်ထမ်းခွင့်ပြုချက်',n_finance:'ဘဏ္ဍာရေး',n_reports:'အစီရင်ခံစာ',n_notifications:'အသိပေးချက်များ',n_settings:'ဆက်တင်',n_dashboard:'ဒက်ရှ်ဘုတ်',
  n_deliveries:'ကျွန်ုပ်၏ပို့ဆောင်မှုများ',n_ways:'ကျွန်ုပ်၏ Ways',n_parcels:'ကျွန်ုပ်၏ ပါဆယ်များ',n_account:'ကျွန်ုပ်၏အကောင့်'}
};
let lang = localStorage.getItem('eg_lang') || 'my';
const t = k => I18N[lang][k] ?? I18N.en[k] ?? k;
const setLang = () => { lang = lang === 'en' ? 'my' : 'en'; localStorage.setItem('eg_lang', lang); document.documentElement.lang = lang; start(); };
function toast(m){const e=$('#toast');e.textContent=m;e.style.display='block';clearTimeout(toast.x);toast.x=setTimeout(()=>e.style.display='none',3200);}

if (!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY) { app.innerHTML = `<div class="center"><div class="card"><img class="logo" src="logo.png" alt="EASY GO"><div class="msg">${t('cfg')}</div></div></div>`; return; }
const sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
let profile = null;

// ---------- navigation by role ----------
const NAV = {
 admin:['overview','history','entry','create','assign','waycheck','shops','riders','staff','perms','finance','reports','notifications','settings'],
 shop:['dashboard','create','deliveries','history','finance','notifications','account'],
 rider:['dashboard','ways','parcels','waycheck','history','notifications','account']
};
const STAFF_PERM = {overview:'dashboard',history:'data_history',entry:'data_entry',create:'create_delivery',assign:'rider_assignment',waycheck:'way_check',shops:'shop_management',riders:'rider_management',finance:'finance',reports:'reports'};
const ICON = {overview:'📊',dashboard:'📊',history:'🕘',entry:'📝',create:'➕',assign:'🛵',waycheck:'✅',shops:'🏪',riders:'🏍️',staff:'👥',perms:'🔐',finance:'💰',reports:'📑',notifications:'🔔',settings:'⚙️',deliveries:'📦',ways:'🗺️',parcels:'📦',account:'👤'};
function navFor(p){
 if (p.role === 'staff') { const ok = k => STAFF_PERM[k] ? p.permissions?.[STAFF_PERM[k]] === true : false;
   return [...Object.keys(STAFF_PERM).filter(ok), 'notifications', 'account']; }
 return NAV[p.role];
}

// ---------- auth screens ----------
function authScreen(mode = 'login', note = '', ok = false){
 const f = {
  login:`<label>${t('email')}</label><input id="email" type="email" autocomplete="email" required><label>${t('password')}</label><input id="pw" type="password" autocomplete="current-password" required><button class="btn" id="go">${t('login')}</button>`,
  signup:`<label>${t('shopName')}</label><input id="shop" required><label>${t('ownerName')}</label><input id="owner" required><label>${t('phone')}</label><input id="phone" type="tel" required><label>${t('address')}</label><input id="addr"><label>${t('email')}</label><input id="email" type="email" required><label>${t('password')}</label><input id="pw" type="password" autocomplete="new-password" required><button class="btn" id="go">${t('signup')}</button>`,
  forgot:`<label>${t('email')}</label><input id="email" type="email" required><button class="btn" id="go">${t('send')}</button>`
 }[mode];
 app.innerHTML = `<div class="center"><div class="card"><img class="logo" src="logo.png" alt="EASY GO"><h1>${t(mode)}</h1><p class="sub">EASY GO Delivery Management</p>${f}
  ${note ? `<div class="msg ${ok?'ok':''}">${esc(note)}</div>` : ''}
  <div class="links">${mode==='login'?`<button class="lnk" data-m="signup">${t('signup')}</button><button class="lnk" data-m="forgot">${t('forgot')}</button>`:`<button class="lnk" data-m="login">${t('back')}</button>`}<button class="lnk" id="lang">${lang==='en'?'မြန်မာ':'English'}</button></div></div></div>`;
 app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => authScreen(b.dataset.m));
 $('#lang').onclick = setLang;
 $('#go').onclick = async e => {
  const btn = e.target, v = id => $('#'+id)?.value.trim(); btn.disabled = true;
  try {
   if (mode === 'login') { const {data,error} = await sb.auth.signInWithPassword({email:v('email'),password:$('#pw').value}); if (error) throw error; return enter(); }
   if (mode === 'signup') { if ($('#pw').value.length < 8) throw new Error(t('pwShort'));
    const {error} = await sb.auth.signUp({email:v('email'),password:$('#pw').value,options:{data:{shop_name:v('shop'),owner_name:v('owner'),phone:v('phone'),address:v('addr')}}});
    if (error) throw error; return authScreen('login', t('signedUp'), true); }
   if (mode === 'forgot') { const {error} = await sb.auth.resetPasswordForEmail(v('email'),{redirectTo:location.origin+location.pathname}); if (error) throw error; return authScreen('login', t('resetSent'), true); }
  } catch (err) { authScreen(mode, err.message); }
 };
}
function recoveryScreen(){
 app.innerHTML = `<div class="center"><div class="card"><img class="logo" src="logo.png" alt="EASY GO"><h1>${t('newPw')}</h1><label>${t('newPw')}</label><input id="pw" type="password" autocomplete="new-password"><button class="btn" id="go">${t('savePw')}</button><div id="m"></div></div></div>`;
 $('#go').onclick = async () => { const pw = $('#pw').value; if (pw.length < 8) { $('#m').innerHTML = `<div class="msg">${t('pwShort')}</div>`; return; }
  const {error} = await sb.auth.updateUser({password:pw}); if (error) { $('#m').innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; } toast(t('saved')); enter(); };
}
function blockedScreen(session){
 const isOwner = session.user.email?.toLowerCase() === C.ADMIN_EMAIL.toLowerCase();
 app.innerHTML = `<div class="center"><div class="card"><img class="logo" src="logo.png" alt="EASY GO"><h1>${t('pendingT')}</h1>
  <p class="sub">${profile?.status==='pending'?t('pendingM'):t('suspM')}</p>
  ${isOwner?`<button class="btn alt" id="adm">${t('setupAdmin')}</button>`:''}<div id="m"></div><button class="btn ghost" id="out">${t('logout')}</button></div></div>`;
 $('#out').onclick = () => sb.auth.signOut().then(() => authScreen('login'));
 if (isOwner) $('#adm').onclick = async () => { const {error} = await sb.rpc('claim_first_admin');
  if (error) { $('#m').innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; } toast(t('adminOk')); enter(); };
}

// ---------- session + shell ----------
async function enter(){
 const {data:{session}} = await sb.auth.getSession(); if (!session) return authScreen('login');
 const {data,error} = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
 profile = data;
 if (error || !profile || profile.status !== 'active') return blockedScreen(session);
 shell();
}
async function shell(){
 const items = navFor(profile);
 app.innerHTML = `<div class="layout"><aside class="side" id="side"><img class="logo" src="logo.png" alt="EASY GO"><nav class="nav">${items.map(k=>`<a href="#/${k}" data-k="${k}"><span>${ICON[k]}</span>${t('n_'+k)}<span class="badge" id="b-${k}" hidden></span></a>`).join('')}</nav></aside>
  <div class="main"><header class="top"><button id="menu">☰</button><div class="grow" id="title"></div><span class="pill">${esc(profile.role)}</span><button id="lang">${lang==='en'?'မြန်မာ':'EN'}</button><button id="out">${t('logout')}</button></div></header><main id="view"></main></div></div>`;
 $('#menu').onclick = () => $('#side').classList.toggle('open');
 $('#side').onclick = e => { if (e.target.closest('a') || e.target.id === 'side') $('#side').classList.remove('open'); };
 $('#lang').onclick = setLang;
 $('#out').onclick = () => sb.auth.signOut().then(() => { profile = null; authScreen('login'); });
 window.onhashchange = route; route(); unreadBadge();
}
async function unreadBadge(){
 const {count} = await sb.from('notifications').select('id',{count:'exact',head:true}).eq('is_read',false);
 const b = $('#b-notifications'); if (b) { b.hidden = !count; b.textContent = count; }
}
function route(){
 if (!profile) return; const items = navFor(profile);
 let k = location.hash.startsWith('#/') ? location.hash.slice(2) : items[0]; if (!items.includes(k)) k = items[0];
 document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('on', a.dataset.k === k));
 $('#title').textContent = t('n_'+k);
 const view = $('#view'); view.innerHTML = '<div class="center"><div class="spinner"></div></div>';
 (PAGES[k] || soon)(view, k);
}

// ---------- pages built in Part 2 ----------
const soon = (v, k) => v.innerHTML = `<div class="card wide"><h2>${t('welcome')}, ${esc(profile.full_name || profile.email)}</h2><p class="sub">${t('role')}: ${esc(profile.role)}</p><div class="msg ok">${t('soon')}</div></div>`;
async function notifs(v){
 const {data,error} = await sb.from('notifications').select('*').order('created_at',{ascending:false}).limit(100);
 if (error) { v.innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; }
 v.innerHTML = `<div class="card wide"><button class="lnk" id="all">${t('readAll')}</button>${data.length ? data.map(n => `<div class="row" data-id="${n.id}"><span class="dot ${n.is_read?'read':''}"></span><div><b>${esc(n.title)}</b><div class="sub" style="margin:0">${esc(n.body)} · ${new Date(n.created_at).toLocaleString()}</div></div></div>`).join('') : `<div class="empty">${t('noNotes')}</div>`}</div>`;
 const mark = async (q) => { await q; unreadBadge(); };
 v.querySelectorAll('.row').forEach(r => r.onclick = async () => { await mark(sb.from('notifications').update({is_read:true}).eq('id', r.dataset.id)); r.querySelector('.dot').classList.add('read'); });
 $('#all').onclick = async () => { await mark(sb.from('notifications').update({is_read:true}).eq('is_read',false).eq('user_id',profile.id)); notifs(v); };
}
function account(v){
 v.innerHTML = `<div class="card wide"><h2>${t('n_account')}</h2><label>${t('email')}</label><input value="${esc(profile.email)}" disabled><label>${t('fullName')}</label><input id="fn" value="${esc(profile.full_name)}"><label>${t('phone')}</label><input id="ph" value="${esc(profile.phone)}"><button class="btn" id="sv">${t('save')}</button>
  <h2 style="margin-top:22px">${t('chgPw')}</h2><input id="np" type="password" autocomplete="new-password" placeholder="${t('newPw')}"><button class="btn alt" id="pw">${t('savePw')}</button></div>`;
 $('#sv').onclick = async () => { const {error} = await sb.from('profiles').update({full_name:$('#fn').value.trim(),phone:$('#ph').value.trim()}).eq('id',profile.id);
  if (error) return toast(error.message); profile.full_name = $('#fn').value.trim(); profile.phone = $('#ph').value.trim(); toast(t('saved')); };
 $('#pw').onclick = async () => { const p = $('#np').value; if (p.length < 8) return toast(t('pwShort')); const {error} = await sb.auth.updateUser({password:p}); toast(error ? error.message : t('saved')); };
}
const PAGES = { notifications: notifs, account };

// ---------- start ----------
sb.auth.onAuthStateChange(ev => { if (ev === 'PASSWORD_RECOVERY') setTimeout(recoveryScreen, 0); });
async function start(){ const {data:{session}} = await sb.auth.getSession(); if (!session) return authScreen('login'); enter(); }
start();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
