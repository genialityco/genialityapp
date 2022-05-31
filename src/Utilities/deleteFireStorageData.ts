import { DispatchMessageService } from '@/context/MessageService';
import { fireStorage } from '@/helpers/firebase';

export const deleteFireStorageData = async (fileUrl: string) => {
  console.log('🚀 debug ~ deleteFireStorageData ~ fileUrl', fileUrl);
  let theFileWasDeleted = '';
  try {
    // Create a reference to the file to delete
    let fileRef = fireStorage.refFromURL(fileUrl);

    // Delete the file using the delete() method
    try {
      await fileRef
        .delete()
        .then(function() {
          // File deleted successfully
          theFileWasDeleted = 'file deleted successfully';
          DispatchMessageService({
            type: 'success',
            msj: theFileWasDeleted,
            action: 'show',
          });
        })
        .catch(function(error: any) {
          // Some Error occurred
          theFileWasDeleted = `error deleting file - ${error}`;
          DispatchMessageService({
            type: 'error',
            msj: theFileWasDeleted,
            action: 'show',
          });
        });
    } catch (error) {
      theFileWasDeleted = `unexpected error - ${error}`;
      DispatchMessageService({
        type: 'error',
        msj: theFileWasDeleted,
        action: 'show',
      });
    }
  } catch (error) {
    theFileWasDeleted = `unexpected error - ${error}`;
    DispatchMessageService({
      type: 'error',
      msj: theFileWasDeleted,
      action: 'show',
    });
  }

  return theFileWasDeleted;
};
