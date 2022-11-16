import { Container } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { TwitchEmbed } from 'react-twitch-embed';
import StreamingAreaController from '../../../classes/StreamingAreaController';
import { useInteractable, useStreamingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import SelectStreamModal from './SelectStreamModal';
import StreamingAreaInteractable from './StreamingArea';

/**
 * The StreamingAreaVideo component renders a StreamingArea's stream.
 * The URL property of the ReactPlayer is set to the StreamingAreaVideoController's stream property
 *
 * The StreamingAreaVideo subscribes to the StreamingAreaVideoController's events
 *
 * The StreamingAreaVideo also subscribes to onProgress, onPause, onPlay, and onEnded events of the ReactPlayer.
 * In response to these events, the StreamingAreaVideo updates the StreamingAreaVideoController's properties, and
 * uses the TownController to emit a streaming area update.
 *
 * @param props: A single property 'controller', which is the StreamingAreaVideoController corresponding to the
 *               current streaming area.
 */
export function StreamingAreaVideo({
  controller,
}: {
  controller: StreamingAreaController;
}): JSX.Element {
  const townController = useTownController();
  console.log(townController);
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
  console.log(townController);
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
