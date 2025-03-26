import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface OnboardingPageProps {
	refetchSession: () => Promise<void>;
}

async function updateMnumber(mnumber: string) {
	const response = await fetch('/api/user/update-mnumber', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ mnumber }),
		credentials: 'include',
	});

	const data = await response.json();
	return data;
}

function OnboardingPage({ refetchSession }: OnboardingPageProps) {
	const [mnumber, setMnumber] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		if (!mnumber.trim()) {
			setError('Mnumber is required');
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await updateMnumber(mnumber);
			if (response.success) {
				// Refetch session to update the mnumber
				await refetchSession();
				// Navigate to dashboard
				navigate('/dashboard');
			} else {
				setError(response.message || 'Failed to update mnumber');
			}
		} catch (err) {
			setError('An error occurred while updating your mnumber');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Complete Your Profile</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4">Please enter your mnumber to continue.</p>
					<form onSubmit={handleSubmit}>
						<Input
							type="text"
							placeholder="Enter your mnumber"
							value={mnumber}
							onChange={(e) => setMnumber(e.target.value)}
							className="mb-4"
						/>
						{error && <p className="text-red-500 mb-4">{error}</p>}
						<Button type="submit" disabled={isSubmitting} className="w-full">
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default OnboardingPage;