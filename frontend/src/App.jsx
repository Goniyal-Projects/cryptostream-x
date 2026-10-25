import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [cryptoPrices, setCryptoPrices] = useState({
    BTCUSDT: { current_price: 0, price_change_percent: 0, volume_24h: 0, high_price: 0 },
    ETHUSDT: { current_price: 0, price_change_percent: 0, volume_24h: 0, high_price: 0 }
  });
  const [pipelineState, setPipelineState] = useState("Initializing Link...");
  const socketRef = useRef(null);

  useEffect(() => {
    // Hardcoded connection link pointing directly to your local FastAPI backend pipeline
    socketRef.current = new WebSocket("ws://127.0.0.1:8000/ws/live-crypto");

    socketRef.current.onopen = () => setPipelineState("Pipeline Stream Active ⚡");
    
    socketRef.current.onmessage = (event) => {
      const incomingTicker = JSON.parse(event.data);
      const targetSymbol = incomingTicker.symbol;

      if (targetSymbol === "BTCUSDT" || targetSymbol === "ETHUSDT") {
        setCryptoPrices((prevPrices) => ({
          ...prevPrices,
          [targetSymbol]: incomingTicker
        }));
      }
    };

    socketRef.current.onclose = () => setPipelineState("Pipeline Connection Offline ❌");

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh', padding: '25px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #141414', paddingBottom: '15px', marginBottom: '35px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>CryptoStream-X</h1>
        <p style={{ color: '#666', marginTop: '6px', fontSize: '0.9rem' }}>
          Pipeline Status: <span style={{ color: '#ffb6c1', fontWeight: '600' }}>{pipelineState}</span>
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
        {Object.keys(cryptoPrices).map((symbol) => {
          const coinData = cryptoPrices[symbol];
          const isPositive = coinData.price_change_percent >= 0;

          return (
            <div key={symbol} style={{ backgroundColor: '#080808', border: '1px solid #161616', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.7)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#b3b3b3' }}>{symbol === "BTCUSDT" ? "🪙 Bitcoin (BTC)" : "💎 Ethereum (ETH)"}</span>
                <span style={{ backgroundColor: isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: isPositive ? '#4caf50' : '#f44336', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                  {isPositive ? '▲' : '▼'} {coinData.price_change_percent}%
                </span>
              </div>
              
              <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '20px 0', color: '#ffffff', fontFamily: 'monospace' }}>
                ${coinData.current_price.toLocaleString()}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', borderTop: '1px solid #141414', paddingTop: '15px', fontSize: '0.85rem', color: '#555' }}>
                <div>
                  <label style={{ display: 'block', color: '#444', marginBottom: '4px' }}>24H HIGH TARGET</label>
                  <span style={{ color: '#aaa', fontWeight: '600' }}>${coinData.high_price.toLocaleString()}</span>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#444', marginBottom: '4px' }}>EXCHANGE VOLUME</label>
                  <span style={{ color: '#aaa', fontWeight: '600' }}>{coinData.volume_24h.toLocaleString()} units</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
