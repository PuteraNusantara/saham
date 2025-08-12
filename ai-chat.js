// AI Chat Functionality
let chatHistory = [];
let isTyping = false;

function initializeAIChat() {
    setupChatEventListeners();
    loadChatSuggestions();
}

// Setup event listeners for chat
function setupChatEventListeners() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        chatInput.addEventListener('input', function() {
            const sendButton = document.getElementById('sendButton');
            if (this.value.trim()) {
                sendButton.classList.add('active');
            } else {
                sendButton.classList.remove('active');
            }
        });
    }
}

// Send message function
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    // Add user message
    addMessageToChat(message, 'user');
    input.value = '';
    document.getElementById('sendButton').classList.remove('active');
    
    // Show typing indicator
    showTypingIndicator();
    
    // Generate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        hideTypingIndicator();
        addMessageToChat(response, 'ai');
    }, Math.random() * 2000 + 1000); // 1-3 second delay
}

// Send suggestion
function sendSuggestion(suggestion) {
    document.getElementById('chatInput').value = suggestion;
    sendMessage();
}

// Add message to chat
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                ${formatAIResponse(message)}
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to history
    chatHistory.push({ message, sender, timestamp: new Date() });
}

// Format AI response with HTML
function formatAIResponse(response) {
    // Simple formatting for better presentation
    let formatted = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert bullet points
    const lines = formatted.split('\n');
    let inList = false;
    let result = '';
    
    for (let line of lines) {
        if (line.trim().startsWith('- ')) {
            if (!inList) {
                result += '<ul>';
                inList = true;
            }
            result += `<li>${line.substring(2).trim()}</li>`;
        } else {
            if (inList) {
                result += '</ul>';
                inList = false;
            }
            if (line.trim()) {
                result += `<p>${line.trim()}</p>`;
            }
        }
    }
    
    if (inList) {
        result += '</ul>';
    }
    
    return result;
}

// Show typing indicator
function showTypingIndicator() {
    if (document.querySelector('.typing-indicator')) return;
    
    isTyping = true;
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isTyping = false;
}

// Generate AI Response
function generateAIResponse(question) {
    const responses = getAIResponses();
    const lowerQuestion = question.toLowerCase();
    
    // Check for specific stock codes
    const stockCodes = ['bbri', 'bmri', 'tlkm', 'asii', 'bbca', 'bni'];
    for (const code of stockCodes) {
        if (lowerQuestion.includes(code)) {
            return generateStockAnalysis(code.toUpperCase());
        }
    }
    
    // Check for keywords
    for (const [keywords, response] of Object.entries(responses)) {
        const keywordList = keywords.split('|');
        if (keywordList.some(keyword => lowerQuestion.includes(keyword))) {
            return response;
        }
    }
    
    // Default response
    return `Terima kasih atas pertanyaan Anda tentang "${question}". Saya akan memberikan informasi yang relevan berdasarkan data pasar terkini.

**Analisis Umum:**
- Pasar saham Indonesia menunjukkan volatilitas yang wajar
- Sektor perbankan dan telekomunikasi masih menjadi favorit investor
- Diversifikasi portofolio tetap menjadi kunci sukses investasi

Apakah ada aspek spesifik yang ingin Anda dalami lebih lanjut?`;
}

