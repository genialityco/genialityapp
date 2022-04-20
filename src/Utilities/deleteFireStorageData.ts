import { fireStorage } from '@/helpers/firebase';

export const deleteFireStorageData = async (fileUrl: string) => {
  let theFileWasDeleted = '';
  // Create a reference to the file to delete
  let fileRef = fireStorage.refFromURL(fileUrl);

  // Delete the file using the delete() method
  await fileRef
    .delete()
    .then(function() {
      // File deleted successfully
      theFileWasDeleted = 'File deleted successfully';
    })
    .catch(function(error) {
      // Some Error occurred
      theFileWasDeleted = 'error deleting file';
    });

  return theFileWasDeleted;
};
