function calculateSIP() {
  const sip = parseFloat(document.getElementById('sipAmount').value);
  const years = parseFloat(document.getElementById('years').value);
  const cagr = parseFloat(document.getElementById('cagr').value);

  if (isNaN(sip) || isNaN(years) || isNaN(cagr)) {
    document.getElementById('result').innerHTML = "❗ Please enter all values.";
    return;
  }

  const months = years * 12;
  const monthlyRate = cagr / 100 / 12;

  const futureValue = sip * (((Math.pow(1 + monthlyRate, months)) - 1) / monthlyRate) * (1 + monthlyRate);

animateValue('result', 0, futureValue, 1000);
  function showInWords(amount) {
  const wordsDiv = document.getElementById('resultInWords');
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  const formatted = formatter.format(amount);
  wordsDiv.innerText = `💬 ${formatted} (in words)`;
}

// Set CAGR value based on selected fund
document.getElementById('fund').addEventListener('change', function () {
  document.getElementById('cagr').value = this.value;
});
function animateValue(id, start, end, duration) {
  let range = end - start;
  let current = start;
  let increment = range / (duration / 30);
  let obj = document.getElementById(id);

  const step = () => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      obj.innerText = formatNumberIndianStyle(end.toFixed(2));
      showInWords(end);
    } else {
      obj.innerText = formatNumberIndianStyle(current.toFixed(2));
      requestAnimationFrame(step);
    }
  };

  step();
}
function formatNumberIndianStyle(x) {
  return Number(x).toLocaleString('en-IN');
}
