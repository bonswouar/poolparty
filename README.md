poolparty
=========

Make a youtube playlist, collaboratively.

![dsu](https://github.com/pin3da/poolparty/blob/master/dsu.jpg)

# Fork updates

This is a forked version. There are quite a few fixes and new features, including:

- Basic Youtube search support
- Sync the playback on all clients *(experimental)*
- Use piped instead of native youtube for everything - no call is ever made directly on youtube's server
- Implement Shaka Player
- DASH+xml conversion from streams (apparently youtube's HLS are kinda broken)
- Update packages.json, remove reprecated
- Dockerized

You can take a look at TODO.md for details about potential future features.

## Requirements

- [node.js](https://nodejs.org/en/)


## Installation

    npm install

## Run

    npm start


When the server is running, everyone in the party can acces to
server_ip:8080/  and add songs.

One person will visit server_ip:8080/play in order to reproduce the
playlist.

## Authors

- [@carlos4rias](https://github.com/carlos4rias)
- [@jhonber](https://github.com/jhonber)
- [@leiverandres](https://github.com/leiverandres)
- [@pin3da](https://github.com/pin3da)
