import { Moment } from "moment";

export interface LandingBlock {
	index:   number;
	key:     string;
	name:    string;
	label?:  string;
	status:  boolean;
}

export interface Alias {
	[key : string] : string 
}
// Generated by https://quicktype.io

export interface ConfigCountdown {
	date:          Moment;
	messageIn:     string;
	messageFinish: string;
}

export interface PropsDrawer {
	visibleDrawer : boolean
	setVisibleDrawer : React.Dispatch<React.SetStateAction<boolean>>
}
export interface DataSource {
	created_at: 			string;
	event_id: 				string;
	updated_id: 			string;
	_id: 					string;
	main_landing_blocks: 	LandingBlock[];
}


export interface Speaker {
	_id:                  string;
	name:                 string;
	image:                string;
	description_activity: boolean;
	profession:           string;
	published:            boolean;
	order:                number;
	index:                number;
	event_id:             string;
	updated_at:           string;
	created_at:           string;
}

export interface ApiGeneric<T> {
	data:  T[];
	links: Links;
	meta:  Meta;
}

export interface Description {
	_id:        string;
	type:       string;
	value:      string;
	index:      number;
	event_id:   string;
	updated_at: string;
	created_at: string;
}

export interface Links {
	first: string;
	last:  string;
	prev:  null;
	next:  null;
}

export interface Meta {
	current_page: number;
	from:         number;
	last_page:    number;
	path:         string;
	per_page:     number;
	to:           number;
	total:        number;
}


export interface Agenda {
	_id:                     string;
	name:                    string;
	image:                   string;
	description:             string;
	capacity:                number;
	event_id:                string;
	datetime_end:            string;
	datetime_start:          string;
	date_start_zoom:         string;
	date_end_zoom:           string;
	hosts:					 any[];
	host_ids:				 any[];
	updated_at:              string;
	created_at:              string;
	type_id:                 string;
	requires_registration:   boolean; 
	type:                    any;
	transmition:             string;
	tabs:                    Tabs;
	avalibleGames:           AvalibleGame[];
	habilitar_ingreso:       string;
	isPublished:             boolean;

}

export interface AvalibleGame {
	name:     string;
	id:       string;
	index:    number;
	showGame: boolean;
	picture:  string;
}

export interface Tabs {
	chat:      boolean;
	surveys:   boolean;
	attendees: boolean;
	games:     boolean;
}
export interface Sponsor {
	short_description: string;
	name:              string;
	stand_image:       string;
	telefono:          string;
	index:             number;
	services:          any[];
	times_and_venues:  string;
	description:       string;
	gallery:           Gallery[];
	video_url:         string;
	stand_type:        string;
	brochure:          string;
	social_networks:   any[];
	contact_info:      ContactInfo;
	list_image:        string;
	visitors_space_id: string;
	email:             string;
	visible:           boolean;
	webpage:           string;
	advisor:           any[];
	id:                string;
}

export interface ContactInfo {
	description: string;
	image:       string;
}

export interface Gallery {
	image: string;
}


export interface EventContext {
	status:    string;
	value:     Value;
	nameEvent: string;
	isByname:  boolean;
}

export interface Value {
	_id:                      string;
	name:                     string;
	address:                  string | null;
	datetime_from:            string;
	datetime_to:              string;
	picture:                  string | null;
	venue:                    any | null;
	location:                 any | null;
	visibility:               string;
	description:              string;
	allow_register:           boolean;
	type_event:               string;
	where_it_run:             string;
	url_external:             any | null;
	styles:                   Styles;
	author_id:                string;
	organizer_id:             string;
	updated_at:               string;
	created_at:               string;
	user_properties:          UserProperty[];
	itemsMenu:                ItemsMenu;
	countdownFinalMessage:    string;
	countdownMessage:         string;
	dateLimit:                string;
	useCountdown:             boolean;
	bingo:                    any | null;
	dynamics:                 Dynamics;
	allow_detail_calendar:    boolean;
	custom_password_label:    string;
	data_loader_page:         any | null;
	enable_language:          boolean;
	event_platform:           string;
	facebookpixelid:          any | null;
	googleanlyticsid:         any | null;
	googletagmanagerid:       any | null;
	has_date:                 boolean;
	has_payment:              boolean;
	initial_page:             any | null;
	is_custom_password_label: boolean;
	language:                 string;
	loader_page:              string;
	show_banner:              boolean;
	show_banner_footer:       boolean;
	success_message:          any | null;
	video:                    any | null;
	video_position:           string;
	dates:                    any[];
	timetable:                any | null;
	author:                   { [key: string]: string };
	categories:               any[];
	event_type:               any | null;
	organiser:                Organi;
	organizer:                Organi;
	currency:                 Currency;
	tickets:                  any[];
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
	bingo:       boolean;
	share_photo: boolean;
	millionaire: boolean;
}

export interface ItemsMenu {
	evento:     Agenda;
	agenda:     Agenda;
	networking: Agenda;
}

export interface Agenda {
	name:        string;
	position:    number;
	section:     string;
	icon:        string;
	checked:     boolean;
	permissions: string;
}

export interface Organi {
	_id:             string;
	name:            string;
	styles:          Styles;
	author:          string;
	updated_at:      string;
	created_at:      string;
	user_properties: UserProperty[];
}

export interface Styles {
	buttonColor:            string;
	banner_color:           string;
	menu_color:             string;
	event_image:            null | string;
	banner_image:           null | string;
	menu_image:             null;
	banner_image_email:     null;
	footer_image_email:     string;
	brandPrimary:           string;
	brandSuccess:           string;
	brandInfo:              string;
	brandDanger:            string;
	containerBgColor:       string;
	brandWarning:           string;
	toolbarDefaultBg:       string;
	brandDark:              string;
	brandLight:             string;
	textMenu:               string;
	activeText:             string;
	bgButtonsEvent:         string;
	BackgroundImage:        null | string;
	FooterImage:            null;
	banner_footer:          null | string;
	mobile_banner:          null;
	banner_footer_email:    null;
	show_banner:            string;
	show_card_banner:       boolean;
	show_inscription:       boolean;
	hideDatesAgenda:        boolean;
	hideDatesAgendaItem:    boolean;
	hideHoursAgenda:        boolean;
	hideBtnDetailAgenda:    boolean;
	loader_page:            string;
	data_loader_page:       null;
	toolbarMenuSocial?:     string;
	color_icon_socialzone?: string;
	color_tab_agenda?:      string;
	show_title?:            boolean;
	show_video_widget?:     boolean;
}

export interface UserProperty {
	name:            string;
	label:           string;
	unique:          boolean;
	mandatory:       boolean;
	type:            string;
	updated_at:      any;
	created_at:      any;
	_id:             any;
	visibleByAdmin?: boolean;
}


