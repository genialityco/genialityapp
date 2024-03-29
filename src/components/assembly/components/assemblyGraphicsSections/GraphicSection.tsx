import { Card, Row, Grid, Result, Typography, Radio, RadioChangeEvent } from 'antd';
import { GraphicsData } from '@/components/events/surveys/types';
import ChartRender from '../ChartRender';
// import useAssemblyInCMS from '../../hooks/useAssemblyInCMS';
import { GraphicType, Question, Survey } from '../../types';
import { useState } from 'react';
import { SegmentedValue } from 'antd/lib/segmented';
import { BarChartOutlined, PieChartOutlined } from '@ant-design/icons';

interface Props {
	survey: Survey;
	questionSelectedId: string;
	graphicsData: GraphicsData;
	graphicType: GraphicType;
	setGraphicType: React.Dispatch<React.SetStateAction<GraphicType>>;
	question: Question;
}

const { useBreakpoint } = Grid;

export default function GraphicSection(props: Props) {
	const { survey, questionSelectedId, graphicsData, graphicType, question, setGraphicType } = props;
	const screens = useBreakpoint();

	const handleGraphicType = (e: RadioChangeEvent) => {
		// console.log(e.target.value as GraphicType)
		setGraphicType(e.target.value as GraphicType)
	}


	return (
		<Card
			style={{ height: '100%', width: '100%' }}
			headStyle={{ border: 'none' }}
			bodyStyle={{ paddingTop: '0px' }}
			title={
				<div className='animate__animated animate__fadeInLeft' key={question?.title}>
					{question?.title}
				</div>
			}
			// extra={
			// 	<Radio.Group buttonStyle='solid' value={graphicType} onChange={handleGraphicType}>
			// 		<Radio.Button value='vertical'>
			// 			<BarChartOutlined rotate={90} />
			// 		</Radio.Button>
			// 		<Radio.Button value='horizontal'>
			// 			<BarChartOutlined />
			// 		</Radio.Button>
			// 		<Radio.Button value='pie'>
			// 			<PieChartOutlined />
			// 		</Radio.Button>
			// 	</Radio.Group>
			// }
		>
			<Row align='middle' justify='center'>
				{!graphicsData.dataValues?.length && <Result title='No hay graficas para mostrar aun'></Result>}
				<div
					style={{
						visibility: !graphicsData.dataValues?.length ? 'hidden' : 'visible',
						height: '100%',
						width: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<ChartRender
						dataValues={graphicsData.dataValues}
						isMobile={screens.xs ? true : false}
						labels={graphicsData.labelsToShow}
						type={graphicType}
					/>
				</div>
			</Row>
		</Card>
	);
}
