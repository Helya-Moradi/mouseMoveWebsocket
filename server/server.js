const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({
    port: 8000,
});

wss.on('connection', (ws) => {
    console.log('Connected')

    ws.on('error', (error) => {
        console.error('Error', error);
    });

    ws.on('message', (buffer) => {
        const message = Buffer.from(buffer).toString('utf-8');
        const data = JSON.parse(message);

        if (data.action === 'introduce') {
            handleIntroduce(ws, data.data);
        } else if (data.action === 'move') {
            handleMove(ws, data.data);
        }
    });
});

function handleIntroduce(ws, data) {
    ws.metadata = {
        name: data.name || 'user',
        color: data.color || 'black',
        position: { x: 0, y: 0 },
    };

    const clients = [];

    wss.clients.forEach((client) => {
        clients.push({
            name: client.metadata.name,
            color: client.metadata.color,
            position: client.metadata.position,
        });

        if (client !== ws) {
            client.send(JSON.stringify({
                action: 'joined',
                data: ws.metadata,
            }))
        }
    })

    ws.send(JSON.stringify({
        action: 'introduced',
        data: {
            clients,
        },
    }))
}

function handleMove(ws, data) {
    ws.metadata.position = { x: data.x, y: data.y };

    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            action: 'moved',
            data: ws.metadata,
        }))
    })
}