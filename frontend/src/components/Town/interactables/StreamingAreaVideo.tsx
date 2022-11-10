import { Container } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import StreamingAreaController from '../../../classes/StreamingAreaController';
import { useInteractable, useStreamingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import SelectStreamModal from './SelectStreamModal';
import StreamingAreaInteractable from './StreamingArea';
import { TwitchEmbed } from 'react-twitch-embed';

/**
 * The StreamingAreaVideo component renders a StreamingArea's stream.
 * The URL property of the ReactPlayer is set to the ViewingAreaController's video property, and the isPlaying
 * property is set, by default, to the controller's isPlaying property.
 *
 * The ViewingAreaVideo subscribes to the ViewingAreaController's events, and responds to
 * playbackChange events by pausing (or resuming) the video playback as appropriate. In response to
 * progressChange events, the ViewingAreaVideo component will seek the video playback to the same timecode.
 * To avoid jittering, the playback is allowed to drift by up to ALLOWED_DRIFT before seeking: the video should
 * not be seek'ed to the newTime from a progressChange event unless the difference between the current time of
 * the video playback exceeds ALLOWED_DRIFT.
 *
 * The ViewingAreaVideo also subscribes to onProgress, onPause, onPlay, and onEnded events of the ReactPlayer.
 * In response to these events, the ViewingAreaVideo updates the ViewingAreaController's properties, and
 * uses the TownController to emit a viewing area update.
 *
 * @param props: A single property 'controller', which is the ViewingAreaController corresponding to the
 *               current viewing area.
 */
export function StreamingAreaVideo({
  controller,
}: {
  controller: StreamingAreaController;
}): JSX.Element {
  const townController = useTownController();

  return (
    <Container className='participant-wrapper'>
      Streaming Area: {controller.id}
      <TwitchEmbed channel={controller.stream} />
    </Container>
  );
}

/**
 * The StreamingArea monitors the player's interaction with a StreamingArea on the map: displaying either
 * a popup to set the stream for a stream area, or if the stream is set, a player for the stream.
 *
 * @param props: the streaming area interactable that is being interacted with
 */
export function StreamingAreaContainer({
  streamingArea,
}: {
  streamingArea: StreamingAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const streamingAreaController = useStreamingAreaController(streamingArea.name);
  const [selectIsOpen, setSelectIsOpen] = useState(streamingAreaController.stream === undefined);
  const [streamingAreaURL, setStreamingAreaURL] = useState(streamingAreaController.stream);
  useEffect(() => {
    const setURL = (url: string | undefined) => {
      if (!url) {
        townController.interactableEmitter.emit('endIteraction', streamingAreaController);
      } else {
        setStreamingAreaURL(url);
      }
    };
    streamingAreaController.addListener('streamChange', setURL);
    return () => {
      streamingAreaController.removeListener('streamChange', setURL);
    };
  }, [streamingAreaController, townController]);

  if (!streamingAreaURL) {
    return (
      <SelectStreamModal
        isOpen={selectIsOpen}
        close={() => setSelectIsOpen(false)}
        streamingArea={streamingArea}
      />
    );
  }
  return (
    <>
      <StreamingAreaVideo controller={streamingAreaController} />
    </>
  );
}

/**
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function StreamingAreaWrapper(): JSX.Element {
  const streamingArea = useInteractable<StreamingAreaInteractable>('streamingArea');
  if (streamingArea) {
    return <StreamingAreaContainer streamingArea={streamingArea} />;
  }
  return <></>;
}
