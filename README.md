poolparty
=========

Make a youtube playlist, collaboratively, and play it in sync.

![dsu](https://github.com/pin3da/poolparty/blob/master/dsu.jpg)

# Fork updates

This is a forked version. There are quite a few fixes and new features, including:

- Basic Youtube search support (including Youtube Music)
- Sync the playback on all clients *(experimental)*
- Use Piped instead of native Youtube for everything: no call is ever made on Youtube's server
- Implement Shaka Player
- DASH+xml conversion from streams (apparently Youtube's HLS are kinda broken)
- Update packages.json, remove reprecated
- Dockerized for easier installation

You can take a look at [TODO](./TODO.md) for details about potential future features.

## Requirements

- docker


## Installation

    docker build -t poolparty .

## Run

    docker-compose up -d


When the server is running, everyone in the party can acces to
`http://server_ip:5468` and add songs.

One or more persons can then visit `http://server_ip:5468/play` in order to play the playlist in sync.


## Warning

This is a work in progress. Don't use it in production environment, or do it at your own risks.


## Thanks to original Authors

- [@carlos4rias](https://github.com/carlos4rias)
- [@jhonber](https://github.com/jhonber)
- [@leiverandres](https://github.com/leiverandres)
- [@pin3da](https://github.com/pin3da)
