import * as Moment from 'moment';
import useDeepStateEqualityValidation from './useDeepStateEqualityValidation';
import { FormularyType } from "../components/AgendaFormulary";

function useValideChangesInFormulary(
  saved: FormularyType,
  modified: FormularyType,
  isPublished: boolean,
  setWasChanged: (was: boolean) => void,
) {
  const deepStateEqualityValidation = useDeepStateEqualityValidation(); 
  const valideChangesInFormulary = () => {
    if (!saved) return;
    const {
      name,
      hour_start,
      hour_end,
      date,
      space_id,
      selectedCategories,
      description,
      image,
      // isPublished,
      length,
      latitude,
      selectedHosts,
      isPhysical,
    } = modified;

    const initialHour = Moment(hour_start).format('HH:mm');
    const finalHour = Moment(hour_end).format('HH:mm');

    const formattedModified = {
      name,
      hour_start: initialHour,
      hour_end: finalHour,
      date,
      space_id,
      selectedCategories,
      description,
      image,
      isPublished: isPublished,
      length,
      latitude,
      selectedHosts,
      isPhysical,
    };

    const equalityValidation = deepStateEqualityValidation(modified, formattedModified);
    console.log('equalityValidation:', equalityValidation);
    setWasChanged(equalityValidation === false)
  };

  return valideChangesInFormulary;
}

export default useValideChangesInFormulary;