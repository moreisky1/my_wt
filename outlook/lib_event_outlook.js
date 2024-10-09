/**
 * Если найдёшь баг - не стесняйся, исправляй  =)
 * 
 *  Как пользоваться:
 * - Функция create_event() создаёт строку в формате iCal. 
 *     Входной объект для create_event() - 
 *      {
 *         id : '',     //id события
 *         body: '',    // текст тела (просто текст или HTML)
 *         title: '',   // заголовок встречи
 *         desc: '',    // короткое описание
 *         start_date: '',   // дата начала
 *         end_date: '',    // дата окончания
 *         create_date: '',  // дата создания (по умолчанию - текущая дата)
 *         recipient_email: '',    // почта получателя
 *         recipient_fullname: '',   // ФИО получателя 
 *         org_name: '',        //Имя отправителя
 *         org_email: '',       //Почта отправителя
 *         method: '',          // метод (REQUEST/CANCEL)
 *      }
 * - Функция create_message() создаёт сообщение 
 *      Входной объект для create_message() - 
 *         {    
 *           recipient_email : '',// ящик отправителя
 *           subject : '',  // тема сообщения
 *           sender_email : '',// ящик отправителя
 *           html_body : '', // тело сообщения
 *           ical : '' // строка iCal 
 *          }
 * 
 * - Пример отправки письма со встречей:
 * 
      var lib_event = OpenCodeLib('x-local://wtv/custom/lib_event_outlook.js');
      var sSenderAddress = global_settings.settings.own_org.email;

    var oIcalConfig = 
        {
            id : lib_event.generate_id(6859607672064784726),     
            body: 'Клёво!',   
            title: 'Новая тема', 
            desc: 'Что это?',   
            start_date: DateOffset(Date(),0 - 54000), 
            end_date: DateOffset(Date(),0 - 14000),    
            create_date: Date(),  
            recipient_email: 'test@mail.ru',  
            recipient_fullname: 'Иванов Иван Иванович',   
            org_name: 'Учебный портал',       
            org_email: global_settings.settings.own_org.email,      
            method: 'REQUEST'
        };
    var sEvent = lib_event.create_event(oIcalConfig);
        sEvent = lib_event.prepare_ical_string_to_send(sEvent);

    var oMessConfig = {
        recipient_email: 'test@mail.ru',  
        subject: 'Тееема!',
        sender_email: global_settings.settings.own_org.email,
        html_body : 'Nice!',
        ical : sEvent
    };

    var sMess = lib_event.create_message(oMessConfig);

    var oClient = lib_event.get_smtp_client();

    oClient.SendMimeMessage(global_settings.settings.own_org.email,'test@mail.ru',sMess); // так происходит отправка встречи
    oClient.CloseSession();   // отрубает подключение клиента к smtp серверу

    
 * - Если нужно добавить напоминание, то воспользуйся функцией add_reminder()
 * 
 * - Есть вспомогательные функции: 
 *      set_ical_method_to_ical() - устанавливает метод (REQUEST - запрос на добавление встречи в каленадарь
 *                                                  CANCEL  - запрос на отмену встречи )
 *      generate_id() - генерирует id для встречи на основе id из WT.
 *      prepare_ical_string_to_send() - подготавливает iCal строку к отправке (не забудь воспользоваться)
 *      cancel_event() - устанавливает iCal Method = CANCEL 
 * 

 * 
 *      Полезные подсказки:
 *         - global_settings.settings.own_org.email - почтовый ящик учебного портала
 * 
 *         - global_settings.settings.portal_base_url - http адрес портала
 * 
 *         - oClient.SendMimeMessage(sender_address,recipient_email,iCalMessage); // так происходит отправка встречи
 *           oClient.CloseSession();   // отрубает подключение клиента к smtp серверу
 * 
 *         - LogEvent( 'email', 'Текст логирования' ); - так можно быстро залогировать отправку
 * 
 * 
 *       Идеи для развития:
 *       -  Сейчас не реализован блок по обновлению уже имеющейся встречи. Обычно это делается 
 *          по параметру в iCal - SEQUENCE. Его нужно устанавливать равным 1.
 * 
 */


