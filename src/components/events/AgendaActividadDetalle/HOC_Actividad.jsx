import React, { useContext } from 'react';
import { HelperContext } from '../../../Context/HelperContext';
import ImageComponentwithContext from './ImageComponent';
import RenderComponent from './RenderComponent';
import { SecondVideoActivity } from './SecondVideoActivity';

const HCOActividad = () => {
  let { currentActivity } = useContext(HelperContext);
  return (
    <header>
      <div>
        <RenderComponent />

        {currentActivity && currentActivity.secondvideo && <SecondVideoActivity />}

        {(currentActivity?.habilitar_ingreso === '' || currentActivity?.habilitar_ingreso == null) &&
          currentActivity?.video == null && <ImageComponentwithContext />}
      </div>
    </header>
  );
};

export default HCOActividad;