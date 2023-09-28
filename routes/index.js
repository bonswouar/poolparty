
var list = { playlist: [] };
var serverTime = 0;
var currentVideoUrl = null;

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
    socket.on('add video', function(data) {
      console.log('Add video');
      io.emit('added', data);
      list.playlist.push(data);
    });

    socket.on('update time', function(data) {
      if (!currentVideoUrl) {
        currentVideoUrl = data['currentVideoUrl'];
      }
      var time = data['time'];
      if (serverTime < time && currentVideoUrl == data['currentVideoUrl']) {
        serverTime = time;
        io.emit('updated time', data);
      }
    });

    socket.on('query', function(data) {
      socket.emit('start', list);
    })

    socket.on('nextVideo', function(data) {
      if (list.playlist.length > 0 && list.playlist[1]['url'] == data) {
        socket.broadcast.emit('nextVideo', data);
        list.playlist.shift();
        serverTime = 0;
        currentVideoUrl = data['currentVideoUrl'];
      }
    })
  });

};
