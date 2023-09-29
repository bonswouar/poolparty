var io = require('socket.io-client');
var Handlebars = require('handlebars');
var parseAddress = require('../lib/parseAddress.js');
var youtubeInfo = require('../lib/youtubeInfo.js');

var socket = io();

// To have access in the templates (no better way?!)
window.getParseAddress = function (address) {
  return parseAddress(address);
}
window.getYoutubeInfo = async function (youtubeId, play) {
  return await youtubeInfo(youtubeId, play);
}


function addToList(item) {
  list  = document.getElementById('playlist');
  var div = document.createElement('div')
  div.setAttribute('id', 'item');

  var title = document.createElement('h3');
  title.innerHTML = item.title;
  title.setAttribute('id', 'title');

  var entry = document.createElement('img');
  var img = item.thumbnail;
  entry.setAttribute('src', img);
  entry.setAttribute('id', 'img');

  div.appendChild(title);
  div.appendChild(entry);
  list.appendChild(div);
}

function sendData() {
  document.getElementById('searchResults').style.display = "none";
  var videoUrl = document.getElementById('videoUrl');
  var youtubeId = parseAddress(videoUrl.value);
  if (youtubeId) {
    const requestYoutubeInfo = async () => {
      var data = await youtubeInfo(youtubeId);
      if (data) {
        socket.emit('add video', data);
        videoUrl.value = "";
      }
    };
    requestYoutubeInfo();
  }
}

function searchData() {
  var searchText = document.getElementById('searchText');
  const filters = [
    "videos",
    // "playlists",
    "music_songs",
    "music_videos",
    // "music_playlists"
  ];
  filters.forEach(filter => {
    fetch(`https://pipedapi.kavin.rocks/search/?q=${searchText.value}&filter=${filter}`)
    .then(res => res.json())
    .then(json => {
      var searchResults = document.getElementById(`searchResults-${filter}`);
      searchResults.innerHTML = "";
      json.items.forEach(item => {
        var link = document.createElement("a");
        link.href = "https://piped.kavin.rocks"+item.url;
        link.title = item.title;
        link.onclick = function(e) {
          var data = {url: link.href, thumbnail: item.thumbnail, title: item.title};
          if (data.url !== '') {
            socket.emit('add video', data);
            document.getElementById('videoUrl').value = "";
          }

          return false;
        };

        var div = document.createElement("div");
        div.style.width = "250px";
        div.style.height = "175px";
        div.style.color = "black";
        div.style.float = "left";
        title = document.createTextNode(item.title);

        var img = document.createElement("img");
        img.style.width = "240px";
        img.style.height = "135px";
        img.src = item.thumbnail;

        div.appendChild(title);
        div.appendChild(img);
        link.appendChild(div);
        searchResults.appendChild(link);
        searchResults.parentElement.style.display = "block";
      });
      document.getElementById('searchResults').style.display = "block";
    })
    .catch(err => { throw err })
  });
}

document.addEventListener('DOMContentLoaded', function() {

  if (window.location.pathname === '/') {
    var playlistT = document.getElementById('playlistTemplate');
    var source   = playlistT.innerHTML;
    var template = Handlebars.compile(source);

    socket.on('start', function(data) {
      playlistT.innerHTML = template(data);
    });

    var send = document.getElementById('sendButton');
    var videoUrl = document.getElementById('videoUrl');
    send.addEventListener('click', sendData);
    videoUrl.addEventListener('keyup', function(evt) {
      if (evt.keyCode == 13)
        sendData();
    });

    var searchButton = document.getElementById('searchButton');
    var searchText = document.getElementById('searchText');
    searchButton.addEventListener('click', searchData);
    searchText.addEventListener('keyup', function(evt) {
      if (evt.keyCode == 13)
        searchData();
    });

    socket.on('added', function(data) {
      addToList(data);
    });

    socket.on('nextVideo', function(data) {
      var t = document.querySelector('#playlist');
      if (t.children.length > 0)
        t.removeChild(t.children[0]);
    });

  } else if (window.location.pathname === '/play') {
    window.socket = socket;

    socket.on('start', function(data) {
      // NOTE: doesn't seem to be triggered the first time the page is loaded on chrome (need refresh)
      for (var i = 0, f; f = data.playlist[i]; ++i) {
        if (parseAddress(f.url))
          window.data.push(f.url);
      }
      if (window.data.length > 0) {
        initShaka();
        loadVideo(window.data.shift());
      }
    });

    socket.on('added', function(data) {
      if (parseAddress(data.url)) {
        window.data.push(data.url);
        if (!window.playing) {
          loadVideo(window.data.shift());
        }
      }
    });

    socket.on('updated time', updatedTime);

    socket.on('nextVideo', function(data) {
      if (window.currentVideoUrl != data) {
        loadVideo(window.data.shift());
      }
    });
  }

});
