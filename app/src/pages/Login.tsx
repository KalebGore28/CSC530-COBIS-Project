import { Wrench } from "lucide-react"
import primaryLogo from "../assets/primary_white.png"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-secondary">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<div className="flex items-center justify-center">
					<img src={primaryLogo} alt="COBIS Logo" className="h-auto w-auto" />
				</div>
				<a className="flex items-center gap-2 self-center font-medium text-primary-foreground">
					<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
						<Wrench className="size-4" />
					</div>
					COBIS Tool (v0.0.1)
				</a>
				<LoginForm />
			</div>
		</div>
	)
}