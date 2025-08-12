// Charts and Analytics JavaScript
let mainChart = null;
let volumeChart = null;
let currentStock = 'IHSG';
let currentTimeRange = '1D';
let currentChartType = 'line';

function initializeCharts() {
    setupChartControls();
    initializeMainChart();
    initializeVolumeChart();
    updateTechnicalIndicators();
}

// Setup chart controls
function setupChartControls() {
    const stockSelector = document.getElementById('stockSelector');
    const timeRange = document.getElementById('timeRange');
    const chartType = document.getElementById('chartType');
    
    if (stockSelector) {
        stockSelector.addEventListener('change', function() {
            currentStock = this.value;
            updateCharts();
            updateTechnicalIndicators();
            updateChartAnalysis();
        });
    }
    
    if (timeRange) {
        timeRange.addEventListener('change', function() {
            currentTimeRange = this.value;
            updateCharts();
            updateTechnicalIndicators();
        });
    }
    
    if (chartType) {
        chartType.addEventListener('change', function() {
            currentChartType = this.value;
            updateMainChart();
        });
    }
}

// Initialize main chart
function initializeMainChart() {
    const ctx = document.getElementById('mainChart');
    if (!ctx) return;
    
    const data = generateChartData(currentStock, currentTimeRange);
    
    if (mainChart) {
        mainChart.destroy();
    }
    
    const config = getChartConfig(data, currentChartType);
    mainChart = new Chart(ctx, config);
    
    // Add click event for chart analysis
    ctx.addEventListener('click', function(event) {
        const points = mainChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const label = mainChart.data.labels[firstPoint.index];
            const value = mainChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
            showChartPointAnalysis(label, value);
        }
    });
}

// Initialize volume chart
function initializeVolumeChart() {
    const ctx = document.getElementById('volumeChart');
    if (!ctx) return;
    
    const data = generateVolumeData(currentStock, currentTimeRange);
    
    if (volumeChart) {
        volumeChart.destroy();
    }
    
    volumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Volume',
                data: data.volumes,
                backgroundColor: data.colors,
                borderColor: data.colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatVolume(value);
                        }
                    }
                }
            }
        }
    });
}

