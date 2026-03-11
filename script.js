const SUPABASE_URL  = 'https://cszndxbezfmczyblirbj.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_0JIdgChXkZJsHWlHFwwTYA_bjmVBLpU';
const BASE_URL      = 'https://gdpsarch.github.io/linkextender/';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const slider      = document.getElementById('lengthSlider');
const badge       = document.getElementById('lengthBadge');
const fill        = document.getElementById('sliderFill');
const previewEl   = document.getElementById('previewChars');
const resultCard  = document.getElementById('resultCard');
const resultLink  = document.getElementById('resultLink');
const metaLen     = document.getElementById('metaLen');
const generateBtn = document.getElementById('generateBtn');
const btnLoader   = document.getElementById('btnLoader');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomPath(length) {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => CHARS[b % CHARS.length]).join('');
}

function updateSlider() {
  const val = parseInt(slider.value);
  const pct = ((val - 10) / (500 - 10)) * 100;
  badge.textContent = val;
  fill.style.width  = pct + '%';
  previewEl.textContent = randomPath(val);
}

slider.addEventListener('input', updateSlider);
updateSlider();

setInterval(() => {
  if (!generateBtn.disabled) {
    previewEl.textContent = randomPath(parseInt(slider.value));
  }
}, 600);

let toastTimer = null;

function showToast(msg, type = 'info') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

async function generateLink() {
  const urlInput = document.getElementById('urlInput');
  const url = urlInput.value.trim();

  if (!url) {
    showToast('// введи посилання!', 'error');
    urlInput.focus();
    return;
  }

  try {
    new URL(url);
  } catch {
    showToast('// некоректне посилання', 'error');
    return;
  }

  generateBtn.disabled = true;
  generateBtn.classList.add('loading');

  const length = parseInt(slider.value);
  let path = randomPath(length);

  try {
    let attempts = 0;
    while (attempts < 5) {
      const { error } = await db
        .from('links')
        .insert({ path, url });

      if (!error) break;

      if (error.code === '23505') {
        path = randomPath(length);
        attempts++;
        continue;
      }

      throw error;
    }

    const fullLink = BASE_URL + path;
    resultLink.textContent = fullLink;
    metaLen.textContent = length + ' chars';
    resultCard.classList.add('visible');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('// посилання збережено ✓', 'success');

  } catch (err) {
    console.error(err);
    showToast('// помилка: ' + (err.message || 'щось пішло не так'), 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading');
  }
}

async function copyLink() {
  const link = resultLink.textContent;
  if (!link) return;

  const btn = document.getElementById('copyBtn');
  const copyText = document.getElementById('copyText');

  try {
    await navigator.clipboard.writeText(link);
    copyText.textContent = '✓ copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      copyText.textContent = '📋 copy';
      btn.classList.remove('copied');
    }, 2000);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = link;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('// скопійовано!', 'success');
  }
}

document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') generateLink();
});