//getters
function get_html_body_template() {
    return '<html><body></body></html>';
}

function get_message_template() {
    return 'X-Mru-BL: 0:0:2
X-Mru-NR: 1
X-Mru-OF: unknown (unknown)
To: WT_RECIPIENT_EMAIL
Subject: WT_SUBJECT
MIME-Version: 1.0
From: WT_SENDER_EMAIL
Content-Type: multipart/mixed; boundary="=_mixed 004128EAC32576F1_="
X-Spam: Not detected
X-Mras: Ok

--=_mixed 004128EAC32576F1_=
Content-Type: multipart/related; boundary="=_related 004128EAC32576F1_="

--=_related 004128EAC32576F1_=
Content-Type: multipart/alternative; boundary="=_alternative 004128EAC32576F1_="

--=_alternative 004128EAC32576F1_=
Content-Type: text/html; method="REQUEST"; charset="utf-8";
Content-Disposition: inline

WT_HTML

--=_alternative 004128EAC32576F1_=
Content-Type: text/calendar; method="REQUEST"; charset="utf-8";

WT_ICAL

--=_alternative 004128EAC32576F1_=--
';
}

function get_ical_template() {
    return 'BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WebSoft LTD//WebTutor 2//EN
METHOD:WT_METHOD
BEGIN:VEVENT
DTSTART:WT_START_DATE
DTEND:WT_END_DATE
TRANSP:OPAQUE
DTSTAMP:WT_CREATE_DATE
SEQUENCE:0
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN="WT_RECIPIENT_FULLNAME";RSVP=FALSE
 :mailto:WT_RECIPIENT_EMAIL
CLASS:PUBLIC
DESCRIPTION:WT_DESCRIPTION\n
SUMMARY: WT_TITLE
ORGANIZER;CN="WT_ORG_NAME":mailto:WT_ORG_EMAIL
UID:WT_UID
WT_ALARM_BLOCK
X-ALT-DESC;FMTTYPE=text/html:WT_BODY_HTML
 
X-MICROSOFT-CDO-BUSYSTATUS:BUSY
X-MICROSOFT-CDO-IMPORTANCE:1
X-MICROSOFT-DISALLOW-COUNTER:FALSE
X-MS-OLK-AUTOFILLLOCATION:FALSE
X-MS-OLK-CONFTYPE:0
END:VEVENT
END:VCALENDAR';
}
function get_wt_ical_fields() {
return['WT_METHOD',
'WT_START_DATE',
'WT_END_DATE',
'WT_RECIPIENT_FULLNAME',
'WT_RECIPIENT_EMAIL',
'WT_CREATE_DATE',
'WT_DESCRIPTION',
'WT_TITLE',
'WT_ORG_NAME',
'WT_ORG_EMAIL',
'WT_UID',
'WT_ALARM_BLOCK',
'WT_BODY_HTML'];
}
function get_ical_methods() {
    return ['REQUEST','CANCEL'];
}

