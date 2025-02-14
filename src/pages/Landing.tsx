import Link from '@/components/Link';
import { ArrowRight, CheckCircle, Shield, Cpu, Code } from 'lucide-react';

const LandingPage = () => {
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
			{/* Hero Section */}
			<div className="container mx-auto px-4">
				<div className="text-center py-32">
					<h1 className="text-6xl font-bold text-slate-900 mb-8">
						LLMSaysSo
					</h1>
					<p className="text-2xl text-slate-600 py-32 mb-12 max-w-2xl mx-auto">
						Verified AI Responses for Web3 Applications
					</p>
					<div className="flex justify-center gap-6">
						<Link className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors" to="/app">
							Get Started
						</Link>
						<Link className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors" to="/docs">
							Documentation
						</Link>
					</div>
				</div>

				{/* How It Works */}
				<div className="py-32">
					<h2 className="text-4xl font-bold text-center text-slate-900 mb-20">
						How It Works
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
						<div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
							<div className="mb-6">
								<Code className="w-16 h-16 text-orange-500" />
							</div>
							<h3 className="text-2xl font-semibold mb-4">1. Integration</h3>
							<p className="text-slate-600 text-lg">
								Integrate our SDK into your agent environment with just a few lines of code. Handle LLM responses and proofs seamlessly.
							</p>
						</div>
						<div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
							<div className="mb-6">
								<Cpu className="w-16 h-16 text-orange-500" />
							</div>
							<h3 className="text-2xl font-semibold mb-4">2. Verification</h3>
							<p className="text-slate-600 text-lg">
								Receive verified LLM responses with built-in heuristics. Generate proofs for on-chain operations automatically.
							</p>
						</div>
						<div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
							<div className="mb-6">
								<Shield className="w-16 h-16 text-orange-500" />
							</div>
							<h3 className="text-2xl font-semibold mb-4">3. On-Chain Trust</h3>
							<p className="text-slate-600 text-lg">
								Submit proofs and commitments to smart contracts with confidence. Ensure the authenticity of AI responses.
							</p>
						</div>
					</div>
				</div>

				{/* Features */}
				<div className="py-32 bg-white">
					<div className="max-w-6xl mx-auto">
						<h2 className="text-4xl font-bold text-center text-slate-900 mb-20">
							Key Features
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
							<div className="flex items-start gap-6">
								<CheckCircle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
								<div>
									<h3 className="text-xl font-semibold mb-3">Built-in Verification</h3>
									<p className="text-slate-600 text-lg">
										Every response comes with cryptographic proofs and heuristics, ensuring authenticity from source to chain.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-6">
								<CheckCircle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
								<div>
									<h3 className="text-xl font-semibold mb-3">Easy Integration</h3>
									<p className="text-slate-600 text-lg">
										Simple SDK that handles all the complexity of proof generation and contract interaction.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-6">
								<CheckCircle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
								<div>
									<h3 className="text-xl font-semibold mb-3">Gas Efficient</h3>
									<p className="text-slate-600 text-lg">
										Optimized proof generation and verification process to minimize on-chain costs.
									</p>
								</div>
							</div>
							<div className="flex items-start gap-6">
								<CheckCircle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
								<div>
									<h3 className="text-xl font-semibold mb-3">Smart Contract Ready</h3>
									<p className="text-slate-600 text-lg">
										Pre-built smart contracts and verification systems for major blockchain networks.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* CTA */}
				<div className="py-32">
					<div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-16 text-center max-w-5xl mx-auto">
						<h2 className="text-4xl font-bold mb-6">
							Ready to Build with Verified AI?
						</h2>
						<p className="text-xl mb-10 text-orange-50">
							Get started with LLMSaysSo today and bring trusted AI to your blockchain applications.
						</p>
						<button className="bg-white text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
							Start Building
							<ArrowRight className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
