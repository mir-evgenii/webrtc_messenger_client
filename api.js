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
    getMessages();
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
    // TODO добавить обработку ошибки
    return json.online_users;
}

// отправить сообщение
async function sendMessage(message, sender, recipient) {
    let date = getFormatedDateTime();
    let sign = ''; // TODO реализовать подпись RSA
    let url = server_host + api_command.send_message + "?content=" + message + "&sender=" + sender + "&recipient=" + recipient + "&date=" + date + "&sign=" + sign;
    let response = await sendRequest(url);
    let json = JSON.parse(response);
    console.log(json);
}

// получить сообщения
async function getMessages() {
    let url = server_host + api_command.get_messages + "?key=" + public_key;
    let response = await sendRequest(url);
    let json = JSON.parse(response);
    console.log(json['messages-for-client']); // TODO заменить - на _ на сервере
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

function getFormatedDateTime() {
    let date = new Date();
    let curr_date = date.getDate();
    let curr_month = date.getMonth() + 1;
    let curr_year = date.getFullYear();
    let curr_hour = date.getHours();
    let curr_minute = date.getMinutes();
    let curr_secund = date.getSeconds();
    let formated_date = curr_date + '-' + curr_month + '-' + curr_year + ' ' + curr_hour + ':' + curr_minute + ':' + curr_secund; 

    return formated_date;
}