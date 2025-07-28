document.addEventListener("DOMContentLoaded", function () {
  const fundDropdown = document.getElementById("fund");
  const cagrInput = document.getElementById("cagr");
  const sipInput = document.getElementById("sip");
  const yearsInput = document.getElementById("years");
  const inflationToggle = document.getElementById("inflation-toggle");
  const inflationInput = document.getElementById("inflation-rate");
  const deviationInput = document.getElementById("deviation");
  const resultAmount = document.getElementById("result-amount");
  const resultWords = document.getElementById("result-words");
  const summaryText = document.getElementById("summary");
  const chartCanvas = document.getElementById("sipChart");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Auto-select first valid fund option
  const firstValidOption = Array.from(fundDropdown.options).find(opt => !opt.disabled);
  if (firstValidOption) {
    cagrInput.value = firstValidOption.value;
  }

  // Update CAGR input when a fund is selected
  fundDropdown.addEventListener("change", function () {
    const selectedValue = fundDropdown.value;
    if (selectedValue !== "") {
      cagrInput.value = selectedValue;
    }
  });

  // Toggle inflation input visibility
  inflationToggle.addEventListener("change", function () {
    document.getElementById("inflation-container").style.display = inflationToggle.checked ? "block" : "none";
  });

  // Chart instance
  let chart;

  function calculateSIP() {
    const sip = parseFloat(sipInput.value);
    const years = parseFloat(yearsInput.value);
    let cagr = parseFloat(cagrInput.value);
    const adjustInflation = inflationToggle.checked;
    const inflationRate = parseFloat(inflationInput.value);
    const deviation = parseFloat(deviationInput.value);

    if (isNaN(sip)) return showError("Please enter a valid SIP amount.");
    if (isNaN(years)) return showError("Please enter investment duration.");
    if (isNaN(cagr)) return showError("Please enter or select a CAGR.");

    // Adjust CAGR for inflation
    if (adjustInflation && !isNaN(inflationRate)) {
      cagr = Math.max(0, cagr - inflationRate);
    }

    const months = years * 12;
    const rate = cagr / 12 / 100;
    const fv = sip * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    const totalInvested = sip * months;

    const bestCAGR = cagr + deviation;
    const worstCAGR = Math.max(0, cagr - deviation);
    const bestRate = bestCAGR / 12 / 100;
    const worstRate = worstCAGR / 12 / 100;

    const bestFV = sip * ((Math.pow(1 + bestRate, months) - 1) / bestRate) * (1 + bestRate);
    const worstFV = sip * ((Math.pow(1 + worstRate, months) - 1) / worstRate) * (1 + worstRate);

    resultAmount.textContent = `₹${fv.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    resultWords.textContent = `(${convertToWords(Math.round(fv))} rupees)`;

    summaryText.innerHTML = `
      <strong>Total Invested:</strong> ₹${totalInvested.toLocaleString("en-IN")}<br>
      <strong>Expected Value:</strong> ₹${fv.toLocaleString("en-IN")}<br>
      <strong>Best Case:</strong> ₹${bestFV.toLocaleString("en-IN")} @ ${bestCAGR.toFixed(2)}%<br>
      <strong>Worst Case:</strong> ₹${worstFV.toLocaleString("en-IN")} @ ${worstCAGR.toFixed(2)}%
    `;

    drawChart(years, sip, cagr, deviation);
  }

  function showError(message) {
    alert(message);
    window.scrollTo(0, 0);
  }

  function convertToWords(num) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    if (num === 0) return 'zero';

    const getTwoDigits = n => {
      if (n < 10) return ones[n];
      else if (n >= 10 && n < 20) return teens[n - 10];
      else return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '');
    };

    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = Math.floor(num / 100);
    num %= 100;
    const remainder = num;

    let words = '';
    if (crore) words += getTwoDigits(crore) + ' crore ';
    if (lakh) words += getTwoDigits(lakh) + ' lakh ';
    if (thousand) words += getTwoDigits(thousand) + ' thousand ';
    if (hundred) words += ones[hundred] + ' hundred ';
    if (remainder) words += getTwoDigits(remainder);

    return words.trim();
  }

  function drawChart(years, sip, cagr, deviation) {
    const labels = Array.from({ length: years + 1 }, (_, i) => `${i} yr`);
    const monthsPerYear = 12;

    const dataPoints = (rate) =>
      labels.map((_, i) => {
        const months = i * monthsPerYear;
        return Math.round(
          sip * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate)
        );
      });

    const baseRate = cagr / 12 / 100;
    const bestRate = (cagr + deviation) / 12 / 100;
    const worstRate = Math.max(0, (cagr - deviation) / 12 / 100);

    const baseData = dataPoints(baseRate);
    const bestData = dataPoints(bestRate);
    const worstData = dataPoints(worstRate);

    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: 'Expected (₹)',
            data: baseData,
            borderColor: '#70b9ff',
            backgroundColor: 'rgba(112, 185, 255, 0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 3
          },
          {
            label: 'Best Case (₹)',
            data: bestData,
            borderColor: '#4caf50',
            borderDash: [5, 5],
            tension: 0.3,
            pointRadius: 0
          },
          {
            label: 'Worst Case (₹)',
            data: worstData,
            borderColor: '#f44336',
            borderDash: [5, 5],
            tension: 0.3,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: getComputedStyle(document.body).getPropertyValue('--text-color') || '#333'
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-color') || '#333'
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.body).getPropertyValue('--text-color') || '#333'
            }
          }
        }
      }
    });
  }

  function updateChartTheme() {
    if (chart) {
      chart.options.plugins.legend.labels.color =
        getComputedStyle(document.body).getPropertyValue('--text-color') || '#333';
      chart.options.scales.x.ticks.color =
        getComputedStyle(document.body).getPropertyValue('--text-color') || '#333';
      chart.options.scales.y.ticks.color =
        getComputedStyle(document.body).getPropertyValue('--text-color') || '#333';
      chart.update();
    }
  }

  // Theme on load
  if (document.body.classList.contains("dark-mode")) {
    updateChartTheme();
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      updateChartTheme();
    });
  }

  // Calculate button
  document.getElementById("calculate-btn").addEventListener("click", calculateSIP);
});
