getDataPb(11);

function setCourceRate(dataRaw)
{
    let usdRow = document.getElementById('usd');
    let eurRow = document.getElementById('eur');
    let rurRow = document.getElementById('rur');
    
    let usdSale = usdRow.querySelector('.sale');
    let usdBuy = usdRow.querySelector('.buy');
    usdBuy.innerHTML = Math.round(parseFloat(dataRaw[0]['buy']) * 100) / 100;
    usdSale.innerHTML = Math.round(parseFloat(dataRaw[0]['sale']) * 100) / 100;
    
    let eurSale = eurRow.querySelector('.sale');
    let eurBuy = eurRow.querySelector('.buy');
    eurBuy.innerHTML = Math.round(parseFloat(dataRaw[1]['buy']) * 100) / 100;
    eurSale.innerHTML = Math.round(parseFloat(dataRaw[1]['sale']) * 100) / 100;
    
    let rurSale = rurRow.querySelector('.sale');
    let rurBuy = rurRow.querySelector('.buy');
    rurBuy.innerHTML = Math.round(parseFloat(dataRaw[2]['buy']) * 100) / 100;
    rurSale.innerHTML = Math.round(parseFloat(dataRaw[2]['sale']) * 100) / 100;
}


function getDataPb(coursId) {
    let url = 'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=' + coursId;
    
    let xhr = new XMLHttpRequest();
    let dataRaw;
    
    xhr.timeout = 10000; // 10 sec
//    xhr.addEventListener('progress', connectUpdateProgress, false);
//    xhr.addEventListener('load', connectTransferComplete, false);
//    xhr.addEventListener('error', connectTransferFailed, false);
//    xhr.addEventListener('abort', connectTransferCanceled, false);
    
    xhr.onreadystatechange = function() {
	if (xhr.readyState === 4 && xhr.status === 200) {
	    dataRaw = xhr.response;
            setCourceRate(dataRaw);
            //console.log(dataRaw);
	}
    };

    xhr.open('GET', url, true);
    
    xhr.responseType = 'json';
    
    xhr.send();
    
    return dataRaw;
};


