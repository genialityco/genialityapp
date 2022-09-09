import AgendaType from '@Utilities/types/AgendaType';
import dayjs from 'dayjs';

function processDateFromAgendaDocument(document: AgendaType) {
  /* console.log(document, 'entro en handleDate'); */
  const date = dayjs(document.datetime_end).format('YYYY-MM-DD');
  const hour_start = dayjs(document.datetime_start).toDate();
  const hour_end = dayjs(document.datetime_end).toDate();
  return { date, hour_start, hour_end };
}

export default function useProcessDateFromAgendaDocument() {
  return processDateFromAgendaDocument;
}
