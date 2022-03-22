import { TypeActivity, TypeActivityState } from '../interfaces/interfaces';

export type TypeActivityAction =
  | { type: 'type'; payload: TypeActivity }
  | { type: 'toggleType'; payload: { id: string } }
  | { type: 'toggleLiveBroadcast'; payload: { id: string } }
  | { type: 'toggleMeeting'; payload: { id: string } }
  | { type: 'toggleVideo'; payload: { id: string } }
  | { type: 'toggleEviusStreaming'; payload: { id: string } }
  | { type: 'toggleVimeo'; payload: { id: string } }
  | { type: 'toggleYouTube'; payload: { id: string } }
  | { type: 'toggleCloseModal'; payload: boolean }
  | { type: 'selectLiveBroadcast'; payload: { id: string } }
  | { type: 'selectMeeting'; payload: { id: string } }
  | { type: 'selectVideo'; payload: { id: string } }
  | { type: 'selectEviusStreaming'; payload: { id: string } }
  | { type: 'selectVimeo'; payload: { id: string } }
  | { type: 'selectYouTube'; payload: { id: string } }
  | { type: 'selectEviusMeet'; payload: { id: string } }
  | { type: 'selectRTMP'; payload: { id: string } };

export type TypeActivityContextProps = {
  typeActivityState: TypeActivityState;
  toggleActivitySteps: (id: string) => void;
  closeModal: () => void;
  selectOption: (id: string) => void;
};