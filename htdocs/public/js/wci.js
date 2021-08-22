"use strict";

let addCoinButton = document.querySelector('.add_coin');
let wciKeyAddButton = document.querySelector('.wci_key_add_button');
let coinList = {};
let coinListLenght = 0;
let wciApiKey;

if (undefined !== localStorage.coinList) {
    coinList = JSON.parse(localStorage.coinList);
    coinListLenght = Object.keys(coinList).length;
} else {
    coinList = {
        'Bittorrent':'BTT',
        'Dogecoin':'DOGE',
        'Ripple':'XRP',
        'Tron':'TRX',
        'Bitcoin':'BTC',
        'Ethereum':'ETH',
        'Zcash':'ZEC',
        'Litecoin':'LTC',
        'Stellarlumens':'XLM',
        'Shiba-inu':'SHIB',
        'Etherinc':'ETI',
        'Desire':'DSR',
    };
    localStorage.setItem ('coinList', JSON.stringify(coinList));
}

if (undefined === localStorage.wciApiKey) {
    setWciApiKeyAddBox();
    wciKeyAddButton = document.querySelector('.wci_key_add_button');
    
    let addWciKey = function addWciKey(wciApiKey) {
        let wciKey = document.querySelector('.wci_key_input').value;
        localStorage.setItem('wciApiKey', wciKey);
        document.querySelector('.wci_key_input').value = '';
        wciApiKey = wciKey;
        coinTableView(coinList);
        getPriceData(coinList, wciApiKey, true);
        setWciApiMessageBox();
    };
    wciKeyAddButton.addEventListener('click', addWciKey.bind(this, wciApiKey));
} else {
    wciApiKey = localStorage.wciApiKey;
    setWciApiMessageBox();
    let wciKeyAddButton = document.querySelector('.wci_key_add_button');
}

/** Add coin submit handler */
let getCoin = function getCoin(coinList, coinListLenght) {
    let fullName = document.querySelector('.full_name').value;
    let abbreviation = document.querySelector('.abbreviation').value;
    coinList[fullName] = abbreviation;
    let coinListString = JSON.stringify(coinList);
    localStorage.setItem('coinList', coinListString);
    coinListLenght = Object.keys(coinList).length;
    coinTableView(coinList);
    getPriceData(coinList, wciApiKey, true);
    document.querySelector('.full_name').value = '';
    document.querySelector('.abbreviation').value = '';
};
addCoinButton.addEventListener('click', getCoin.bind(this, coinList));



coinTableView(coinList);
getPriceData(coinList, wciApiKey, false);

function getPriceData(coinList, wciApiKey, sourceNecessarily) {
    let data = {};
    
    let useCacheInterval = 120;
    
    let date = localStorage.getItem('dataSourceDate');
    date = new Date(date);
    let dateNow = new Date();
    let dateDiff = Math.round((dateNow - date) / 1000);
    
    if (undefined !== wciApiKey && (useCacheInterval < dateDiff || true === sourceNecessarily)) {
        let url = wciUrl(coinList, wciApiKey);
        data = getDataWci(url);
    } else {
        let dataSourceText = localStorage.dataSource;
        if (undefined !== dataSourceText) {
            let dataSource = JSON.parse(dataSourceText);
            setCoinPrice(dataSource, coinList);
        }
    }
    
    return data;
}

function delCoin(coin) {
    delete coinList[coin];
    coinTableView(coinList);
    getPriceData(coinList, wciApiKey, false);
    let coinListString = JSON.stringify(coinList);
    localStorage.setItem('coinList', coinListString);
}

function delWciApiKey () {
    localStorage.removeItem('wciApiKey');
    setWciApiKeyAddBox();
    wciKeyAddButton = document.querySelector('.wci_key_add_button');
    wciApiKey = '';
}

function wciUrl(coinList, wciApiKey) {
    let label = '';
    for (let coinKey in coinList) {
        let coinNeed = coinList[coinKey].toLowerCase() + 'btc';
        label += coinNeed + '-';
    }
    let urlCoin = 'https://www.worldcoinindex.com/apiservice/ticker?key=' + wciApiKey + '&label=' + label + '&fiat=usd'

    return urlCoin;
}

function coinTableView(coinList) {
    let tableRow = '';
    coinListLenght = Object.keys(coinList).length;
    if (0 !== coinListLenght) {
        for (let coin in coinList) {
            tableRow += '<tr><td class="coin_name_box">' + coin + ' (' + coinList[coin] + ')</td><td class="coin_value coin_value_' + coinList[coin].toLowerCase() + '">0</td><td class="del_box" title="Delete coin" onclick="delCoin(\'' + coin +'\')">D</td></tr>';
        }
        let priceContainer = document.querySelector('.price_container');
        priceContainer.innerHTML = tableRow;
    }
}