// Get chart configuration based on type
function getChartConfig(data, type) {
    const baseConfig = {
        data: {
            labels: data.labels,
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${currentStock}: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    position: 'right',
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    };
    
    if (type === 'line') {
        baseConfig.type = 'line';
        baseConfig.data.datasets = [{
            data: data.prices,
            borderColor: '#00d4aa',
            backgroundColor: 'rgba(0, 212, 170, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6
        }];
    } else if (type === 'bar') {
        baseConfig.type = 'bar';
        baseConfig.data.datasets = [{
            data: data.prices,
            backgroundColor: data.colors,
            borderColor: data.colors,
            borderWidth: 1
        }];
    } else if (type === 'candlestick') {
        // Simplified candlestick using line chart with high/low
        baseConfig.type = 'line';
        baseConfig.data.datasets = [
            {
                label: 'High',
                data: data.high,
                borderColor: '#ff6b6b',
                backgroundColor: 'transparent',
                borderWidth: 1,
                pointRadius: 0
            },
            {
                label: 'Low', 
                data: data.low,
                borderColor: '#4ecdc4',
                backgroundColor: 'transparent',
                borderWidth: 1,
                pointRadius: 0
            },
            {
                label: 'Close',
                data: data.prices,
                borderColor: '#00d4aa',
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 2
            }
        ];
        baseConfig.options.plugins.legend.display = true;
    }
    
    return baseConfig;
}

// Generate chart data based on stock and time range
function generateChartData(stock, timeRange) {
    const basePrice = getBasePrice(stock);
    const dataPoints = getDataPoints(timeRange);
    
    const labels = [];
    const prices = [];
    const high = [];
    const low = [];
    const colors = [];
    
    let currentPrice = basePrice;
    
    for (let i = 0; i < dataPoints; i++) {
        // Generate label based on time range
        labels.push(generateTimeLabel(i, timeRange));
        
        // Generate price with some volatility
        const volatility = 0.02; // 2% volatility
        const change = (Math.random() - 0.5) * 2 * volatility;
        currentPrice = currentPrice * (1 + change);
        
        prices.push(Math.round(currentPrice));
        
        // Generate high/low for candlestick
        const dayVolatility = currentPrice * 0.01;
        high.push(Math.round(currentPrice + Math.random() * dayVolatility));
        low.push(Math.round(currentPrice - Math.random() * dayVolatility));
        
        // Colors for bar chart (green if up, red if down)
        if (i > 0) {
            colors.push(prices[i] > prices[i-1] ? '#00d4aa' : '#ff6b6b');
        } else {
            colors.push('#00d4aa');
        }
    }
    
    return { labels, prices, high, low, colors };
}

// Generate volume data
function generateVolumeData(stock, timeRange) {
    const dataPoints = getDataPoints(timeRange);
    const labels = [];
    const volumes = [];
    const colors = [];
    
    const baseVolume = getBaseVolume(stock);
    
    for (let i = 0; i < dataPoints; i++) {
        labels.push(generateTimeLabel(i, timeRange));
        
        // Generate volume with variation
        const volumeVariation = (Math.random() * 0.5 + 0.5); // 50-150% of base
        const volume = Math.round(baseVolume * volumeVariation);
        volumes.push(volume);
        
        // Random color for volume bars
        colors.push(Math.random() > 0.5 ? '#00d4aa' : '#ff6b6b');
    }
    
    return { labels, volumes, colors };
}

// Get base price for different stocks
function getBasePrice(stock) {
    const basePrices = {
        'IHSG': 7234,
        'BBRI': 4580,
        'BMRI': 5325,
        'TLKM': 3150,
        'ASII': 6875
    };
    return basePrices[stock] || 5000;
}

// Get base volume for different stocks
function getBaseVolume(stock) {
    const baseVolumes = {
        'IHSG': 15000000,
        'BBRI': 50000000,
        'BMRI': 30000000,
        'TLKM': 25000000,
        'ASII': 8000000
    };
    return baseVolumes[stock] || 20000000;
}

// Get number of data points based on time range
function getDataPoints(timeRange) {
    const dataPoints = {
        '1D': 24,
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '1Y': 365
    };
    return dataPoints[timeRange] || 30;
}

// Generate time labels based on time range
function generateTimeLabel(index, timeRange) {
    const now = new Date();
    
    switch (timeRange) {
        case '1D':
            const hour = new Date(now.getTime() - (23 - index) * 60 * 60 * 1000);
            return hour.getHours() + ':00';
            
        case '1W':
            const day = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
            return day.toLocaleDateString('id-ID', { weekday: 'short' });
            
        case '1M':
            const date = new Date(now.getTime() - (29 - index) * 24 * 60 * 60 * 1000);
            return date.getDate();
            
        case '3M':
            const monthDate = new Date(now.getTime() - (89 - index) * 24 * 60 * 60 * 1000);
            return monthDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
            
        case '1Y':
            const yearDate = new Date(now.getTime() - (364 - index) * 24 * 60 * 60 * 1000);
            return yearDate.toLocaleDateString('id-ID', { month: 'short' });
            
        default:
            return index.toString();
    }
}

// Update all charts
function updateCharts() {
    initializeMainChart();
    initializeVolumeChart();
}

// Update main chart only
function updateMainChart() {
    initializeMainChart();
}

// Update technical indicators
function updateTechnicalIndicators() {
    const indicators = generateTechnicalIndicators(currentStock);
    
    const indicatorsList = document.querySelector('.indicators-list');
    if (!indicatorsList) return;
    
    indicatorsList.innerHTML = '';
    
    indicators.forEach(indicator => {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'indicator';
        
        indicatorDiv.innerHTML = `
            <span class="label">${indicator.name}</span>
            <span class="value ${indicator.valueClass}">${indicator.value}</span>
            <span class="status ${indicator.statusClass}">${indicator.status}</span>
        `;
        
        indicatorsList.appendChild(indicatorDiv);
    });
}

// Generate technical indicators
function generateTechnicalIndicators(stock) {
    const indicators = [
        {
            name: 'RSI (14)',
            value: (Math.random() * 40 + 30).toFixed(1),
            valueClass: '',
            status: Math.random() > 0.5 ? 'Bullish' : 'Bearish',
            statusClass: Math.random() > 0.5 ? 'bullish' : 'bearish'
        },
        {
            name: 'MACD',
            value: (Math.random() * 50 - 25).toFixed(1),
            valueClass: Math.random() > 0.5 ? 'positive' : 'negative',
            status: Math.random() > 0.5 ? 'Bullish' : 'Bearish', 
            statusClass: Math.random() > 0.5 ? 'bullish' : 'bearish'
        },
        {
            name: 'MA (50)',
            value: getBasePrice(stock) + (Math.random() * 200 - 100),
            valueClass: '',
            status: Math.random() > 0.5 ? 'Support' : 'Resistance',
            statusClass: Math.random() > 0.5 ? 'support' : 'resistance'
        },
        {
            name: 'Bollinger Bands',
            value: ['Upper', 'Mid', 'Lower'][Math.floor(Math.random() * 3)],
            valueClass: '',
            status: ['Bullish', 'Netral', 'Bearish'][Math.floor(Math.random() * 3)],
            statusClass: ['bullish', 'neutral', 'bearish'][Math.floor(Math.random() * 3)]
        }
    ];
    
    return indicators;
}

// Show chart point analysis
function showChartPointAnalysis(label, value) {
    const analysisDiv = document.getElementById('chartAnalysis');
    if (!analysisDiv) return;
    
    const analysis = generatePointAnalysis(label, value, currentStock);
    
    analysisDiv.innerHTML = `
        <div class="analysis-content">
            <h5>Analisis Titik: ${label}</h5>
            <p><strong>Harga:</strong> ${value.toLocaleString()}</p>
            <div class="analysis-text">
                ${analysis}
            </div>
            <small class="analysis-timestamp">
                Dianalisis pada: ${new Date().toLocaleString('id-ID')}
            </small>
        </div>
    `;
}

// Generate point analysis
function generatePointAnalysis(label, value, stock) {
    const basePrice = getBasePrice(stock);
    const percentChange = ((value - basePrice) / basePrice * 100).toFixed(2);
    
    let trend = 'netral';
    let recommendation = 'HOLD';
    
    if (percentChange > 2) {
        trend = 'bullish';
        recommendation = 'Potensi SELL (profit taking)';
    } else if (percentChange < -2) {
        trend = 'bearish'; 
        recommendation = 'Potensi BUY (support level)';
    } else {
        recommendation = 'HOLD (sideways trend)';
    }
    
    const analysisTemplates = [
        `Pada titik waktu ${label}, ${stock} berada di level ${value.toLocaleString()} dengan perubahan ${percentChange}% dari baseline. Tren saat ini menunjukkan pola ${trend}.`,
        
        `Level harga ${value.toLocaleString()} menunjukkan ${trend === 'bullish' ? 'momentum positif' : trend === 'bearish' ? 'tekanan jual' : 'konsolidasi'} yang perlu diperhatikan investor.`,
        
        `Berdasarkan analisis teknikal, level ini ${trend === 'bullish' ? 'berpotensi menjadi resistance' : trend === 'bearish' ? 'dapat menjadi support' : 'berada dalam range trading'}.`
    ];
    
    const randomAnalysis = analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];
    
    return `
        <p>${randomAnalysis}</p>
        <p><strong>Rekomendasi:</strong> ${recommendation}</p>
        <p><strong>Risk Level:</strong> ${Math.random() > 0.5 ? 'Moderate' : 'Low'}</p>
    `;
}

