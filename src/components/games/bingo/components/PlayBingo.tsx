import { useEffect } from 'react';
import { Card, Col, Image, Row, Space, Tag, Typography } from 'antd';
import { PlayBingoInterface } from '../interfaces/bingo';
import BallotHistoryContainer from './BallotHistoryContainer';
import PlayBingoHeader from './PlayBingoHeader';
import BallotDrawCard from './BallotDrawCard';
import WinnersValidationCard from './WinnersValidationCard';
import playBingo from '../hooks/playBingo';

const PlayBingo = ({ bingoValues, event, notifications, dataFirebaseBingo, dimensions }: PlayBingoInterface) => {
  let demonstratedBallots: string[] = dataFirebaseBingo?.demonstratedBallots;

  const {
    pickedNumber,
    setPickedNumber,
    playing,
    setPlaying,
    inputValidate,
    setInputValidate,
    startBingo,
    restartBingo,
    endBingo,
    initPlayBingo,
    validarBingo,
    generateRandomBallot,
    disableBallotDrawButton,
    setDisableBallotDrawButton,
  } = playBingo();

  useEffect(() => {
    initPlayBingo({ event, dataFirebaseBingo, bingoValues, dimensions });
    return () => {
      setPlaying(false);
      setPickedNumber({ type: '', value: '' });
    };
  }, []);

  const handledeGenerateRandomBallot = () => {
    setDisableBallotDrawButton(true);
    setTimeout(() => {
      generateRandomBallot({ demonstratedBallots, event });
      setDisableBallotDrawButton(false);
    }, 3000);
  };
  const handleStartGame = () => {
    startBingo({ event, dataFirebaseBingo, bingoValues, dimensions });
  };

  const handleEndGame = () => {
    endBingo({ event, bingoValues });
  };

  const handleRestartGame = () => {
    restartBingo({ event, dataFirebaseBingo, bingoValues });
  };

  return (
    <Row
      gutter={[16, 16]}
      style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '10px', paddingBottom: '10px' }}>
      <Col span={24}>
        <PlayBingoHeader
          bingoValues={bingoValues}
          playing={playing}
          pickedNumber={pickedNumber}
          startGame={handleStartGame}
          endGame={handleEndGame}
          restartGame={handleRestartGame}
          dimensions={dimensions}
        />
      </Col>
      <Col span={24}>
        <Row gutter={[16, 8]}>
          <Col span={7}>
            <BallotDrawCard
              pickedNumber={pickedNumber}
              playing={playing}
              generateRandomBallot={handledeGenerateRandomBallot}
              disableBallotDrawButton={disableBallotDrawButton}
            />
          </Col>
          <Col span={4}>
            <Card
              title='Figura'
              hoverable
              headStyle={{ border: 'none', padding: '2px', textAlign: 'center' }}
              bodyStyle={{ padding: '10px' }}
              style={{ borderRadius: '20px', height: '100%' }}>
              <Space direction='vertical' align='center' style={{ width: '100%' }}>
                {dataFirebaseBingo?.template ? (
                  <>
                    <Image
                      style={{ transition: 'all 400ms' }}
                      src={dataFirebaseBingo?.template?.image}
                      preview={false}
                    />
                    <Tag style={{ width: '100%', textAlign: 'center' }}>{dataFirebaseBingo?.template?.title}</Tag>
                  </>
                ) : (
                  <Typography.Paragraph style={{ width: '100%', textAlign: 'center' }}>
                    No hay figura seleccionada
                  </Typography.Paragraph>
                )}
              </Space>
            </Card>
          </Col>
          <Col span={13}>
            <WinnersValidationCard
              event={event}
              notifications={notifications}
              inputValidate={inputValidate}
              setInputValidate={setInputValidate}
              validarBingo={validarBingo}
              dimensions={dimensions}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <BallotHistoryContainer demonstratedBallots={demonstratedBallots} />
      </Col>
    </Row>
  );
};

export default PlayBingo;
