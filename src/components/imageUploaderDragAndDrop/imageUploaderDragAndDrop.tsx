import { useEffect, useState } from 'react';
import { Upload, Spin, Image as ImageAnt, Card } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { uploadImagedummyRequest, readUrlImg, handleImageName } from '../../Utilities/imgUtils';
import { ImageUploaderDragAndDropType } from '../../Utilities/types/types';
import { uploadImageData } from '@/Utilities/uploadImageData';
import { fireStorage } from '@/helpers/firebase';
import { deleteFireStorageData } from '@/Utilities/deleteFireStorageData';
import Compressor from 'compressorjs';

const ImageUploaderDragAndDrop = ({
	imageDataCallBack,
	imageUrl,
	width = 0,
	height = 0,
	styles = { cursor: 'auto', marginBottom: '20px', borderRadius: '20px', textAlign: 'center' },
	bodyStyles,
	hoverable = true,
	compactMode = false,
	getDimensionsCallback,
	onRemove=()=>{},
}: ImageUploaderDragAndDropType) => {
	const { Dragger } = Upload;
	let [image, setImage] = useState<any>(null);
	let [isUploading, setIsUploading] = useState<boolean>(false);

	const fileList = [
		{
			url: imageUrl,
			name: handleImageName(imageUrl),
		},
	];

	useEffect(() => {
		/** Seteamos la imagen cuando ya vien una desde la base de datos, para ver la previa */
		if (imageUrl) {
			setImage(imageUrl);
		} else {
			setImage(null);
		}
	}, [imageUrl]);

	/** props para el dragger */
	let draggerprops: any = {
		listType: 'picture',
		accept: 'image/png,image/jpeg,image/jpg,image/gif',
		name: 'file',
		multiple: false,
		maxCount: 1,
		customRequest: uploadImagedummyRequest,
		defaultFileList: imageUrl ? [...fileList] : undefined,
		onChange: async ({ file }: any) => {
			const { status } = file;

			switch (status) {
				case 'done':
					/** url para previa de la imagen, esta funcion nos servira para cuando se saque el guardado en base de datos de este componente */
					// readUrlImg({ files: file.originFileObj, setImage });
					/** este callback nos servira para cuando se saque el guardado en base de datos de este componente */
					// imageDataCallBack(file.originFileObj);
					function getImageDimensions(file: string) {
						return new Promise(function(resolved, rejected) {
							const i = new Image();
							i.onload = function() {
								resolved({ width: i.width, height: i.height });
							};
							i.src = file;
						});
					}

					// await getImageDimensions(file.originFileObj);

					new Compressor(file.originFileObj, {
						quality: 0.8,
						minWidth: width as number,
						minHeight: height as number,
						convertSize: 5000000,
						success: async (compressedImage: any) => {
							const typeOfImage = file.originFileObj.type;
							const imageData = typeOfImage === 'image/gif' ? file.originFileObj : compressedImage;

							const imagenUrl = await uploadImageData(imageData);
							setImage(imagenUrl);
							imageDataCallBack(imagenUrl);
							const dimensions = await getImageDimensions(imagenUrl);
							!!getDimensionsCallback && getDimensionsCallback(dimensions as { width: number; height: number });
							setIsUploading(false);
						},
					});
					break;

				case 'error':
					setImage(null);
					break;

				case 'removed':
					//ELIMINAR DE FIREBASE
					await deleteFireStorageData(image);
					setImage(null);
					setIsUploading(false);
					imageDataCallBack(null);
					onRemove();
					break;

				default:
					setIsUploading(true);
					break;
			}
		},
		/** props para no mostrar la mini previa de antDesing */
		isImageUrl(file: any) {
			return;
		},
		iconRender(file: any) {
			return <FileImageOutlined style={{ color: '#009fd9' }} />;
		},
		onPreview(file: any) {},
		/**------------------------------------------------- */
	};

	return (
		<Spin tip='Cargando imagen...' spinning={isUploading}>
			<Card bodyStyle={bodyStyles} hoverable={hoverable} style={styles}>
				<Dragger {...draggerprops}>
					{image ? (
						<ImageAnt
							preview={false}
							width={'100%'}
							height={'150px'}
							style={{ objectFit: 'contain' }}
							alt='preview'
							src={image}
						/>
					) : compactMode ? (
						<p className='ant-upload-text'>Haga clic o arrastre una imagen</p>
					) : (
						<>
							<p className='ant-upload-drag-icon'>
								<FileImageOutlined style={{ color: '#009fd9' }} />
							</p>
							<p className='ant-upload-text'>Haga clic o arrastre el archivo a esta área para cargarlo</p>
							{width && height && (
								<p className='ant-upload-hint'>
									Dimensiones sugeridas: {width}px * {height}px
								</p>
							)}
							<p>Formatos aceptados: .png, .jpeg, .jpg, .gif</p>
						</>
					)}
				</Dragger>
			</Card>
		</Spin>
	);
};

export default ImageUploaderDragAndDrop;
