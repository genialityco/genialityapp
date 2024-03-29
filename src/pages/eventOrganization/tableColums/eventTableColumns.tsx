import { Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { DATE_FORMAT } from '@/constants/datesformat.constants';
import { AddEventToGroup } from '../components/addEventToGroup/AddEventToGroup';
import { eventsGetColumnSearchProps } from '../searchFunctions/membersGetColumnSearchProps';

type GoToEvent = (eventId: string) => void;
type OpenModal = (event: any) => void;
export const columns = (goToEvent: GoToEvent, columnsData: any, openModal: OpenModal): ColumnsType<any> => [
  {
    title: 'Nombre del evento',
    dataIndex: 'name',
    ellipsis: true,
    sorter: (a, b) => a.name.localeCompare(b.name),
    ...eventsGetColumnSearchProps('name', columnsData, goToEvent),
   /*  render(val, item) {
      return (
        <Button type='link' onClick={() => goToEvent(item._id)}>
          <span style={{ color: '#2E9AFE' }}>{item.name}</span>
        </Button>
      );
    }, */
  },
  {
    title: 'Fecha de inicio',
    dataIndex: 'startDate',
    sorter: (a, b) => {
      const getDateStart = (item:any) => {
        if (item?.dates && item.dates.length > 0) {
          return moment(item.dates[0]?.start);
        }
        return moment(item.datetime_from);
      };

      const dateStartA = getDateStart(a);
      const dateStartB = getDateStart(b);

      return dateStartA.diff(dateStartB);
    },
    render(val, item) {
      let dateStart;
      if (item?.dates && Array.isArray(item?.dates) && item?.dates?.length > 0) {
        dateStart = item.dates[0]?.start;
      }
      if (!dateStart) {
        dateStart = item.datetime_from;
      }
      return (
        <Button type='link' onClick={() => goToEvent(item._id)}>
          <span>{moment(dateStart).format(DATE_FORMAT.DateFull)}</span>
        </Button>
      );
    },
  },
 /* IMPORTANT NOTE: Se quita esto debido a que no le sirve a ceta  
 {
    title: 'Grupos',
    dataIndex: 'index',
    fixed: 'right',
    render(val, item, index) {
      return (
        <>
          <AddEventToGroup selectedEvent={item} />
        </>
      );
    },
  }, */
  {
    title: 'Total usuarios',
    dataIndex: 'count',
    align: 'center',
    ellipsis: true,
    sorter: (a, b) => a.count - b.count,
  },
  {
    title: 'Usuarios sin checkIn',
    dataIndex: 'checked_in_not',
    align: 'center',
    ellipsis: true,
    sorter: (a, b) => a.checked_in_not - b.checked_in_not,
  },
  {
    title: 'Usuarios con checkIn',
    dataIndex: 'checked_in',
    align: 'center',
    ellipsis: true,
    sorter: (a, b) => a.checked_in - b.checked_in,
  },
];
