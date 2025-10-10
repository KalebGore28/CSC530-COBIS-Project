import React from "react";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";

export const WaitingPage: React.FC = () => {
	const handleLogout = async () => {
		await authClient.signOut();
		window.location.href = "/login";
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Account Pending</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Your account is being processed. Please wait for approval.</p>
				</CardContent>
				<CardFooter>
					<Button onClick={handleLogout}>Log Out</Button>
				</CardFooter>
			</Card>
		</div>
	);
}