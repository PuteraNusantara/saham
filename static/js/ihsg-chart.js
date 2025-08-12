let chartInstance = null;

async function loadIHSGData() {
    try {
        const response = await fetch('/api/ihsg');
        const data = await response.json();
        
        // Debug: Log data dari API
        console.log("Data from API:", data);
        
        // Update informasi harga
        updatePriceInfo(data);
        
        // Update chart jika data valid
        if (data.prices && data.dates && data.prices.length === data.dates.length) {
            updateChart(data.dates, data.prices);
        } else {
            console.error("Invalid data format:", data);
            document.getElementById('chart-container').innerHTML = 
                '<p class="error-message">Format data tidak valid</p>';
        }
        
    } catch (error) {
        console.error("Failed to load data:", error);
        document.getElementById('data-container').innerHTML = 
            '<p class="error-message">Gagal memuat data. Silakan refresh halaman.</p>';
    }
}

function updatePriceInfo(data) {
    const changePercent = ((data.change / (data.last_price - data.change)) * 100).toFixed(2);
    
    document.getElementById('data-container').innerHTML = `
        <div class="price-display">
            <p>Harga Terakhir: <strong>${data.last_price.toLocaleString('id-ID')}</strong></p>
            <p>Perubahan: <span class="${data.change >= 0 ? 'positive' : 'negative'}">
                ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)} (${changePercent}%)
            </span></p>
        </div>
    `;
}

function updateChart(dates, prices) {
    const ctx = document.getElementById('ihsgChart').getContext('2d');
    
    // Hancurkan chart sebelumnya jika ada
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'IHSG',
                data: prices,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `Rp ${context.raw.toLocaleString('id-ID')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => value.toLocaleString('id-ID')
                    }
                }
            }
        }
    });
}

// Auto-refresh setiap 30 detik
document.addEventListener('DOMContentLoaded', loadIHSGData);
setInterval(loadIHSGData, 30000);
