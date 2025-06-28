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

  document.getElementById('result').innerHTML =
    `<h3>Expected Value: ₹${futureValue.toFixed(2)}</h3>`;
}
document.getElementById('fund').addEventListener('change', function () {
  document.getElementById('cagr').value = this.value;
});
