import { useEffect, useState } from 'react';
import { listeningConfigChat } from '@/components/games/bingo/services';
import { IConfigChat } from '../interface/message.interface';

const useListeningConfigChat = (eventId: string) => {
    const [configChat, setConfigChat] = useState<IConfigChat>({ message_controlled: false, message_highlighted: '' } as IConfigChat);
    const [isLoading, setisLoading] = useState(true);

    const onSetConfigChat = (configChatRealTime: IConfigChat) => {
        setConfigChat(configChatRealTime);
        setisLoading(false);
    };
    useEffect(() => {
        const unsusbcribe = listeningConfigChat(eventId, onSetConfigChat);
        return () => {
            unsusbcribe();
        };
    }, [eventId]);

    return {
        configChat,
        isLoading,
    };
};

export default useListeningConfigChat;
