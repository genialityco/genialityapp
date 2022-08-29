import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { Badge, Space, Typography } from 'antd';

import QuizStatusMessage from './quizStatus';

interface QuizBadgetProps {
  right: number,
  total: number,
  minimum: number,
  isLoading?: boolean,
};

function QuizBadge(props: QuizBadgetProps) {
  const {
    right,
    total,
    minimum,
    isLoading,
  } = props;

  const [isRight, setIsRight] = useState<boolean>(false);

  /**
   * The badget color, gray while it is processing, red and green pretty to other states
   */
   const badgetColor = useMemo(() => {
    // Check out the 3 status
    if (isRight === undefined) return '#7D7D7D';
    if (minimum === 0) return '#CB7E0B';
    return isRight ? '#5EB841' : '#B8415A';
  }, [isRight]);

  const badgeMessage = useMemo(() => {
    if (isLoading) return QuizStatusMessage.PROCESSING;
    if (total === 0) return QuizStatusMessage.NO_QUESTIONS;
    if (minimum === 0) return QuizStatusMessage.NO_REQUIRED;
    if (isRight) return QuizStatusMessage.PASSED;
    return QuizStatusMessage.NOT_PASSED;
  }, [isRight, total, isLoading, minimum]);

  /**
   * The stats message that says how many answers were responsed rightly
   */
   const statsMessage = useMemo(() => {
    if (isLoading)  return 'N de M';
    return `${right} de ${total}`;
  }, [isLoading, right, total]);

  useEffect(() => {
    setIsRight(right > minimum);
  }, [right, minimum]);

  return (
    <Space>
      <Badge count={badgeMessage} style={{ backgroundColor: badgetColor }}/>
      {' '}
      <Typography.Text strong>{statsMessage}</Typography.Text>
    </Space>
  );
}

export default QuizBadge;