//setters
function set_ical_start_date (_sIcal,_dDate,_bAddZ) {
    if (_dDate != undefined)
    return StrReplace(_sIcal,'WT_START_DATE' , prepare_date(_dDate,_bAddZ) );
}
function set_ical_end_date (_sIcal,_dDate,_bAddZ) {
    if (_dDate != undefined)
    return StrReplace(_sIcal,'WT_END_DATE' , prepare_date(_dDate,_bAddZ) );
}
function set_ical_create_date (_sIcal,_dDate) {
    if (_dDate != undefined)
    return StrReplace(_sIcal,'WT_CREATE_DATE' , ( _dDate != undefined && _dDate!='' ? prepare_date( _dDate , true) : prepare_date( Date() , true) ));
}
function set_ical_recipient_info (_sIcal,_sRecipientFullname,_sRecipientEmail) {
    if (_sRecipientFullname != undefined && _sRecipientEmail != undefined)
    return StrReplace(StrReplace(_sIcal,'WT_RECIPIENT_EMAIL' , _sRecipientEmail),'WT_RECIPIENT_FULLNAME' , _sRecipientFullname );
}
function set_ical_organizator_info (_sIcal, _sOrgName, _sOrgEmail) {
    if (_sOrgName != undefined && _sOrgEmail != undefined)
    return StrReplace(StrReplace(_sIcal,'WT_ORG_EMAIL' , _sOrgEmail),'WT_ORG_NAME' , _sOrgName );
}
function set_ical_description (_sIcal, _sDesc) {
    if (_sDesc != undefined)
    return StrReplace(_sIcal,'WT_DESCRIPTION' , _sDesc );
}
function set_ical_title (_sIcal, _sTitle) {
    if (_sTitle != undefined)
    return StrReplace(_sIcal,'WT_TITLE' , _sTitle );
}
function set_ical_id (_sIcal, _sID) {
    if ( _sID != undefined )
    return StrReplace(_sIcal,'WT_UID' , _sID );
}
function set_ical_body( _sIcal , _sHTML ) {
    if (_sHTML != undefined)
return StrReplace( _sIcal ,'WT_BODY_HTML' , _sHTML );
}

