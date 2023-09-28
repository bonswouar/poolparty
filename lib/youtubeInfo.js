
module.exports = async function (youtubeVideoId, play = false) {
  const response = await fetch(`https://pipedapi.kavin.rocks/streams/${youtubeVideoId}`)
  const json = await response.json();
  if (json) {
    let returnData = {url: `https://piped.kavin.rocks/watch?v=${youtubeVideoId}`, title: json['title'], thumbnail: json['thumbnailUrl']};
    if (play) {
      returnData['audioStreams'] = json['audioStreams'];
      returnData['videoStreams'] = json['videoStreams'];
      returnData['duration'] = json['duration'];
    }
    return returnData;
  }
}
