// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupMobileMenu();
    initializeDashboard();
    initializeCharts();
    initializeAIChat();
    setupRealTimeUpdates();
}

// Navigation System
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage + '-page') {
                    page.classList.add('active');
                }
            });

            // Initialize page-specific functionality
            if (targetPage === 'charts') {
                setTimeout(initializeMainChart, 100);
            }
        });
    });
}

// Mobile Menu Toggle
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Dashboard Initialization
function initializeDashboard() {
    createMiniChart();
    updateMarketStatus();
    loadTopStocks();
}

// Create Mini Chart for Dashboard
function createMiniChart() {
    const ctx = document.getElementById('miniChart');
    if (!ctx) return;

    const data = generateMiniChartData();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                borderColor: '#00d4aa',
                backgroundColor: 'rgba(0, 212, 170, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
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
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
}

// Generate sample data for mini chart
function generateMiniChartData() {
    const labels = [];
    const values = [];
    const basePrice = 7234.56;
    
    for (let i = 0; i < 24; i++) {
        labels.push(i + ':00');
        const variation = (Math.random() - 0.5) * 100;
        values.push(basePrice + variation);
    }
    
    return { labels, values };
}

// Update Market Status
function updateMarketStatus() {
    const now = new Date();
    const hour = now.getHours();
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.market-status span:nth-child(2)');
    
    if (hour >= 9 && hour < 16) {
        statusIndicator.className = 'status-indicator open';
        statusText.textContent = 'Pasar Terbuka';
    } else {
        statusIndicator.className = 'status-indicator closed';
        statusText.textContent = 'Pasar Tutup';
    }
}

// Load Top Stocks with real-time updates
function loadTopStocks() {
    const stocks = [
        { code: 'BBRI', price: 4580, change: 2.1 },
        { code: 'BMRI', price: 5325, change: -0.8 },
        { code: 'TLKM', price: 3150, change: 1.5 },
        { code: 'ASII', price: 6875, change: 0.9 }
    ];

    const stocksList = document.querySelector('.stocks-list');
    if (!stocksList) return;

    stocksList.innerHTML = '';
    
    stocks.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'stock-item';
        
        const changeClass = stock.change >= 0 ? 'gain' : 'loss';
        const changeSign = stock.change >= 0 ? '+' : '';
        
        stockItem.innerHTML = `
            <span class="stock-code">${stock.code}</span>
            <span class="stock-price">${stock.price.toLocaleString()}</span>
            <span class="stock-change ${changeClass}">${changeSign}${stock.change}%</span>
        `;
        
        stockItem.addEventListener('click', function() {
            showStockDetail(stock.code);
        });
        
        stocksList.appendChild(stockItem);
    });
}

// Show stock detail modal/popup
function showStockDetail(stockCode) {
    alert(`Detail saham ${stockCode} akan ditampilkan di sini. Feature dalam pengembangan.`);
}

// Real-time Updates
function setupRealTimeUpdates() {
    // Update stock prices every 30 seconds
    setInterval(() => {
        updateStockPrices();
        updateMarketSummary();
    }, 30000);
    
    // Update time every minute
    setInterval(updateMarketStatus, 60000);
}

// Update stock prices with simulated real-time data
function updateStockPrices() {
    const stockItems = document.querySelectorAll('.stock-item');
    
    stockItems.forEach(item => {
        const priceElement = item.querySelector('.stock-price');
        const changeElement = item.querySelector('.stock-change');
        
        if (priceElement && changeElement) {
            const currentPrice = parseInt(priceElement.textContent.replace(/,/g, ''));
            const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
            const newPrice = Math.round(currentPrice * (1 + variation));
            const changePercent = ((newPrice - currentPrice) / currentPrice * 100).toFixed(1);
            
            priceElement.textContent = newPrice.toLocaleString();
            
            const changeClass = changePercent >= 0 ? 'gain' : 'loss';
            const changeSign = changePercent >= 0 ? '+' : '';
            
            changeElement.className = `stock-change ${changeClass}`;
            changeElement.textContent = `${changeSign}${changePercent}%`;
            
            // Add flash effect
            item.classList.add('price-flash');
            setTimeout(() => item.classList.remove('price-flash'), 1000);
        }
    });
}

// Update market summary
function updateMarketSummary() {
    const ihsgElement = document.querySelector('.summary-item .value');
    const changeElement = document.querySelector('.summary-item .change');
    
    if (ihsgElement && changeElement) {
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const currentValue = 7234.56;
        const newValue = (currentValue * (1 + variation)).toFixed(2);
        const changePercent = (variation * 100).toFixed(2);
        
        ihsgElement.textContent = newValue;
        
        const changeClass = variation >= 0 ? 'gain' : 'loss';
        const changeSign = variation >= 0 ? '+' : '';
        
        changeElement.className = `change ${changeClass}`;
        changeElement.textContent = `${changeSign}${changePercent}%`;
    }
}

// Quick Chat Functionality
function askQuickQuestion() {
    const input = document.getElementById('quick-question');
    const answerDiv = document.getElementById('quick-answer');
    
    if (!input.value.trim()) {
        showNotification('Silakan masukkan pertanyaan terlebih dahulu', 'warning');
        return;
    }
    
    const question = input.value.trim();
    answerDiv.innerHTML = '<div class="loading">Menganalisis pertanyaan...</div>';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateQuickAIResponse(question);
        answerDiv.innerHTML = `
            <div class="ai-quick-response">
                <i class="fas fa-robot"></i>
                <p>${response}</p>
                <small>Untuk analisis lebih detail, silakan gunakan AI Assistant</small>
            </div>
        `;
    }, 1500);
    
    input.value = '';
}

// Generate AI response for quick questions
function generateQuickAIResponse(question) {
    const responses = {
        'bbri': 'BBRI menunjukkan tren positif dengan fundamental yang kuat. Bank ini memiliki NPL rendah dan pertumbuhan kredit yang stabil.',
        'bmri': 'BMRI sebagai bank terbesar memiliki diversifikasi yang baik. Namun, perhatikan rasio CAR dan ROE di laporan keuangan terbaru.',
        'ihsg': 'IHSG saat ini berada dalam tren sideways dengan support di 7.200 dan resistance di 7.300. Pantau volume trading.',
        'investasi': 'Untuk pemula, mulai dengan blue chip stocks dan diversifikasi portofolio. Jangan lupa tentang manajemen risiko.',
        'saham': 'Analisis fundamental dan teknikal sangat penting. Perhatikan PER, ROE, dan trend chart sebelum membeli.'
    };
    
    const lowerQuestion = question.toLowerCase();
    
    for (const key in responses) {
        if (lowerQuestion.includes(key)) {
            return responses[key];
        }
    }
    
    return 'Pertanyaan yang menarik! Untuk analisis yang lebih mendalam, silakan gunakan fitur AI Assistant di menu navigasi.';
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Format number with Indonesian locale
function formatIDR(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

// Format percentage
function formatPercent(number) {
    const sign = number >= 0 ? '+' : '';
    return `${sign}${number.toFixed(2)}%`;
}

// Enter key support for inputs
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        if (e.target.id === 'quick-question') {
            askQuickQuestion();
        } else if (e.target.id === 'chatInput') {
            sendMessage();
        }
    }
});

// Smooth scroll for navigation
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Export functions for use in other files
window.appFunctions = {
    showNotification,
    formatIDR,
    formatPercent,
    generateQuickAIResponse
};