function set_mess_recipient( _sMess , _sMail ) {
    if (_sMail != undefined)
return StrReplace( _sMess ,'WT_RECIPIENT_EMAIL' , _sMail );
}
function set_mess_subject( _sMess , _sSubject ) {
    if (_sSubject != undefined)
return StrReplace( _sMess ,'WT_SUBJECT' , _sSubject );
}
function set_mess_sender( _sMess , _sSender ) {
    if ( _sSender != undefined )
return StrReplace( _sMess ,'WT_SENDER_EMAIL' , _sSender );
}
function set_mess_body( _sMess , _sHTML ) {
    if (_sHTML != undefined)
return StrReplace( _sMess ,'WT_HTML' , _sHTML );
}
function add_mess_ical( _sMess , _sIcal ) {
    if (_sIcal != undefined)
return StrReplace( _sMess ,'WT_ICAL' , _sIcal );
}
//methods
function add_reminder( _sIcal , _nDays , _sDesc, _sUID ) {
var sReminderTemplate = 'BEGIN:VALARM
TRIGGER:-P'+ _nDays +'D
REPEAT:2
DURATION:PT15M
ACTION:DISPLAY
DESCRIPTION: '+ _sDesc +'
X-WR-ALARMUID: '+ _sUID +'
END:VALARM';
    if (!StrContains(_sIcal,'WT_ALARM_BLOCK')) {
        sIcalAlarm = 'BEGIN:VALARM'+_sIcal.split('BEGIN:VALARM')[1].split('END:VALARM')[0] + 'END:VALARM';
        _sIcal = StrReplace(_sIcal , sIcalAlarm , 'WT_ALARM_BLOCK');
    }
    return StrReplace(_sIcal , 'WT_ALARM_BLOCK' , sReminderTemplate);
}
function remove_reminder(_sIcal) {
    if (!StrContains(_sIcal,'WT_ALARM_BLOCK')) {
        sIcalAlarm = 'BEGIN:VALARM'+_sIcal.split('BEGIN:VALARM')[1].split('END:VALARM')[0] + 'END:VALARM';
        _sIcal = StrReplace(_sIcal , sIcalAlarm , 'WT_ALARM_BLOCK');
    }
return _sIcal;
}
function prepare_date(_dDate, _bAddZ) {
return StrReplace(StrReplace(StrLeftRange(StrXmlDate(_dDate),StrXmlDate(_dDate).lastIndexOf('+')),'-',''),':','')+ (_bAddZ==true?'Z':'');
}
function set_ical_method_to_ical (_sIcal,_sMethodName) {
    if (ArrayOptFind(get_ical_methods(),"This=='"+ _sMethodName +"'") != undefined)
    return StrReplace(_sIcal , 'WT_METHOD', _sMethodName);
    else
    throw 'set_ical_method_to_ical: method '+ _sMethodName + ' not found.'
}	
function cancel_event (_sIcal) {
    return StrReplace(_sIcal , 'WT_METHOD', 'CANCEL');    
}
function prepare_ical_string_to_send(_sIcal) {
    for( _fld in get_wt_ical_fields() ) {
        _sIcal = StrReplace(_sIcal,_fld , '');
    }
    return _sIcal;
}
function create_message (_oConfig) {
    var sMess = get_message_template();
    if (_oConfig.GetOptProperty('recipient_email',undefined) != undefined)
    sMess = set_mess_recipient( sMess, _oConfig.recipient_email);

    if (_oConfig.GetOptProperty('subject',undefined) != undefined)
    sMess = set_mess_subject( sMess, _oConfig.subject);

    if (_oConfig.GetOptProperty('sender_email',undefined) != undefined)
    sMess = set_mess_sender( sMess, _oConfig.sender_email);

    if (_oConfig.GetOptProperty('html_body',undefined) != undefined)
    sMess = set_mess_body( sMess, _oConfig.html_body);

    if (_oConfig.GetOptProperty('ical',undefined) != undefined)
    sMess = add_mess_ical( sMess, _oConfig.ical);

    return sMess;
}
function create_event (_oConfig) {
    var sIcal = get_ical_template();

    if (_oConfig.GetOptProperty('start_date',undefined) != undefined)
    sIcal = set_ical_start_date( sIcal, _oConfig.start_date);

    if (_oConfig.GetOptProperty('end_date',undefined) != undefined)
    sIcal = set_ical_end_date( sIcal, _oConfig.end_date);

    sIcal = set_ical_create_date( sIcal, _oConfig.GetOptProperty('create_date',undefined));

    if (_oConfig.GetOptProperty('recipient_email',undefined) != undefined && _oConfig.GetOptProperty('recipient_fullname',undefined) != undefined)
    sIcal = set_ical_recipient_info( sIcal,_oConfig.recipient_fullname, _oConfig.recipient_email);

    if (_oConfig.GetOptProperty('org_name',undefined) != undefined && _oConfig.GetOptProperty('org_email',undefined) != undefined)
    sIcal = set_ical_organizator_info(  sIcal,_oConfig.org_name, _oConfig.org_email);

    if (_oConfig.GetOptProperty('desc',undefined) != undefined)
    sIcal = set_ical_description( sIcal, _oConfig.desc);

    if (_oConfig.GetOptProperty('title',undefined) != undefined)
    sIcal = set_ical_title( sIcal, _oConfig.title);

    if (_oConfig.GetOptProperty('id',undefined) != undefined)
    sIcal = set_ical_id( sIcal, _oConfig.id);

    if (_oConfig.GetOptProperty('body',undefined) != undefined)
    sIcal = set_ical_body( sIcal, _oConfig.body);
    if (_oConfig.GetOptProperty('method',undefined) != undefined)
    sIcal = set_ical_method_to_ical( sIcal, _oConfig.method);
    
    return sIcal;
}
function generate_id (_sID) {
    return StrHexInt(_sID) +'-WebTutor_Generated';
}
function get_smtp_client() {
    if (global_settings.settings.own_org.smtp_server == '') {
        throw 'send_event: in global settings smtp server not defined.';
    } else {
        try {
            var oClient = SmtpClient();
            oClient.OpenSession( global_settings.settings.own_org.smtp_server );
            oClient.UseTLS = true;
            if ( global_settings.settings.own_org.use_smtp_authenticate )	
            oClient.Authenticate( global_settings.settings.own_org.smtp_login, global_settings.settings.own_org.smtp_password );
            return oClient;
        } catch (ers) {
            throw 'send_event: error while Smtp Client init - ' + ers;
        }
    }
}
//TODO
function is_ical_valid() {
// 
}
