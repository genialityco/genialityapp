import { ReactNode } from 'react';
import { useMemo, memo, useEffect, useState } from 'react';
import { useLocation, useParams, useRouteMatch } from 'react-router';
import './Step.css';

export interface StepProps {
  children: ReactNode;
  isActive?: boolean | number;
  isSurvey?: boolean;
  key?: string;
  /* onChangeFunction?: any; */
  setCurrentId?: any;
  currentId?: any;
  id?: string;
  onClick?: () => void;
}

function Step(props: StepProps) {
  const { children, isActive, isSurvey, key, currentId, setCurrentId, id, ...rest } = props;

  const location = useLocation();
  console.log('location', location);

  const params = useParams();
  console.log('params', params);

  const className = useMemo(() => {
    if (isActive) {
      return 'Step active';
    }
    return 'Step';
  }, [isActive]);

  useEffect(() => {
    const urlCompleta = location.pathname;
    const urlSplited = urlCompleta.split('activity/');
    const currentActivityId = urlSplited[1];
    setCurrentId(currentActivityId);
  }, [location]);

  return (
    <div
      className={className}
      style={{
        borderRadius: isSurvey ? '' : '50%',
        backgroundColor: currentId == id ? '#043558' : '',
        color: currentId == id ? '#fff' : '',
      }}
      {...rest}
      onClick={() => {
        setCurrentId(id);
        props.onClick && props.onClick();
      }}
    >
      {children}
    </div>
  );
}

export default memo(Step);