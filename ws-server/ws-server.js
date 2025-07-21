const WebSocket = require('ws');
const { createClient } = require('redis');

const wss = new WebSocket.Server({ port: 8080 }); // WebSocket server trên port 8080
const redis = createClient({url: process.env.REDIS_URL });

(async () => {
  console.log("begin useWebsocket");
  await redis.connect();
  console.log("connecting redis");
  // SUBSCRIBE channel 'bid_updates'
  await redis.subscribe('bid_updates', (message) => {
    // Khi có message mới từ Redis, gửi tới tất cả client WebSocket
    console.log("message from redis: ", message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("client connected");
        client.send(message);
      }
    });
  });
})();

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ message: 'Connected to bid updates' }));
});