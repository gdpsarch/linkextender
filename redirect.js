const SUPABASE_URL = 'https://cszndxbezfmczyblirbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0JIdgChXkZJsHWlHFwwTYA_bjmVBLpU';
const BASE_PATH    = '/linkextender/';
const HOME_URL     = 'https://gdpsarch.github.io/linkextender/';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const spinner    = document.getElementById('spinner');
const statusText = document.querySelector('.status-text');
const urlText    = document.getElementById('urlText');
const errorState = document.getElementById('errorState');
const errorMsg   = document.getElementById('errorMsg');

const rawPath = window.location.pathname;

let path = rawPath;
if (path.startsWith(BASE_PATH)) {
  path = path.slice(BASE_PATH.length);
}
path = path.replace(/\/$/, '');

async function redirect() {
  if (!path || path === '') {
    window.location.replace(HOME_URL);
    return;
  }

  try {
    const { data, error } = await db
      .from('links')
      .select('url')
      .eq('path', path)
      .single();

    if (error || !data) {
      showError('посилання не знайдено або видалено');
      return;
    }

    urlText.textContent = '→ ' + data.url;
    urlText.style.display = 'block';

    setTimeout(() => {
      window.location.replace(data.url);
    }, 500);

  } catch (err) {
    console.error(err);
    showError('помилка підключення до бази даних');
  }
}

function showError(msg) {
  spinner.style.display    = 'none';
  statusText.style.display = 'none';
  errorMsg.textContent     = msg;
  errorState.classList.add('visible');
}

redirect();