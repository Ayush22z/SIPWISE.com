 function calculateSIP() {
  const P = parseFloat(document.getElementById('sipAmount').value);
  const N = parseInt(document.getElementById('years').value) * 12;
  const r = parseFloat(document.getElementById('cagr').value) / 100 / 12;
  const resultDiv = document.getElementById('result');

  if (isNaN(P) || P <= 0 || isNaN(N) || N <= 0 || isNaN(r)) {
    resultDiv.innerHTML = 'Please enter valid numbers.';
    return;
  }

  let corpus = P * (((Math.pow(1 + r, N)) - 1) * (1 + r) / r);
  resultDiv.innerHTML = `
    <strong>Invested:</strong> ₹${(P * (N/12)).toLocaleString()}<br>
    <strong>Expected Corpus:</strong> ₹${corpus.toFixed(0).toLocaleString()}
  `;
}