document.addEventListener('DOMContentLoaded', function () {
  const fundDropdown = document.getElementById('fund');
  const cagrInput = document.getElementById('cagr');

  // ✅ Initialize Choices.js
  const choices = new Choices(fundDropdown, { searchEnabled: true });

  // ✅ When fund is selected, update CAGR input
  fundDropdown.addEventListener('change', function () {
    const selectedValue = parseFloat(this.value);
    if (!isNaN(selectedValue)) {
      cagrInput.value = selectedValue;
    }
  });

  // ✅ Inflation toggle show/hide input
  const adjustCheckbox = document.getElementById('adjustInflation');
  const inflationGroup = document.getElementById('inflationRateGroup');

  adjustCheckbox.addEventListener('change', function () {
    inflationGroup.style.display = this.checked ? 'block' : 'none';
  });
});

function calculateSIP() {
  const sip = parseFloat(document.getElementById('sipAmount').value);
  const years = parseFloat(document.getElementById('years').value);
  const cagrInput = parseFloat(document.getElementById('cagr').value);
  const adjustInflation = document.getElementById('adjustInflation').checked;
  let inflationRate = parseFloat(document.getElementById('inflationRate')?.value || 0);
  let cagr = cagrInput;

  if (adjustInflation) {
    cagr = (((1 + cagrInput / 100) / (1 + inflationRate / 100)) - 1) * 100;
  }

  if (isNaN(sip) || isNaN(years) || isNaN(cagr)) {
    document.getElementById('result').innerHTML = "❗ Please enter all values.";
    return;
  }

  const months = years * 12;
  const monthlyRate = cagr / 100 / 12;
  const futureValue = sip * (((Math.pow(1 + monthlyRate, months)) - 1) / monthlyRate) * (1 + monthlyRate);

  animateValue('result', 0, futureValue, 1000);
  showInWords(futureValue);
  drawChart(sip, cagr, years);

  const totalInvested = sip * 12 * years;
  const wealthGained = futureValue - totalInvested;

  document.getElementById('summary').innerHTML = `
    💼 <strong>Total Invested:</strong> ₹${formatNumberIndianStyle(totalInvested.toFixed(0))}<br>
    💰 <strong>Final Value${adjustInflation ? " (Inflation Adjusted)" : ""}:</strong> ₹${formatNumberIndianStyle(futureValue.toFixed(0))}<br>
    📈 <strong>Wealth Gained:</strong> ₹${formatNumberIndianStyle(wealthGained.toFixed(0))}<br>
    ${adjustInflation ? `🧮 <em>Real CAGR Used:</em> ${cagr.toFixed(2)}%` : ''}
  `;
}

// Animate number
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

function showInWords(amount) {
  const wordsDiv = document.getElementById('resultInWords');
  const numeric = formatNumberIndianStyle(amount.toFixed(0));
  const wordy = convertToIndianWords(Math.floor(amount));
  wordsDiv.innerHTML = `💬 ₹ ${numeric}<br>(${wordy})`;
}

function drawChart(sip, cagr, years) {
  const months = years * 12;
  const monthlyRate = cagr / 100 / 12;
  let data = [];
  let labels = [];

  for (let i = 1; i <= years; i++) {
    let fv = sip * (((Math.pow(1 + monthlyRate, i * 12) - 1) / monthlyRate) * (1 + monthlyRate));
    data.push(Math.round(fv));
    labels.push(`Year ${i}`);
  }

  const ctx = document.getElementById('growthChart').getContext('2d');
  if (window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'SIP Growth (₹)',
        data: data,
        borderColor: '#42a5f5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => value.toLocaleString('en-IN')
          }
        }
      }
    }
  });
}

function convertToIndianWords(num) {
  if (num === 0) return "Zero";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const getWords = (n) => {
    if (n > 19) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    } else {
      return ones[n];
    }
  };

  let result = "";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = num % 100;

  if (crore) result += getWords(crore) + " Crore ";
  if (lakh) result += getWords(lakh) + " Lakh ";
  if (thousand) result += getWords(thousand) + " Thousand ";
  if (hundred) result += getWords(hundred) + " Hundred ";
  if (rest) {
    if (result !== "") result += "and ";
    result += getWords(rest);
  }

  return result.trim();
}
