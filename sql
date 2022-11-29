				DECLARE @curdate datetime
				SET @curdate = GETDATE()
				SELECT
					collaborators.id, collaborator.created
				FROM collaborators
				LEFT JOIN orgs
					ON collaborators.org_id = orgs.id
				LEFT JOIN org
					ON collaborators.org_id = org.id
				LEFT JOIN collaborator
					ON collaborators.id = collaborator.id
				WHERE
					(
						org.data.value('(org/custom_elems/custom_elem[name=''is_rck''])[1]/value[1]', 'varchar(max)') = 'true'
						OR org.data.value('(org/custom_elems/custom_elem[name=''is_roiv''])[1]/value[1]', 'varchar(max)') = 'true'
						OR org.data.value('(org/custom_elems/custom_elem[name=''is_partner''])[1]/value[1]', 'varchar(max)') = 'true'
						OR org.data.value('(org/custom_elems/custom_elem[name=''format_part''])[1]/value[1]', 'varchar(max)') != ''
						OR orgs.code = '7724426759'
					)
					AND collaborators.code NOT LIKE('%_muc_%')
					AND collaborators.is_dismiss = 0
					AND collaborator.created > DATEADD(day,-2, @curdate)
				ORDER BY collaborator.created DESC
