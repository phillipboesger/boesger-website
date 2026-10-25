
(() => {
  'use strict';
  const state = window.BDPrivacy || {choice:null};
  const box = document.getElementById('bd-privacy');
  const options = document.getElementById('bd-options');
  const membership = document.getElementById('bd-membership');
  const surveys = document.getElementById('bd-surveys');
  const nonce = document.querySelector('script[data-bd-controller]').nonce;
  function open(details = false) {
    box.hidden = false; options.hidden = !details;
    membership.checked = Boolean(state.choice && state.choice.membership);
    surveys.checked = Boolean(state.choice && state.choice.surveys);
    document.getElementById(details ? 'bd-membership' : 'bd-reject').focus({preventScroll:true});
  }
  function save(member, survey) {
    const value = `v1-m${Number(member)}-s${Number(survey)}-t${Math.floor(Date.now()/1000)}`;
    try { document.cookie = `bd_privacy=${value}; Max-Age=15552000; Path=/; Secure; SameSite=Lax`; } catch (_) {}
    // Reload cancels already-running optional scripts on withdrawal.
    location.reload();
  }
  document.getElementById('bd-reject').addEventListener('click', () => save(false,false));
  document.getElementById('bd-accept').addEventListener('click', () => save(true,true));
  document.getElementById('bd-details').addEventListener('click', () => {options.hidden = false;membership.focus();});
  document.getElementById('bd-save').addEventListener('click', () => save(membership.checked,surveys.checked));
  document.querySelectorAll('.bd-privacy-open').forEach(button => button.addEventListener('click',()=>open(true)));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-portal],a[href*="#/portal/"]');
    if (link && !(state.choice && state.choice.membership)) {
      event.preventDefault(); event.stopImmediatePropagation();
      history.replaceState(null,'',link.getAttribute('href').replace(/^.*(?=#\/portal\/)/,''));
      open(true);
    }
  },true);
  function script(src, attributes = {}) {
    return new Promise((resolve,reject) => {
      const element = document.createElement('script');
      for (const [key,value] of Object.entries(attributes)) element.setAttribute(key,value);
      element.nonce = nonce; element.src = src;
      element.onload = resolve; element.onerror = reject;
      document.body.append(element);
    });
  }
  function restore(original, source) {
    const attributes = Object.fromEntries([...original.attributes].filter(a=>a.name.startsWith('data-') || a.name==='crossorigin').map(a=>[a.name,a.value]));
    return script(source || original.src,attributes);
  }
  async function services() {
    // Necessary local display/search functions are self-hosted.
    const search = document.querySelector('script[data-sodo-search]');
    if (search) {
      const attrs = Object.fromEntries([...search.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value]));
      attrs['data-styles'] = '/assets/vendor/sodo-search.css';
      await script('/assets/vendor/sodo-search.min.js',attrs);
    }
    const cards = [...document.scripts].find(s=>new URL(s.src || location.href).pathname==='/public/cards.min.js');
    if (cards) await restore(cards);
    if (state.choice && state.choice.membership) {
      await script('https://js.stripe.com/v3/');
      for (const original of [...document.scripts].filter(s=>s.src.startsWith('https://cdn.jsdelivr.net/ghost/portal@') || s.src.startsWith('https://cdn.jsdelivr.net/ghost/comments-ui@'))) await restore(original);
    }
    document.querySelectorAll('iframe[data-tally-src]').forEach(frame => {
      if (state.choice && state.choice.surveys) {
        frame.dataset.bdLoaded='true'; frame.src=frame.dataset.tallySrc;
      } else {
        const panel=document.createElement('section'); panel.className='bd-survey-placeholder';
        const info=document.createElement('p'); info.textContent='Externe Umfrage gesperrt. Tally erhält erst nach deiner Einwilligung deine IP-Adresse und technische Browserdaten. Antworten sendest du anschließend freiwillig direkt an Tally. Details stehen in der Datenschutzerklärung.';
        const button=document.createElement('button');button.type='button';button.textContent='Datenschutz-Einstellungen für die Umfrage öffnen';button.addEventListener('click',()=>open(true));
        panel.append(info,button);frame.before(panel);
      }
    });
    if (state.choice && state.choice.surveys && document.querySelector('iframe[data-tally-src]')) await script('https://tally.so/widgets/embed.js');
  }
  const ready = () => {
    if (!state.choice) open();
    services().catch(()=>{document.getElementById('bd-service-status').textContent='Ein Dienst konnte nicht geladen werden. Du kannst den Blog weiterhin lesen und mich über das Kontaktformular erreichen.';});
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready,{once:true}); else ready();
})();
