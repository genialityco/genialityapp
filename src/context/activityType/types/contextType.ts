import * as React from 'react';
import type { ActivityType } from './activityType';

export type ProcessingType = {
  stoppingStreaming: boolean,
  creating: boolean,
  saving: boolean,
  deleting: boolean,
  updatingActivityType: boolean,
  updatingActivityContent: boolean,
};

export type OpenedWidget = ActivityType.CardUI | ActivityType.FormUI;

export type ActivityTypeContextType = {
  is: ProcessingType,
  videoObject: any | null,
  contentSource: string | null,
  formWidgetFlow: ActivityType.MainUI,
  activityType: ActivityType.Name | null,
  activityContentType: ActivityType.ContentValue | null,
  videoId?: string | null,

  setActivityType: (type: ActivityType.Name | null) => void,
  setActivityContentType: (type: ActivityType.ContentValue | null) => void,
  setContentSource: (input: string) => void,
  setVideoId: (input: string | null) => void,
  saveActivityType: () => void,
  deleteActivityType: () => void,
  resetActivityType: (type: ActivityType.Name) => void,
  saveActivityContent: (type?: ActivityType.ContentValue, data?: string |  null) => void,
  translateActivityType: (type: string) => ActivityType.TypeAsDisplayment | null,
  visualizeVideo: (url: string | null, created_at: string | null, name: string | null) => void,
  executer_stopStream: () => void,
  humanizeActivityType: (type: string) => string,
};

export type ActivityTypeProviderProps = {
  children: React.ReactNode,
};
