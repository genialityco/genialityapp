import { useReducer } from 'react';
import { helperInitialState, helperReducer } from './reducerFormEnrollAttendeeToEvent';

const useDispatchFormEnrollAttendeeToEvent = () => {
  const [formState, formDispatch] = useReducer(helperReducer, helperInitialState);

  const reducer = {
    formState,
    formDispatch,
  };

  return reducer;
};

export default useDispatchFormEnrollAttendeeToEvent;
