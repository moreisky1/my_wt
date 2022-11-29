
function fun() {
	alert('fun!')
}

function get_days_between_dates( _dDateFrom, _dDateTo ) {
	try {
		return Real( DateDiff( _dDateTo, _dDateFrom ) ) / 86400
	} catch( err ) { return err }
}

function from_str_to_date( _sDate, _bWithTime ) {
	try {
		if ( _bWithTime ) {
			return OptDate( _sDate )
		} else {
			return OptDate( StrDate( OptDate( _sDate ), false, false ) )
		}
	} catch( err ) { return err }
}

function add_cols_to_groups( _arrGroupIDs, _arrColIDs ) {
	try {
		for ( groupID in _arrGroupIDs ) {
			if ( is_exist_in_catalog_by_id( 'group', groupID ) ) {
				docGroup = tools.open_doc( groupID )
				teGroup = docGroup.TopElem
				for ( colID in _arrColIDs ) {
					colID = OptInt( colID )
					if ( is_exist_in_catalog_by_id( 'collaborator', colID ) && !teGroup.collaborators.ChildByKeyExists( colID ) ) {
						teGroup.collaborators.ObtainChildByKey( colID )
					}
				}
				docGroup.Save()	
			}
		}
		return true
	} catch ( err ) {
		return false
	}
}

function del_cols_from_groups( _arrGroupIDs, _arrColIDs ) {
	try {
		for ( groupID in _arrGroupIDs ) {
			if ( is_exist_in_catalog_by_id( 'group', groupID ) ) {
				docGroup = tools.open_doc( groupID )
				teGroup = docGroup.TopElem
				for ( colID in _arrColIDs ) {
					colID = OptInt( colID )
					if ( teGroup.collaborators.ChildByKeyExists( colID ) ) {
						teGroup.collaborators.DeleteChildByKey( colID )
					}
				}
				docGroup.Save()	
			}
		}
		return true
	} catch ( err ) {
		return false
	}
}

function del_fms_from_objects( _arrObjectIDs, _arrFmIDs ) {
	try {
		for ( objectID in _arrObjectIDs ) {
			if ( is_exist_in_catalog_by_id( 'org', objectID ) || is_exist_in_catalog_by_id( 'group', objectID ) ) {
				docObject = tools.open_doc( objectID )
				teObject = docObject.TopElem
				for ( fmID in _arrFmIDs ) {
					fmID = OptInt( fmID )
					if ( teObject.func_managers.ChildByKeyExists( fmID ) ) {
						teObject.func_managers.DeleteChildByKey( fmID )
					}
				}
				docObject.Save()
			}
		}
		return true
	} catch ( err ) {
		return false
	}
}

function add_access_groups_to_object( _objectID, _arrAccessGroupIDs ) {
	try {
		docObject = tools.open_doc( _objectID )
		teObject = docObject.TopElem
		for ( accessGroupID in _arrAccessGroupIDs ) {
			accessGroupID = OptInt( accessGroupID )
			if ( is_exist_in_catalog_by_id( 'group', accessGroupID ) && !teObject.access.access_groups.ChildByKeyExists( accessGroupID ) ) {
				teObject.access.access_groups.ObtainChildByKey( accessGroupID )
			}
		}
		docObject.Save()
		return true
	} catch ( err ) {
		return false
	}
}

function del_access_groups_from_object( _objectID, _arrAccessGroupIDs ) {
	try {
		docObject = tools.open_doc( _objectID )
		teObject = docObject.TopElem
		for ( accessGroupID in _arrAccessGroupIDs ) {
			accessGroupID = OptInt( accessGroupID )
			if ( teObject.access.access_groups.ChildByKeyExists( accessGroupID ) ) {
				teObject.access.access_groups.DeleteChildByKey( accessGroupID )
			}
		}
		docObject.Save()
		return true
	} catch ( err ) {
		return false
	}
}

function clear_access_groups_from_object( _objectID ) {
	try {
		docObject = tools.open_doc( _objectID )
		teObject = docObject.TopElem
		teObject.access.access_groups.Clear()
		docObject.Save()
		return true
	} catch ( err ) {
		return false
	}
}

