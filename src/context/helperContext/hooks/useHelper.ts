import { useContext } from 'react';
import { HelperContext } from '../helperContext';

export const useHelper = () => {
  const {
    helperDispatch,
    containtNetworking,
    infoAgenda,
    isNotification,
    ChangeActiveNotification,
    totalSolicitudAmistad,
    totalsolicitudAgenda,
    totalsolicitudes,
    HandleChangeDrawerProfile,
    propertiesProfile,
    getPropertiesUserWithId,
    propertiesOtherprofile,
    activitiesEvent,
    chatActual,
    HandleGoToChat,
    contacts,
    createNewOneToOneChat,
    privateChatsList,
    attendeeList,
    attendeeListPresence,
    isCollapsedMenuRigth,
    HandleOpenCloseMenuRigth,
    HandleChatOrAttende,
    chatAttendeChats,
    HandlePublicPrivate,
    chatPublicPrivate,
    eventPrivate,
    seteventPrivate,
    GetPermissionsEvent,
    totalPrivateMessages,
    imageforDefaultProfile,
    requestSend,
    obtenerContactos,
    typeModal,
    handleChangeTypeModal,
    authModalState,
    authModalDispatch,
    visibleLoginEvents,
    visibilityLoginEvents,
    reloadTemplatesCms,
    handleReloadTemplatesCms,
    gameData,
    setGameData,
    theUserHasPlayed,
    setTheUserHasPlayed,
    knowMaleOrFemale,
    femaleicons,
    maleIcons,
    handleChangeCurrentActivity,
    currentActivity,
    gameRanking,
    setGameRanking,
    myScore,
    setMyScore,
    tabsGenerals,
    handleChangeTabs,
    updateEventUser,
    setUpdateEventUser,
    register,
    setRegister,
    HandleControllerLoginVisible,
    controllerLoginVisible,
    rolHasPermissions,
    theRoleExists,
    setcurrenActivity,
    getOrganizationUser,
    logout,
  } = useContext(HelperContext);

  return {
    helperDispatch,
    containtNetworking,
    infoAgenda,
    isNotification,
    ChangeActiveNotification,
    totalSolicitudAmistad,
    totalsolicitudAgenda,
    totalsolicitudes,
    HandleChangeDrawerProfile,
    propertiesProfile,
    getPropertiesUserWithId,
    propertiesOtherprofile,
    activitiesEvent,
    chatActual,
    HandleGoToChat,
    contacts,
    createNewOneToOneChat,
    privateChatsList,
    attendeeList,
    attendeeListPresence,
    isCollapsedMenuRigth,
    HandleOpenCloseMenuRigth,
    HandleChatOrAttende,
    chatAttendeChats,
    HandlePublicPrivate,
    chatPublicPrivate,
    eventPrivate,
    seteventPrivate,
    GetPermissionsEvent,
    totalPrivateMessages,
    imageforDefaultProfile,
    requestSend,
    obtenerContactos,
    typeModal,
    handleChangeTypeModal,
    authModalState,
    authModalDispatch,
    visibleLoginEvents,
    visibilityLoginEvents,
    reloadTemplatesCms,
    handleReloadTemplatesCms,
    gameData,
    setGameData,
    theUserHasPlayed,
    setTheUserHasPlayed,
    knowMaleOrFemale,
    femaleicons,
    maleIcons,
    handleChangeCurrentActivity,
    currentActivity,
    gameRanking,
    setGameRanking,
    myScore,
    setMyScore,
    tabsGenerals,
    handleChangeTabs,
    updateEventUser,
    setUpdateEventUser,
    register,
    setRegister,
    HandleControllerLoginVisible,
    controllerLoginVisible,
    rolHasPermissions,
    theRoleExists,
    setcurrenActivity,
    getOrganizationUser,
    logout,
  };
};
