import React, { Suspense } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

// GraphQL imports
import { graphql, useLazyLoadQuery } from "react-relay";

// 	const handleViewDetails = (termCode: string, year: number) => {
// 		navigate(`/instructors/${mnumber}/${year}${termCode}`);
// 	};

