import DrawerWhereIs from '../components/DrawerWhereIs';
import WhereIsProvider from '../contexts/WhereIsContext';
import WhereIsInLandingProvider from '../contexts/WhereIsInLandingContext';
import useWhereIsInLanding from '../hooks/useWhereIsInLanding';
import Game from './landing/Game';
import Introduction from './landing/Introduction';
import Results from './landing/Results';

interface RenderViewProps {
	eventId: string;
}

const RenderView = (props: RenderViewProps) => {
	const { eventId } = props;
	const { location, player } = useWhereIsInLanding();

	const views = {
		introduction: {
			component: <Introduction />,
		},
		game: {
			component: <Game />,
		},
		results: {
			component: <Results />,
		},
	};

	if (!!player) return views.results.component;

	return views[location.activeView].component;
};

interface Props {
	eventId: string;
}

export default function WhereIsInLanding(props: Props) {
	const { eventId } = props;
	return (
		<WhereIsProvider>
			<WhereIsInLandingProvider>
				<DrawerWhereIs>
					<RenderView eventId={eventId} />
				</DrawerWhereIs>
			</WhereIsInLandingProvider>
		</WhereIsProvider>
	);
}
