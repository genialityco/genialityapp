import React, { useContext, useState } from 'react';
import { Steps, Button, Alert } from 'antd';
import RegisterFast from './Content/RegisterFast';
import RegistrationResult from './Content/RegistrationResult';
import AccountOutlineIcon from '@2fd/ant-design-icons/lib/AccountOutline';
import TicketConfirmationOutlineIcon from '@2fd/ant-design-icons/lib/TicketConfirmationOutline';
import { ScheduleOutlined } from '@ant-design/icons';
import FormComponent from '../events/registrationForm/form';
import { useEffect } from 'react';
import { SearchUserbyEmail, UsersApi } from 'helpers/request';
import { LoadingOutlined } from '@ant-design/icons';
import createNewUser from './ModalsFunctions/createNewUser';
import { useIntl } from 'react-intl';
import { UseEventContext } from 'Context/eventContext';
import HelperContext from 'Context/HelperContext';
const { Step } = Steps;

const RegisterUserAndEventUser = ({ screens, stylePaddingMobile, stylePaddingDesktop }) => {
  const intl = useIntl();
  const cEvent = UseEventContext();
  const [current, setCurrent] = React.useState(0);
  const [basicDataUser, setbasicDataUser] = React.useState({
    names: '',
    email: '',
    password: '',
    picture: '',
  });
  let { handleChangeTabModal } = useContext(HelperContext);
  const [dataEventUser, setdataEventUser] = useState({});
  const [buttonStatus, setbuttonStatus] = useState(true);
  const [validationGeneral, setValidationGeneral] = useState({
    status: false,
    textError: '',
    loading: false,
  });
  const [validateEventUser, setvalidateEventUser] = useState({
    status: false,
    textError: '',
    statusFields: false,
  });

  const hookValidations = (status, textError) => {
    setValidationGeneral({
      status: status,
      textError: textError,
      loading: false,
    });
    setbuttonStatus(status);
  };

  const HandleHookForm = (e, FieldName, picture) => {
    let value = '';
    if (FieldName === 'picture') {
      value = picture;
    } else {
      value = e.target.value;
    }

    if (current === 0) {
      if (FieldName === 'picture') {
        setbasicDataUser({ ...basicDataUser, [FieldName]: picture });
      } else {
        setbasicDataUser({
          ...basicDataUser,
          [FieldName]: value,
        });
      }
    } else {
      setdataEventUser({
        ...dataEventUser,
        [FieldName]: value,
      });
    }
  };

  const steps = [
    {
      title: 'First',
      content: <RegisterFast basicDataUser={basicDataUser} HandleHookForm={HandleHookForm} />,
      icon: <AccountOutlineIcon style={{ fontSize: '32px' }} />,
    },
    {
      title: 'Second',
      content: (
        <FormComponent
          hookValidations={hookValidations}
          dataEventUser={dataEventUser}
          basicDataUser={basicDataUser}
          HandleHookForm={HandleHookForm}
          validateEventUser={validateEventUser}
          setvalidateEventUser={setvalidateEventUser}
        />
      ),
      icon: <TicketConfirmationOutlineIcon style={{ fontSize: '32px' }} />,
    },
    {
      title: 'Last',
      content: <RegistrationResult validationGeneral={validationGeneral} basicDataUser={basicDataUser} />,
      icon: <ScheduleOutlined style={{ fontSize: '32px' }} />,
    },
  ];

  const handleValidateAccountEvius = () => {
    SearchUserbyEmail(basicDataUser.email).then((resp) => {
      if (resp.length > 0) {
        setValidationGeneral({
          loading: false,
          status: true,
          textError: intl.formatMessage({
            id: 'modal.feedback.title.error',
            defaultMessage: 'Correo electrónico ya en uso, inicie sesión si desea continuar con este correo.',
          }),
          component: intl.formatMessage({ id: 'modal.feedback.title.errorlink', defaultMessage: 'iniciar sesión' }),
        });
      } else {
        setValidationGeneral({
          loading: false,
          status: false,
          textError: '',
        });
        setCurrent(current + 1);
      }
    });
  };

  const handleSubmit = () => {
    setCurrent(current + 1);
    let SaveUserEvius = new Promise((resolve, reject) => {
      async function CreateAccount() {
        let resp = await createNewUser(basicDataUser);
        resolve(resp);
      }

      CreateAccount();
    });

    async function createEventUser() {
      let clonBasicDataUser = { ...basicDataUser };
      delete clonBasicDataUser.password;
      delete clonBasicDataUser.picture;

      let datauser = {
        ...clonBasicDataUser,
        ...dataEventUser,
      };

      let propertiesuser = { properties: { ...datauser } };
      let respUser = await UsersApi.createOne(propertiesuser, cEvent.value?._id);
      if (respUser && respUser._id) {
        setValidationGeneral({
          status: false,
          loading: false,
          textError: intl.formatMessage({
            id: 'text_error.successfully_registered',
            defaultMessage: 'Te has inscrito correctamente a este evento',
          }),
        });
        setbasicDataUser({});
        setdataEventUser({});
      }
    }

    SaveUserEvius.then((resp) => {
      if (resp) {
        createEventUser();
      } else {
        setValidationGeneral({
          status: false,
          loading: false,
          textError: intl.formatMessage({
            id: 'text_error.error_creating_user',
            defaultMessage: 'Hubo un error al crear el usuario, intente nuevamente',
          }),
        });
      }
    });
  };

  const next = () => {
    if (current == 0) {
      setValidationGeneral({
        ...validationGeneral,
        loading: true,
        status: false,
      });

      handleValidateAccountEvius();
    } else if (current == 1) {
      setvalidateEventUser({
        status: true,
        textError: '',
      });
    }
  };

  useEffect(() => {
    if (validateEventUser.statusFields) {
      setValidationGeneral({
        ...validationGeneral,
        loading: true,
        status: false,
      });
      handleSubmit();
    }
  }, [validateEventUser.statusFields]);

  const prev = () => {
    setCurrent(current - 1);
    setbuttonStatus(false);
  };

  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  const ValidateGeneralFields = () => {
    if (basicDataUser.email && basicDataUser.password && basicDataUser.names) {
      if (
        validateEmail(basicDataUser.email) &&
        basicDataUser.password.length >= 6 &&
        basicDataUser.password.length <= 18
      ) {
        setbuttonStatus(false);
        setValidationGeneral({
          ...validationGeneral,
          loading: false,
          status: false,
          textError: '',
        });
      } else {
        setValidationGeneral({
          ...validationGeneral,
          loading: false,
          textError: intl.formatMessage({
            id: 'feedback.title.error',
            defaultMessage: 'Complete los campos solicitados correctamente.',
          }),
          status: true,
        });
      }
    } else {
      setbuttonStatus(true);
    }
  };

  useEffect(() => {
    if (current == 0) {
      ValidateGeneralFields();
    }
  }, [basicDataUser, dataEventUser, current]);

  return (
    <div style={screens.xs ? stylePaddingMobile : stylePaddingDesktop}>
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} icon={item.icon} />
        ))}
      </Steps>
      <div style={{ marginTop: '30px' }}>{steps[current].content}</div>
      <div style={{ marginTop: '30px' }}>
        {current > 0 && current < 2 && (
          <Button
            onClick={() => {
              hookValidations(false, '');
              prev();
            }}
            size='large'
            style={{ margin: '0 8px' }}>
            {intl.formatMessage({ id: 'register.button.previous', defaultMessage: 'Anterior' })}
          </Button>
        )}

        {validationGeneral.loading ? (
          <LoadingOutlined style={{ fontSize: '28px' }} />
        ) : (
          <>
            {!validationGeneral.status && (
              <>
                {current < steps.length - 1 && (
                  <Button
                    disabled={buttonStatus}
                    size='large'
                    type='primary'
                    onClick={() => {
                      next();
                    }}>
                    {current > 0
                      ? intl.formatMessage({ id: 'register.button.finalize', defaultMessage: 'Finalizar' })
                      : intl.formatMessage({ id: 'register.button.next', defaultMessage: 'Siguiente' })}
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {validationGeneral.status && (
        <Alert
          style={{ marginTop: '5px' }}
          message={
            <>
              {validationGeneral.textError}
              {validationGeneral.component ? (
                <Button
                  style={{ padding: 4, color: '#333F44', fontWeight: 'bold' }}
                  onClick={() => handleChangeTabModal('1')}
                  type='link'>
                  {validationGeneral.component}
                </Button>
              ) : (
                ''
              )}
            </>
          }
          type='error'
        />
      )}
    </div>
  );
};

export default RegisterUserAndEventUser;
