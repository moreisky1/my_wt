if ( LdsIsClient ) {
	MoveDoc( UrlFromDocID( OptInt( Param.id ), 'trash' ), UrlFromDocID( OptInt( Param.id ), DefaultDb ) )
}