// Update chart analysis with general market view
function updateChartAnalysis() {
    const analysisDiv = document.getElementById('chartAnalysis');
    if (!analysisDiv) return;
    
    const marketAnalysis = generateMarketAnalysis(currentStock);
    
    analysisDiv.innerHTML = `
        <div class="analysis-content">
            <h5>Analisis Pasar: ${currentStock}</h5>
            <div class="analysis-text">
                ${marketAnalysis}
            </div>
            <button onclick="getDetailedAnalysis()" class="btn-analysis">
                <i class="fas fa-chart-line"></i>
                Analisis Mendalam
            </button>
        </div>
    `;
}

// Generate market analysis
function generateMarketAnalysis(stock) {
    const analyses = {
        'IHSG': `
            <p><strong>Outlook IHSG:</strong> Indeks bergerak dalam tren sideways dengan support kuat di 7.200 dan resistance di 7.300.</p>
            <p><strong>Sentimen:</strong> Netral dengan bias positif dari sektor perbankan dan telekomunikasi.</p>
            <p><strong>Volume:</strong> Trading volume menunjukkan partisipasi investor yang sehat.</p>
        `,
        'BBRI': `
            <p><strong>Tren BBRI:</strong> Saham menunjukkan momentum positif dengan dukungan fundamental yang kuat.</p>
            <p><strong>Katalisa:</strong> Pertumbuhan kredit mikro dan transformasi digital mendukung kinerja.</p>
            <p><strong>Risk:</strong> Perhatikan kualitas kredit dan persaingan di sektor perbankan.</p>
        `,
        'BMRI': `
            <p><strong>Analisis BMRI:</strong> Bergerak stabil dengan dukungan status sebagai bank BUKU 4.</p>
            <p><strong>Kekuatan:</strong> Diversifikasi portofolio dan digital banking yang kuat.</p>
            <p><strong>Perhatian:</strong> Ekspektasi pertumbuhan kredit dan margin bunga.</p>
        `,
        'TLKM': `
            <p><strong>Prospek TLKM:</strong> Beneficiary dari trend digitalisasi dan rollout 5G.</p>
            <p><strong>Dividend:</strong> Yield menarik dengan track record pembayaran yang konsisten.</p>
            <p><strong>Growth:</strong> Ekspansi layanan digital dan infrastruktur telekomunikasi.</p>
        `,
        'ASII': `
            <p><strong>ASII Outlook:</strong> Cyclical recovery dengan dukungan sektor otomotif dan infrastruktur.</p>
            <p><strong>Diversifikasi:</strong> Multi-sektor exposure memberikan stabilitas.</p>
            <p><strong>Challenge:</strong> Transisi ke electric vehicle dan volatilitas komoditas.</p>
        `
    };
    
    return analyses[stock] || `
        <p>Analisis untuk ${stock} sedang dikembangkan. Silakan gunakan fitur AI Assistant untuk analisis yang lebih mendalam.</p>
        <p>Klik pada titik chart untuk mendapatkan analisis spesifik pada level harga tersebut.</p>
    `;
}

