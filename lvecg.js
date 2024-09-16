

var nameBle;
var deviceUuid;
var notifyUuid;
var writeUuid;
let appState;
let notifyEcg;
let serviceEcg;
let gattEcg;
window.callEcg = function () {
  appState = window.appEcg;
  appEcg.getConnect(0);
};

function setUuid(obj) {
  nameBle=obj.nameBle;
  deviceUuid=obj.deviceUuid;
  notifyUuid=obj.notifyUuid;
  writeUuid=obj.writeUuid;
  //console.log(nameBle);
}

function handleNotify(event) {
  appEcg.getValue(event.target.value) ;
}

function onDisconnected(event) {
    appEcg.getConnect(0);
}

function connectDevice(){
  navigator.bluetooth.requestDevice({
      filters: [{name: nameBle}],
      optionalServices: [deviceUuid,notifyUuid,writeUuid],
      acceptAllDevices: false,
      acceptAllAdvertisements: true,
      'listAllDevicesEvenThoughItIsAPoorUserExperience': true
  }).then(device => {
      appEcg.getConnect(1)
      device.addEventListener('gattserverdisconnected', onDisconnected);
      return device.gatt.connect();
  }).then(gattServer =>{
      gattEcg=gattServer;
      return gattEcg.getPrimaryService(deviceUuid);
  }).then(service => {
      serviceEcg= service;
      return serviceEcg.getCharacteristic(notifyUuid);
  }).then(characteristic => {
      notifyEcg= characteristic;
      appEcg.getConnect(2)
      return notifyEcg.startNotifications().then(_ => {
      notifyEcg.addEventListener('characteristicvaluechanged',
        handleNotify);
  });
  }).catch(error => { 
     appEcg.getConnect(0);
  });
}

function disconnectDevice() {
  if(gattEcg && gattEcg.connected) {
    if(notifyEcg) {
        notifyEcg.stopNotifications()
        .then(() => {
        return gattEcg.disconnect();
        }).then(() => {
        })
        .catch(error => {
        });
    } else {
    }
  } else {
  }
}
function playDevice(value) {
  if(gattEcg && gattEcg.connected) {
    if(notifyEcg) {
      if(value){
        notifyEcg.startNotifications();
      }else{
        notifyEcg.stopNotifications();
      };
    }
  }
}
async function writeOnCharacteristic(value){
  if (gattEcg&& gattEcg.connected) {
      serviceEcg.getCharacteristic(writeUuid)
    .then(characteristic => {
        const data =new TextEncoder("utf-8").encode(value);
        return characteristic.writeValue(data);
    }).then(() => {
      //appEcg.getRssi(6);  
    }).catch(error => {
      //appEcg.getRssi(7);  
      });
  } else {
    //appEcg.getRssi(8);  
  }
}