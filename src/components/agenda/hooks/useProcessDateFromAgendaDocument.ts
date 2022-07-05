import * as Moment from 'moment';
import AgendaDocumentType from '../types/AgendaDocumentType';

function processDateFromAgendaDocument (document: AgendaDocumentType) {
  /* console.log(document, 'entro en handleDate'); */
  const date = Moment(document.datetime_end, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD');
  const hour_start = Moment(document.datetime_start, 'YYYY-MM-DD HH:mm').toDate();
  const hour_end = Moment(document.datetime_end, 'YYYY-MM-DD HH:mm').toDate();
  return { date, hour_start, hour_end };
}

export default function useProcessDateFromAgendaDocument () {
  return processDateFromAgendaDocument;
}