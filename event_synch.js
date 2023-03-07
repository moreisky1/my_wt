if( LdsIsClient ) {
	try {
		object_ids_arr = OBJECTS_ID_STR.split(';')
		n = 0
		for ( object_id in object_ids_arr ) {
			object_doc = tools.open_doc( object_id )
			te_doc = object_doc.TopElem
			if ( te_doc.Name == "event") {
				if ( StrContains( Param.what_to_do, "del" ) ) { // Удаляем
					sql_str = "sql:
						DECLARE @event_id bigint = '" + object_id + "';
						WITH wt1 AS (
							SELECT
								event_results.person_id
							FROM event_results
							WHERE event_results.event_id = @event_id 
						)
						SELECT
							event_collaborators.collaborator_id
						FROM event_collaborators
						WHERE event_collaborators.is_collaborator = 1
							AND event_collaborators.event_id = @event_id
							AND NOT EXISTS (
								SELECT 1 FROM wt1 WHERE wt1.person_id = event_collaborators.collaborator_id
							) 
					"
					arr = ArraySelectAll( XQuery( sql_str ) )
					for( el in arr ) {
						collaborator_id = OptInt( el.collaborator_id )
						if ( te_doc.collaborators.ChildByKeyExists( collaborator_id ) ) {
							te_doc.collaborators.DeleteChildByKey( collaborator_id )
						}	
					}

				}
				if ( StrContains( Param.what_to_do, "add" ) ) { // Добавляем
					sql_str = "sql:
						DECLARE @event_id bigint = '" + object_id + "';
						WITH wt1 AS (
							SELECT
								event_collaborators.collaborator_id
							FROM event_collaborators
							WHERE event_collaborators.is_collaborator = 1
								AND event_collaborators.event_id = @event_id 
						)
						SELECT
							event_results.*
						FROM event_results
						WHERE event_results.event_id = @event_id
							AND NOT EXISTS (
								SELECT 1 FROM wt1 WHERE wt1.collaborator_id = event_results.person_id
							) 
					"
					arr = ArraySelectAll( XQuery( sql_str ) )
					for( el in arr ) {
						te_col_doc = tools.open_doc( el.person_id ).TopElem
						new_col = te_doc.collaborators.AddChild()
						new_col.collaborator_id = te_col_doc.id
						new_col.person_fullname = te_col_doc.fullname
						new_col.person_position_id = te_col_doc.position_id
						new_col.person_position_name = te_col_doc.position_name
						new_col.person_org_id = te_col_doc.org_id
						new_col.person_org_name = te_col_doc.org_name
						new_col.person_org_code = te_col_doc.org_id.ForeignElem.code
						new_col.person_code = te_col_doc.code
						new_col.can_use_camera = false
						new_col.can_use_microphone = false
					}
				}
				object_doc.Save()
				n++
			}
		}
		alert( "Обновлено " + n + " мероприятий" )
	} catch ( err ) { alert( 'AGENT - 7125716019505953514, ERROR - ' + err ) }
}