function get_attached_object_ids( _documentID, _teDocument, _catalogType ) {
	try {
		teDocument = ( tools.open_doc( _documentID ) == undefined ) ? _teDocument : tools.open_doc( _documentID ).TopElem
		if ( _catalogType == 'all' ) {
			return_arr = []
			for ( catalog in teDocument.catalogs ) {
				arr = ArrayExtractKeys( catalog.objects, "object_id" )
				for ( elem in arr ) {
					return_arr.push( elem )
				}
			}
			return return_arr
		} else {
			foundCatalog = ArrayOptFirstElem( teDocument.catalogs, "This.type == '" + _catalogType + "'" )
			if ( foundCatalog == undefined ) {
				return []
			} else {
				return ArrayExtractKeys( foundCatalog.objects, "object_id" )
			}
		}
	} catch ( err ) {
		return []
	}
}

function add_access_groups_to_attached_objects( _documentID, _teDocument, _catalogType ) {
	try {
		teDocument = ( tools.open_doc( _documentID ) == undefined ) ? _teDocument : tools.open_doc( _documentID ).TopElem
		arrAccessGroupIDs = ArrayExtractKeys( teDocument.access.access_groups, "group_id" )
		arrObjectIDs = get_attached_object_ids( '', teDocument, _catalogType )
		for ( objectID in arrObjectIDs ) {
			add_access_groups_to_object( objectID, arrAccessGroupIDs )
		}
		return true
	} catch ( err ) {
		return false
	}
}

function del_access_groups_from_attached_objects( _documentID, _teDocument, _catalogType, _arrDelAccessGroupIDs ) {
	try {
		teDocument = ( tools.open_doc( _documentID ) == undefined ) ? _teDocument : tools.open_doc( _documentID ).TopElem
		arrObjectIDs = get_attached_object_ids( '', teDocument, _catalogType )
		for ( objectID in arrObjectIDs ) {
			del_access_groups_from_object( objectID, _arrDelAccessGroupIDs )
		}
		return true
	} catch ( err ) {
		return false
	}
}

function clear_access_groups_from_attached_objects( _documentID, _teDocument, _catalogType ) {
	try {
		teDocument = ( tools.open_doc( _documentID ) == undefined ) ? _teDocument : tools.open_doc( _documentID ).TopElem
		arrObjectIDs = get_attached_object_ids( '', teDocument, _catalogType )
		for ( objectID in arrObjectIDs ) {
			clear_access_groups_from_object( objectID )
		}
		return true
	} catch ( err ) {
		return false
	}
}

function is_exist_in_catalog_by_id( _catalogName, _id ) {
	return ArrayOptFirstElem( XQuery( "for $elem in " + _catalogName + "s where $elem/id = " + _id + " return $elem" ) ) != undefined
}

function is_exist_in_catalog_by_key( _catalogName, _key_name, _key_value ) {
	return ArrayOptFirstElem( XQuery( "for $elem in " + _catalogName + "s where $elem/" + _key_name + " = '" + _key_value + "' return $elem" ) ) != undefined
}

function from_ids_str_to_ids_arr( _sIDs ) {
	_sIDs = String( _sIDs )
	arrIDs = []
	if ( StrContains( _sIDs, ';' ) ) {
		arrIDs = _sIDs.split( ';' )
	} else {
		arrIDs.push( _sIDs )
	}
	return arrIDs
}

