
var request = require("request");
var list = { playlist: [] };

module.exports = function(app, io) {
  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/play', function(req, res) {
    res.render('play');
  });

  io.on('connection', function(socket) {
    socket.emit('start', list);
    console.log('a user connected');
    socket.on('add song', function(data) {
      console.log('Add song');
      // TODO : Use Piped
      var urlInfo = 'https://www.youtube.com/oembed?url=' +
      data.url + '&format=json';

      request(urlInfo, function(err, res, body) {
        if (!err && res.statusCode == 200) {
          var info = JSON.parse(body);
          data['info'] = info;
          io.emit('added', data);
          list.playlist.push(data);
        }
        else {
          data['info'] = {'title': ''};
          io.emit('added', data);
          list.playlist.push(data);
        }
      })

    });

    socket.on('update time', function(currentTime) {
      io.emit('updated time', currentTime);
    });

    socket.on('query', function(data) {
      socket.emit('start', list);
    })

    socket.on('nextSong', function(data) {
      socket.broadcast.emit('nextSong', data);
      if (list.playlist.length > 0) {
        list.playlist.shift();
      }
    })
  });

};
