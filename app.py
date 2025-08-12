from flask import Flask, render_template, jsonify
import yfinance as yf
from datetime import datetime, timedelta
import pytz

app = Flask(__name__)

def get_market_status():
    """Cek status pasar berdasarkan waktu lokal Indonesia"""
    jakarta_tz = pytz.timezone('Asia/Jakarta')
    now = datetime.now(jakarta_tz)
    
    # Cek weekday (Senin-Jumat)
    if now.weekday() >= 5:  # Sabtu-Minggu
        return False
    
    # Cek jam pasar (09:00-16:00 WIB)
    market_open = now.replace(hour=9, minute=0, second=0, microsecond=0)
    market_close = now.replace(hour=16, minute=0, second=0, microsecond=0)
    return market_open <= now <= market_close

@app.route('/api/ihsg')
def get_ihsg():
    try:
        ticker = yf.Ticker("^JKSE")
        data = ticker.history(period="1mo")
        
        if data.empty:
            return jsonify({"error": "Data kosong"}), 404
            
        # Pastikan semua data terformat dengan benar
        prices = data["Close"].round(2).tolist()
        dates = data.index.strftime("%Y-%m-%d").tolist()
        
        # Validasi panjang data
        if len(prices) != len(dates):
            return jsonify({
                "error": "Data tidak konsisten",
                "details": f"Jumlah dates ({len(dates)}) != prices ({len(prices)})"
            }), 500
        
        return jsonify({
            "dates": dates,
            "prices": prices,
            "last_price": round(data["Close"].iloc[-1], 2),
            "change": round(data["Close"].iloc[-1] - data["Close"].iloc[-2], 2)
        })
        
    except Exception as e:
        return jsonify({
            "error": "System error",
            "details": str(e)
        }), 500
@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)