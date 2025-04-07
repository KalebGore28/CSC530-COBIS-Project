import React from 'react'
import ProfessorTeachingInfo from '@/components/professor-information'
import { Separator } from "@/components/ui/separator"

/**
 * Professor information page that displays teaching loads, courses, and student counts
 */
const ProfessorPage: React.FC = () => {
	return (
		<div className="p-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Faculty Information</h1>
				<p className="text-muted-foreground mt-2">
					View teaching loads and student counts for faculty in your department
				</p>
			</div>
			<Separator className="my-4" />
			<ProfessorTeachingInfo />
		</div>
	)
}
export default ProfessorPage

