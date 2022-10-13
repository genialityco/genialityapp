/**
 * TODO:
 * 
 * - Add a differential to the global session. This can be a collection name
 *   different.
 * - Test its function.
 * - Export method to another file as utils.ts.
 */

import { fireRealtime, firestore, ServerValue, FieldValue, app } from '@helpers/firebase';
import { useEffect, useState } from 'react';

import Logger from '@Utilities/logger';
import { sessionStatus } from '../constants';
import { createInitialSessionPayload, convertSessionPayloadToOffline } from '../utils';
import type { SessionPayload, UserSessionId } from '../types';

const { LOG } = Logger('presence.global');

export interface PresenceGlobalProps {
  userId: string;
  organizationId: string;
};


function PresenceGlobal(props: PresenceGlobalProps) {
  const [payload, setPayload] = useState(createInitialSessionPayload(props.userId, props.organizationId));

  useEffect(() => {
    if (!props.userId) return;
    if (!props.organizationId) return;

    const userSessionsIdDB = firestore.collection('user_sessions').doc(props.userId);

    let userSessionsRealtime: app.database.Reference;
    let onDisconnect: app.database.OnDisconnect;
    let lastId = 0;

    (async () => {
      const result = await userSessionsIdDB.get();
      // Get last ID
      if (result.exists) {
        const document = result.data() as UserSessionId;
        if (typeof document.lastId === 'number') {
          lastId = document.lastId;
          LOG('update lastId to', lastId);
        }
      }

      // Update last ID
      await userSessionsIdDB.set({ lastId: lastId + 1 });
      LOG('mask as connected');

      // Get the path in realtime
      userSessionsRealtime = fireRealtime.ref(`/user_sessions/${props.userId}/${lastId}`);

      // Get presence
      const presence = fireRealtime.ref('.info/connected');

      // Use presence
      presence.on('value', async (snapshot) => {
        if (snapshot.val() === false) {
          // Disconnect locally
          await userSessionsRealtime.update(convertSessionPayloadToOffline(payload));
          LOG('manually mask as disconnected');
          return;
        }

        // Get this object to save a value when the FB gets be disconnected
        onDisconnect = userSessionsRealtime.onDisconnect();
        // Save the disconnection value
        await onDisconnect.update(convertSessionPayloadToOffline(payload));
        // Mask as connected
        await userSessionsRealtime.set(payload);
        // myDbRef.set({ ...fakePayload, status: 'on', size: 'P' });
        LOG('Connected');
      });
    })();
    console.log('OK');
  }, []);

  return (
    <></>
  );
}

export default PresenceGlobal;