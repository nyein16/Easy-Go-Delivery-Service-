// Part 3: Data Entry, Create Delivery, My Deliveries, History, Online Shops
(() => {
const {sb, t, esc, $, toast, PAGES, I18N} = window.EG;
Object.assign(I18N.en, {customer:'Customer name',deliveryAddr:'Delivery address',date:'Delivery date',photoAmt:'Photo amount',delAmt:'Delivery amount',notes:'Notes',photo:'Parcel photo (optional)',
 shop:'Online shop',category:'Category',create:'Save parcel',edit:'Edit',del:'Delete',cancel:'Cancel parcel',search:'Search name, phone, shop, ID',all:'All statuses',from:'From',to:'To',go:'Search',
 saved:'Saved',confirmDel:'Delete this parcel record?',confirmCancel:'Cancel this parcel?',none:'No parcels found',required:'Please fill all required fields.',viewPhoto:'View photo',
 total:'Parcels',addShop:'Add new shop',createShop:'Create shop account',approve:'Approve / Activate',suspend:'Suspend',deactivate:'Deactivate',noShops:'No shops yet',
 s_pending:'Pending',s_assigned:'Assigned',s_out_for_delivery:'Out for delivery',s_complete:'Complete',s_return:'Return',s_cancelled:'Cancelled',s_active:'Active',s_suspended:'Suspended',s_inactive:'Inactive',close:'Close',way:'Rider',
 chooseShop:'Choose a shop',pwShort2:'Password must be 8+ characters.'});
Object.assign(I18N.my, {customer:'ဖောက်သည်အမည်',deliveryAddr:'ပို့ရမည့်လိပ်စာ',date:'ပို့ဆောင်မည့်ရက်',photoAmt:'ဓာတ်ပုံတန်ဖိုး',delAmt:'ပို့ခ',notes:'မှတ်ချက်',photo:'ပါဆယ်ဓာတ်ပုံ (မထည့်လည်းရ)',
 shop:'အွန်လိုင်းဆိုင်',category:'အမျိုးအစား',create:'ပါဆယ်သိမ်းရန်',edit:'ပြင်ရန်',del:'ဖျက်ရန်',cancel:'ပါဆယ်ပယ်ဖျက်ရန်',search:'အမည်၊ ဖုန်း၊ ဆိုင်၊ ID ရှာရန်',all:'အခြေအနေအားလုံး',from:'မှ',to:'အထိ',go:'ရှာရန်',
 saved:'သိမ်းပြီးပါပြီ',confirmDel:'ဤပါဆယ်မှတ်တမ်းကို ဖျက်မလား?',confirmCancel:'ဤပါဆယ်ကို ပယ်ဖျက်မလား?',none:'ပါဆယ် မတွေ့ပါ',required:'လိုအပ်သောအချက်များ ဖြည့်ပါ။',viewPhoto:'ဓာတ်ပုံကြည့်ရန်',
 total:'ပါဆယ်',addShop:'ဆိုင်အသစ်ထည့်ရန်',createShop:'ဆိုင်အကောင့်ဖန်တီးရန်',approve:'ခွင့်ပြု / ဖွင့်ရန်',suspend:'ရပ်ဆိုင်းရန်',deactivate:'ပိတ်ရန်',noShops:'ဆိုင် မရှိသေးပါ',
 s_pending:'စောင့်ဆိုင်း',s_assigned:'Rider သတ်မှတ်ပြီး',s_out_for_delivery:'ပို့ဆောင်နေဆဲ',s_complete:'ပြီးစီး',s_return:'ပြန်လာ',s_cancelled:'ပယ်ဖျက်',s_active:'အသုံးပြုနေ',s_suspended:'ရပ်ဆိုင်း',s_inactive:'ပိတ်ထား',close:'ပိတ်ရန်',way:'Rider',
 chooseShop:'ဆိုင်ရွေးပါ',pwShort2:'စကားဝှက် ၈ လုံးအထက် ရှိရမည်။'});
const P = () => window.EG.profile;
const has = k => P().role === 'admin' || (P().role === 'staff' && P().permissions?.[k] === true);
const today = () => new Date().toLocaleDateString('en-CA');
const daysAgo = n => new Date(Date.now() - n * 864e5).toLocaleDateString('en-CA');
const money = n => Number(n || 0).toLocaleString();
const STATUS = ['pending','assigned','out_for_delivery','complete','return','cancelled'];
const CATS = ['normal','MDY','NPT','Gate','Royal','return','not_found'];
const CATLABEL = {normal:'Normal',MDY:'MDY',NPT:'NPT',Gate:'Gate',Royal:'Royal','return':'Return parcel',not_found:'မတွေ့ပါဆယ် (Not found)'};
const isStaffSide = () => P().role === 'admin' || P().role === 'staff';

function compress(file){ return new Promise(res => { const img = new Image(); img.onload = () => { const s = Math.min(1, 1280 / img.width);
  const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  c.toBlob(b => res(b), 'image/jpeg', .75); }; img.src = URL.createObjectURL(file); }); }

async function shopOptions(){ const {data} = await sb.from('shops').select('id,shop_name').order('shop_name'); return data || []; }

// ---------- parcel form (create or edit) ----------
async function parcelForm(host, {row = null, onDone}){
  const shops = isStaffSide() ? await shopOptions() : [];
  const r = row || {};
  host.innerHTML = `<form id="pf" class="grid2" novalidate>
   ${isStaffSide() ? `<div class="full"><label>${t('shop')} *</label><select id="f-shop" ${row?'disabled':''}><option value="">${t('chooseShop')}</option>${shops.map(s=>`<option value="${s.id}" ${r.shop_id===s.id?'selected':''}>${esc(s.shop_name)}</option>`).join('')}</select></div>` : ''}
   <div><label>${t('customer')} *</label><input id="f-name" value="${esc(r.customer_name)}"></div>
   <div><label>${t('phone')} *</label><input id="f-phone" type="tel" value="${esc(r.phone)}"></div>
   <div class="full"><label>${t('deliveryAddr')} *</label><input id="f-addr" value="${esc(r.address)}"></div>
   <div><label>${t('date')}</label><input id="f-date" type="date" value="${r.delivery_date || today()}"></div>
   ${isStaffSide() ? `<div><label>${t('category')}</label><select id="f-cat">${CATS.map(c=>`<option value="${c}" ${r.category===c?'selected':''}>${CATLABEL[c]}</option>`).join('')}</select></div>` : '<div></div>'}
   <div><label>${t('photoAmt')}</label><input id="f-pa" type="number" min="0" step="any" inputmode="decimal" value="${r.photo_amount ?? 0}"></div>
   <div><label>${t('delAmt')}</label><input id="f-da" type="number" min="0" step="any" inputmode="decimal" value="${r.delivery_amount ?? 0}"></div>
   <div class="full"><label>${t('notes')}</label><textarea id="f-notes" rows="2">${esc(r.notes)}</textarea></div>
   <div class="full"><label>${t('photo')}</label><input id="f-file" type="file" accept="image/*"></div>
   <div class="full"><button class="btn" id="f-save" type="submit">${t('create')}</button><div id="f-msg"></div></div></form>`;
  $('#pf', host).onsubmit = async e => { e.preventDefault(); const v = id => $('#'+id, host)?.value.trim(); const btn = $('#f-save', host);
    const shopId = isStaffSide() ? (row ? row.shop_id : v('f-shop')) : P().id;
    const pa = Number(v('f-pa') || 0), da = Number(v('f-da') || 0);
    if (!shopId || !v('f-name') || !v('f-phone') || !v('f-addr') || !(pa >= 0) || !(da >= 0)) { $('#f-msg', host).innerHTML = `<div class="msg">${t('required')}</div>`; return; }
    btn.disabled = true;
    try {
      const rec = {customer_name:v('f-name'), phone:v('f-phone'), address:v('f-addr'), delivery_date:v('f-date') || today(), photo_amount:pa, delivery_amount:da, notes:v('f-notes') || null};
      if (isStaffSide()) rec.category = v('f-cat');
      const file = $('#f-file', host).files[0];
      if (file) { const blob = await compress(file); const path = `${shopId}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.jpg`;
        const up = await sb.storage.from('parcel-photos').upload(path, blob, {contentType:'image/jpeg'}); if (up.error) throw up.error; rec.photo_url = path; }
      const q = row ? sb.from('deliveries').update(rec).eq('id', row.id) : sb.from('deliveries').insert({...rec, shop_id: shopId});
      const {error} = await q; if (error) throw error;
      toast(t('saved')); if (!row) $('#pf', host).reset(); onDone && onDone();
    } catch (err) { $('#f-msg', host).innerHTML = `<div class="msg">${esc(err.message)}</div>`; }
    btn.disabled = false; };
}

// ---------- parcel list with search / filters ----------
function listView(host, {editable = false, cancelable = false, days = 30}){
  host.innerHTML = `<div class="bar"><input id="q" placeholder="${t('search')}"><select id="st"><option value="">${t('all')}</option>${STATUS.map(s=>`<option value="${s}">${t('s_'+s)}</option>`).join('')}</select>
   <input id="d1" type="date" value="${daysAgo(days)}" title="${t('from')}"><input id="d2" type="date" value="${today()}" title="${t('to')}"><button class="btn" id="go">${t('go')}</button></div><div id="sum"></div><div id="res"><div class="center"><div class="spinner"></div></div></div>`;
  const canEdit = editable && has('edit_delivery'), canDel = editable && has('delete_delivery');
  async function load(){
    let q = sb.from('deliveries').select('*, shops(shop_name), riders(rider_name)').eq('is_deleted', false)
      .gte('delivery_date', $('#d1', host).value).lte('delivery_date', $('#d2', host).value).order('delivery_date', {ascending:false}).order('created_at', {ascending:false}).limit(500);
    if ($('#st', host).value) q = q.eq('status', $('#st', host).value);
    const {data, error} = await q; if (error) { $('#res', host).innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; }
    const term = $('#q', host).value.trim().toLowerCase();
    const rows = (data || []).filter(d => !term || [d.delivery_no, d.customer_name, d.phone, d.shops?.shop_name, d.delivery_date].some(x => String(x || '').toLowerCase().includes(term)));
    // photo amount and delivery amount are totalled separately, never mixed
    $('#sum', host).innerHTML = `<div class="sum"><span>${t('total')}: ${rows.length}</span><span>${t('photoAmt')}: ${money(rows.reduce((a,d)=>a+Number(d.photo_amount),0))}</span><span>${t('delAmt')}: ${money(rows.reduce((a,d)=>a+Number(d.delivery_amount),0))}</span></div>`;
    $('#res', host).innerHTML = rows.length ? rows.map(d => `<div class="dcard" data-id="${d.id}"><div class="r1"><b>${esc(d.delivery_no)}</b><span class="st st-${d.status}">${t('s_'+d.status)}</span></div>
      <div>${esc(d.customer_name)} · ${esc(d.phone)}</div><div class="sub" style="margin:2px 0">${esc(d.address)}</div>
      <div class="r3"><span>${t('photoAmt')}: ${money(d.photo_amount)}</span><span>${t('delAmt')}: ${money(d.delivery_amount)}</span></div>
      <div class="sub" style="margin:0">${esc(d.shops?.shop_name)} · ${esc(d.delivery_date)}${d.category!=='normal'?' · '+esc(CATLABEL[d.category]):''}${d.riders?.rider_name?' · '+t('way')+': '+esc(d.riders.rider_name):''}</div>
      ${d.notes?`<div class="sub" style="margin:4px 0 0">${esc(d.notes)}</div>`:''}
      <div class="acts">${d.photo_url?`<button class="mini" data-a="photo">${t('viewPhoto')}</button>`:''}${canEdit?`<button class="mini gold" data-a="edit">${t('edit')}</button>`:''}${canDel?`<button class="mini red" data-a="del">${t('del')}</button>`:''}${cancelable&&d.status==='pending'?`<button class="mini red" data-a="cancel">${t('cancel')}</button>`:''}</div></div>`).join('') : `<div class="empty">${t('none')}</div>`;
    const byId = Object.fromEntries(rows.map(d => [d.id, d]));
    host.querySelectorAll('.dcard [data-a]').forEach(b => b.onclick = async () => { const d = byId[b.closest('.dcard').dataset.id], a = b.dataset.a;
      if (a === 'photo') { const {data:u, error:e} = await sb.storage.from('parcel-photos').createSignedUrl(d.photo_url, 120); return e ? toast(e.message) : window.open(u.signedUrl, '_blank'); }
      if (a === 'edit') return openEdit(d, load);
      if (!confirm(a === 'del' ? t('confirmDel') : t('confirmCancel'))) return;
      const {error} = await sb.from('deliveries').update(a === 'del' ? {is_deleted:true} : {status:'cancelled'}).eq('id', d.id);
      error ? toast(error.message) : (toast(t('saved')), load()); });
  }
  $('#go', host).onclick = load; $('#q', host).oninput = load; load();
}
function openEdit(row, done){
  const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="card"><h2>${esc(row.delivery_no)}</h2><div id="ef"></div><button class="btn ghost" id="x">${t('close')}</button></div>`;
  document.body.appendChild(m); $('#x', m).onclick = () => m.remove(); parcelForm($('#ef', m), {row, onDone: () => { m.remove(); done(); }});
}

// ---------- Online Shops management ----------
async function shopsPage(v){
  const canAdd = has('shop_management'), isAdmin = P().role === 'admin';
  v.innerHTML = `${canAdd?`<div class="card wide" style="margin-bottom:12px"><h2>${t('addShop')}</h2><form id="sf" class="grid2" novalidate>
   <div><label>${t('shopName')} *</label><input id="s-n"></div><div><label>${t('ownerName')}</label><input id="s-o"></div><div><label>${t('phone')}</label><input id="s-p" type="tel"></div><div><label>${t('email')} *</label><input id="s-e" type="email"></div>
   <div class="full"><label>${t('address')}</label><input id="s-a"></div><div class="full"><label>${t('password')} *</label><input id="s-pw" type="password" autocomplete="new-password"><button class="btn" type="submit">${t('createShop')}</button><div id="s-m"></div></div></form></div>`:''}<div id="sl"></div>`;
  async function load(){
    const {data, error} = await sb.from('shops').select('*, profiles(status,email)').order('shop_name');
    if (error) { $('#sl', v).innerHTML = `<div class="msg">${esc(error.message)}</div>`; return; }
    $('#sl', v).innerHTML = data.length ? data.map(s => `<div class="dcard" data-id="${s.id}"><div class="r1"><b>${esc(s.shop_name)}</b><span class="st st-${s.profiles?.status}">${t('s_'+s.profiles?.status)}</span></div>
      <div class="sub" style="margin:2px 0">${esc(s.owner_name)} · ${esc(s.phone)} · ${esc(s.profiles?.email)}</div><div class="sub" style="margin:0">${esc(s.address)}</div>
      ${isAdmin?`<div class="acts"><button class="mini gold" data-s="active">${t('approve')}</button><button class="mini" data-s="suspended">${t('suspend')}</button><button class="mini red" data-s="inactive">${t('deactivate')}</button></div>`:''}</div>`).join('') : `<div class="empty">${t('noShops')}</div>`;
    v.querySelectorAll('[data-s]').forEach(b => b.onclick = async () => { const {error:e} = await sb.from('profiles').update({status:b.dataset.s}).eq('id', b.closest('.dcard').dataset.id); e ? toast(e.message) : (toast(t('saved')), load()); });
  }
  if (canAdd) $('#sf', v).onsubmit = async e => { e.preventDefault(); const g = id => $('#'+id, v).value.trim(); const m = $('#s-m', v);
    if (!g('s-n') || !g('s-e')) { m.innerHTML = `<div class="msg">${t('required')}</div>`; return; } if ($('#s-pw', v).value.length < 8) { m.innerHTML = `<div class="msg">${t('pwShort2')}</div>`; return; }
    const {data, error} = await sb.functions.invoke('create-user', {body:{role:'shop', shop_name:g('s-n'), full_name:g('s-o') || g('s-n'), phone:g('s-p'), email:g('s-e'), address:g('s-a'), password:$('#s-pw', v).value}});
    let msg = error ? error.message : data?.error; if (error?.context?.json) { try { msg = (await error.context.json()).error || msg; } catch {} }
    if (msg) { m.innerHTML = `<div class="msg">${esc(msg)}</div>`; return; } toast(t('saved')); $('#sf', v).reset(); m.innerHTML = ''; load(); };
  load();
}

// ---------- register pages ----------
PAGES.entry = v => { v.innerHTML = `<div class="card wide" style="margin-bottom:12px"><h2>${t('n_entry')}</h2><div id="form"></div></div><div id="lst"></div>`;
  const reload = () => listView($('#lst', v), {editable:true}); parcelForm($('#form', v), {onDone: reload}); reload(); };
PAGES.create = v => { v.innerHTML = `<div class="card wide"><h2>${t('n_create')}</h2><div id="form"></div></div>`; parcelForm($('#form', v), {}); };
PAGES.deliveries = v => listView(v, {cancelable:true});
PAGES.history = v => listView(v, {editable:false, days:90});
PAGES.shops = shopsPage;
if (window.EG.route && window.EG.profile) window.EG.route();
})();
