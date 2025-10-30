(async () => {
  // CONFIGURA QUI
  const owner = 'TombaccoTommaso'; // es. 'mionome'
  const repo  = 'FinalWebsite';      // es. 'sito'
  const path  = 'verbali'; // es. 'assets/verbali' (no trailing slash)
  const branch = 'main'; // o 'master' o altra branch

  // Se vuoi usare un token personale (migliore per molti accessi),
  // inseriscilo qui. Attenzione: non mettere token in repo pubblica.
  const GITHUB_TOKEN = ''; // lascia vuoto per accesso anonimo

  const targetDivId = 'verbali_files'; // id del div dove mettere la lista

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;

  const headers = GITHUB_TOKEN ? { Authorization: 'token ' + GITHUB_TOKEN } : {};

  try {
    const res = await fetch(apiUrl, { headers });
    if (!res.ok) throw new Error(`GitHub API errore: ${res.status} ${res.statusText}`);

    const items = await res.json();
    if (!Array.isArray(items)) throw new Error('La risposta non è una lista (controlla path/branch).');

    // Filtra solo file .pdf (case-insensitive), e prendi name, size, download_url
    const pdfs = items
      .filter(it => it.type === 'file' && /\.pdf$/i.test(it.name))
      .map(it => ({ name: it.name, size: it.size, download_url: it.download_url, path: it.path }));

    // Ordina alfabeticamente
    pdfs.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    const container = document.getElementById(targetDivId);
    if (!container) {
      console.error(`Elemento con id "${targetDivId}" non trovato.`);
      return;
    }

    // Svuota contenuto e costruisci lista
    container.innerHTML = '';
    if (pdfs.length === 0) {
      container.textContent = 'Nessun PDF trovato in questa cartella.';
      return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';

    const humanFileSize = (size) => {
      if (size === 0) return '0 B';
      const i = Math.floor(Math.log(size) / Math.log(1024));
      const units = ['B','KB','MB','GB','TB'];
      return (size / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + units[i];
    };

    pdfs.forEach(p => {
      const li = document.createElement('li');
      li.style.margin = '6px 0';
      li.style.padding = '6px';
      li.style.borderRadius = '6px';
      li.style.display = 'flex';
      li.style.gap = '10px';
      li.style.alignItems = 'center';

      // Link al raw (download/view)
      // download_url è già in formato raw.githubusercontent (se pubblico); usalo.
      const a = document.createElement('a');
      a.href = p.download_url;
      a.textContent = p.name;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.textDecoration = 'none';
      a.style.fontWeight = '600';

      const meta = document.createElement('small');
      meta.textContent = ` — ${humanFileSize(p.size)}`;
      meta.style.color = '#666';
      meta.style.marginLeft = '6px';

      li.appendChild(a);
      li.appendChild(meta);

      ul.appendChild(li);
    });

    container.appendChild(ul);

  } catch (err) {
    console.error(err);
    const container = document.getElementById(targetDivId);
    if (container) {
      container.innerHTML = `<div style="color:crimson">Errore: ${err.message}</div>`;
    }
  }
})();