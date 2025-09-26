import React, { Suspense, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { List } from 'react-window';

// GraphQL imports
import type { programsPageQuery } from './__generated__/programsPageQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';

const programsPageQuery = graphql`
  query programsPageQuery {
    programs {
      code
      description
      has_concentration
      is_aacsb
      is_discontinued
      is_major
      is_minor
    }
  }
`;

export const ProgramsPage: React.FC = () => (
	<div className="space-y-4">
		<Card>
			<CardHeader>
				<CardTitle>Programs</CardTitle>
			</CardHeader>
			<CardContent>
				<Suspense fallback={<Skeleton className="h-6 w-1/2" />}>
					<ProgramList />
				</Suspense>
			</CardContent>
		</Card>
	</div>
);

const ProgramList: React.FC = () => {
	const navigate = useNavigate();
	const data = useLazyLoadQuery<programsPageQuery>(
		programsPageQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);
	const programs = data.programs ?? [];

	const [search, setSearch] = useState('');
	const filtered = useMemo(
		() =>
			programs.filter((p) =>
				`${p.code} ${p.description}`
					.toLowerCase()
					.includes(search.trim().toLowerCase())
			),
		[programs, search]
	);

	return (
		<div className="space-y-4">
			<Input
				placeholder="Search programs..."
				value={search}
				onChange={(e) => setSearch(e.currentTarget.value)}
				className="max-w-sm"
			/>

			<div className="text-sm text-muted-foreground">
				Showing {filtered.length} of {programs.length} programs
			</div>

			<List
				height={500}
				itemCount={filtered.length}
				itemSize={50}             // each row is 120px high (match your Card height + gap)
				width="100%"
			>
				{({ index, style }) => {
					const program = filtered[index];
					return (
						<div
							key={program.code}
							style={style}
							className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800"
							onClick={() => navigate(`/enrollment/programs/${program.code}`)}
						>
							<div className="flex justify-between">
								<span className='truncate'>
									{program.code} - {program.description}
								</span>
								<div className="flex items-center space-x-2">
									{program.is_major && (
										<Badge
											variant="outline"
											className="text-green-800 border-green-800 bg-green-100 dark:text-green-100 dark:bg-green-900"
										>
											Major
										</Badge>
									)}
									{program.is_minor && (
										<Badge
											variant="outline"
											className="text-blue-800 border-blue-800 bg-blue-100 dark:text-blue-100 dark:bg-blue-900"
										>
											Minor
										</Badge>
									)}
									{program.has_concentration && (
										<Badge
											variant="outline"
											className="text-purple-800 border-purple-800 bg-purple-100 dark:text-purple-100 dark:bg-purple-900"
										>
											Concentration
										</Badge>
									)}
									{program.is_discontinued && (
										<Badge
											variant="outline"
											className="text-red-800 border-red-800 bg-red-100 dark:text-red-100 dark:bg-red-900"
										>
											Discontinued
										</Badge>
									)}
									{program.is_aacsb && (
										<Badge
											variant="outline"
											className="text-amber-800 border-amber-800 bg-amber-100 dark:text-amber-100 dark:bg-amber-900"
										>
											AACSB
										</Badge>
									)}
								</div>

							</div>
						</div>
					);
				}}
			</List>
		</div>
	);
};
