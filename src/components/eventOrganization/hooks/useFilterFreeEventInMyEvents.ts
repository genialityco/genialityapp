import { useEffect, useState } from 'react';

export const useFilterFreeEventInMyEvents = (
  eventsFreeAcces: any[],
  eventsWithEventUser: any[],
  myUserOrg: any,
  condition: boolean
) => {
  const [eventFreeFiltered, setEventFreeFiltered] = useState<any[]>([]);
  const [isFiltering, setisFiltering] = useState(true);

  useEffect(() => {
    if (condition) {
      setisFiltering(true);
      const eventsFreeFilter = eventsFreeAcces.filter(
        (eventFree) => !eventsWithEventUser.map((eventOfUser) => eventOfUser._id).includes(eventFree._id)
      );
      if (myUserOrg) setEventFreeFiltered(eventsFreeFilter ?? []);
      setisFiltering(false);
    }
  }, [condition, eventsWithEventUser.length]);

  return {
    eventFreeFiltered,
    isFiltering,
  };
};
