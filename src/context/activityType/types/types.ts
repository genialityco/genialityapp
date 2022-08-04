import * as React from 'react';
import {
  ActivitySubTypeName,
  ActivityTypeData,
  ActivityTypeName,
  SimplifiedActivityTypeValue,
} from '../schema/structureInterfaces';

export type ProcessingType = {
  stoppingStreaming: boolean,
  creating: boolean,
  saving: boolean,
  deleting: boolean,
  updatingActivityType: boolean,
  updatingActivityContent: boolean,
};

export type ActivityTypeContextType = {
  is: ProcessingType,
  videoObject: any | null,
  contentSource: string | null,
  formWidgetFlow: ActivityTypeData,
  activityType: ActivityTypeName | null,
  activityContentType: ActivitySubTypeName | null,

  setActivityType: (type: ActivityTypeName | null) => void,
  setActivityContentType: (type: ActivitySubTypeName | null) => void,
  setContentSource: (input: string) => void,
  saveActivityType: () => void,
  deleteActivityType: () => void,
  resetActivityType: (type: ActivityTypeName) => void,
  saveActivityContent: (type?: ActivitySubTypeName, data?: string |  null) => void,
  translateActivityType: (type: string) => SimplifiedActivityTypeValue | null,
  visualizeVideo: (url: string | null, created_at: string | null, name: string | null) => void,
  executer_stopStream: () => void,
  convertTypeToHumanizedString: (type: string) => string,
};

export type ActivityTypeProviderProps = {
  children: React.ReactNode,
};
