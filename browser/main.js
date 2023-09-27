var io = require('socket.io-client');
var Handlebars = require('handlebars');
var parseAddress = require('../views/parseAddress.js');

var socket = io();


function addToList(item) {
  list  = document.getElementById('playlist');
  var div = document.createElement('div')
  div.setAttribute('id', 'item');

  var title = document.createElement('h3');
  title.innerHTML = item.info.title;
  title.setAttribute('id', 'title');

  var entry = document.createElement('img');
  var img = item.prev;
  entry.setAttribute('src', img);
  entry.setAttribute('id', 'img');

  div.appendChild(title);
  div.appendChild(entry);
  list.appendChild(div);
}

function sendData() {
  document.getElementById('searchResults').style.display = "none";
  var songText = document.getElementById('songText');
  if (parseAddress(songText.value) !== "invalid") {
    var urlPre = 'https://pipedproxy.kavin.rocks/vi/' + parseAddress(songText.value) + '/maxresdefault.jpg?host=i.ytimg.com';
    var data = {url: songText.value, prev: urlPre};
    if (data.url !== '') {
      socket.emit('add song', data);
      songText.value = "";
    }
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
          e.preventDefault;

          var data = {url: link.href, prev: item.thumbnail};
          if (data.url !== '') {
            socket.emit('add song', data);
            songText.value = "";
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
    var songText = document.getElementById('songText');
    send.addEventListener('click', sendData);
    songText.addEventListener('keyup', function(evt) {
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

    socket.on('delete', function() {
      console.log('delete on list');
      var t = document.querySelector('#playlist');
      if (t.children.length > 0)
        t.removeChild(t.children[0]);
    });

  } else if (window.location.pathname === '/play') {
    window.socket = socket;

    socket.on('start', function(data) {
      for (var i = 0, f; f = data.playlist[i]; ++i) {
        if (parseAddress(f.url) !== "invalid")
          window.data.push(parseAddress(f.url));
      }
      if (window.data.length > 0) {
        fetchHls(window.data.shift());
      }
    });

    socket.on('added', function(data) {
      if (parseAddress(data.url) !== "invalid") {
        window.data.push(parseAddress(data.url));
        if (!document.getElementById('player-status').getAttribute('playing')) {
          fetchHls(window.data.shift());
        }
      }
    });

    socket.on('delete', function() {
      console.log('delete on player');
      window.data.shift();
    });
  }

});
