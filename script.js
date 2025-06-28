document.addEventListener('DOMContentLoaded', function () {
  const fundDropdown = document.getElementById('fund');
  const cagrInput = document.getElementById('cagr');
  const adjustCheckbox = document.getElementById('adjustInflation');
  const inflationGroup = document.getElementById('inflationRateGroup');
  const darkToggle = document.getElementById('darkModeToggle');

  // ✅ Initialize Choices.js
  const choices = new Choices(fundDropdown, {
    searchEnabled: true,
    itemSelectText: '',
    shouldSort: false
  });

  // ✅ When fund is selected, update CAGR input
  fundDropdown.addEventListener('change', function () {
    const selectedValue = parseFloat(this.value);
    if (!isNaN(selectedValue)) {
      cagrInput.value = selectedValue;
    }
  });

  // ✅ Inflation toggle show/hide input
  adjustCheckbox.addEventListener('change', function () {
    inflationGroup.style.display = this.checked ? 'block' : 'none';
  });

  // ✅ Dark Mode Toggle
  darkToggle.addEventListener('change', function () {
    document.body.classList.toggle('dark-mode', this.checked);
    updateChartTheme(); // 🔄 Refresh chart theme
  });
});

let chart; // Chart instance

function calculateSIP() {
  const sip = parseFloat(document.getElementById('sip').value);
  const years = parseFloat(document.getElementById('years').value);
  const cagrInput = parseFloat(document.getElementById('cagr').value);
  const adjustInflation = document.getElementById('adjustInflation').checked;
  let inflationRate = parseFloat(document.getElementById('inflationRate').value);
  let cagr = cagrInput;

  if (adjustInflation && !isNaN(inflationRate)) {
    cagr = cagrInput - inflationRate;
  }

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
  const format = num => num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const result = document.getElementById('result');
  result.innerHTML = `
    💬 ${format(futureValue)}<br>
    <div id="resultInWords">(${convertToWords(futureValue)})</div>
    <div id="summary">
      📦 Total Invested: ${format(totalInvested)}<br>
      💰 Final Value: ${format(futureValue)}<br>
      🧾 Wealth Gained: ${format(wealthGained)}
    </div>
  `;

  // 📊 Graph Data
  const labels = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);
  const data = labels.map((_, i) => {
    const n = (i + 1) * 12;
    return sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  });

  const ctx = document.getElementById('myChart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'SIP Growth (₹)',
        data,
        fill: false,
        borderColor: '#70b9ff',
        tension: 0.3,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-color') || (document.body.classList.contains('dark-mode') ? '#fff' : '#333')
          }
        },
        y: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-color') || (document.body.classList.contains('dark-mode') ? '#fff' : '#333')
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

// 📚 Helper: Convert number to Indian words
function convertToWords(num) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  const raw = formatter.format(num);
  const words = raw.replace(/₹/g, '').replace(/,/g, '').trim();

  const number = parseInt(words);
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

  let wordsArray = [];
  if (crore) wordsArray.push(getWords(crore) + ' Crore');
  if (lakh) wordsArray.push(getWords(lakh) + ' Lakh');
  if (thousand) wordsArray.push(getWords(thousand) + ' Thousand');
  if (hundred) wordsArray.push(a[hundred] + ' Hundred');
  if (rest) wordsArray.push('and ' + getWords(rest));

  return wordsArray.join(' ');
}

// 🔄 Update Chart Theme on Dark Mode Toggle
function updateChartTheme() {
  if (!chart) return;

  const isDark = document.body.classList.contains('dark-mode');
  chart.options.scales.x.ticks.color = isDark ? '#fff' : '#333';
  chart.options.scales.y.ticks.color = isDark ? '#fff' : '#333';
  chart.options.plugins.legend.labels.color = isDark ? '#fff' : '#333';
  chart.update();
}
