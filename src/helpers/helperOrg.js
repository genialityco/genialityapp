//METODO PARA SABER SI SE ESTÁ POSICIONADO EN LA LANDING DE LA ORGANIZACIÓN
export function isOrganization() {
  const isOrganization = window.location.pathname.startsWith('/organization');
  if (isOrganization) {
    return true;
  } else {
    return false;
  }
}