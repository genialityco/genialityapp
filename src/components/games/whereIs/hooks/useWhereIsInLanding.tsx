import { UseUserEvent } from '@/context/eventUserContext';
import { DispatchMessageService } from '@/context/MessageService';
import { useContext, useEffect } from 'react';
import { WhereIsInLandingContext, WhereIsLocationView } from '../contexts/WhereIsInLandingContext';
import { Player, PointInGame } from '../types';
import useWhereIs from './useWhereIs';
import * as services from '../services';
import { UseEventContext } from '@/context/eventContext';
import { fromPlayerToScore } from '../utils/fromPlayerToScore';

export default function useWhereIsInLanding() {
	// const cUser = UseUserEvent();
	// const cEvent = UseEventContext();
	const context = useContext(WhereIsInLandingContext);

	if (context === undefined) {
		throw new Error('Debe estar dentro del WhereIsInLandingProvider');
	}

	return context

	// const { whereIs, points } = useWhereIs();

	// useEffect(() => {
	// 	if (!whereIs) return;
	// 	const pointsToShow = points.map(point => ({ ...point, stroke: undefined, isFound: false }));
	// 	setWhereIsGame(prev => ({
	// 		...prev,
	// 		lifes: whereIs.lifes,
	// 		dynamic_id: whereIs._id,
	// 		event_user_id: '',
	// 		user_name: '',
	// 		picture: '',
	// 		points: pointsToShow,
	// 	}));
	// 	verifyPlayer();
	// }, []);

	// const verifyPlayer = async () => {
	// 	const player = await services.getPlayer({ event_id: cEvent.nameEvent, event_user_id: cUser.value._id });
	// 	setPlayer(player);
	// };

	// const { location, setLocation, whereIsGame, setWhereIsGame, player, setPlayer } = context;

	// const goTo = (location: WhereIsLocationView) => {
	// 	setLocation(prev => ({ ...prev, activeView: location }));
	// };

	// const wrongPoint = () => {
	// 	console.log(cEvent.nameEvent);
	// 	if (!whereIsGame.lifes) return;
	// 	if (whereIsGame.lifes - 1 === 0) {
	// 		setWhereIsGame(prev => ({
	// 			...prev,
	// 			won: false,
	// 			isFinish: true,
	// 		}));
	// 		loseGame();
	// 	}
	// 	setWhereIsGame(prev => ({ ...prev, lifes: prev.lifes > 0 ? prev.lifes - 1 : 0 }));
	// 	DispatchMessageService({ type: 'error', action: 'show', msj: 'Ups!, perdiste una vida 💔' });
	// };

	// const foundPoint = (id: PointInGame['id']) => {
	// 	// Verify lifes
	// 	if (!whereIsGame.lifes) return;
	// 	const pointIndex = whereIsGame.points.findIndex(point => point.id === id);
	// 	// Verify if point is found
	// 	if (whereIsGame.points[pointIndex].isFound) return;
	// 	const totalPoints = whereIsGame.points.length;
	// 	const pointsFound = whereIsGame.points.reduce((total, current) => {
	// 		if (current.isFound) {
	// 			total += 1;
	// 		}
	// 		return total;
	// 	}, 0);
	// 	if (pointsFound + 1 === totalPoints) {
	// 		setWhereIsGame(prev => ({
	// 			...prev,
	// 			won: true,
	// 			isFinish: true,
	// 		}));
	// 		winGame();
	// 	}
	// 	// Create new Point
	// 	const newPoint = { ...whereIsGame.points[pointIndex], stroke: 'red', isFound: true };
	// 	const newPoints = whereIsGame.points.map(point => (point.id === id ? newPoint : point));
	// 	setWhereIsGame(prev => ({ ...prev, points: newPoints }));
	// 	DispatchMessageService({ type: 'success', action: 'show', msj: 'Lo encontraste! Sigue asi!' });
	// };

	// const setTimer = (count: number) => {
	// 	setWhereIsGame(prev => ({
	// 		...prev,
	// 		duration: count,
	// 	}));
	// };

	// const restartGame = () => {
	// 	setWhereIsGame(prev => ({
	// 		...prev,
	// 		duration: 0,
	// 		isFinish: false,
	// 		won: false,
	// 	}));
	// };

	// const winGame = async () => {
	// 	if (whereIs === null) return;
	// 	const player: Player = {
	// 		created_at: new Date().toISOString(),
	// 		updated_at: new Date().toISOString(),
	// 		isFinish: true,
	// 		duration: whereIsGame.duration + 1,
	// 		dynamic_id: whereIs._id,
	// 		event_user_id: cUser.value._id,
	// 		user_name: cUser.value.user.names,
	// 		picture: cUser.value.user.picture,
	// 	};
	// 	setPlayer(player);
	// 	console.log('Ganaste');
	// 	await services.createPlayer({ ...player, event_id: cEvent.nameEvent });
	// 	goTo('results');
	// };

	// const loseGame = async () => {
	// 	if (whereIs === null) return;
	// 	const player: Player = {
	// 		created_at: new Date().toISOString(),
	// 		updated_at: new Date().toISOString(),
	// 		isFinish: false,
	// 		duration: whereIsGame.duration + 1,
	// 		dynamic_id: whereIs._id,
	// 		event_user_id: cUser.value._id,
	// 		user_name: cUser.value.user.names,
	// 		picture: cUser.value.user.picture,
	// 	};
	// 	console.log('Perdiste');
	// 	setPlayer(player);
	// 	await services.createPlayer({ ...player, event_id: cEvent.nameEvent });
	// 	goTo('results');
	// };

	// const getPlayer = async () => {
	// 	const player = await services.getPlayer({ event_id: cEvent.nameEvent, event_user_id: cUser.value._id });
	// 	return player;
	// };

	// const getScores = async () => {
	// 	const players = await services.getScores({ event_id: cEvent.nameEvent });
	// 	if (players === null) return { scoresFinished: [], scoresNotFinished: [] };

	// 	const playersFinished = players.filter(player => player.isFinish === true);
	// 	const playersNotFinished = players.filter(player => player.isFinish === false);
	// 	const playersOrderedByDuration = playersFinished.sort((playerA, playerB) => playerA.duration - playerB.duration);
	// 	const scoresFinished = playersOrderedByDuration.map((player, i) => {
	// 		return fromPlayerToScore(player, i + 1);
	// 	});
	// 	const scoresNotFinished = playersNotFinished.map(player => {
	// 		return fromPlayerToScore(player, 0);
	// 	});
	// 	return { scoresFinished, scoresNotFinished };
	// };

	// // const getScoresListener = (setScores: React.Dispatch<React.SetStateAction<Score[]>>) => {
	// // 	console.log(cEvent.nameEvent);
	// // 	const unsubscribe = services.getScoresListener(cEvent.nameEvent, setScores);
	// // 	return unsubscribe;
	// // };

	// return {
	// 	location,
	// 	goTo,
	// 	whereIsGame,
	// 	wrongPoint,
	// 	foundPoint,
	// 	setTimer,
	// 	winGame,
	// 	player,
	// 	getPlayer,
	// 	getScores,
	// 	// getScoresListener,
	// };
}
