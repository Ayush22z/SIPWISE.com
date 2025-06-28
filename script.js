document.addEventListener('DOMContentLoaded', function () {
  const fundDropdown = document.getElementById('fund');
  const cagrInput = document.getElementById('cagr');
  const adjustCheckbox = document.getElementById('adjustInflation');
  const inflationGroup = document.getElementById('inflationRateGroup');
  const darkToggle = document.getElementById('darkModeToggle');
  const calculateButton = document.getElementById('calculateBtn');

  // ✅ Initialize Choices.js
  new Choices(fundDropdown, {
    searchEnabled: true,
    itemSelectText: '',
    shouldSort: false
  });

  // ✅ Auto-fill CAGR when fund is selected
  fundDropdown.addEventListener('change', function () {
    const selectedValue = parseFloat(this.value);
    if (!isNaN(selectedValue)) {
      cagrInput.value = selectedValue;
    }
  });

  // ✅ Show/hide inflation rate input
  adjustCheckbox.addEventListener('change', function () {
    inflationGroup.style.display = this.checked ? 'block' : 'none';
  });

  // ✅ Toggle dark mode
  darkToggle.addEventListener('change', function () {
    document.body.classList.toggle('dark-mode', this.checked);
    updateChartTheme();
  });

  // ✅ Calculate SIP on button click
  calculateButton.addEventListener('click', calculateSIP);
});

let chart; // Global chart instance

function calculateSIP() {
  const sip = parseFloat(document.getElementById('sip').value);
  const years = parseFloat(document.getElementById('years').value);
  const cagrInput = parseFloat(document.getElementById('cagr').value);
  const adjustInflation = document.getElementById('adjustInflation').checked;
  let inflationRate = parseFloat(document.getElementById('inflationRate').value);

  if (adjustInflation && !isNaN(inflationRate)) {
    cagrInput -= inflationRate;
  }

  const cagr = cagrInput;

  if (isNaN(sip) || isNaN(years) || isNaN(cagr)) {
    alert("Please fill all fields correctly.");
    return;
  }

  const months = years * 12;
  const r = cagr / 100 / 12;
  const futureValue = sip * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  const totalInvested = sip * months;
  const wealthGained = futureValue - totalInvested;

  // Format currency
  const format = num => num.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  // ✅ Update result sections individually
  document.getElementById('result').innerHTML = `💬 ${format(futureValue)}`;
  document.getElementById('resultInWords').innerHTML = `(${convertToWords(futureValue)})`;
  document.getElementById('summary').innerHTML = `
    📦 Total Invested: ${format(totalInvested)}<br>
    💰 Final Value: ${format(futureValue)}<br>
    🧾 Wealth Gained: ${format(wealthGained)}
  `;

  // 📊 Graph Data
  const labels = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);
  const data = labels.map((_, i) => {
    const n = (i + 1) * 12;
    return sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  });

  const ctx = document.getElementById('myChart').getContext('2d');
  if (chart) chart.destroy(); // Destroy old chart if exists

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'SIP Growth (₹)',
        data,
        borderColor: '#70b9ff',
        fill: false,
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            color: document.body.classList.contains('dark-mode') ? '#fff' : '#333'
          }
        },
        y: {
          ticks: {
            color: document.body.classList.contains('dark-mode') ? '#fff' : '#333'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: document.body.classList.contains('dark-mode') ? '#fff' : '#333'
          }
        }
      }
    }
  });
}

// 🔢 Convert large numbers to Indian words
function convertToWords(num) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  const raw = formatter.format(num).replace(/₹|,/g, '').trim();
  const number = parseInt(raw);
  if (isNaN(number)) return "";

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const c = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const getWords = (n) => {
    if (n < 10) return a[n];
    if (n >= 10 && n < 20) return c[n - 10];
    const tens = Math.floor(n / 10);
    const units = n % 10;
    return b[tens] + (units ? ' ' + a[units] : '');
  };

  const numStr = number.toString().padStart(9, '0');
  const crore = parseInt(numStr.slice(0, 2));
  const lakh = parseInt(numStr.slice(2, 4));
  const thousand = parseInt(numStr.slice(4, 6));
  const hundred = parseInt(numStr[6]);
  const rest = parseInt(numStr.slice(7));

  const parts = [];
  if (crore) parts.push(getWords(crore) + ' Crore');
  if (lakh) parts.push(getWords(lakh) + ' Lakh');
  if (thousand) parts.push(getWords(thousand) + ' Thousand');
  if (hundred) parts.push(a[hundred] + ' Hundred');
  if (rest) parts.push('and ' + getWords(rest));

  return parts.join(' ');
}

// 🌙 Update chart theme on dark mode toggle
function updateChartTheme() {
  if (!chart) return;
  const isDark = document.body.classList.contains('dark-mode');
  chart.options.scales.x.ticks.color = isDark ? '#fff' : '#333';
  chart.options.scales.y.ticks.color = isDark ? '#fff' : '#333';
  chart.options.plugins.legend.labels.color = isDark ? '#fff' : '#333';
  chart.update();
}