// Get detailed analysis
function getDetailedAnalysis() {
    const analysisDiv = document.getElementById('chartAnalysis');
    if (!analysisDiv) return;
    
    analysisDiv.innerHTML = `
        <div class="analysis-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Menggenerate analisis mendalam...</p>
        </div>
    `;
    
    setTimeout(() => {
        const detailedAnalysis = generateDetailedAnalysis(currentStock);
        analysisDiv.innerHTML = detailedAnalysis;
    }, 2000);
}

// Generate detailed analysis
function generateDetailedAnalysis(stock) {
    return `
        <div class="detailed-analysis">
            <h5>Analisis Mendalam: ${stock}</h5>
            
            <div class="analysis-section">
                <h6><i class="fas fa-chart-line"></i> Technical Analysis</h6>
                <ul>
                    <li>Moving Average menunjukkan tren ${Math.random() > 0.5 ? 'bullish' : 'bearish'}</li>
                    <li>Support level teridentifikasi di ${(getBasePrice(stock) * 0.95).toLocaleString()}</li>
                    <li>Resistance level di ${(getBasePrice(stock) * 1.05).toLocaleString()}</li>
                    <li>Volume confirmation: ${Math.random() > 0.5 ? 'Strong' : 'Weak'}</li>
                </ul>
            </div>
            
            <div class="analysis-section">
                <h6><i class="fas fa-building"></i> Fundamental Outlook</h6>
                <ul>
                    <li>Earnings growth expected: ${(Math.random() * 20 + 5).toFixed(1)}%</li>
                    <li>P/E ratio: ${(Math.random() * 10 + 8).toFixed(1)}x</li>
                    <li>ROE: ${(Math.random() * 10 + 12).toFixed(1)}%</li>
                    <li>Debt to Equity: ${(Math.random() * 0.8 + 0.2).toFixed(2)}x</li>
                </ul>
            </div>
            
            <div class="analysis-section">
                <h6><i class="fas fa-exclamation-triangle"></i> Risk Assessment</h6>
                <ul>
                    <li>Market Risk: ${['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}</li>
                    <li>Sector Risk: ${['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}</li>
                    <li>Liquidity: ${Math.random() > 0.3 ? 'High' : 'Medium'}</li>
                    <li>Volatility: ${(Math.random() * 30 + 10).toFixed(1)}%</li>
                </ul>
            </div>
            
            <div class="recommendation-box">
                <strong>Final Recommendation: ${['BUY', 'HOLD', 'SELL'][Math.floor(Math.random() * 3)]}</strong>
                <br>
                <small>Target Price: ${(getBasePrice(stock) * (1 + (Math.random() * 0.2 - 0.1))).toLocaleString()}</small>
            </div>
            
            <button onclick="updateChartAnalysis()" class="btn-back">
                <i class="fas fa-arrow-left"></i> Kembali
            </button>
        </div>
    `;
}

