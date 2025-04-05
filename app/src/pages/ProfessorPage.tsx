import React from 'react'
import ProfessorTeachingInfo from '@/components/professor-information'
import ProfessorTeachingInfoStatic from '@/components/professor-information-static'

/**
 * Professor information page that displays teaching loads, courses, and student counts
 */
const ProfessorPage: React.FC = () => {
	return (
		<>
			<div className="flex h-screen">
				<div className="flex-1 flex flex-col overflow-hidden">
					<main className="flex-1 overflow-y-auto bg-slate-50 p-4">
						<div className="space-y-6">
							<div>
								<h1 className="text-3xl font-bold">Faculty Information</h1>
								<p className="text-muted-foreground mt-2">
									View teaching loads and student counts for faculty in your department
								</p>
							</div>
							<ProfessorTeachingInfo />
							{/* <ProfessorTeachingInfoStatic /> */}
						</div>
					</main>
				</div>
			</div>
		</>
	)
}
export default ProfessorPage

