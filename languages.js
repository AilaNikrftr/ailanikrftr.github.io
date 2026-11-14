// Languages: tap a language to open a small card of facts about it.
(function () {
  const LANGS = {
    fa: {
      name: 'Persian', native: 'فارسی', family: 'Indo-European → Iranian',
      facts: [
        'An Iranian language of the Indo-European family, and therefore distantly related to English.',
        'Spoken by approximately 110 million people. It is known as Dari in Afghanistan and Tajik in Tajikistan.',
        'Written right to left in a modified Arabic script.',
        'It has no grammatical gender. A single pronoun, او, means both "he" and "she."',
        'The language has changed so little that texts from a thousand years ago remain readable today.'
      ]
    },
    az: {
      name: 'Azerbaijani', native: 'Azərbaycanca', family: 'Turkic → Oghuz',
      facts: [
        'A language of the Oghuz branch of the Turkic family.',
        'Spoken by approximately 24 million native speakers.',
        'North Azerbaijani has used the Latin script since 1991, while South Azerbaijani continues to use the Perso-Arabic script.',
        'Its alphabet changed three times in the twentieth century: Arabic, then Latin, then Cyrillic, then Latin again.',
        'It is mutually intelligible with Turkish to a high degree.'
      ]
    },
    en: {
      name: 'English', native: 'English', family: 'Indo-European → West Germanic',
      facts: [
        'A West Germanic language of the Indo-European family, closely related to German and Dutch.',
        'Spoken by approximately 1.5 billion people, including native speakers and those who use it as an additional language.',
        'The Oxford English Dictionary contains more than 500,000 entries.',
        'Roughly a third of its vocabulary is of French origin.'
      ]
    },
    tr: {
      name: 'Turkish', native: 'Türkçe', family: 'Turkic → Oghuz',
      facts: [
        'A language of the Oghuz branch of the Turkic family.',
        'Spoken by approximately 88 million people, 82 million of them native speakers.',
        'It adopted the Latin alphabet in 1928, replacing the Arabic script.',
        'Words are formed by adding suffixes to a root, so a single word can express an entire sentence.',
        'It has no grammatical gender. The pronoun <i>o</i> means "he," "she" and "it."'
      ]
    },
    fr: {
      name: 'French', native: 'Français', family: 'Indo-European → Romance',
      facts: [
        'A Romance language descended from Latin.',
        'Spoken by approximately 312 million people, the majority of them in Africa.',
        'Some numbers are counted in twenties. Eighty is <i>quatre-vingts</i>, literally "four twenties."',
        'The Académie française, founded in 1635, has 40 members and oversees the standard language.'
      ]
    },
    de: {
      name: 'German', native: 'Deutsch', family: 'Indo-European → West Germanic',
      facts: [
        'A West Germanic language of the Indo-European family, and English\'s closest major relative.',
        'Spoken by approximately 134 million people.',
        'All nouns are capitalized.',
        'Words can be combined without limit to form new compound nouns.',
        'It has three grammatical genders, which do not always follow meaning. <i>Das Mädchen</i> ("the girl") is neuter.'
      ]
    }
  };

  const box = document.querySelector('.langs');
  const pop = document.getElementById('langpop');
  if (!box || !pop) return;
  const buttons = [...box.querySelectorAll('.lang')];
  const title = pop.querySelector('.lp-t');
  const level = pop.querySelector('.lp-lv');
  const fam = pop.querySelector('.lp-fam');
  const list = pop.querySelector('.lp-facts');
  const closeBtn = pop.querySelector('.lp-x');
  let current = null;

  // level meter: six steps, A1 → C2
  buttons.forEach(b => {
    const n = parseFloat(b.dataset.n) || 0;
    const m = b.querySelector('.meter');
    for (let i = 1; i <= 6; i++) {
      const s = document.createElement('i');
      if (i <= n) s.className = 'on';
      else if (i - 0.5 <= n) s.className = 'half';
      m.appendChild(s);
    }
  });

  function open(btn) {
    const d = LANGS[btn.dataset.lang];
    if (!d) return;
    if (current) current.setAttribute('aria-expanded', 'false');
    current = btn;
    btn.setAttribute('aria-expanded', 'true');
    title.textContent = d.name;
    level.textContent = btn.querySelector('.lv').textContent;
    fam.textContent = d.family;
    list.innerHTML = d.facts.map(f => '<li>' + f + '</li>').join('');
    btn.after(pop); // the card opens right under the row that was tapped
    pop.hidden = false;
    // re-trigger the entrance animation
    pop.style.animation = 'none'; void pop.offsetWidth; pop.style.animation = '';
  }

  function close(returnFocus) {
    if (!current) return;
    pop.hidden = true;
    current.setAttribute('aria-expanded', 'false');
    if (returnFocus) current.focus();
    current = null;
  }

  buttons.forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    if (current === b) close(false); else open(b);
  }));
  closeBtn.addEventListener('click', () => close(true));
  pop.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', () => close(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(true); });
})();
