import { useEffect, useState } from 'react';
import { getOffers } from '../services';

export const useSatistic = (eventId: string,reload: boolean) => {
  const [offers, setOffers] = useState<any[]>([]);

const callOffers = async () => {
    if (eventId) {
        const data = await getOffers(eventId);
        setOffers(data);
      }
}
  useEffect(() => {
   if(reload) callOffers();
  },[reload]);

  return {
    offers,
    callOffers
  };
};
