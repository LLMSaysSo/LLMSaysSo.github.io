import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { merkle, ec, hash, WeierstrassSignatureType } from 'starknet';
// import { SignatureType } from '@noble/curves/abstract/weierstrass';


export interface LLMRequest {
	signer: "starknet" | "ethereum";
	instructions: string;
	context: string;
	message: string;
}

export interface Heuristics {
	leaves: string[];
	root: string;
	r: string;
	s: string;
}

export interface LLMSaysResponse {
	status: 'success' | 'error';
	error?: string;
	thinking?: string[];
	response?: string[];
	heuristics?: Heuristics;
}

export interface LLMSaysSuccess {
	status: 'success' | 'error';
	thinking: string[];
	response: string[];
	heuristics: Heuristics;
}

function verifyOrigin(response: LLMSaysSuccess) {
	const { r, s, root } = response.heuristics;
	const sig = { r: BigInt(r), s: BigInt(s) } as WeierstrassSignatureType;

	console.log('sig:', r.replace('0x', '0000').slice(-64) + s.replace('0x', '0000').slice(-64))


	ec.starkCurve.verify(r.replace('0x', '0000').slice(-64) + s.replace('0x', '0000').slice(-64), root, '0x58c57fc0f90bac2bbd38c74169bca8d00d2f9be0998a6f21cc176765dde22a8');
	console.log('verifying origin', r, s);
}

function verifyResponse(response: LLMSaysSuccess) {
	console.log('verifying response', response);
	const { leaves, root } = response.heuristics;

	console.log('expected decommitment', leaves[0])

	const merkle_tree = new merkle.MerkleTree(leaves);
	const proof = merkle_tree.getProof(leaves[0]);
	console.log(proof);
	console.log('signed root match ', merkle_tree.root == root);

	console.log('response recommitment', hash.starknetKeccak(response.response[0]).toString(16))
}

// const mockResponse = {};
const mockResponse: LLMSaysSuccess = {
	"status": "success",
	"thinking": [
		"Alright, so I've got this query here: \"Swap 100 USDC to ETH.\" The user wants me to parse this as a DeFi instruction. Let me break it down.",
		"First, I need to identify the operation. The word \"Swap\" is present, so that's the operation. The valid operations are SWAP and PROVIDE_LIQ, so SWAP is definitely the one here.",
		"Next, I have to figure out the arguments. The user is swapping 100 USDC to ETH. So, the amount is 100, and the token is USDC. Then, the second token is ETH. ",
		"Wait, the format for SWAP is SWAP|token1|amount|token2. So, token1 is USDC, amount is 100, and token2 is ETH. That makes sense.",
		"I should make sure there are no extra arguments or missing parts. The user didn't mention providing liquidity, so it's just a straightforward swap. ",
		"I think that's all. The response should be SWAP|USDC|100|ETH."
	],
	"response": [
		"SWAP|USDC|100|ETH"
	],
	"heuristics": {
		"leaves": [
			"0x1fecd93a53e11703b5dff6fa75540480667ae8442d7a37e922639570fb63774",
			"0x11cc26d2c1de0872c4703e4fc5e83742b7b86409eec18dc526f991785885622",
			"0xf9bfc6c8a8e72c83c941852776725a3442096beffe8cb17d26cd9ee0b1a0c7",
			"0x2baf6c66618acd49fb133cebc22f55bd907fe9f0d69a726d45b7539ba6bbe08"
		],
		"root": "0x3f34b32ed26490540d047ba4e60e95b3b72fea24e3e086bb9fba7f9c3a08de2",
		"r": "0x77a6c3554e59cfe76bc7d820fe2c306ef5c18a5d6dc6c7a9b1cafa74a4d578a",
		"s": "0x63c235485914803869b51e9724098548d9b31dc4a3eccc5b24e9a398fa64cac"
	}
};


const Demo = () => {
	const [instructions, setInstructions] = useState(`You are a DeFi instruction parser. Output format must be:\nOPERATION|ARG1|ARG2|...\n\nValid operations:\nSWAP, e.g. SWAP|token1|amount|token2\nLIQ (Provide liquidity), e.g. LIQ|token1|token1_amount|token2.\n\nBy default, use USDC as the second token and eth as the first. The output should not contain anything other than the instruction.`);
	const [message, setMessage] = useState('swap 1 eth');
	const [response, setResponse] = useState<LLMSaysSuccess | null>(mockResponse);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);


	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await fetch('http://localhost:3000/llm', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					instructions,
					message,
					signer: '', // You might want to make this configurable
					context: {} // Add context if needed
				}),
			});

			const data = await res.json();
			if (data.status === 'success') {
				setResponse(data);
			} else {
				throw new Error('Failed to get response');
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6 p-4">
			<Card>
				<CardHeader>
					<CardTitle>LLM Says So Interface</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-2">
								Agent context
							</label>
							<Textarea
								value={instructions}
								onChange={(e) => setInstructions(e.target.value)}
								placeholder="Enter instructions for the LLM..."
								className="w-full"
								rows={8}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								Prompt
							</label>
							<Textarea
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Enter your message..."
								className="w-full"
								rows={4}
							/>
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={loading}
						>
							{loading ? 'Sending...' : 'Send to LLM'}
						</Button>
					</form>
				</CardContent>
			</Card>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{response && response.status == "success" && (
				<Card>
					<CardHeader>
						<CardTitle>Response</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-medium mb-2">Thinking:</h3>
							<div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
								{response.thinking.join('\n')}
							</div>
						</div>

						<div>
							<h3 className="font-medium mb-2">Response:</h3>
							<div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
								{response.response.join('\n')}
							</div>
						</div>

						<Button
							onClick={() => verifyOrigin(response)}
							className="w-50"
						>
							Verify origin
						</Button>
						<Button
							onClick={() => verifyResponse(response)}
							className="ml-2"
						>
							Verify Response Commitment
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default Demo;
