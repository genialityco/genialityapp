/**
 * request to not show the error generated by the antd upload component when the upload is not performed from it
 */
export const uploadImagedummyRequest = ({ file, onSuccess }: any) => {
  setTimeout(() => {
    onSuccess('done');
  }, 1000);
};

/**
 * It takes a file object, reads it, and then sets the image data to the state.
 * @param {any} - files - the file that was uploaded
 * @param {any} - setImage - set de image url preview
 */
export function readUrlImg({ files, setImage }: any) {
  var reader = new FileReader();
  reader.onloadend = function async() {
    const imageData = reader.result;
    setImage(imageData);
  };
  if (files) {
    reader.readAsDataURL(files);
  }
}

/**
 * It takes a string, checks if it's a string, then splits the string into an array, then returns the
 * last item in the array
 * @param {string} imageUrl -
 * https://images.unsplash.com/photo-1558981852-426c6c22a060?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&
 */
export const handleImageName = (imageUrl: string) => {
  if (imageUrl && typeof imageUrl === 'string') {
    const url = new URL(imageUrl);
    let name = url.pathname.split('/');
    return name[name.length - 1];
  }
};

export const renderTypeImage = (name: string, imageFile: []): any => {
  const imageFilter: any = imageFile && imageFile.filter((image: any) => image.name === name);
  if (imageFilter.length > 0) {
    return imageFilter[0].file;
  }
};

export const removeObjectFromArray = (name: string, array: [], callback: (data: any) => void) => {
  let filtered = array.filter((item: any) => item.name !== name);
  callback(filtered);
};

export const showImageOrDefaultImage = (image: string, defultImage: string): string => {
  if (image && image !== '') return image;
  return defultImage;
};
