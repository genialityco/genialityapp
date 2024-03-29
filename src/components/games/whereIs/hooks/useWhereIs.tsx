import { useContext } from 'react';
import { WhereIsContext } from '../contexts/WhereIsContext';

export default function useWhereIs() {
	const context = useContext(WhereIsContext);

	if (context === undefined) {
		throw new Error('Debe estar dentro del WhereIsProvider');
	}

	return context;
}
