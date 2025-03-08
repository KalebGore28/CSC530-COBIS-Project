import { ThemeProvider } from "@/components/theme-provider"
import Layout from './layout.tsx'

function App() {
	return (
		<>
			<ThemeProvider>
				<Layout>
					<h1></h1>
				</Layout>
			</ThemeProvider>
		</>
	);
}

export default App;
