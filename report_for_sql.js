arr = XQuery( "sql:
		WITH TempTable1 AS (
			SELECT 
				CAST(collaborators.id AS varchar) AS col_id
				, CAST(certificates.type_id AS varchar) AS cert_type_id
			FROM collaborators
			LEFT JOIN event_results
				ON event_results.person_id = collaborators.id
			LEFT JOIN events
				ON events.id = event_results.event_id
			LEFT JOIN org
				ON org.id = collaborators.org_id
			LEFT JOIN certificates
				ON certificates.person_id = collaborators.id
			WHERE org.data.value('(org/custom_elems/custom_elem[name=''is_roiv''])[1]/value[1]', 'varchar(max)') = 'true'
				AND events.education_org_id IN (6938000483356197646,6869760264243199229)
				AND events.type_id = 'education_method'
				AND event_results.is_assist = 1
				AND events.status_id = 'close'
			GROUP BY collaborators.id, certificates.type_id
		)
		SELECT col_id, cert_type_id_s = STUFF (
				(
					SELECT '; ' + cert_type_id
					FROM TempTable1 tt2
					WHERE tt2.col_id = tt1.col_id
					FOR XML PATH ('')
				)
				, 1, 1, ''	
			)
		INTO #Table1
		FROM TempTable1 tt1
		GROUP BY col_id
		;
		SELECT col_id as id, cert_type_id_s
		FROM #Table1
		WHERE cert_type_id_s IS NULL OR cert_type_id_s NOT LIKE '%7069723285559858963%'
		;
		DROP TABLE #Table1
" )

final_arr = []

for ( elem in arr ) {
	obj = {}
	for( fldElem in elem ){
		if ( fldElem.Name != "id" ) {
			obj.SetProperty( fldElem.Name, String( fldElem ) )
		}
	}
	obj.SetProperty( "PrimaryKey", String( elem.id ) )
	final_arr.push( obj )
}

columns.Clear()

_cc = columns.AddChild()
_cc.flag_formula = true
_cc.flag_visible = true
_cc.datatype = "string"
_cc.column_width = "10"
_cc.column_title = "PrimaryKey"
_cc.column_value = "ListElem.PrimaryKey"

for( fldElem in ArrayOptFirstElem( arr ) ) {
	if ( fldElem.Name != "id" ) {
		_cc = columns.AddChild()
		_cc.flag_formula = true
		_cc.flag_visible = true
		_cc.datatype = "string"
		_cc.column_width = "10"
		_cc.column_title = fldElem.Name
		_cc.column_value = "ListElem." + fldElem.Name
	}
}

return final_arr
