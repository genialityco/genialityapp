import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { DispatchMessageService } from '../../context/MessageService';
import { ExcelColumn } from '@/pages/eventOrganization/tableColums/interfaces/ExcelEvent.interface';
import { utils, writeFileXLSX } from 'xlsx';

interface Props {
  columns?: ExcelColumn[];
  fileName: string;
  onAsyncList: () => Promise<any[]>;
}
export const ExportExcelAsync = ({ columns, fileName, onAsyncList }: Props) => {
  const exportData = async () => {
    try {
      const data = await onAsyncList();

      if (!data || data.length === 0) return handledError('no-data');

      const newlist = data.map((obj) => {
        let newObj: { [key: string]: any } = {};
        Object.keys(obj).forEach((key) => {
          const nameColum = columns?.find((c) => c.dataIndex === key)?.title;
          if (Array.isArray(obj[key])) {
            newObj[nameColum ?? key] = obj[key].join('\n');
          } else {
            newObj[nameColum ?? key] = obj[key];
          }
        });
        return newObj;
      });
      // console.log({ newlist })
      const wb = utils.book_new();
      const ws = utils.json_to_sheet(newlist);
      utils.book_append_sheet(wb, ws, 'Datos');
      writeFileXLSX(wb, fileName + '.xlsx');
    } catch (error) {
      handledError('error-request');
      console.error(error);
    }
  };

  const handledError = (type: 'no-data' | 'error-request') => {
    switch (type) {
      case 'error-request':
        DispatchMessageService({
          type: 'error',
          msj: 'No se pudo descargar el excel',
          action: 'show',
        });
        break;
      case 'no-data':
        DispatchMessageService({
          type: 'error',
          msj: 'No hay eventos para exportar',
          action: 'show',
        });
        break;
    }
  };

  return (
    <div>
      <Button onClick={exportData}>
        <DownloadOutlined /> Exportar
      </Button>
    </div>
  );
};