function new_notification_with_template( _sCode, _sName, _sTheme, _sBody ) {
	foundNotification = ArrayOptFirstElem( XQuery( "for $elem in notifications where $elem/code = '" + _sCode + "' return $elem" ) )
	if ( foundNotification == undefined ) {
		docNewNotification = tools.new_doc_by_name( 'notification', false )
		docNewNotification.BindToDb()
		teNewNotification = docNewNotification.TopElem
		
		docNewNotificationTemplate = tools.new_doc_by_name( 'notification_template', false )
		docNewNotificationTemplate.BindToDb();
		teNewNotificationTemplate = docNewNotificationTemplate.TopElem
		
		teNewNotification.code = _sCode
		teNewNotificationTemplate.code = _sCode
		
		teNewNotification.name = _sName
		teNewNotificationTemplate.name = _sName
		
		teNewNotificationTemplate.subject = _sTheme
		teNewNotificationTemplate.body_type = 'html'
		teNewNotificationTemplate.body = _sBody
		
		ChildRecipient = teNewNotification.recipients.AddChild()
		ChildRecipient.recipient_type = 'in_doc'
		ChildRecipient.notification_template_id = docNewNotificationTemplate.DocID
		
		docNewNotification.Save()
		docNewNotificationTemplate.Save()		
	} else {
		docNotification = tools.open_doc( foundNotification.id )
		teNotification = docNotification.TopElem
		
		docNotificationTemplate = tools.open_doc( teNotification.recipients[0].notification_template_id )
		teNotificationTemplate = docNotificationTemplate.TopElem
		
		teNotification.code = _sCode
		teNotificationTemplate.code = _sCode
		
		teNotification.name = _sName
		teNotificationTemplate.name = _sName
		
		teNotificationTemplate.subject = _sTheme
		teNotificationTemplate.body_type = 'html'
		teNotificationTemplate.body = _sBody

		docNotification.Save()
		docNotificationTemplate.Save()	
	}
}

function get_data_type( _mData ) {
	/* 
		String
		Object
		Date
		SimpleArray
		XqueryArray
		BmObject - Р С—Р С•РЎвЂ¦Р С•Р В¶Р Вµ Р Р…Р В° Р СР В°РЎРѓРЎРѓР С‘Р Р†, Р Р…Р С• Р Р…Р ВµР В»РЎРЉР В·РЎРЏ Р С•Р В±РЎР‚Р В°РЎвЂљР С‘РЎвЂљРЎРЉРЎРѓРЎРЏ Р С—Р С• Р С‘Р Р…Р Т‘Р ВµР С”РЎРѓРЎС“ Р С” РЎРЊР В»Р ВµР СР ВµР Р…РЎвЂљРЎС“. Р СћР С•Р В»РЎРЉР С”Р С• РЎвЂЎР ВµРЎР‚Р ВµР В· for Р С‘Р В»Р С‘ Р Т‘Р ВµР В»Р В°РЎвЂљРЎРЉ ArraySelectAll
		XmlDoc
		Integer
		Real
		Bool
		Null
		Undefined
		JSON 
	*/
	var sRes = '';
	var sDataType = DataType(_mData);
	switch (sDataType) {
		case 'string':
			if ( tools.object_to_text(tools.read_object(_mData, 'json'), 'json') != '[]' ) {
				sRes = 'JSON';
			}
			else {
				sRes= 'String';
			}
			break;
		case 'object':
			if (ObjectType(_mData) == 'JsArray')
				sRes = 'SimpleArray';
			else if (ObjectType(_mData) == 'XmHookSeq' || ObjectType(_mData) == 'XmLdsSeq')
				sRes = 'XqueryArray';
			else if (ObjectType(_mData) == 'XmElem')
				sRes = 'XmlDoc';
			else if (ObjectType(_mData) == 'BmObject' ) {
				try{
					Date(_mData);
					sRes = 'Date';
				} catch(_err) {
					try{
						String(_mData);
						sRes = 'String';
					} catch(_err2) {
						sRes = 'BmObject';
					}
				}
			} else {
				sRes = 'Object';
			}
			break;
		default:
			sRes = StrTitleCase(sDataType);
			break;
	}
	return sRes;
}

function check_data_type( _mParam, _sTargetDataType ) {
	return get_data_type( _mParam ) == _sTargetDataType;
}