function setWciApiKeyAddBox() {
    let priceContainer = document.querySelector('.wci_key_box');
    priceContainer.innerHTML = '<form method="POST"><input type="text" name="wci_key" class="wci_key_input" placeholder="Worldcoinindex.com API key"> <button type="submit" name="wci_key_add_button" class="wci_key_add_button" value="Add WCI key" onclick="return false">Add WCI Key</button></form>';
}

function setWciApiMessageBox() {
    let priceContainer = document.querySelector('.wci_key_box');
    priceContainer.innerHTML = '<div>Key saved <span title="Delete coin" onclick="delWciApiKey()">DEL</span></div>';
}


//let wciKeyRaw = JSON.parse(localStorage.getItem('wciKey'));
let wciKeyRaw = localStorage.getItem('wciKey');

//if (null === wciKeyRaw) {
//    let wciKeyReceived = prompt('Enter WCI API key', '');
//    if (null === wciKeyReceived.match(/^[0-9a-z]{3,40}$/i)) {
//        //console.log('Does not match the pattern');
//    } else {
//        //console.log('Match pattern');
//        wciConnect(wciKeyReceived);
//    }
//}



function getDataWci(url) {
    let xhr = new XMLHttpRequest();
    let dataRaw;
    
    xhr.timeout = 10000; // 10 sec
    xhr.addEventListener('progress', connectUpdateProgress, false);
    xhr.addEventListener('load', connectTransferComplete, false);
    xhr.addEventListener('error', connectTransferFailed, false);
    xhr.addEventListener('abort', connectTransferCanceled, false);
    
    xhr.onreadystatechange = function() {
	if (xhr.readyState === 4 && xhr.status === 200) {
	    dataRaw = xhr.response;
            localStorage.setItem('dataSource', JSON.stringify(dataRaw));
            localStorage.setItem('dataSourceDate', new Date());
	    setCoinPrice(dataRaw, coinList);
            //console.log(dataRaw);
	}
    };

    xhr.open('GET', url, true);
    
    xhr.responseType = 'json';
    
    xhr.send();
    
    return dataRaw;
};

function setCoinPrice(data, coinList) {
    if (undefined !== data['Markets']) {
        let dataMarketsRaw = data['Markets'];
        for (let i = 0; i < dataMarketsRaw.length; i++) {
            let row = dataMarketsRaw[i];
            let coinName = row['Name'];

            if (coinName in coinList) {
                let price = row['Price'];
                let className = '.coin_value_' + coinList[coinName].toLowerCase();
                let priceValue = document.querySelector(className);
                priceValue.innerHTML = '<a href="https://www.worldcoinindex.com/coin/' + coinName.toLowerCase() + '" target="_blank">' + roundByValue(price) + '</a>';
            }
        }
        
        let date = localStorage.getItem('dataSourceDate');
        date = new Date(date);
        let dateText = getDateTime(date);
        let priceValue = document.querySelector('.date_update_coin_index');
        priceValue.innerHTML = 'Last updated: ' + dateText;
    }
}

function connectUpdateProgress (evt) {
    console.log('Progress: ' + evt);
}
function connectTransferComplete (evt) {
    console.log('Complete: ' + evt);
}
function connectTransferFailed (evt) {
    console.log('Failed: ' + evt);
}
function connectTransferCanceled (evt) {
    console.log('Canseled: ' + evt);
}

function roundByValue(value) {
    if (value > 1000) {
        return Math.round(value);
    } else if (value > 100) {
        return Math.round(parseFloat(value) * 10) / 10;
    } else if (value > 10) {
        return Math.round(parseFloat(value) * 100) / 100;
    } else if (value > 1) {
        return Math.round(parseFloat(value) * 1000) / 1000;
    } else if (value > 0.1) {
        return Math.round(parseFloat(value) * 1000) / 1000;
    } else if (value > 0.01) {
        return Math.round(parseFloat(value) * 10000) / 10000;
    } else if (value > 0.001) {
        return Math.round(parseFloat(value) * 100000) / 100000;
    } else if (value > 0.0001) {
        return Math.round(parseFloat(value) * 1000000) / 1000000;
    } else {
        return Math.round(parseFloat(value) * 10000000) / 10000000;
    }
}

function getDateTime(date) {
    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    let yy = date.getFullYear();
    let hh = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours();
    let ii = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
    let ss = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();

    return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + ii + ':' + ss;
}
