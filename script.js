 function calculateSIP() {
  const amount = parseFloat(document.getElementById('amount').value);
  const years = parseFloat(document.getElementById('years').value);
  const cagr = parseFloat(document.getElementById('fund').value);

  if (isNaN(amount) || isNaN(years) || isNaN(cagr)) {
    document.getElementById('result').innerText = '❗ Please enter all values correctly.';
    return;
  }

  const months = years * 12;
  const monthlyRate = cagr / 100 / 12;

  const futureValue = amount * ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)) / monthlyRate;

  document.getElementById('result').innerText = 
    `📊 Estimated Value after ${years} years: ₹${futureValue.toFixed(2).toLocaleString('en-IN')}`;
}