// Get AI responses database
function getAIResponses() {
    return {
        'cara memulai|pemula|mulai investasi': `**Panduan Memulai Investasi Saham untuk Pemula**

**1. Persiapan Dasar:**
- Siapkan dana dingin minimal 1 juta rupiah
- Buka rekening efek di sekuritas terpercaya
- Pelajari dasar-dasar analisis fundamental dan teknikal

**2. Langkah Pertama:**
- Mulai dengan blue chip stocks (BBRI, BMRI, TLKM)
- Diversifikasi ke 3-5 saham berbeda sektor
- Terapkan dollar cost averaging

**3. Tips Penting:**
- Jangan investasi semua uang sekaligus
- Set target profit dan stop loss
- Investasi jangka panjang (minimal 1 tahun)

Apakah ada aspek tertentu yang ingin dipelajari lebih dalam?`,

        'analisis fundamental|fundamental|laporan keuangan': `**Analisis Fundamental Saham**

**Rasio Keuangan Penting:**
- **PER (Price Earning Ratio):** Idealnya < 15x
- **PBV (Price to Book Value):** Idealnya < 2x
- **ROE (Return on Equity):** > 15% sangat baik
- **DER (Debt to Equity Ratio):** < 1x lebih aman

**Indikator Kesehatan Perusahaan:**
- Pertumbuhan revenue konsisten
- Margin profit yang stabil
- Arus kas operasional positif
- Dividen yield yang menarik

**Tips Analisis:**
- Bandingkan dengan peers di sektor yang sama
- Lihat tren 3-5 tahun terakhir
- Perhatikan outlook industri

Mau saya analisis saham spesifik?`,

        'analisis teknikal|teknikal|chart|grafik': `**Analisis Teknikal Dasar**

**Indikator Utama:**
- **Moving Average:** MA20 dan MA50 untuk trend
- **RSI:** Overbought (>70), Oversold (<30)
- **MACD:** Signal bullish/bearish
- **Support & Resistance:** Level kunci harga

**Pattern Recognition:**
- Head & Shoulders: Reversal pattern
- Triangle: Continuation pattern
- Double Top/Bottom: Reversal signal

**Tips Trading:**
- Konfirmasi dengan volume tinggi
- Multiple timeframe analysis
- Risk management dengan stop loss

**Timeframe Recommended:**
- Day trading: 15m, 1H
- Swing trading: 4H, Daily
- Investment: Weekly, Monthly

Ingin analisis chart saham tertentu?`,

        'dividend|dividen|yield': `**Panduan Dividend Yield dan Investasi Dividen**

**Apa itu Dividend Yield?**
Persentase dividen tahunan dibagi harga saham saat ini

**Saham High Dividend di Indonesia:**
- TLKM: ~4-5% yield
- BMRI: ~3-4% yield  
- ASII: ~2-3% yield
- UNTR: ~4-6% yield

**Strategi Dividend Investing:**
- Pilih perusahaan dengan track record dividen konsisten
- Perhatikan payout ratio (idealnya 40-60%)
- Diversifikasi sektor untuk stabilitas

**Keuntungan:**
- Passive income rutin
- Cocok untuk investor konservatif
- Compound effect jangka panjang

**Risiko:**
- Dividen bisa dipotong saat krisis
- Capital gain terbatas
- Tax implications

Ingin rekomendasi saham dividen terbaik?`,

        'buy and hold|long term|jangka panjang': `**Strategi Buy and Hold**

**Prinsip Dasar:**
- Beli saham berkualitas dan tahan jangka panjang (5-10 tahun)
- Fokus pada fundamental perusahaan
- Abaikan fluktuasi harga jangka pendek

**Kriteria Saham untuk Buy and Hold:**
- Leader di industrinya
- Moat atau competitive advantage
- Management berkualitas
- Consistent earnings growth

**Contoh Saham Buy and Hold Indonesia:**
- BBRI: Bank retail terbesar
- TLKM: Monopoli telekomunikasi
- ASII: Konglomerat otomotif
- ICBP: Consumer staples

**Keuntungan:**
- Compound interest effect
- Menghindari market timing
- Biaya transaksi rendah
- Less stress

**Tips Sukses:**
- Dollar cost averaging
- Reinvest dividends
- Review tahunan portfolio
- Stay disciplined

Butuh bantuan memilih saham untuk buy and hold?`,

        'risk management|manajemen risiko|stop loss': `**Manajemen Risiko dalam Trading Saham**

**Prinsip 2% Rule:**
- Maksimal risiko 2% dari total portfolio per trade
- Jika portfolio 100 juta, maksimal loss 2 juta per trade

**Stop Loss Strategy:**
- Technical stop loss: Di bawah support
- Percentage stop loss: 5-10% dari entry
- Time-based stop loss: Exit jika tidak bergerak

**Position Sizing:**
- Hitung risk/reward ratio minimal 1:2
- Diversifikasi maksimal 5% per saham
- Reserve cash untuk averaging down

**Diversifikasi:**
- Sektor: Banking, Consumer, Mining, Infrastructure
- Market cap: Large cap, mid cap, small cap
- Geografi: Lokal vs global exposure

**Psychological Discipline:**
- Stick to your plan
- Don't chase FOMO
- Cut losses early, let profits run

**Portfolio Allocation:**
- 60% blue chips
- 30% growth stocks
- 10% speculative plays

Mau simulasi perhitungan risk untuk trade tertentu?`
    };
}

