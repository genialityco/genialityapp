import { useEffect, useState } from 'react';
import { Row, Col, Button, Drawer, Space } from 'antd';
import { FileDoneOutlined, PieChartOutlined, CloseOutlined } from '@ant-design/icons';
import { UseSurveysContext } from '../../../../context/surveysContext';
import { UseCurrentUser } from '../../../../context/userContext';
import SurveyDetailPage from '../SurveyDetailPage';
import RankingTrivia from '../rankingTrivia';
import ThisRouteCanBeDisplayed from '../../Landing/helpers/thisRouteCanBeDisplayed';
import { parseStringBoolean } from '@/Utilities/parseStringBoolean';

function SurveyDrawer(props: any) {
  let cSurveys: any = UseSurveysContext();
  let cUser = UseCurrentUser();

  // Estado para hacer visible el ranking
  const [rankingVisible, setRankingVisible] = useState(true);

  const showRanking = () => {
    setRankingVisible(!rankingVisible);
  };
  useEffect(() => {
    if (!cSurveys.shouldDisplayRanking()) {
      setRankingVisible(true);
    }
  }, [cSurveys.shouldDisplayRanking()]);

  function closeDrawer() {
    cSurveys.unset_select_survey(null);
  }

  const validationsToOpenTheDrawer = () => {
    return cSurveys.currentSurvey !== null;
  };

  return (
    <>
      {validationsToOpenTheDrawer() && (
        <Drawer
          zIndex={1000}
          destroyOnClose={true}
          title={
            cSurveys.currentSurvey && cSurveys.currentSurvey?.allow_gradable_survey ? (
              <Space>
                {!parseStringBoolean(cSurveys.currentSurvey.allow_gradable_survey) ? (
                  <PieChartOutlined
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      height: '40px',
                      width: '40px',
                      borderRadius: '8px',
                      color: `${props.colorTexto}`,
                      backgroundColor: `${props.colorFondo}`,
                    }}
                  />
                ) : (
                  <FileDoneOutlined
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      height: '40px',
                      width: '40px',
                      borderRadius: '8px',
                      color: `${props.colorTexto}`,
                      backgroundColor: `${props.colorFondo}`,
                    }}
                  />
                )}
                <Space direction='vertical' size={-3}>
                  {cSurveys.currentSurvey?.name}
                  {parseStringBoolean(cSurveys.currentSurvey.allow_gradable_survey) && (
                    <span style={{ fontSize: '12px', color: '#52c41a' }}>Calificable</span>
                  )}
                </Space>
              </Space>
            ) : (
              <Space>
                <PieChartOutlined
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    height: '40px',
                    width: '40px',
                    borderRadius: '8px',
                    color: `${props.colorTexto}`,
                    backgroundColor: `${props.colorFondo}`,
                  }}
                />
                {cSurveys.currentSurvey?.name}
              </Space>
            )
          }
          bodyStyle={{ padding: '10px' }}
          closeIcon={<CloseOutlined style={{ fontSize: '24px' }} />}
          placement='right'
          // closable={true}
          visible={cSurveys.shouldDisplaysurveyAssignedToThisActivity() && cUser.value !== null}
          onClose={closeDrawer}
          width={window.screen.width >= 768 ? (rankingVisible === false ? '100%' : '70%') : '100%'}>
          <div style={{ width: '100%', display: 'inline-block', paddingBottom: '10px' }}>
            {cSurveys.shouldDisplayRanking() && (
              <Button type='primary' onClick={showRanking}>
                {rankingVisible === false ? 'Cerrar ranking' : 'Abrir ranking'}
              </Button>
            )}
          </div>

          <Row gutter={[8, 8]} justify='center'>
            <Col xl={rankingVisible === true ? 24 : 16} xxl={rankingVisible === true ? 24 : 16}>
              <ThisRouteCanBeDisplayed>
                <SurveyDetailPage />
              </ThisRouteCanBeDisplayed>
            </Col>
            <Col hidden={rankingVisible} xl={8} xxl={8}>
              <div style={{ width: '100%' }}>
                <div style={{ justifyContent: 'center', display: 'grid' }}>
                  {cSurveys.shouldDisplayRanking() && <RankingTrivia noWidth />}
                </div>
              </div>
            </Col>
          </Row>
        </Drawer>
      )}
    </>
  );
}

export default SurveyDrawer;
