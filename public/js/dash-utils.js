// Adapted from https://github.com/TeamPiped/Piped/blob/master/src/utils/DashUtils.js
//   Which is based of https://github.com/GilgusMaximus/yt-dash-manifest-generator/blob/master/src/DashGenerator.js

function generate_dash_file_from_formats(streams, duration) {
  const doc = document.implementation.createDocument("1.0", "utf-8", null);
  const MPDElem = doc.createElement("MPD");
  MPDElem.setAttribute("xmlns", "urn:mpeg:dash:schema:mpd:2011");
  MPDElem.setAttribute("profiles", "urn:mpeg:dash:profile:full:2011");
  MPDElem.setAttribute("minBufferTime", "PT1.5S");
  MPDElem.setAttribute("type", "static");
  MPDElem.setAttribute("mediaPresentationDuration", `PT${duration}S`);
  const PeriodElem = doc.createElement("Period");
  MPDElem.appendChild(PeriodElem);

  generate_adaptation_set(streams, PeriodElem, doc);

  const serializer = new XMLSerializer();
  const MPDStr = serializer.serializeToString(MPDElem);
  return `<?xml version="1.0" encoding="UTF-8"?>${MPDStr}`;
}

function generate_adaptation_set(VideoFormatArray, PeriodElem, doc) {
  let mimeAudioObjs = [];

  VideoFormatArray.forEach(videoFormat => {
    // the dual formats should not be used
    if (
      (videoFormat.mimeType.includes("video") && !videoFormat.videoOnly) ||
      videoFormat.mimeType.includes("application")
      ) {
        return;
    }

    const audioTrackId = videoFormat.audioTrackId;
    const mimeType = videoFormat.mimeType;

    for (let i = 0; i < mimeAudioObjs.length; i++) {
      const mimeAudioObj = mimeAudioObjs[i];

      if (mimeAudioObj.audioTrackId == audioTrackId && mimeAudioObj.mimeType == mimeType) {
        mimeAudioObj.videoFormats.push(videoFormat);
        return;
      }
    }

    mimeAudioObjs.push({
      audioTrackId,
      mimeType,
      videoFormats: [videoFormat],
    });
  });

  mimeAudioObjs.forEach(mimeAudioObj => {
    const AdaptationSetElem = doc.createElement("AdaptationSet");
    AdaptationSetElem.setAttribute("id", mimeAudioObj.audioTrackId);
    AdaptationSetElem.setAttribute("lang", mimeAudioObj.audioTrackId?.substr(0, 2));
    AdaptationSetElem.setAttribute("mimeType", mimeAudioObj.mimeType);
    AdaptationSetElem.setAttribute("startWithSAP", "1");
    AdaptationSetElem.setAttribute("subsegmentAlignment", "true");

    let isVideoFormat = false;

    if (mimeAudioObj.mimeType.includes("video")) {
      isVideoFormat = true;
    }

    if (isVideoFormat) {
      AdaptationSetElem.setAttribute("scanType", "progressive");
    }

    for (var i = 0; i < mimeAudioObj.videoFormats.length; i++) {
      const videoFormat = mimeAudioObj.videoFormats[i];
      if (isVideoFormat) {
        generate_representation_video(videoFormat, AdaptationSetElem, doc);
      } else {
        generate_representation_audio(videoFormat, AdaptationSetElem, doc);
      }
    }
    PeriodElem.appendChild(AdaptationSetElem);
  });
}

function generate_representation_video(Format, AdaptationSetElem, doc) {
  const RepresentationElem = doc.createElement("Representation");
  RepresentationElem.setAttribute("id", Format.itag);
  RepresentationElem.setAttribute("codecs", Format.codec);
  RepresentationElem.setAttribute("bandwidth", Format.bitrate);
  RepresentationElem.setAttribute("width", Format.width);
  RepresentationElem.setAttribute("height", Format.height);
  RepresentationElem.setAttribute("maxPlayoutRate", "1");
  RepresentationElem.setAttribute("framerate", Format.fps);

  const BaseURLElem = doc.createElement("BaseURL");
  BaseURLElem.textContent = Format.url;
  RepresentationElem.appendChild(BaseURLElem);

  const SegmentBaseElem = doc.createElement("SegmentBase");
  SegmentBaseElem.setAttribute("indexRange", `${Format.indexStart}-${Format.indexEnd}`);
  RepresentationElem.appendChild(SegmentBaseElem);

  const InitializationElem = doc.createElement("Initialization");
  InitializationElem.setAttribute("range", `${Format.initStart}-${Format.initEnd}`);
  SegmentBaseElem.appendChild(InitializationElem);

  AdaptationSetElem.appendChild(RepresentationElem);
}

function generate_representation_audio(Format, AdaptationSetElem, doc) {
  const RepresentationElem = doc.createElement("Representation");
  RepresentationElem.setAttribute("id", Format.itag);
  RepresentationElem.setAttribute("codecs", Format.codec);
  RepresentationElem.setAttribute("bandwidth", Format.bitrate);

  const AudioChannelConfigurationElem = doc.createElement("AudioChannelConfiguration");
  AudioChannelConfigurationElem.setAttribute("schemeIdUri", "urn:mpeg:dash:23003:3:audio_channel_configuration:2011");
  AudioChannelConfigurationElem.setAttribute("value", "2");
  RepresentationElem.appendChild(AudioChannelConfigurationElem);

  const BaseURLElem = doc.createElement("BaseURL");
  BaseURLElem.textContent = Format.url;
  RepresentationElem.appendChild(BaseURLElem);

  const SegmentBaseElem = doc.createElement("SegmentBase");
  SegmentBaseElem.setAttribute("indexRange", `${Format.indexStart}-${Format.indexEnd}`);
  RepresentationElem.appendChild(SegmentBaseElem);

  const InitializationElem = doc.createElement("Initialization");
  InitializationElem.setAttribute("range", `${Format.initStart}-${Format.initEnd}`);
  SegmentBaseElem.appendChild(InitializationElem);

  AdaptationSetElem.appendChild(RepresentationElem);
}
