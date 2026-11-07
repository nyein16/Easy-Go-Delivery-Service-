// Part 4: Rider Management, Rider Assignment, Rider pages, simple stats dashboard
(() => {
const {sb, t, esc, $, toast, PAGES, I18N} = window.EG;
Object.assign(I18N.en, {addRider:'Add rider',createRider:'Create rider account',riderName:'Rider name',vehicle:'Vehicle',ways:'Ways',details:'Parcels',noRiders:'No riders yet',
 assignBtn:'Assign selected',wayNo:'Way / trip name (optional)',pickRider:'Choose rider',pickParcels:'Select parcels first',assignedN:'Parcels assigned',selectAll:'Select all',noneToAssign:'No parcels to assign',
 start:'Start delivery',markComplete:'Mark complete',markReturn:'Mark return',confirmSt:'Update this parcel status?',noWays:'No assigned parcels',call:'Call',st:'Status',
 dTotal:'Total parcels',dToday:'Today',dPhoto:'Photo amount (total)',dDel:'Delivery amount (total)'});
Object.assign(I18N.my, {addRider:'Rider ထည့်ရန်',createRider:'Rider အကောင့်ဖန်တီးရန်',riderName:'Rider အမည်',vehicle:'ယာဉ်',ways:'Way အရေအတွက်',details:'ပါဆယ်များ',noRiders:'Rider မရှိသေးပါ',
 assignBtn:'ရွေးထားသည်များ သတ်မှတ်ရန်',wayNo:'Way / ခရီးစဉ်အမည် (မထည့်လည်းရ)',pickRider:'Rider ရွေးပါ',pickParcels:'ပါဆယ်များကို အရင်ရွေးပါ',assignedN:'သတ်မှတ်ပြီးပါဆယ်',selectAll:'အားလုံးရွေးရန်',noneToAssign:'သတ်မှတ်စရာ ပါဆယ် မရှိပါ',
 start:'ပို့ဆောင်ရန် စတင်ပါ',markComplete:'ပြီးစီးကြောင်းမှတ်ရန်',markReturn:'ပြန်လာကြောင်းမှတ်ရန်',confirmSt:'ဤပါဆယ် အခြေအနေကို ပြောင်းမလား?',noWays:'သတ်မှတ်ထားသော ပါဆယ် မရှိပါ',call:'ခေါ်ရန်',st:'အခြေအနေ',
 dTotal:'ပါဆယ်စုစုပေါင်း',dToday:'ယနေ့',dPhoto:'ဓာတ်ပုံတန်ဖိုး (စုစုပေါင်း)',dDel:'ပို့ခ (စုစုပေါင်း)'});
const P = () => window.EG.profile;
const has = k => P().role === 'admin' || (P().role === 'staff' && P().permissions?.[k] === true);
const today = () => new Date().toLocaleDateString('en-CA');
const ago = n => new Date(Date.now() - n * 864e5).toLocaleDateString('en-CA');
const mstart = () => { const d = new Date(); d.setDate(1); return d.toLocaleDateString('en-CA'); };
const money = n => Number(n || 0).toLocaleString();
const sum = (a, k) => a.reduce((x, d) => x + Number(d[k] || 0), 0);
const spin = '<div class="center"><div class="spinner"></div></div>';
function modal(html){ const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="card">${html}<button class="btn ghost" id="x">${t('close')}</button></div>`; document.body.appendChild(m); $('#x', m).onclick = () => m.remove(); return m; }
async function invoke(body){ const {data, error} = await sb.functions.invoke('create-user', {body}); let msg = error ? error.message : data?.error;
  if (error?.context?.json) { try { msg = (await error.context.json()).error || msg; } catch {} } return msg; }
const pcard = (d, extra = '') => `<div class="dcard" data-id="${d.id}"><div class="r1"><b>${esc(d.delivery_no)}</b><span class="st st-${d.status}">${t('s_'+d.status)}</span></div>
  <div>${esc(d.customer_name)} · <a class="lnk" href="tel:${esc(d.phone)}">${esc(d.phone)}</a></div><div class="sub" style="margin:2px 0">${esc(d.address)}</div>
  <div class="r3"><span>${t('photoAmt')}: ${money(d.photo_amount)}</span><span>${t('delAmt')}: ${money(d.delivery_amount)}</span></div>
  <div class="sub" style="margin:0">${esc(d.shops?.shop_name)} · ${esc(d.delivery_date)}${d.way_no?' · '+esc(d.way_no):''}</div>${d.notes?`<div class="sub" style="margin:4px 0 0">${esc(d.notes)}</div>`:''}${extra}</div>`;

// ---------- Rider Management ----------
async function ridersPage(v){
  const canAdd = has('rider_management'), isAdmin = P().role === 'admin';
  v.innerHTML = `${canAdd?`<div class="card wide" style="margin-bottom:12px"><h2>${t('addRider')}</h2><form id="rf" class="grid2" novalidate>
   <div><label>${t('riderName')} *</label><input id="r-n"></div><div><label>${t('phone')}</label><input id="r-p" type="tel"></div><div><label>${t('email')} *</label><input id="r-e" type="email"></div><div><label>${t('vehicle')}</label><input id="r-v"></div>
   <div class="full"><label>${t('address')}</label><input id="r-a"></div><div class="full"><label>${t('password')} *</label><input id="r-pw" type="password" autocomplete="new-password"><button class="btn" type="submit">${t('createRider')}</button><div id="r-m"></div></div></form></div>`:''}
   <div class="bar"><input id="d1" type="date" value="${mstart()}"><input id="d2" type="date" value="${today()}"><button class="btn" id="go">${t('go')}</button></div><div id="rl">${spin}</div>`;
  async function load(){
    const [r, d] = await Promise.all([sb.from('riders').select('*, profiles(status,email)').order('rider_name'),
      sb.from('deliveries').select('id,rider_id,status,photo_amount,delivery_amount').eq('is_deleted', false).not('rider_id', 'is', null).gte('delivery_date', $('#d1', v).value).lte('delivery_date', $('#d2', v).value).limit(5000)]);
    if (r.error) { $('#rl', v).innerHTML = `<div class="msg">${esc(r.error.message)}</div>`; return; }
    const by = {}; (d.data || []).forEach(x => (by[x.rider_id] ||= []).push(x));
    $('#rl', v).innerHTML = r.data.length ? r.data.map(x => { const a = by[x.id] || [];
      return `<div class="dcard" data-id="${x.id}"><div class="r1"><b>${esc(x.rider_name)}</b><span class="st st-${x.profiles?.status}">${t('s_'+x.profiles?.status)}</span></div>
      <div class="sub" style="margin:2px 0">${esc(x.phone)} · ${esc(x.profiles?.email)}${x.vehicle?' · '+esc(x.vehicle):''}</div>
      <div class="r3"><span>${t('ways')}: ${a.length}</span><span>${t('photoAmt')}: ${money(sum(a,'photo_amount'))}</span><span>${t('delAmt')}: ${money(sum(a,'delivery_amount'))}</span></div>
      <div class="sub" style="margin:0">${['assigned','out_for_delivery','complete','return'].map(s => t('s_'+s)+': '+a.filter(y => y.status === s).length).join(' · ')}</div><div class="det"></div>
      <div class="acts"><button class="mini" data-a="det">${t('details')}</button>${has('rider_management')?`<button class="mini gold" data-a="edit">${t('edit')}</button>`:''}${isAdmin?`<button class="mini" data-a="active">${t('approve')}</button><button class="mini red" data-a="inactive">${t('deactivate')}</button>`:''}</div></div>`; }).join('') : `<div class="empty">${t('noRiders')}</div>`;
    const byId = Object.fromEntries(r.data.map(x => [x.id, x]));
    v.querySelectorAll('#rl [data-a]').forEach(b => b.onclick = async () => { const card = b.closest('.dcard'), id = card.dataset.id, a = b.dataset.a;
      if (a === 'det') { const box = $('.det', card); box.innerHTML = spin;
        const {data, error} = await sb.from('deliveries').select('*, shops(shop_name)').eq('rider_id', id).eq('is_deleted', false).gte('delivery_date', $('#d1', v).value).lte('delivery_date', $('#d2', v).value).order('delivery_date', {ascending:false}).limit(300);
        box.innerHTML = error ? `<div class="msg">${esc(error.message)}</div>` : (data.length ? data.map(x => pcard(x)).join('') : `<div class="empty">${t('none')}</div>`); return; }
      if (a === 'edit') { const x = byId[id]; const m = modal(`<h2>${esc(x.rider_name)}</h2><label>${t('riderName')}</label><input id="e-n" value="${esc(x.rider_name)}"><label>${t('phone')}</label><input id="e-p" value="${esc(x.phone)}"><label>${t('vehicle')}</label><input id="e-v" value="${esc(x.vehicle)}"><label>${t('address')}</label><input id="e-a" value="${esc(x.address)}"><button class="btn" id="e-s">${t('save')}</button>`);
        $('#e-s', m).onclick = async () => { const {error} = await sb.from('riders').update({rider_name:$('#e-n', m).value.trim(), phone:$('#e-p', m).value.trim(), vehicle:$('#e-v', m).value.trim(), address:$('#e-a', m).value.trim()}).eq('id', id);
          error ? toast(error.message) : (m.remove(), toast(t('saved')), load()); }; return; }
      const {error} = await sb.from('profiles').update({status:a}).eq('id', id); error ? toast(error.message) : (toast(t('saved')), load()); });
  }
  if (canAdd) $('#rf', v).onsubmit = async e => { e.preventDefault(); const g = id => $('#'+id, v).value.trim(), m = $('#r-m', v);
    if (!g('r-n') || !g('r-e')) { m.innerHTML = `<div class="msg">${t('required')}</div>`; return; } if ($('#r-pw', v).value.length < 8) { m.innerHTML = `<div class="msg">${t('pwShort2')}</div>`; return; }
    const msg = await invoke({role:'rider', full_name:g('r-n'), phone:g('r-p'), email:g('r-e'), vehicle:g('r-v'), address:g('r-a'), password:$('#r-pw', v).value});
    if (msg) { m.innerHTML = `<div class="msg">${esc(msg)}</div>`; return; } toast(t('saved')); $('#rf', v).reset(); m.innerHTML = ''; load(); };
  $('#go', v).onclick = load; load();
}

// ---------- Rider Assignment (Admin + authorized Staff only) ----------
async function assignPage(v){
  if (!has('rider_assignment')) { v.innerHTML = `<div class="msg">No permission</div>`; return; }
  v.innerHTML = `<div class="card wide" style="margin-bottom:12px"><div class="grid2"><div><label>${t('pickRider')}</label><select id="rd"></select></div><div><label>${t('wayNo')}</label><input id="wy"></div></div>
   <div class="bar" style="margin-top:10px"><select id="st"><option value="pending">${t('s_pending')}</option><option value="assigned">${t('s_assigned')}</option></select><input id="d1" type="date" value="${ago(7)}"><input id="d2" type="date" value="${today()}"><button class="btn" id="go">${t('go')}</button></div>
   <button class="btn alt" id="all" style="margin-top:6px">${t('selectAll')}</button><button class="btn" id="as">${t('assignBtn')}</button><div id="am"></div></div><div id="al">${spin}</div>`;
  const {data: rs} = await sb.from('riders').select('id,rider_name,profiles(status)').order('rider_name');
  $('#rd', v).innerHTML = `<option value="">${t('pickRider')}</option>` + (rs || []).filter(r => r.profiles?.status === 'active').map(r => `<option value="${r.id}">${esc(r.rider_name)}</option>`).join('');
  async function load(){ const {data, error} = await sb.from('deliveries').select('*, shops(shop_name), riders(rider_name)').eq('is_deleted', false).eq('status', $('#st', v).value).gte('delivery_date', $('#d1', v).value).lte('delivery_date', $('#d2', v).value).order('delivery_date').limit(500);
    if (error) { $('#al', v).innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; }
    $('#al', v).innerHTML = data.length ? data.map(d => pcard(d, `<label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" class="ck" value="${d.id}" style="width:auto"> ${d.riders?.rider_name ? esc(d.riders.rider_name) : t('s_pending')}</label>`)).join('') : `<div class="empty">${t('noneToAssign')}</div>`; }
  $('#go', v).onclick = load; $('#st', v).onchange = load;
  $('#all', v).onclick = () => v.querySelectorAll('.ck').forEach(c => c.checked = true);
  $('#as', v).onclick = async () => { const ids = [...v.querySelectorAll('.ck:checked')].map(c => c.value), m = $('#am', v);
    if (!$('#rd', v).value || !ids.length) { m.innerHTML = `<div class="msg">${!$('#rd', v).value ? t('pickRider') : t('pickParcels')}</div>`; return; }
    const {data, error} = await sb.rpc('assign_deliveries', {p_ids:ids, p_rider:$('#rd', v).value, p_way:$('#wy', v).value.trim()});
    if (error) { m.innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; } m.innerHTML = `<div class="msg ok">${t('assignedN')}: ${data}</div>`; load(); };
  load();
}

// ---------- Rider pages ----------
const RS = {assigned:['out_for_delivery','complete','return'], out_for_delivery:['complete','return']};
const RBTN = {out_for_delivery:'start', complete:'markComplete', 'return':'markReturn'};
async function ways(v){
  v.innerHTML = spin;
  const {data, error} = await sb.from('deliveries').select('*, shops(shop_name)').eq('is_deleted', false).in('status', ['assigned','out_for_delivery']).order('way_no').order('delivery_date').limit(500);
  if (error) { v.innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; }
  v.innerHTML = `<div class="sum"><span>${t('ways')}: ${data.length}</span><span>${t('photoAmt')}: ${money(sum(data,'photo_amount'))}</span><span>${t('delAmt')}: ${money(sum(data,'delivery_amount'))}</span></div>` +
    (data.length ? data.map(d => pcard(d, `<div class="acts">${RS[d.status].map(s => `<button class="mini ${s==='complete'?'gold':s==='return'?'red':''}" data-s="${s}">${t(RBTN[s])}</button>`).join('')}</div>`)).join('') : `<div class="empty">${t('noWays')}</div>`);
  v.querySelectorAll('[data-s]').forEach(b => b.onclick = async () => { if (!confirm(t('confirmSt'))) return;
    const {error:e} = await sb.from('deliveries').update({status:b.dataset.s}).eq('id', b.closest('.dcard').dataset.id); e ? toast(e.message) : (toast(t('saved')), ways(v)); });
}
async function parcels(v){
  v.innerHTML = `<div class="bar"><input id="q" placeholder="${t('search')}"><select id="st"><option value="">${t('all')}</option>${['assigned','out_for_delivery','complete','return'].map(s=>`<option value="${s}">${t('s_'+s)}</option>`).join('')}</select></div><div id="pl">${spin}</div>`;
  const {data, error} = await sb.from('deliveries').select('*, shops(shop_name)').eq('is_deleted', false).order('delivery_date', {ascending:false}).limit(500);
  if (error) { $('#pl', v).innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; }
  const draw = () => { const q = $('#q', v).value.trim().toLowerCase(), s = $('#st', v).value;
    const rows = data.filter(d => (!s || d.status === s) && (!q || [d.delivery_no, d.customer_name, d.phone, d.shops?.shop_name].some(x => String(x || '').toLowerCase().includes(q))));
    $('#pl', v).innerHTML = rows.length ? rows.map(d => pcard(d)).join('') : `<div class="empty">${t('none')}</div>`; };
  $('#q', v).oninput = draw; $('#st', v).onchange = draw; draw();
}
// Dashboard for Shop and Rider (RLS already limits rows to their own parcels). Photo and delivery amounts are never mixed.
async function dash(v){
  v.innerHTML = spin;
  const {data, error} = await sb.from('deliveries').select('status,photo_amount,delivery_amount,delivery_date').eq('is_deleted', false).limit(5000);
  if (error) { v.innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; }
  const td = data.filter(d => d.delivery_date === today()), S = ['pending','assigned','out_for_delivery','complete','return','cancelled'];
  v.innerHTML = `<div class="sum"><span>${t('dTotal')}: ${data.length}</span><span>${t('dToday')}: ${td.length}</span><span>${t('dPhoto')}: ${money(sum(data,'photo_amount'))}</span><span>${t('dDel')}: ${money(sum(data,'delivery_amount'))}</span></div>` +
    S.map(s => `<div class="dcard"><div class="r1"><span class="st st-${s}">${t('s_'+s)}</span><b style="font-size:20px">${data.filter(d => d.status === s).length}</b></div></div>`).join('');
}
PAGES.riders = ridersPage; PAGES.assign = assignPage; PAGES.ways = ways; PAGES.parcels = parcels; PAGES.dashboard = dash;
})();
