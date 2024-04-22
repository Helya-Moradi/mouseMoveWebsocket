let config = localStorage.getItem('config');
let clients = [];

if (config) {
    config = JSON.parse(config);

} else {
    let name = prompt('name:');
    let color = prompt('color:');

    config = {
        name,
        color
    }

    localStorage.setItem('config', JSON.stringify(config))
}

const socket = new WebSocket('ws://192.168.3.1:8000')

socket.onopen = function (e) {
    socket.send(JSON.stringify({
        action: 'introduce',
        data: config
    }))
}

socket.onmessage = function (e) {
    const message = JSON.parse(e.data)

    if (message.action === 'introduced') {
        clients = message.data.clients;
        clients.forEach(createClient)

    } else if (message.action === 'joined') {
        clients.push(message.data)

        createClient(message.data)
    } else if (message.action === 'moved') {
        const client = clients.find((c) => message.data.name === c.name)

        if (client) {
            client.position = message.data.position;

            updateClient(client)
        }
    }
}

document.addEventListener('mousemove', (e) => {
    socket.send(JSON.stringify({
        action: 'move',
        data: {
            x: e.pageX,
            y: e.pageY
        }
    }))
})


function createClient(client) {
    const elem = document.createElement('div')
    elem.classList.add('client')
    elem.setAttribute('data-name',client.name)
    elem.style.backgroundColor = client.color;
    elem.style.left = client.position.x + 'px';
    elem.style.top = client.position.y + 'px';

    document.body.appendChild(elem)
    client.elem = elem;
}

function updateClient(client) {
    client.elem.style.left = client.position.x + 'px';
    client.elem.style.top = client.position.y + 'px';
}