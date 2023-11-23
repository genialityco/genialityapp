import { Button, Form, Modal, Space, Typography, Card, Row, Col } from 'antd';
import { SketchPicker, CirclePicker } from 'react-color';
import { useState } from 'react';
import { DispatchMessageService } from '@/context/MessageService';
import { getCorrectColor } from '@/helpers/utils';
import { useModalLogic } from '@/hooks/useModalLogic';

const { Text } = Typography;

type Props = {
  color: string;
  onChange: (color: string) => void;
  setIsVisible?: (isVisible: boolean) => void;
  labelColorName?: string;
};

export const InputColor2 = ({ color, onChange, labelColorName }: Props) => {
  const { closeModal, isOpenModal, openModal } = useModalLogic();

  const colorsP = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#ff5722',
    '#795548',
    '#607d8b',
    '#000000',
    '#FFFFFF' /* En caso de querer cambiar la posición del color blanco, buscar en el proyecto la clase de css .circle-picker */,
    '#4A4A4A',
    '#9B9B9B',
  ];

  const hexToRgb = (hex: string) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  return (
    <>
      <Modal
        onCancel={closeModal}
        width={600}
        style={{ borderRadius: '20px' }}
        closable={true}
        footer={[
          <Button key='ok' type='primary' onClick={closeModal}>
            Aceptar
          </Button>,
        ]}
        title={null}
        visible={isOpenModal}>
        <Row gutter={[16, 16]} justify='center' align='top'>
          <Col>
            <Card bodyStyle={{ padding: '15px' }} style={{ borderRadius: '20px' }}>
              <SketchPicker disableAlpha={true} presetColors={[]} color={color} onChangeComplete={onChange} />
            </Card>
          </Col>
          <Col>
            <Card bodyStyle={{ padding: '15px' }} style={{ borderRadius: '20px' }}>
              <CirclePicker colors={colorsP} color={color} onChangeComplete={onChange} />
            </Card>
          </Col>
        </Row>
      </Modal>
      <div onClick={openModal}>
        <Space>
          <Card
            style={{
              cursor: 'pointer',
              borderRadius: '8px',
              width: '100px',
              height: '100px',
              borderColor: getCorrectColor(color),
              color: getCorrectColor(color),
              backgroundColor: color,
            }}></Card>
          <Space direction='vertical'>
            <Text
              style={{ fontSize: '20px' }}
              code
              copyable={{
                text: `${color.toUpperCase()}`,
                onCopy: () =>
                  DispatchMessageService({
                    type: 'success',
                    msj: 'Color hexadecimal copiado',
                    action: 'show',
                  }),
              }}>{`HEX ${color.toUpperCase()}`}</Text>
            <Text
              style={{ fontSize: '20px' }}
              code
              copyable={{
                text: `${hexToRgb(color)?.r},${hexToRgb(color)?.g},${hexToRgb(color)?.b}`,
                onCopy: () =>
                  DispatchMessageService({
                    type: 'success',
                    msj: 'Color rgb copiado',
                    action: 'show',
                  }),
              }}>{`RGB (${hexToRgb(color)?.r},${hexToRgb(color)?.g},${hexToRgb(color)?.b})`}</Text>
          </Space>
        </Space>
      </div>
    </>
  );
};