function find_col_by_fullname_inn ( _fullname, _inn, is_muc ) {
	var param_is_muc = is_muc ? "AND collaborators.code LIKE '%muc%'" : "AND collaborators.code NOT LIKE '%muc%'"
	var sql_str = "sql:
		SELECT
			collaborators.*
		FROM collaborators
		LEFT JOIN orgs
			ON orgs.id = collaborators.org_id
		WHERE collaborators.fullname = '" + _fullname + "'
			AND orgs.code = '" + _inn + "'
			" + param_is_muc + "
	"
	return ArrayOptFirstElem( XQuery( sql_str ) )
}

function ce_value( _catalog, ce_name, key_field, key_value ) {
	sql_str = "sql:
		SELECT TOP 1
			" + _catalog + ".data.value('(" + _catalog + "/custom_elems/custom_elem[name=''" + ce_name + "''])[1]/value[1]', 'varchar(max)') AS val
		FROM " + _catalog + "s
		LEFT JOIN " + _catalog + "
			ON " + _catalog + "s.id = " + _catalog + ".id
		WHERE
			" + _catalog + "s." + key_field + " = '" + key_value + "'
	"
	found_obj = ArrayOptFirstElem( XQuery( sql_str ) )
	return found_obj == undefined ? undefined : found_obj.val
}

function declOfNum(n, text_forms) {  
	n = Math.abs(n) % 100
	var n1 = n % 10
	if (n > 10 && n < 20) { return text_forms[2]; }
	if (n1 > 1 && n1 < 5) { return text_forms[1]; }
	if (n1 == 1) { return text_forms[0]; }
	return text_forms[2]
}

function plus_zero_if_one_char( _str ) {
	if( StrCharCount( _str ) == 1 ) {
		return "0" + _str
	} else {
		return _str
	}
}

function del_broken_links_from_access_groups_by_catalog( _catalog ) {
	try {
		if ( _catalog == "course" || _catalog == "document" || _catalog == "custom_web_template" ) {
			sql_str = "sql: 
				WITH TempTable1 AS (
					SELECT
						" + _catalog + "s.id
						, Table1.field.value('(.)[1]', 'varchar(100)') AS group_id
						, groups.id AS gr_id
					FROM " + _catalog + "s
					CROSS APPLY " + _catalog + "s.access_groups.nodes('(/access_groups/access_group)') AS Table1(field)
					LEFT JOIN groups
						ON groups.id = Table1.field.value('(.)[1]', 'varchar(100)')
					WHERE groups.id IS NULL
				)
				SELECT id, group_ids = STUFF (
					(
						SELECT ';' + group_id
						FROM TempTable1 tt2
						WHERE tt2.id = tt1.id
						FOR XML PATH ('')
					)
					, 1, 1, ''	
				)
				FROM TempTable1 tt1
				GROUP BY id
				ORDER BY id
			"
			arr = XQuery( sql_str )
			for ( elem in arr ) {
				del_access_groups_from_object( elem.id.Value, elem.group_ids.Value.split( ";" ) )
			}
			return true
		} else if ( _catalog == "override_web_template" ) {
			sql_str = "sql: 
				WITH TempTable1 AS (
					SELECT
						override_web_templates.id
						, Table1.field.value('(.)[1]', 'varchar(100)') AS group_id
						, groups.id AS gr_id
					FROM override_web_templates
					LEFT JOIN override_web_template
						ON override_web_template.id = override_web_templates.id
					CROSS APPLY override_web_template.data.nodes('(/override_web_template/access/access_groups/access_group)') AS Table1(field)
					LEFT JOIN groups
						ON groups.id = Table1.field.value('(.)[1]', 'varchar(100)')
					WHERE groups.id IS NULL
				)
				SELECT id, group_ids = STUFF (
					(
						SELECT ';' + group_id
						FROM TempTable1 tt2
						WHERE tt2.id = tt1.id
						FOR XML PATH ('')
					)
					, 1, 1, ''	
				)
				FROM TempTable1 tt1
				GROUP BY id
				ORDER BY id
			"
			arr = XQuery( sql_str )
			for ( elem in arr ) {
				del_access_groups_from_object( elem.id.Value, elem.group_ids.Value.split( ";" ) )
			}
			return true
		} else {
			return false
		}
	} catch ( err ) {
		return false
	}
}
