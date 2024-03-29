
export interface CertificatesProps {
    event:         Event;
    matchUrl:      string;
    history:       History;
    location:      Location;
    match:         Match;
    path:          string;
    componentKey:  string;
    computedMatch: Match;
}

export interface Match {
    path:    string;
    url:     string;
    isExact: boolean;
    params:  Params;
}

export interface Params {
}

export interface Event {
    _id:                   string;
    name:                  string;
    address:               string;
    datetime_from:         string;
    datetime_to:           string;
    visibility:            string;
    allow_register:        boolean;
    type_event:            string;
    where_it_run:          string;
    author_id:             string;
    organizer_id:          string;
    updated_at:            string;
    created_at:            string;
    user_properties:       UserProperty[];
    itemsMenu:             { [key: string]: ItemsMenu };
    countdownFinalMessage: string;
    countdownMessage:      string;
    dynamics:              Dynamics;
    author:                { [key: string]: string };
    categories:            any[];
    currency:              Currency;
    tickets:               any[];
    hour_start:            string;
    hour_end:              string;
    date_start:            string;
    date_end:              string;
}

export interface Currency {
    _id:            string;
    id:             number;
    title:          string;
    symbol_left:    string;
    symbol_right:   string;
    code:           string;
    decimal_place:  number;
    value:          number;
    decimal_point:  string;
    thousand_point: string;
    status:         number;
    created_at:     string;
    updated_at:     string;
}

export interface Dynamics {
    bingo: boolean;
}

export interface ItemsMenu {
    name:        string;
    position:    number;
    section:     string;
    icon:        string;
    checked:     boolean;
    label?:      null;
    permissions: Permissions;
    markup?:     null;
}
// Generated by https://quicktype.io

export interface UserData {
    _id:                      string;
    state_id:                 string;
    checked_in:               boolean;
    rol_id:                   string;
    account_id:               string;
    event_id:                 string;
    model_type:               string;
    properties:               Properties;
    private_reference_number: string;
    updated_at:               string;
    created_at:               string;
    checkedin_at:             string;
    checkedin_type:           string;
    printouts:                number;
    printouts_at:             string;
    user:                     { [key: string]: string };
    rol:                      Rol;
}


export interface Properties {
    names: string;
    email: string;
}

export interface Rol {
    _id:        string;
    name:       string;
    guard_name: string;
    updated_at: string;
    created_at: string;
    type:       string;
    module:     string;
}


export interface Organi {
    _id:             string;
    name:            string;
    author:          string;
    updated_at:      string;
    created_at:      string;

}

export interface UserProperty {
    name:       string;
    label:      string;
    unique:     boolean;
    mandatory:  boolean;
    type:       string;
    updated_at: AtedAt;
    created_at: AtedAt;
    _id:        ID;
}

export interface ID {
    $oid: string;
}

export interface AtedAt {
    $date: DateClass;
}

export interface DateClass {
    $numberLong: string;
}

export interface History {
    length:   number;
    action:   string;
    location: Location;
}

export interface Location {
    pathname: string;
    search:   string;
    hash:     string;
    state:    State;
    key:      string;
}

export interface State {
    new: boolean;
    edit?: string
}


export  type RowCert = 'break' | 'h1' | 'h2' | 'h3' | 'h4' | 'p'

export interface CertifiRow {
    id: string
    type: RowCert,
    times?:  number,
    content?: string,
}

export interface Certificates {
    _id:        string;
    name:       string;
    content:    CertifiRow[];
    event_id:   string;
    background: string;
    updated_at: string;
    created_at: string;
    userTypes?: string[]
}
