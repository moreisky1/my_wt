try{
	cur_user_id_hex = StrHexInt( LdsCurUserID )
	custom_report_id_hex = ( Param.custom_report_id == '' ) ? '' : StrHexInt( Int( Param.custom_report_id ) )

	str = custom_report_id_hex + cur_user_id_hex

	XQuery("sql:
		DELETE
		FROM [WTDB].[dbo].[(spxml_blobs)]
		WHERE
			url LIKE '%trash/temp/custom_reports%'
			AND url LIKE '%" + str + "%' 
	")
} catch( err ){ alert( err ) }
