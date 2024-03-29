import { DispatchMessageService } from '@/context/MessageService';
import { useForm } from '@/hooks/useForm';
import React, { createRef, useContext, useEffect, useState } from 'react'
import { NetworkingContext } from '../context/NetworkingContext';
import { FormMeeting, IMeeting, IParticipants, TransferType, typeAttendace } from '../interfaces/Meetings.interfaces';
import { defaultType } from '../utils/utils';


export const useMeetingFormLogic = () => {
    const dataContext = useContext(
        NetworkingContext
    );

    const formRef = createRef<any>();

    const [AttendeesKeyTarget, setAttendeesKeyTarget] = useState<string[]>([]);
    const [selectedAttendesKeys, setSelectedAttendeesKey] = useState<string[]>([]);
    const [attendeesTransfer, setDataTransfer] = useState<TransferType[]>([]);
    const { formState, onInputChange, onResetForm } = useForm<IMeeting>(dataContext.meentingSelect);
    useEffect(() => {
        if (dataContext.edicion) {
            setAttendeesKeyTarget(dataContext.meentingSelect.participants.map((item : IParticipants) => item.id));
        }
        //Tranformar todos los asistentes al evento para el transfer
        setDataTransfer(
            dataContext.attendees.map((asistente: any) => ({
                id: asistente._id,
                name: asistente.user?.names,
                key: asistente._id,
                email: asistente.user?.email,
                picture : asistente.user?.picture,
                confirmed: false,
            }))
        );
    }, []);

    const onChange = (nextAttendeeKeyTarget: string[]) => {
        setAttendeesKeyTarget(nextAttendeeKeyTarget);
    };

    const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
        setSelectedAttendeesKey([...sourceSelectedKeys, ...targetSelectedKeys]);
    };

    const onSubmit = async (datos: FormMeeting) => {
        
         
         DispatchMessageService({
            type: 'loading',
            key: 'loading',
            msj: ' Por favor espere mientras se guarda la información...',
            action: 'show',
        })
        try {
            //Buscar los datos de los asistentes
            const participants: IParticipants[] = attendeesTransfer.filter((attendeeTransfer: any) => AttendeesKeyTarget.includes(attendeeTransfer.key));

            //objeto de creacion
            const meeting: Omit<IMeeting, 'id' | 'startTimestap'> = {
                name: datos.name,
                start: datos.date[0].toString(),
                end : datos.date[1].toString(),
                participants: participants,
                participantsIds : AttendeesKeyTarget,
                place: datos.place,
                dateUpdated: Date.now(),
                type :  dataContext.typeMeetings.find((item)=> item.id === datos.type ) || defaultType 
            };
        
            if (dataContext.edicion && datos.id) {
                const response = await dataContext.updateMeeting(datos.id, { ...meeting, id: datos.id });
                DispatchMessageService({
                    key: 'loading',
                    action: 'destroy',
                });
                DispatchMessageService({
                    key: 'response',
                    type: response ? 'success' : 'warning',
                    msj: response ? '¡Información guardada correctamente!' : 'No se logro guardar la información',
                    action: 'show',
                    duration : 1
                  });
                return dataContext.closeModal();
            }
            dataContext.createMeeting(meeting);
            DispatchMessageService({
                key: 'loading',
                action: 'destroy',
            });
            dataContext.closeModal();
        } catch (e: any) {
            DispatchMessageService({
                key: 'loading',
                action: 'destroy',
            });
            DispatchMessageService({
                type: 'error',
                msj: e.response.data.message || e.response.status,
                action: 'show',
            });
            console.log(`Ocurrio un problema al ${dataContext.edicion ? 'editar' : 'guardar'} la reunion`);
            dataContext.closeModal();
        }  
    };

    return {
        ...dataContext,
        formRef,
        onSubmit,
        onSelectChange,
        onChange,
        AttendeesKeyTarget,
        selectedAttendesKeys,
        attendeesTransfer,
        formState
    }
}
