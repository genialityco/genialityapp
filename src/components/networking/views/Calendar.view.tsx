import { Col, Row } from 'antd';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { Calendar, View, momentLocalizer } from 'react-big-calendar';
import { NetworkingContext } from '../context/NetworkingContext';
import { IEventCalendar, IMeeting, IMeetingCalendar } from '../interfaces/Meetings.interfaces';
import { meetingSelectedInitial, defaultType } from '../utils/utils';
import { TypeCalendarView } from '../interfaces/configurations.interfaces';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';


export default function MyCalendar() {
  const [View, setView] = useState<View>(TypeCalendarView.month);
  const localizer = momentLocalizer(moment);
  const now = () => new Date();
  const { meetings, 
    updateMeeting, 
    editMeenting, 
    setMeentingSelect, 
    openModal, 
    observers , 
    DataCalendar } = useContext(
    NetworkingContext
  );

  const ReactBigCalendar : any = withDragAndDrop(Calendar);

  {
    /*actualziar reuniones con el evento "drop" del calendario*/
  }
  const updateEventCalendar = ({ start, end, event }: IEventCalendar<IMeeting>) => {
    updateMeeting(event.id, { ...event, start: start.toString(), end: end.toString(), dateUpdated: Date.now() });
  };

  {
    /*crear reuniones desde el calendario*/
  }
  const createEventCalendar = ({ start, end }: IEventCalendar<IMeeting>) => {
    end.setDate(end.getDate() - 1);
    end.setTime(end.getTime() + 5 * 60 * 1000);
    setMeentingSelect({ ...meetingSelectedInitial, start: start.toString(), end: end.toString() });
    openModal();
  };

  const renderEvents = ( events : IMeeting[]  | IMeetingCalendar[]) => {
    return events.map((meeting) => ({
      ...meeting,
      start: new Date(meeting.start),
      end: new Date(meeting.end),
    }));
  };

  const eventStyleGetter = (event : IMeeting | IMeetingCalendar)  => {
    const style = {
      backgroundColor: event.type ? event.type.style : defaultType.style
    };
    return {
      style: style,
    };
  }

  return (
    <>
      <Row justify='center' wrap gutter={[0, 16]}>
        <Col span={24}>
          <ReactBigCalendar
            events={View === TypeCalendarView.month ? renderEvents(meetings) : renderEvents(DataCalendar)}
            view={View}
            onView={(view: View) => setView(view)}
           
            onSelectSlot={createEventCalendar}
            onSelectEvent={editMeenting}
            onEventDrop={updateEventCalendar}
            onEventResize={updateEventCalendar}
           
            resources={observers.length ? observers : undefined}
            resourceAccessor={'assigned'}
            resourceIdAccessor='value'
            resourceTitleAccessor='label'
           
            localizer={localizer}
            getNow={now}
            selectable='ignoreEvents'
            eventPropGetter={eventStyleGetter}
            titleAccessor='name'
            startAccessor='start'
            endAccessor='end'
            style={{ height: 500 }}
          />
        </Col>
      </Row>
    </>
  );
}