// Generate stock analysis
function generateStockAnalysis(stockCode) {
    const stockAnalyses = {
        'BBRI': {
            name: 'Bank Rakyat Indonesia',
            sector: 'Perbankan',
            price: '4,580',
            target: '5,200',
            recommendation: 'BUY',
            analysis: `**Analisis BBRI (Bank Rakyat Indonesia)**

**Fundamental Analysis:**
- PER: 8.5x (Attractive)
- PBV: 1.2x (Reasonable)  
- ROE: 18.5% (Excellent)
- NPL: 2.1% (Healthy)

**Strengths:**
- Market leader di segmen mikro dan UMKM
- Digital banking transformation
- Strong credit growth
- Consistent dividend payout

**Catalysts:**
- Ekspansi digital banking
- Economic recovery Indonesia
- Interest rate normalization
- UMKM sector recovery

**Technical View:**
- Support: 4,400
- Resistance: 4,800
- RSI: 65 (Neutral to bullish)
- Trend: Bullish

**Target Price: 5,200 (Upside 13.5%)**
**Recommendation: BUY**`
        },
        
        'BMRI': {
            name: 'Bank Mandiri',
            sector: 'Perbankan', 
            price: '5,325',
            target: '5,800',
            recommendation: 'HOLD',
            analysis: `**Analisis BMRI (Bank Mandiri)**

**Fundamental Analysis:**
- PER: 9.2x (Fair)
- PBV: 1.1x (Attractive)
- ROE: 16.8% (Good)
- NPL: 2.8% (Manageable)

**Strengths:**
- Largest bank by assets
- Strong corporate banking
- Digital transformation progress
- Government backing

**Risks:**
- Exposure to large corporates
- Competition in retail segment
- Credit risk in current environment

**Technical View:**
- Support: 5,100
- Resistance: 5,500
- RSI: 58 (Neutral)
- Trend: Sideways

**Target Price: 5,800 (Upside 8.9%)**
**Recommendation: HOLD**`
        },
        
        'TLKM': {
            name: 'Telkom Indonesia',
            sector: 'Telekomunikasi',
            price: '3,150',
            target: '3,600', 
            recommendation: 'BUY',
            analysis: `**Analisis TLKM (Telkom Indonesia)**

**Fundamental Analysis:**
- PER: 12.5x (Reasonable)
- PBV: 1.8x (Fair)
- ROE: 14.2% (Good)
- Dividend Yield: 4.8% (Attractive)

**Strengths:**
- Monopoli infrastruktur telekomunikasi
- 5G rollout opportunity
- Digital business expansion
- Stable dividend payer

**Growth Drivers:**
- Data consumption growth
- Digital transformation Indonesia
- Enterprise solutions
- Tower monetization

**Technical View:**
- Support: 3,000
- Resistance: 3,300
- RSI: 72 (Slightly overbought)
- Trend: Bullish

**Target Price: 3,600 (Upside 14.3%)**
**Recommendation: BUY**`
        },
        
        'ASII': {
            name: 'Astra International',
            sector: 'Otomotif',
            price: '6,875',
            target: '7,500',
            recommendation: 'HOLD',
            analysis: `**Analisis ASII (Astra International)**

**Fundamental Analysis:**
- PER: 11.8x (Fair)
- PBV: 1.5x (Reasonable)
- ROE: 12.5% (Decent)
- Dividend Yield: 2.8% (Moderate)

**Business Segments:**
- Automotive: 50% revenue
- Financial Services: 20%
- Heavy Equipment: 15%
- Agribusiness: 10%
- Others: 5%

**Catalysts:**
- Automotive market recovery
- Infrastructure projects
- Electric vehicle transition
- Commodity price stability

**Risks:**
- Cyclical nature of business
- Competition in automotive
- Commodity price volatility

**Target Price: 7,500 (Upside 9.1%)**
**Recommendation: HOLD**`
        }
    };
    
    const analysis = stockAnalyses[stockCode];
    if (analysis) {
        return analysis.analysis;
    }
    
    return `Saya belum memiliki analisis detail untuk ${stockCode}. Namun saya bisa memberikan analisis umum berdasarkan data pasar. Apakah ada saham lain yang ingin dianalisis?`;
}

// Load chat suggestions
function loadChatSuggestions() {
    const suggestions = [
        'Bagaimana cara memulai investasi saham?',
        'Analisis BBRI hari ini',
        'Apa itu dividend yield?',
        'Strategi buy and hold',
        'Manajemen risiko trading',
        'Analisis fundamental vs teknikal',
        'Rekomendasi saham blue chip',
        'Tips untuk pemula'
    ];
    
    const suggestionsContainer = document.querySelector('.chat-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = '';
        
        suggestions.slice(0, 4).forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'suggestion-btn';
            button.textContent = suggestion;
            button.onclick = () => sendSuggestion(suggestion);
            suggestionsContainer.appendChild(button);
        });
    }
}

// Export chat functions
window.chatFunctions = {
    sendMessage,
    sendSuggestion,
    generateAIResponse,
    chatHistory
};