import { Tabs } from 'antd';
import React, { useContext, useState } from 'react';
import CreateAuction from '../components/cms/CreateAuction';
import { Auction } from '../interfaces/auction.interface';
import Loading from '@/components/profile/loading';
import { AuctionContext } from '../context/AuctionContext';
import ExecuteAuction from './ExecuteAuction';
import CreateProducts from './CreateProducts';
import ConfigAppearance from '../components/cms/ConfigAppearance';
import Report from '../components/cms/Report';

export default function AuctionView({auction,event,eventId,loadingConfig} : {auction : Auction, event: any,loadingConfig : boolean, eventId : string }) {

  const [currenTab, setcurrenTab] = useState('1')
  return (
    <Tabs defaultActiveKey={currenTab} onTabClick={(key)=> setcurrenTab(key)}>
     
     <Tabs.TabPane tab='Configuración' key={1}  disabled={auction.playing}>
      {loadingConfig ? <Loading/> :<CreateAuction key={'subasta-Configuración'} event={event} active={true} auction={auction}/>}
      </Tabs.TabPane>

      <Tabs.TabPane tab='Apariencia' key={4}>
      <ConfigAppearance auction={auction} eventId={eventId}/>
      </Tabs.TabPane>
      
      <Tabs.TabPane tab='Productos' key={2}>
        <CreateProducts reload={currenTab === '2'} eventId={eventId}/>
      </Tabs.TabPane>

      <Tabs.TabPane tab='Ejecución' key={3}>
        <ExecuteAuction auction={auction} eventId={eventId}/>
      </Tabs.TabPane>
      
      <Tabs.TabPane tab='Reporte de subasta' key={5}>
        <Report eventId={eventId} reload={currenTab === '5'} />
      </Tabs.TabPane>
    </Tabs>
  );
}
