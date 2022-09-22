  // DOM Elements
  title = document.getElementById("title");
  output = document.getElementById("output");
  status = document.getElementById("status");
  setpoint = document.getElementById("setpoint");
  internal = document.getElementById("internal");
  graphdiv2 = document.getElementById("graphdiv2");
  temperature = document.getElementById("temperature");
  recvIdInput = document.getElementById("recvIdInput");
  set_setpoint = document.getElementById("set_setpoint");
  connectButton = document.getElementById("connect-button");
  //Version
  version = '0.2.15';
  title.innerHTML = 'Dave\'s Red Smoker ' + version;
  //  
  var dataChart = $("#myChart");
  var graphUpdateTime = 1000;
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
  {command:'Get', type:'file', name:'temperatures.csv', payload:null },
  {command:'Get', type:'value', name:'dataPoint', payload:null}];
  var request_list = [{type:'value', name:'temperature'},
  {type:'value', name:'setpoint'},
  {type:'value', name:'internal'},
  {type:'value', name:'output'},
  {type:'value', name:'prop'},
  {type:'value', name:'inter'},
  {type:'value', name:'derv'},
  {type:'file', name:'temperatures.csv'},
  {type:'value', name:'dataPoint'}];
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

$("#refreshgraph").click(function() {
  $.mobile.loading( 'show', { theme: "b", text: "Loading......", textonly: true });
  ///g2.destroy();
  ///initializeGraph();
  g2.annotations();
  $.mobile.loading( 'hide' );
});

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
            status.innerHTML = "Status: " + "Received null id from peer open.";
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
        status.innerHTML = "Status: " + "Connection lost. Please reconnect.";
        console.log('Connection lost. Please reconnect');
        // Workaround for peer.reconnect deleting previous id
        peer.id = lastPeerId;
        peer._lastServerId = lastPeerId;
        peer.reconnect();
    });

    peer.on('close', function() {
        conn = null;
        status.innerHTML = "Status: " + "Connection destroyed. Please refresh.";
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

    console.log('Clicked - Connect');

    // Create connection to destination peer specified in the input field
    conn = peer.connect(recvIdInput.value, {
        reliable: true
    });

    conn.on('open', function () {
        status.innerHTML = "Status: " + "Connected to - " + conn.peer;
        console.log("Connected to: " + conn.peer);

        // Check URL params for comamnds that should be sent immediately
        var command = getUrlParam("command");
        if (command)
            conn.send(command);
    });

    // Handle incoming data (messages only since this is the signal sender)
    conn.on('data', function (dataObject) {
        //addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
        //console.log("Recieved: " + dataObject);
        console.log('Recvd: ' + dataObject.command + ' ' + dataObject.type + ' ' + dataObject.name + ' ' + dataObject.payload);
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
                  case 'dataPoint':
                    if (dataObject.payload){
                      myChart.data.labels.push(dataObject.payload['Time']);
                      myChart.data.datasets[0].data.push(dataObject.payload['Temp']);
                      myChart.data.datasets[1].data.push(dataObject.payload['Setpoint']);
                      myChart.data.datasets[2].data.push(dataObject.payload['Internal']);
                      myChart.data.datasets[3].data.push(dataObject.payload['Output']);
                      graphUpdateTime = dataObject.payload['GraphUpdate']
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
        status.innerHTML = "Status: " + "Connection closed.";
    });
}

// Request a new piece of data every 250 milliseconds.
//
//function sendRequest() {
//  if (request_itarator < request_list.length){
//    if (conn && conn.open){
//      conn.send({ command:'Get', type:request_list[request_itarator].type, name:request_list[request_itarator].name, payload:null });
//      console.log('Sent: Get ' + request_list[request_itarator].type + ' ' + request_list[request_itarator].name);
//    }
//    request_itarator++;
//    if (request_itarator == request_list.length){
//      request_itarator = 0;
//    }
//  }
//  setTimeout(sendRequest, 250);
//}

function sendRequest() {
  if (request_itarator < dataObject_list.length) {
    if (conn && conn.open) {
      switch (dataObject_list[request_itarator].command) {
        case 'Get':
          switch (dataObject_list[request_itarator].type) {
            case 'value':
              conn.send({ command:dataObject_list[request_itarator].command, type:dataObject_list[request_itarator].type, name:dataObject_list[request_itarator].name, payload:dataObject_list[request_itarator].payload});
//              console.log('Sent: ' + dataObject_list[request_itarator].command + ' ' + dataObject_list[request_itarator].type + ' ' + dataObject_list[request_itarator].name + ' ' + dataObject_list[request_itarator].payload);
              break;
            default:
          }
          break;
        case 'Set':
          switch (dataObject_list[request_itarator].type) {
            case 'value':
              conn.send({ command:dataObject_list[request_itarator].command, type:dataObject_list[request_itarator].type, name:dataObject_list[request_itarator].name, payload:dataObject_list[request_itarator].payload});
//              console.log('Sent: ' + dataObject_list[request_itarator].command + ' ' + dataObject_list[request_itarator].type + ' ' + dataObject_list[request_itarator].name + ' ' + dataObject_list[request_itarator].payload);
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
  setTimeout(sendRequest, ((graphUpdateTime*1000)/request_list.length));
  console.log("graphUpdateTime:" + graphUpdateTime)
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

var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      label:'Temp',
      data: 0,
      backgroundColor:'rgba(255, 99, 132, 0.2)',
      borderColor:'rgba(255, 99, 132, 1)',
      borderWidth:1,
      fill: false,
      interaction: {
        intersect: false
        },
      radius: 0
    },{
      label:'Setpoint',
      data:0,
      backgroundColor:'rgba(54, 162, 235, 0.2)',
      borderColor:'rgba(54, 162, 235, 1)',
      borderWidth:1,
      fill: false,
      interaction: {
        intersect: false
        },
      radius: 0
    },{
      label:'Internal',
      data:0,
      backgroundColor:'rgba(255, 206, 86, 0.2)',
      borderColor:'rgba(255, 206, 86, 1)',
      borderWidth:1,
      fill: false,
      interaction: {
        intersect: false
      },
      radius: 0
    },{
      label:'Output',
      data:0,
      backgroundColor:'rgba(10, 150, 0, 0.2)',
      borderColor:'rgba(10, 150, 0, 1)',
      borderWidth:1,
      fill: false,
      interaction: {
        intersect: false
      },
      radius: 0
    }]},
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

function getRecvIdInput() {
  if (localStorage.getItem('recvIdInput') === null) {
    recvIdInput.textContent = '[Enter Smoker ID';
  }else {
    recvIdInput.textContent = localStorage.getItem('recvIdInput');
  }
}

function setRecvIdInput(e) {
  if (e.type === 'keypress') {
    // Make sure enter is pressed
    if (e.which == 13 || e.keyCode == 13) {
      localStorage.setItem('recvIdInput', e.target.innerText);
      recvIdInput.blur();
    }
  }else {
    localStorage.setItem('recvIdInput', e.target.innerText);
  }
}

recvIdInput.addEventListener('keypress', setRecvIdInput);
recvIdInput.addEventListener('blur', setRecvIdInput);

connectButton.addEventListener('click', join);
set_setpoint.addEventListener('blur',send_set_setpoint);
set_prop.addEventListener('blur',send_set_prop);
set_inter.addEventListener('blur',send_set_inter);
set_derv.addEventListener('blur',send_set_derv);

startSW();
initializePeerJS(); // Since all our callbacks are setup, start the process of obtaining an ID
sendRequest();
//initializeGraph();
getRecvIdInput();