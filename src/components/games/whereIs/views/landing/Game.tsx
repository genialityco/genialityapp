import { KonvaEventObject } from 'konva/lib/Node';
import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Circle, Layer, Stage } from 'react-konva';
import useWhereIs from '../../hooks/useWhereIs';
import useWhereIsInLanding from '../../hooks/useWhereIsInLanding';

export default function Game() {
	// Hooks
	const { loading, whereIs } = useWhereIs();
	const { whereIsGame, wrongPoint, foundPoint } = useWhereIsInLanding();
	// States
	const [hasScrolled, setHasScrolled] = useState<boolean>(false);
	// from useWhereIs
	if (whereIs === null) return <p>Ups!, esta dinamica no existe aun</p>;

	const { game_image, game_image_height, game_image_width } = whereIs;

	// Interaction handlers
	const handleClick = (e: KonvaEventObject<MouseEvent>) => {
		if (isMobile) return; // Verify isMobile or not, I think is redundant
		const id = e.target.id();
		foundPoint(id);
		e.cancelBubble = true;
	};

	const handleOutsideClick = (e: KonvaEventObject<MouseEvent>) => {
		if (isMobile) return; // Verify isMobile or not, I think is redundant
		wrongPoint();
		e.cancelBubble = true;
	};

	const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
		if (!isMobile) return; // Verify isMobile or not, I think is redundant
		setHasScrolled(false);
		e.cancelBubble = true;
	};

	const handleTouchEnd = (e: KonvaEventObject<TouchEvent>) => {
		if (!isMobile) return; // Verify isMobile or not, I think is redundant
		const id = e.target.id();
		foundPoint(id);
		e.cancelBubble = true;
	};

	const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
		if (!isMobile) return; // Verify isMobile or not, I think is redundant
		setHasScrolled(true);
		e.cancelBubble = true;
	};

	const handleTouchEndOutside = (e: KonvaEventObject<TouchEvent>) => {
		if (!isMobile || hasScrolled) return; // Verify isMobile or not, I think is redundant
		wrongPoint();
		e.cancelBubble = true;
	};

	return (
		<div style={{ margin: 'auto 0', height: 'auto', width: '100%' }}>
			<div style={{ overflow: 'auto', height: 'calc(100vh - 90px)' }}>
				<Stage
					height={game_image_height}
					width={game_image_width}
					style={{
						height: game_image_height,
						width: game_image_width,
						backgroundImage: `url("${game_image}")`,
						backgroundRepeat: 'no-repeat',
					}}
					onClick={handleOutsideClick}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEndOutside}>
					<Layer>
						{whereIsGame.points.map(point => (
							<Circle
								className='animate__animated animate__heartBeat'
								key={point.id}
								id={point.id.toString()}
								x={point.x}
								y={point.y}
								fill='transparent'
								// fill='red' // Just for test purpouses
								stroke={point.stroke}
								radius={point.radius}
								opacity={0.8}
								onClick={handleClick}
								onTouchStart={handleTouchStart}
								onTouchMove={handleTouchMove}
								onTouchEnd={handleTouchEnd}
							/>
						))}
					</Layer>
				</Stage>
			</div>
		</div>
	);
}
