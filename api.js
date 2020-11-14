let api_command = {
    "add_client":           "/client/add",
    "get_online_clients":   "/client/get",
    "del_client":           "/client/del",
    "send_message":         "/message/send",
    "get_messages":         "/message/get"
};
let server_host = 'http://localhost:8080';
let public_key = '123';
let secret_key = '';

// обьявить серверу что клиент в сети
async function getOnline() {
    let url = server_host + api_command.add_client + "?key=" + public_key;
    let response = await sendRequest(url);
    let json = JSON.parse(response);
    if (json.message = "isOnline") {
        console.log('online');
    } else {
        console.log('error');
    }
    getOnlineFrends([123]);
}

// обьявить серверу что клиент вышел из сети
async function getOffline() {
    let url = server_host + api_command.del_client + "?key=" + public_key;
    let response = await sendRequest(url);
    let json = JSON.parse(response);
    if (json.message = "isOffline") {
        console.log('online');
    } else {
        console.log('error');
    }
}

// получить список друзей в сети
// keys - список открытых ключей друзей
async function getOnlineFrends(keys) {
    let url = server_host + api_command.get_online_clients + "?keys=" + keys;
    let response = await sendRequest(url);
    let json = JSON.parse(response);
    console.log(json.online_users);
}

// отправить сообщение
async function sendMessage(message, sender, frend) {
    let url = "http://localhost:8080/client/get?keys=123";
    let response = await sendRequest(url);
    let json = JSON.parse(response);
}

// получить сообщения
async function getMessages() {
    let url = "http://localhost:8080/client/get?keys=123";
    let response = await sendRequest(url);
    let json = JSON.parse(response);
}

// отправка кросс-доменного запроса
async function sendRequest(url) {
    let response = await fetch(url, {
        headers: {
            origin: 'http://localhost:8080'
        }
      });
    let text = await response.text();
    return text;
}