import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useStreamingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { StreamingArea as StreamingAreaModel } from '../../../types/CoveyTownSocket';
import StreamingArea from './StreamingArea';

/**
 * Creating an accessible modal component for React, replicating the video modal
 * @returns the streamingArea that will be displayed
 */
export default function SelectVideoModal({
  //isOpen indicates whether modal should be displayed
  isOpen,
  close,
  streamingArea,
}: {
  isOpen: boolean;
  close: () => void;
  streamingArea: StreamingArea;
}): JSX.Element {
  const coveyTownController = useTownController();
  const streamingAreaController = useStreamingAreaController(streamingArea?.name);

  const [stream, setStream] = useState<string>(streamingArea?.defaultStream || '');

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    close();
  }, [coveyTownController, close]);

  const toast = useToast();

  const createStreamingArea = useCallback(async () => {
    if (stream && streamingAreaController) {
      const request: StreamingAreaModel = {
        id: streamingAreaController.id,
        stream,
        isStream: true,
      };
      try {
        await coveyTownController.createStreamingArea(request);
        toast({
          title: 'Stream set!',
          status: 'success',
        });
        coveyTownController.unPause();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to set stream URL',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [stream, streamingAreaController, coveyTownController, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Set a stream to watch in {streamingAreaController?.id} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createStreamingArea();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='stream'>Stream URL</FormLabel>
              <Input
                id='stream'
                name='stream'
                value={stream}
                onChange={e => setStream(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={createStreamingArea}>
              Set stream
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
