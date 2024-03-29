import { CurrentEventContext } from '@/context/eventContext';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { Button, Collapse, Grid, List, Space, Typography } from 'antd';
import { useContext } from 'react';
import ScrollIntoView from 'react-scroll-into-view';
import { PropsMenuScrollbar } from './types/Prelanding';
import { LandingBlock } from './types';
import { useIntl } from 'react-intl';

const { useBreakpoint } = Grid;

const MenuScrollBlock = ({ sections, vdescription, vspeakers, vactividades, vpatrocinadores } : PropsMenuScrollbar) => {
  //CONTEXTO
  const cEvent = useContext(CurrentEventContext);
  const bgColor = cEvent.value?.styles?.toolbarDefaultBg;
  const textColor = cEvent.value?.styles?.textMenu;
  const intl = useIntl();

  const screens = useBreakpoint();
  //PERMITE CONTROLAR SI LA SECCION TIENE CONTENIDO O NO
  const visibleSeccion = (name : string ) => {
    switch (name) {
      case 'Descripción':
        return vdescription.length > 0

      case 'Conferencistas':
        return vspeakers.length > 0

      case 'Contador':
        return true

      case 'Actividades':
        return vactividades.length > 0

      case 'Patrocinadores':
        return vpatrocinadores.length > 0

      default:
        return false

    }
  };

  const createLabel = (section : LandingBlock) => {
    return section.label || section.name
   };
   
  return screens.xs ? (
    <Collapse
      className='menu__prelanding'
      expandIcon={({ isActive }) =>
        isActive ? (
          <CloseOutlined style={{ fontSize: '24px', color: textColor }} />
        ) : (
          <MenuOutlined style={{ fontSize: '24px', color: textColor }} />
        )
      }
      ghost
      style={{ width: '100%', backgroundColor: bgColor }}>
      <Collapse.Panel
        style={{ backgroundColor: bgColor }}
        header={
          <Typography.Text strong style={{ fontSize: '24px', color: textColor }}>
            {intl.formatMessage({id: 'menu', defaultMessage: 'Menú'})}
          </Typography.Text>
        }
        key='1'>
        <List
          dataSource={sections && sections.filter((section) => section?.status)}
          renderItem={(section) =>
            visibleSeccion(section.name) && (
              <ScrollIntoView
                scrollOptions={{ block: 'start' }}
                key={`section-${section.name}`}
                alignToTop={true}
                selector={`#${section.name}_block`}>
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Typography.Text strong style={{ color: textColor, fontSize: '16px' }}>
                        {createLabel(section)}
                      </Typography.Text>
                    }
                  />
                </List.Item>
              </ScrollIntoView>
            )
          }
        />
      </Collapse.Panel>
    </Collapse>
  ) : (
    <Space wrap size={'large'}>
      {sections &&
        sections
          .filter((section) => section?.status)
          .map((section) => {
            return (
              visibleSeccion(section.name) && (
                <ScrollIntoView
                  scrollOptions={{ block: 'start' }}
                  key={`section-${section.name}`}
                  alignToTop={true}
                  selector={`#${section.name}_block`}>
                  <Button type='text' size='large' style={{ color: textColor, fontWeight: '700' }}>
                    {createLabel(section)}
                  </Button>
                </ScrollIntoView>
              )
            );
          })}
    </Space>
  );
};

export default MenuScrollBlock;
