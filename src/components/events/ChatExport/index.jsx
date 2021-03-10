import React, { useEffect, useState } from 'react';
import { Table, Tag, Space } from 'antd';
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/database';
import { data } from 'jquery';

var otherApp = app.initializeApp(
  {
    apiKey: 'AIzaSyD4_AiJFGf1nIvn9BY_rZeoITinzxfkl70',
    authDomain: 'chatevius.firebaseapp.com',
    databaseURL: 'https://chatevius.firebaseio.com',
    projectId: 'chatevius',
    storageBucket: 'chatevius.appspot.com',
    messagingSenderId: '114050756597',
    appId: '1:114050756597:web:53eada24e6a5ae43fffabc',
    measurementId: 'G-5V3L65YQKP',
  },
  'nameOfOtherApp'
);

const firestore = otherApp.firestore();

function formatAMPM(hours, minutes) {
  // var hours = date.getHours();
  // var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

const ChatExport = ({ eventId }) => {
  function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Deciembre',
    ];
    var year = a.getYear() - 69;
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + formatAMPM(hour, min);

    return time;
  }

  let [datamsjevent, setdatamsjevent] = useState();
  const columns = [
    {
      title: 'usuario',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: 'Mensaje',
      key: 'text',
      dataIndex: 'text',
      render: (text, record) => <Tag color='#3895FA'>{record.text}</Tag>,
    },
    {
      title: 'Fecha',
      dataIndex: 'hora',
      key: 'hora',
      render: (text) => <a>{text}</a>,
    },
  ];

  useEffect(() => {
    let datamessagesthisevent = [];

    firestore
      .collection('messagesevent_' + eventId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log(timeConverter(doc.data().timestamp));
          let newtime = timeConverter(doc.data().timestamp);
          let msjnew = {
            name: doc.data().name,
            text: doc.data().text,
            hora: newtime,
          };
          datamessagesthisevent.push(msjnew);
        });
        setdatamsjevent(datamessagesthisevent);
      })
      .catch((err) => {
        console.log('error firebase', err);
      });

    console.log(datamsjevent);
  }, []);

  return <Table columns={columns} dataSource={datamsjevent} />;
};

export default ChatExport;
