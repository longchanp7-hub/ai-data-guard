const DEMO_ROWS = [
  { name: '佐藤 花子', phone: '090-1234-5678', sales: '¥98,500', due: '¥12,000' },
  { name: '田中 一郎', phone: '080-2468-1357', sales: '¥64,200', due: '¥0' },
  { name: '鈴木 美咲', phone: '070-9876-5432', sales: '¥121,800', due: '¥18,500' }
];

const table = document.getElementById('demoTable');
const resultBox = document.getElementById('resultBox');
const toast = document.getElementById('toast');
let mode = 'raw';

function renderRows(nextMode = 'raw') {
  mode = nextMode;
  table.innerHTML = DEMO_ROWS.map((row, idx) => {
    const name = mode === 'mask' ? `<span class="masked">顧客_${String(idx + 1).padStart(3, '0')}</span>` : row.name;
    const phone = mode === 'mask' ? `<span class="masked">***-****-${row.phone.slice(-4)}</span>` : row.phone;
    const sales = mode === 'mask' ? '<span class="masked">[金額を非表示]</span>' : row.sales;
    const due = mode === 'mask' ? '<span class="masked">[未収金額を非表示]</span>' : row.due;
    const cls = mode === 'scan' ? ' class="flagged"' : '';
    return `<tr><td${cls}>${name}</td><td${cls}>${phone}</td><td${cls}>${sales}</td><td${cls}>${due}</td></tr>`;
  }).join('');
}

function setResult(title, text) {
  resultBox.innerHTML = `<div class="result-title">${title}</div><p>${text}</p>`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function runAction(action) {
  if (action === 'scan') {
    renderRows('scan');
    setResult('4種類の注意項目を見つけました', '顧客名、電話番号、売上金額、未収金額です。このまま外部AIへ送る操作は止める設計にします。');
    showToast('安全チェックのデモを実行');
    return;
  }
  if (action === 'mask') {
    renderRows('mask');
    setResult('見せなくてよい情報を隠しました', '名前・電話番号・金額を、AIにそのまま見せない形へ変更するイメージです。元の値はPCの外へ出しません。');
    showToast('安全な表示へ変換');
    return;
  }
  if (action === 'prompt') {
    renderRows('raw');
    setResult('AIへ聞く内容だけを作りました', '例：「顧客一覧に、売上と未収の列があります。未収合計を出すExcel関数を教えてください。」実際の顧客名や金額は入れません。');
    showToast('AI相談文のデモを作成');
    return;
  }
  if (action === 'policy') {
    document.querySelector('.policy-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('アプリが自動で守るルールを表示');
  }
}

document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => runAction(btn.dataset.action)));
document.getElementById('resetDemo').addEventListener('click', () => {
  renderRows('raw');
  setResult('まだ何もしていません', '上のボタンを押すと、架空データだけを使って動作を確認できます。');
});

document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-nav]').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  const labels = { home: 'ホーム', guard: '安全確認', history: '作業履歴', settings: '設定' };
  showToast(`${labels[btn.dataset.nav]}は現在、画面の外枠だけです`);
}));

document.getElementById('modeButton').addEventListener('click', () => {
  showToast('公開プレビューでは実データ入力を無効にしています');
});

renderRows();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
