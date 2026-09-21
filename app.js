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
    const sales = mode === 'mask' ? `<span class="masked">[金額]</span>` : row.sales;
    const due = mode === 'mask' ? `<span class="masked">[未収金額]</span>` : row.due;
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
    setResult('機密データを検出', '4種類の高リスク項目を検出しました：氏名、電話番号、売上金額、未収金額。外部送信は許可されません。');
    showToast('ローカル検査のデモを実行');
    return;
  }
  if (action === 'mask') {
    renderRows('mask');
    setResult('ローカル匿名化', '氏名・電話番号・金額を端末内で置換するイメージです。復元対応表はローカル環境だけに保存する設計にします。');
    showToast('匿名化デモを実行');
    return;
  }
  if (action === 'prompt') {
    renderRows('raw');
    setResult('AI相談用データ', 'クラウドAIへ渡す場合は「列: 顧客ID / 電話番号 / 売上 / 未収。目的: 未収集計ロジックの作成」のように構造と目的だけを抽出し、実値は含めません。');
    showToast('構造のみの安全な依頼文を生成');
    return;
  }
  if (action === 'policy') {
    document.querySelector('.policy-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('強制ルールを表示');
  }
}

document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => runAction(btn.dataset.action)));
document.getElementById('resetDemo').addEventListener('click', () => {
  renderRows('raw');
  setResult('待機中', '上の機能をタップすると、架空データだけを使って動作イメージを確認できます。');
});

document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-nav]').forEach(x => x.classList.remove('active'));
  btn.classList.add('active');
  const labels = { home: 'ホーム', guard: 'ガード', history: '履歴', settings: '設定' };
  showToast(`${labels[btn.dataset.nav]}は外枠のみ。次の実装で追加します。`);
}));

document.getElementById('modeButton').addEventListener('click', () => {
  showToast('公開プレビューでは実データ入力を強制無効化');
});

renderRows();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
