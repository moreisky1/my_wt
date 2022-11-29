var bIsLog = true // вести логирование выполнения агента
var sLogMethod = "ext" // метод вывода в лог - ext, system, report, excel // report - teCurObject = tools.open_doc( curObjectID ).TopElem
var sLogMethodExt = "ext_log" // префикс файла журнала (для sLogMethod = "ext")
var slogMethodPath = "x-local://Logs/" //директория для сохранения файла на сервер (sLogMethod = "excel")
var docReport
var sLogStr = ''

function open_log() {
	if (!bIsLog) {
		return false;
	}
	if (sLogMethod == "system") {
		return true;
	} else if (sLogMethod == "ext") {
		EnableLog(sLogMethodExt, true);
	} else if (sLogMethod == "report") {
		try{
			_curObjectName = teCurObject.name
			_curObjectID = curObjectID
		}catch(e){
			_curObjectName = '_curObjectName'
			_curObjectID = '_curObjectID'
		}
		docReport = tools.new_doc_by_name( 'action_report', false );
		docReport.BindToDb(DefaultDb);
		docReport.TopElem.create_date = Date();
		docReport.TopElem.type = "result";
		docReport.TopElem.completed = false;
		docReport.TopElem.object_id = _curObjectID;
		docReport.TopElem.data_file_url = _curObjectName;
		docReport.TopElem.report_text = Date() + ': begin\n';
		docReport.TopElem.report_text += Date() + ': ' + _curObjectName + ' - ' + _curObjectID + '\n';
		docReport.Save();
		sLogStr = docReport.TopElem.report_text;
	} else if (sLogMethod == "excel") {
		sLogStr = "<HTML>
			<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=utf-8\"/>
			<BODY>
			<TABLE BORDER=\"1\" CELLPADDING=\"2\" CELLSPACING=\"0\">
			<TR><TD><B>" + Date() + " - ПРОЦЕСС ИМПОРТА ЗАПУЩЕН</B></TD></TR>";
	} else {
		return false;
	}
}

function close_log() {
	if (!bIsLog) {
		return false;
	}
	if (sLogMethod == "system") {
		return true;
	} else if (sLogMethod == "ext") {
		EnableLog(sLogMethodExt, false);
	} else if (sLogMethod == "report") {
		docReport.TopElem.completed = true;
		docReport.TopElem.report_text = sLogStr + Date() + ': end\n';
		docReport.Save();
	} else if (sLogMethod == "excel") {
		sLogStr = sLogStr + "
			<TR><TD><B>" + Date() + " - ПРОЦЕСС ИМПОРТА ЗАВЕРШЕН</B></TD></TR>
			</TABLE>
			</BODY>
			</HTML>";
		if (LdsIsServer) {
			_filename = slogMethodPath + (sLogMethodExt + "_" + Year(Date()) + "_" + Month(Date()) + "_" + Day(Date()) + "_" + Hour(Date()) + "_" + Minute(Date())) + ".xls";
			PutUrlText(_filename, sLogStr);
		} else {
			//_filename = ObtainTempFile('.xls');
			_filename = slogMethodPath + (sLogMethodExt + "_" + Year(Date()) + "_" + Month(Date()) + "_" + Day(Date()) + "_" + Hour(Date()) + "_" + Minute(Date())) + ".xls";
			PutUrlText(_filename, sLogStr);
			//ShellExecute('open', _filename);
		}
	} else {
		return false;
	}
}

function write_log_text(_text) {
	if (!bIsLog) {
		return false;
	}
	if (sLogMethod == "system") {
		alert(_text);
	} else if (sLogMethod == "ext") {
		LogEvent(sLogMethodExt, _text);
	} else if (sLogMethod == "report") {
		sLogStr = sLogStr + Date() + ': ' + _text + "\n";
	} else if (sLogMethod == "excel") {
		sLogStr = sLogStr + "<TR><TD>" + Date() + " - " + _text + "</TD></TR>";
	} else {
		return false;
	}
}
