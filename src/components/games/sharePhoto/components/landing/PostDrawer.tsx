import { HeartFilled, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Drawer, Grid, Image, PageHeader, Row, Space, Typography } from 'antd';
import React, { useEffect } from 'react';
import useSharePhoto from '../../hooks/useSharePhoto';
import { Post } from '../../types';

const { useBreakpoint } = Grid;

interface Props {
	postSelected: Post;
	addLike: any;
	handleBack: any;
}

export default function PostDrawer(props: Props) {
	const { likes, likesListener, handleLike } = useSharePhoto();
	const { addLike, handleBack, postSelected } = props;

	useEffect(() => {
		const unsubscribe = likesListener(postSelected.id);
		return () => {
			unsubscribe();
			console.log('unmount');
		};
	}, []);

	const screens = useBreakpoint();
	return (
		<Drawer
			bodyStyle={{ padding: '0' }}
			width={screens.xs ? '100vw' : '35vw'}
			visible={postSelected ? true : false}
			onClose={() => handleBack()}
			title={''}
			extra={
				<PageHeader
					style={{ padding: '0px 0px' }}
					avatar={{ icon: <UserOutlined />, src: postSelected.picture }}
					title={
						<Typography.Text type='secondary' style={{ fontSize: screens.xs ? '16px' : '18px' }}>
							{postSelected.user_name}
						</Typography.Text>
					}
					/* children={<Typography.Title level={4}>{postSelected.title}</Typography.Title>} */
				/>
			}
			footerStyle={{ border: 'none' }}
			footer={
				<Space>
					<Button
						size='large'
						style={{ width: '100%', height: '100%', padding: 2, margin: 2, border: 'none' }}
						danger
						ghost
						// onClick={() => console.log('postId', postSelected?.id)}
						onClick={() => handleLike(postSelected.id)}
						icon={<HeartFilled style={{ fontSize: '35px' }} />}
					/>
					<Badge
						overflowCount={99999}
						style={{
							fontSize: '28px',
							height: 'auto',
							width: 'auto',
							color: '#000000',
							backgroundColor: 'transparent',
						}}
						count={likes.length}></Badge>
					{`me gusta de ${likes.map(like => like.user_name)[0]}${
						likes.length - 1 > 0 ? ` y ${likes.length - 1} ${likes.length - 1 > 1 ? 'personas' : 'persona'} mas` : ''
					}`}
				</Space>
			}>
			<Row gutter={[0, 0]}>
				<Col span={24}>
					<Card
						style={{ width: '100%' }}
						bodyStyle={{ padding: '10px 10px' }}
						bordered={false}
						cover={
							<div
								style={{
									backgroundImage: `url(${postSelected.image})`,
									backgroundRepeat: 'no-repeat',
									backgroundSize: 'cover',
									backgroundPosition: 'center',
								}}>
								<Image
									/*  onDoubleClick={() => handlerDoubleClick(postSelected.id)} */
									width={'100%'}
									style={{
										minHeight: '420px',
										objectFit: screens.xs ? 'contain' : 'unset',
										backgroundColor: '#00000033',
										backdropFilter: 'blur(8px)',
									}}
									src={postSelected.image}
									preview={false}
								/>
							</div>
						}>
						<Typography.Title level={5}>{postSelected.title}</Typography.Title>
					</Card>
				</Col>
			</Row>
		</Drawer>
	);
}