// Format volume for display
function formatVolume(volume) {
    if (volume >= 1000000000) {
        return (volume / 1000000000).toFixed(1) + 'B';
    } else if (volume >= 1000000) {
        return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
}

// Export chart functions
window.chartFunctions = {
    initializeCharts,
    updateCharts,
    getDetailedAnalysis,
    currentStock,
    currentTimeRange
};

document.addEventListener('DOMContentLoaded', function() {
    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID', { 
            maximumFractionDigits: 2 
        }).format(num);
    };

    const loadData = async () => {
        try {
            const response = await fetch('/api/ihsg');
            const data = await response.json();
            
            document.getElementById('price-info').innerHTML = `
                <p>Harga Terakhir: <strong>${formatNumber(data.last_price)}</strong></p>
                <p>Perubahan: <span class="${data.change >= 0 ? 'positive' : 'negative'}">
                    ${formatNumber(data.change)} (${((data.change / (data.last_price - data.change)) * 100).toFixed(2)}%)
                </span></p>
            `;

            new Chart(
                document.getElementById('ihsgChart'),
                {
                    type: 'line',
                    data: {
                        labels: data.dates,
                        datasets: [{
                            label: 'IHSG',
                            data: data.prices,
                            borderColor: '#007bff',
                            backgroundColor: 'rgba(0, 123, 255, 0.1)',
                            borderWidth: 2,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { 
                                beginAtZero: false,
                                ticks: { callback: formatNumber }
                            }
                        }
                    }
                }
            );
        } catch (error) {
            console.error("Error:", error);
            document.getElementById('price-info').innerHTML = 
                '<p class="negative">Gagal memuat data</p>';
        }
    };

    loadData();
});
