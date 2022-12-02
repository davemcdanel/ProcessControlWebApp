// DOM Elements
title = document.getElementById("title");
output = document.getElementById("output");
status_banner = document.getElementById("status");
setpoint = document.getElementById("setpoint");
internal = document.getElementById("internal");
graphdiv2 = document.getElementById("graphdiv2");
temperature = document.getElementById("temperature");
recvIdInput = document.getElementById("recvIdInput");
set_setpoint = document.getElementById("set_setpoint");
connectButton = document.getElementById("connect-button");
temperatureLabel = document.getElementById("temperatureLabel");
setpointLabel = document.getElementById("setpointLabel");
internalLabel = document.getElementById("internalLabel");
outputLabel = document.getElementById("outputLabel");
//Version
version = '0.2.20.1';
title.innerHTML = 'Dave\'s Red Smoker ' + version;
//  
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = null;
var dataChart = $("#myChart");
var infoUpdateTime = 1000; //refresh rate of the numbers from the server.
var graphUpdateTime = 60000; //refresh rate of the graph using numbers from the server.
var request_string;
var peer = null; // own peer object
var conn = null;
var lastPeerId = null;
var temperatures = null;
var request_itarator = 0;
var dataObject_list = [{command:'Get', type:'value', name:'temperature', payload:null },
  {command:'Get', type:'value', name:'setpoint', payload:null },
  {command:'Get', type:'value', name:'internal', payload:null },
  {command:'Get', type:'value', name:'output', payload:null },
  {command:'Get', type:'value', name:'prop', payload:null },
  {command:'Get', type:'value', name:'inter', payload:null },
  {command:'Get', type:'value', name:'derv', payload:null },
  {command:'Get', type:'value', name:'GraphUpdate', payload:null}];
var request_list = [{type:'value', name:'temperature'},
  {type:'value', name:'setpoint'},
  {type:'value', name:'internal'},
  {type:'value', name:'output'},
  {type:'value', name:'prop'},
  {type:'value', name:'inter'},
  {type:'value', name:'derv'},
  {type:'value', name:'GraphUpdate'}];
  // command: get or set.
  // type: value, file.
  // name: Name of the object.
  // payload: value or data
let dataObject = { command:null, type:null, name:null, payload:null };

jQuery.ajaxSetup({
  // Disable caching of AJAX responses
  cache: false
});

$("#resetdata").click(function() {
  $.get("/cgi-bin/controller", "set resetdata," + "true");
  g2.destroy();
  initializeGraph();
});

/*
$("#refreshgraph").click(function() {
  $.mobile.loading( 'show', { theme: "b", text: "Loading......", textonly: true });
  ///g2.destroy();
  ///initializeGraph();
  g2.annotations();
  $.mobile.loading( 'hide' );
});
*/

// init the graph
//function initializeGraph(){
//    g2 = new Dygraph(graphdiv2,"./temperatures.csv",{colors: ["red","blue","orange","green"]});
//}

/* Get first "GET style" parameter from href.
 * This enables delivering an initial command upon page load.
 *
 * Would have been easier to use location.hash.
 *
 *DLM "Really, I have no idea what this is for. It was in the example code, so I kept it."
 */
function getUrlParam(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
    return null;
  else
    return results[1];
}

/* Create the Peer object for our end of the connection.
 *
 * Sets up callbacks that handle any events related to our
 * peer object.
 */
function initializePeerJS() {
  // Create own peer object with connection to shared PeerJS server
  peer = new Peer(null,{debug:2});
  peer.on('open', function (id) {
    // Workaround for peer.reconnect deleting previous id
    if (peer.id === null) {
      status_banner.innerHTML = "Status: " + "Received null id from peer open.";
      console.log('Received null id from peer open');
      peer.id = lastPeerId;
    } else {
      lastPeerId = peer.id;
    }
      console.log('ID: ' + peer.id);
  });

  peer.on('connection', function (c) {
    // Disallow incoming connections
    c.on('open', function() {
      c.send("Sender does not accept incoming connections");
      setTimeout(function() { c.close(); }, 500);
    });
  });

  peer.on('disconnected', function () {
    status_banner.innerHTML = "Status: " + "Connection lost. Please reconnect.";
    console.log('Connection lost. Please reconnect');
    // Workaround for peer.reconnect deleting previous id
    peer.id = lastPeerId;
    peer._lastServerId = lastPeerId;
    peer.reconnect();
  });

  peer.on('close', function() {
    conn = null;
    status_banner.innerHTML = "Status: " + "Connection destroyed. Please refresh.";
    console.log('Connection destroyed');
  });

  peer.on('error', function (err) {
    console.log(err);
    alert('' + err);
  });
}

