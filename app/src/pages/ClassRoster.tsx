import React, { useState } from "react";
import ClassRosterComponent from "@/components/class-roster";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Example data moved from the component to the page
const exampleClasses = [
	{
		subject: "CS",
		number: "101",
		section: "001",
		term: "FALL",
		year: 2024,
		title: "Introduction to Programming"
	},
	{
		subject: "CS",
		number: "240",
		section: "002",
		term: "SPRING",
		year: 2025,
		title: "Data Structures"
	},
	{
		subject: "MATH",
		number: "150",
		section: "001",
		term: "FALL",
		year: 2024,
		title: "Calculus I"
	}
];

// Modified ClassRoster component that will eventually use the updated component
const ClassRosterPage: React.FC = () => {
	const [selectedClass, setSelectedClass] = useState({
		subject: "CS",
		number: "101",
		section: "001",
		term: "FALL",
		year: 2024
	});

	// Function to handle class selection
	const handleClassChange = (classString: string) => {
		const [subject, number, section, term, year] = classString.split("-");
		setSelectedClass({
			subject,
			number,
			section,
			term,
			year: parseInt(year)
		});
	};

	// Format class for display and selection
	const formatClassForDisplay = (cls: typeof exampleClasses[0]) => {
		return `${cls.subject} ${cls.number}-${cls.section} (${cls.term} ${cls.year})`;
	};

	return (
		<div className="p-6">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Class Roster</CardTitle>
					<CardDescription>View and manage your class roster</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="w-full md:w-2/3">
							<Select
								value={`${selectedClass.subject}-${selectedClass.number}-${selectedClass.section}-${selectedClass.term}-${selectedClass.year}`}
								onValueChange={handleClassChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a class" />
								</SelectTrigger>
								<SelectContent>
									{exampleClasses.map((cls, index) => (
										<SelectItem
											key={index}
											value={`${cls.subject}-${cls.number}-${cls.section}-${cls.term}-${cls.year}`}
										>
											{formatClassForDisplay(cls)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="w-full md:w-1/3 flex justify-end">
							<Button>New Roster</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* For now, we're using the existing component with classId prop */}
			<ClassRosterComponent
				subject={selectedClass.subject}
				number={selectedClass.number}
				section={selectedClass.section}
				term={selectedClass.term}
				year={selectedClass.year}
			/>

			{/* The component now accepts individual props */}
		</div>
	);
};

export default ClassRosterPage;
