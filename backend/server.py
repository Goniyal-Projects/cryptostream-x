import asyncio
import json
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CryptoStream-X Pipeline Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/live-crypto")
async def handle_crypto_stream_pipeline(client_socket: WebSocket):
    await client_socket.accept()
    print("🚀 Connection established: Client attached to CryptoStream-X pipeline.")
    
    # Hardcoded target string explicitly declared directly inside the execution context
    target_url = "wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker"
    
    try:
        async with websockets.connect(target_url) as exchange_socket:
            while True:
                raw_exchange_message = await exchange_socket.recv()
                exchange_data = json.loads(raw_exchange_message)
                
                ticker_payload = {
                    "symbol": exchange_data.get("s"),        
                    "current_price": round(float(exchange_data.get("c", 0)), 2), 
                    "price_change_percent": round(float(exchange_data.get("P", 0)), 2), 
                    "volume_24h": round(float(exchange_data.get("v", 0)), 2), 
                    "high_price": round(float(exchange_data.get("h", 0)), 2)  
                }
                
                await client_socket.send_json(ticker_payload)
                
    except WebSocketDisconnect:
        print("🛑 Connection dropped: React viewport client disconnected safely.")
    except Exception as system_error:
        print(f"⚠️ Internal Pipeline Exception tracking error: {system_error}")
        try:
            await client_socket.close()
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