/** Create the connection between the two Peers.
 *
 * Sets up callbacks that handle any events related to the
 * connection and data received on it.
 */
function join() {
  // Close old connection
  if (conn) {
    conn.close();
  }

  destroyChart();

  console.log('Finding peer...');

  // Create connection to destination peer specified in the input field
  conn = peer.connect(recvIdInput.value, {
    reliable: true
  });

  console.log('Connecting to peer:' + conn.peer + '...');

  conn.on('open', function () {
    status_banner.innerHTML = "Status: " + "Connected to - " + conn.peer;
    console.log("Connected to: " + conn.peer);

    // Check URL params for comamnds that should be sent immediately
    var command = getUrlParam("command");
    if (command){
      conn.send(command);
    }
    console.log("Create chart...");
    createChart();
    console.log("Request historical data...");
    request_historical_data();
    console.log("Start request loop...");
    sendInfoRequest();
    sendGraphRequest();
  });

  // Handle incoming data (messages only since this is the signal sender)
  conn.on('data', function (dataObject) {
    //addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
    //console.log("Recieved: " + dataObject);
    console.log('conn.on data Recvd: ' + dataObject.command + ' ' + dataObject.type + ' ' + dataObject.name + ' ' + dataObject.payload);
    switch (dataObject.command) {
      case 'Get':
        switch (dataObject.type){
          case 'value':
            switch (dataObject.name) {
              case 'temperature':
                break;
              case 'setpoint':
                break;
              case 'internal':
                break;
              case 'output':
                break;
              case 'prop':
                break;
              case 'inter':
                break;
              case 'derv':
                break;
              default:
                break;
            }
            break;
          case 'file':
            switch (dataObject.name) {
              case './temperatures.csv':
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
        case 'Set':
          switch (dataObject.type){
            case 'value':
              switch (dataObject.name) {
                case 'temperature':
                  temperature.innerHTML = dataObject.payload;
                  break;
                case 'setpoint':
                  setpoint.innerHTML = dataObject.payload;
                  break;
                case 'internal':
                  internal.innerHTML = dataObject.payload;
                  break;
                case 'output':
                  output.innerHTML = dataObject.payload;
                  break;
                case 'prop':
                  set_prop.value = dataObject.payload;
                  break;
                case 'inter':
                  set_inter.value = dataObject.payload;
                  break;
                case 'derv':
                  set_derv.value = dataObject.payload;
                  break;
                case 'graphUpdateTime':
                  graphUpdateTime = dataObject.payload;
                  break;
                case 'dataPoint':
                  if (dataObject.payload){
                    myChart.data.labels.push(dataObject.payload['Time']);
                    myChart.data.datasets[0].data.push(dataObject.payload['Temp']);
                    myChart.data.datasets[1].data.push(dataObject.payload['Setpoint']);
                    myChart.data.datasets[2].data.push(dataObject.payload['Internal']);
                    myChart.data.datasets[3].data.push(dataObject.payload['Output']);
                    myChart.update();
                  }
                  break;
                default:
                  break;
              }
              break;
            default:
             break;
          }
          break;
        default:
          break;
    }
  });

  conn.on('close', function () {
    status_banner.innerHTML = "Status: " + "Connection closed.";
  });
}

function sendInfoRequest() {
  if (request_itarator < dataObject_list.length) {
    if (conn && conn.open) {
      switch (dataObject_list[request_itarator].command) {
        case 'Get':
          switch (dataObject_list[request_itarator].type) {
            case 'value':
              conn.send({ command:dataObject_list[request_itarator].command, type:dataObject_list[request_itarator].type, name:dataObject_list[request_itarator].name, payload:dataObject_list[request_itarator].payload});
              console.log('sendRequest: ' + dataObject_list[request_itarator].command + ' ' + dataObject_list[request_itarator].type + ' ' + dataObject_list[request_itarator].name + ' ' + dataObject_list[request_itarator].payload);
              break;
            default:
          }
          break;
        case 'Set':
          switch (dataObject_list[request_itarator].type) {
            case 'value':
              conn.send({ command:dataObject_list[request_itarator].command, type:dataObject_list[request_itarator].type, name:dataObject_list[request_itarator].name, payload:dataObject_list[request_itarator].payload});
              console.log('sendRequest: ' + dataObject_list[request_itarator].command + ' ' + dataObject_list[request_itarator].type + ' ' + dataObject_list[request_itarator].name + ' ' + dataObject_list[request_itarator].payload);
              dataObject_list[request_itarator].command = 'Get';
              dataObject_list[request_itarator].payload = null;
              break;
            default:
          }
          break;
        default:
      }
      request_itarator++;
      if (request_itarator >= request_list.length){
        request_itarator = 0;
      }
    }
  }
  setTimeout(sendInfoRequest, ((infoUpdateTime)/request_list.length));
  console.log("infoUpdateTime:" + infoUpdateTime + " / " + request_list.length);
}

function sendGraphRequest(){
  if (conn && conn.open) {
    conn.send({ command:'Get', type:'value', name:'dataPoint', payload:null});
    console.log('sendGraphRequest: Get value dataPoint');
  }
  setTimeout(sendGraphRequest, graphUpdateTime);
  console.log(`graphUpdateTime: ${graphUpdateTime}`);
}

// Send the new setpoint
function send_set_setpoint() {
  var _itarator = 0;
  while (_itarator < dataObject_list.length) {
    if (dataObject_list[_itarator].name == 'setpoint') {
      dataObject_list[_itarator].payload = set_setpoint.value;
      dataObject_list[_itarator].command = 'Set';
      _itarator = dataObject_list.length;
    }
    _itarator++;
  }
  //conn.send({ command:'Set', type:'value', name:'setpoint', payload:set_setpoint.value });
  //console.log('Sent: Set ' + 'value ' + 'setpoint ' + set_setpoint.value);
}

// Send the new proportional
function send_set_prop() {
  conn.send({ command:'Set', type:'value', name:'prop', payload:set_prop.value });
}

// Send the new integral
function send_set_inter() {
  conn.send({ command:'Set', type:'value', name:'inter', payload:set_inter.value });
}

// Send the new derivitive
function send_set_derv() {
  conn.send({ command:'Set', type:'value', name:'derv', payload:set_derv.value });
}

// Start the serviceWorker
function startSW (){
  if ('serviceWorker' in navigator){
    try {
      navigator.serviceWorker.register('./sw.js');
      console.log('SW registered');
    } catch (error) {
      console.log('SW reg failed');
    }
 }
}

function request_historical_data(){
  if (conn && conn.open) {
    conn.send({ command:'Get', type:'file', name:'history', payload:null });
    console.log('Sent: Get file history');
  }
}
//d3.csv('temperatures.cvs').then(populateChart);

function destroyChart(){
  if (myChart){
    console.log('destroyChart!');
  }
}

function createChart(){
  var _timeLabels = new Date();
  //var _timeLabels = _temperatures.map(function(d) {return d.Timestamp});
  //var _ExternalData = _temperatures.map(function(d) {return d.ExternalTemp});
  //var _SetpointData = _temperatures.map(function(d) {return d.Setpoint});
  //var _InternalData = _temperatures.map(function(d) {return d.InternalTemp});
  //var _OutputData = _temperatures.map(function(d) {return d.Output});

  //var ctx = document.getElementById('myChart').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      //labels: _timeLabels.toString(),
      datasets: [{
       label:'Temp',
       backgroundColor:'rgba(255, 0, 0, 0.3)',
       borderColor:'rgba(255, 0, 0, 1)',
       borderWidth:1,
       fill: false,
       interaction: {
         intersect: false
         },
       radius: 0
     },{
        label:'Setpoint',
        backgroundColor:'rgba(0, 0, 255, 0.3)',
        borderColor:'rgba(0, 0, 255, 1)',
        borderWidth:1,
        fill: false,
        interaction: {
          intersect: false
          },
        radius: 0
     },{
        label:'Internal',
        backgroundColor:'rgba(255, 166, 0, 0.3)',
        borderColor:'rgba(255, 166, 0, 1)',
       borderWidth:1,
        fill: false,
        interaction: {
          intersect: false
       },
       radius: 0
     },{
       label:'Output',
       backgroundColor:'rgba(0, 128, 0, 0.3)',
       borderColor:'rgba(0, 128, 0, 1)',
       borderWidth:1,
       fill: false,
        interaction: {
         intersect: false
       },
       radius: 0
     }]},
    options: {
      legend: {
        position: 'top',
       labels: {
         fontColor: 'white'
       }
      },
      title: {
        display: true,
        text: 'Smoker Stats',
        fontColor: 'white'
      },
      scales: {
        x: {
          type: 'time',
          time: {
            displayFormats: {
              hour: 'YYYY-MM-DD HH:MM:SS'
            },
            unit: 'hour'
          },
          ticks: {
            beginAtZero: true,
            fontColor: 'white', // labels such as 10, 20, etc
            showLabelBackdrop: false // hide square behind text
          },
          pointLabels: {
            fontColor: 'white' // labels around the edge like 'Running'
          },
          gridLines: {
            color: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    }
  });  
}

function getRecvIdInput() {
  if (localStorage.getItem('recvIdInput') === null) {
    recvIdInput.textContent = 'Enter Smoker ID';
  } else {
    recvIdInput.textContent = localStorage.getItem('recvIdInput');
    recvIdInput.value = localStorage.getItem('recvIdInput');
  }
}

function setRecvIdInput(e) {
  if (e.type === 'keypress') {
    // Make sure enter is pressed
    if (e.which == 13 || e.keyCode == 13) {
      localStorage.setItem('recvIdInput', e.target.innerText);
      recvIdInput.blur();
      join();
    }
  } else {
    localStorage.setItem('recvIdInput', e.target.innerText);
  }
}

function getTemperatureLabel(){
  if(localStorage.getItem('temperatureLabel')===null) {
    temperatureLabel.textContent = '';
    temperatureLabel.display = 'none';
  } else {
    temperatureLabel.textContent = localStorage.getItem('temperatureLabel');
    temperatureLabel.value = localStorage.getItem('temperatureLabel');
  }
}

function setTemperatureLabel(e) {
  if (e.type === 'keypress') {
    // Make sure enter is pressed
    if (e.which == 13 || e.keyCode == 13) {
      localStorage.setItem('temperatureLabel', e.target.innerText);
      temperatureLabel.blur();
    }
  } else {
    localStorage.setItem('temperatureLabel', e.target.innerText);
  }
}

function getSetpointLabel(){
  if(localStorage.getItem('setpointLabel')===null) {
    setpointLabel.textContent = '';
    setpointLabel.display = 'none';
  } else {
    setpointLabel.textContent = localStorage.getItem('setpointLabel');
    setpointLabel.value = localStorage.getItem('setpointLabel');
  }
}

function setSetpointLabel(e) {
  if (e.type === 'keypress') {
    // Make sure enter is pressed
    if (e.which == 13 || e.keyCode == 13) {
      localStorage.setItem('setpointLabel', e.target.innerText);
      setpointLabel.blur();
    }
  } else {
    localStorage.setItem('setpointLabel', e.target.innerText);
  }
}

function getInternalLabel(){
  if(localStorage.getItem('internalLabel')===null) {
    internalLabel.textContent = '';
    internalLabel.display = 'none';
  } else {
    internalLabel.textContent = localStorage.getItem('internalLabel');
    internalLabel.value = localStorage.getItem('internalLabel');
  }
}

function setInternalLabel(e) {
  if (e.type === 'keypress') {
    // Make sure enter is pressed
    if (e.which == 13 || e.keyCode == 13) {
      localStorage.setItem('internalLabel', e.target.innerText);
      internalLabel.blur();
    }
  } else {
    localStorage.setItem('internalLabel', e.target.innerText);
  }
}

function getOutputLabel(){
  if(localStorage.getItem('outputLabel')===null) {
    outputLabel.textContent = '';
    outputLabel.display = 'none';
  } else {
    outputLabel.textContent = localStorage.getItem('outputLabel');
    outputLabel.value = localStorage.getItem('outputLabel');
  }
}

function setOutputLabel(e) {
  if (e.type === 'keypress') {
    // Make sure enter is pressed
    if (e.which == 13 || e.keyCode == 13) {
      localStorage.setItem('outputLabel', e.target.innerText);
      outputLabel.blur();
    }
  } else {
    localStorage.setItem('outputLabel', e.target.innerText);
  }
}

recvIdInput.addEventListener('keypress', setRecvIdInput);
recvIdInput.addEventListener('blur', setRecvIdInput);

temperatureLabel.addEventListener('keypress', setTemperatureLabel);
temperatureLabel.addEventListener('blur' , setTemperatureLabel);

setpointLabel.addEventListener('keypress', setSetpointLabel);
setpointLabel.addEventListener('blur' , setSetpointLabel);

internalLabel.addEventListener('keypress', setInternalLabel);
internalLabel.addEventListener('blur', setInternalLabel);

outputLabel.addEventListener('keypress', setOutputLabel);
outputLabel.addEventListener('blur', setOutputLabel);

//connectButton.addEventListener('click', join);
//set_setpoint.addEventListener('blur',send_set_setpoint);
//set_prop.addEventListener('blur',send_set_prop);
//set_inter.addEventListener('blur',send_set_inter);
//set_derv.addEventListener('blur',send_set_derv);

startSW();
initializePeerJS(); // Since all our callbacks are setup, start the process of obtaining an ID
//initializeGraph();
getRecvIdInput();
getTemperatureLabel();
getSetpointLabel();
getInternalLabel();
getOutputLabel();
