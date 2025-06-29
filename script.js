document.addEventListener('DOMContentLoaded', () => {
  const fundDropdown = document.getElementById('fund');
  const cagrInput = document.getElementById('cagr');
  const adjustCheckbox = document.getElementById('adjustInflation');
  const inflationGroup = document.getElementById('inflationRateGroup');
  const darkToggle = document.getElementById('darkModeToggle');
  const calculateBtn = document.getElementById('calculateBtn');

  const choices = new Choices(fundDropdown, {
    searchEnabled: true,
    itemSelectText: '',
    shouldSort: false
  });

  // Handle auto-update CAGR when selecting a fund
  fundDropdown.addEventListener('change', () => {
    const selectedOption = fundDropdown.options[fundDropdown.selectedIndex];
    const cagr = parseFloat(selectedOption.value);
    if (!isNaN(cagr)) {
      cagrInput.value = cagr;
    }
  });

  // Trigger initial CAGR update on page load
  const initialCAGR = parseFloat(fundDropdown.options[fundDropdown.selectedIndex].value);
  if (!isNaN(initialCAGR)) {
    cagrInput.value = initialCAGR;
  }

  adjustCheckbox.addEventListener('change', () => {
    inflationGroup.style.display = adjustCheckbox.checked ? 'block' : 'none';
  });

  darkToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkToggle.checked);
    updateChartTheme();
  });

  calculateBtn.addEventListener('click', calculateSIP);
});

let chart;

function calculateSIP() {
  const sip = parseFloat(document.getElementById('sip').value);
  const years = parseFloat(document.getElementById('years').value);
  let cagr = parseFloat(document.getElementById('cagr').value);
  const deviation = parseFloat(document.getElementById('deviation').value || '0');
  const inflationRate = parseFloat(document.getElementById('inflationRate').value || '0');
  const adjustInflation = document.getElementById('adjustInflation').checked;

  if (adjustInflation && !isNaN(inflationRate)) {
    cagr -= inflationRate;
  }

  if (isNaN(sip) || isNaN(years) || isNaN(cagr)) {
    alert("Please enter all fields correctly.");
    return;
  }

  const months = years * 12;
  const baseRate = cagr / 100 / 12;
  const highRate = (cagr + deviation) / 100 / 12;
  const lowRate = (cagr - deviation) / 100 / 12;

  const fv = r => sip * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);

  const futureValue = fv(baseRate);
  const totalInvested = sip * months;
  const wealthGained = futureValue - totalInvested;

  const format = n => n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  document.getElementById('result').innerText = `💰 ${format(futureValue)}`;
  document.getElementById('resultInWords').innerText = `(${convertToWords(futureValue)})`;
  document.getElementById('summary').innerHTML = `
    📦 Total Invested: ${format(totalInvested)}<br>
    💸 Final Value: ${format(futureValue)}<br>
    🧾 Wealth Gained: ${format(wealthGained)}<br>
    📈 Best Case: ${format(fv(highRate))}<br>
    📉 Worst Case: ${format(fv(lowRate))}
  `;

  const labels = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);
  const grow = r => labels.map((_, i) => {
    const n = (i + 1) * 12;
    return sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  });

  const baseData = grow(baseRate);
  const highData = grow(highRate);
  const lowData = grow(lowRate);

  const ctx = document.getElementById('myChart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Expected (₹)',
          data: baseData,
          borderColor: '#70b9ff',
          tension: 0.3,
          pointRadius: 3,
          fill: false
        },
        {
          label: 'Best Case (₹)',
          data: highData,
          borderColor: '#4caf50',
          tension: 0.3,
          pointRadius: 0,
          borderDash: [5, 5],
          fill: false
        },
        {
          label: 'Worst Case (₹)',
          data: lowData,
          borderColor: '#f44336',
          tension: 0.3,
          pointRadius: 0,
          borderDash: [5, 5],
          fill: false
        }
      ]
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

function updateChartTheme() {
  if (!chart) return;
  const dark = document.body.classList.contains('dark-mode');
  chart.options.scales.x.ticks.color = dark ? '#fff' : '#333';
  chart.options.scales.y.ticks.color = dark ? '#fff' : '#333';
  chart.options.plugins.legend.labels.color = dark ? '#fff' : '#333';
  chart.update();
}

function convertToWords(num) {
  const raw = parseInt(num.toLocaleString('en-IN', {
    maximumFractionDigits: 0
  }).replace(/,/g, ''));

  if (isNaN(raw)) return "";

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const c = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const getWords = n => {
    if (n < 10) return a[n];
    if (n < 20) return c[n - 10];
    return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
  };

  const numStr = raw.toString().padStart(9, '0');
  const crore = parseInt(numStr.slice(0, 2));
  const lakh = parseInt(numStr.slice(2, 4));
  const thousand = parseInt(numStr.slice(4, 6));
  const hundred = parseInt(numStr[6]);
  const rest = parseInt(numStr.slice(7));

  let words = [];
  if (crore) words.push(getWords(crore) + ' Crore');
  if (lakh) words.push(getWords(lakh) + ' Lakh');
  if (thousand) words.push(getWords(thousand) + ' Thousand');
  if (hundred) words.push(a[hundred] + ' Hundred');
  if (rest) words.push('and ' + getWords(rest));

  return words.join(' ');
}
