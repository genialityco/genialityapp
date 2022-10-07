import { ReactElement } from 'react';
import { Fragment } from 'react';
import { Route, Switch, withRouter, useHistory } from 'react-router-dom';
import { Button, Typography } from 'antd';

import { QuizProgressPage } from './quiz/QuizProgressPage';
import { QuizStatusEditorPage } from './quiz/QuizStatusEditorPage';
import { CourseProgressBarPage } from './progresses/CourseProgressBarPage';
import { DatePickerAndDayJSPage } from './date/DatePickerAndDayJSPage';
import { LikertScaleEditorPage } from './quiz/LikertScaleEditorPage';

type UI = {
  url: string;
  text: string;
  Component: (props: any) => ReactElement;
};

interface HomeProps {
  matchUrl: string,
  event: any,
};

/** Edit only this 🤨🔥 */
const uiSet: UI[] = [
  {
    url: 'quizProgress',
    text: 'Quiz Progress',
    Component: QuizProgressPage,
  },
  {
    url: 'quizStatusEditor',
    text: 'Quiz Status Editor',
    Component: QuizStatusEditorPage,
  },
  {
    url: 'courseProgressBar',
    text: 'Course Progress Bar',
    Component: CourseProgressBarPage,
  },
  {
    url: 'datePickerAndDayJSPage',
    text: 'DatePickerAndDayJSPage',
    Component: DatePickerAndDayJSPage,
  },
  {
    url: 'likertScaleEditorPage',
    text: 'Likert Scale Editor Page',
    Component: LikertScaleEditorPage,
  }
];

function Home(props: HomeProps) {
  const history = useHistory();

  const createHandler = (url: string) => {
    return () => history.push(`${props.matchUrl}/${url}`);
  }

  const CustomButton = (ui: UI) => (
    <Button onClick={createHandler(ui.url)}>{ui.text}</Button>
  );

  return (
    <>
    <section>
      <Typography.Title>Isolated Component</Typography.Title>
      {uiSet.map((ui) => CustomButton(ui))}
    </section>
    </>
  );
}

function IsolatedRoutes({ ...props }) {
  const { event, match } = props;
  return (
    <Fragment>
      <Switch>
        <Route exact path={`${match.url}/`} render={() => <Home event={event} matchUrl={match.url} />} />
        {uiSet.map((ui) => (
          <Route
            exact
            path={`${match.url}/${ui.url}`}
            render={() => <ui.Component event={event} matchUrl={match.url} />}
          />
        ))}
      </Switch>
    </Fragment>
  );
}

export default withRouter(IsolatedRoutes);
