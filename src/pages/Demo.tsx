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
		"Okay, so I'm trying to figure out how to parse this DeFi instruction. The user provided a query that says \"swap 1 eth\". I remember from the instructions that the default tokens are ETH as the first and USDC as the second. ",
		"First, I need to identify the operation. The word \"swap\" clearly indicates that the operation is a SWAP. Now, looking at the arguments, the user specified \"1 eth\". Since the first token is ETH by default, the amount is 1 and the token is ETH. ",
		"But wait, the SWAP operation requires two tokens and an amount. The user only provided one token and an amount. So, I should use the default for the second token, which is USDC. ",
		"Putting it all together, the operation is SWAP, the first token is ETH, the amount is 1, and the second token is USDC. So the output should be \"SWAP|ETH|1|USDC\"."
	],
	"response": [
		"SWAP|ETH|1|USDC"
	],
	"heuristics": {
		"leaves": [
			"0x1fc4e9a6e3f7cb7893135a19ee4313ce417f41951004c9b615e9a652df74aed",
			"0x393911157f7c411a6655d55deef9458f11ff57503767855d3ee85998f9a63e9",
			"0x3c087f4ef9d0dc15fef823bff9c78cc5cca8be0a85234afcfd807f412f40877",
			"0x2c4122fb12fe244090f2798a39e02193f4093d09dcc67da16f44ef5e91739f9"
		],
		"root": "0x5a39f5bf3371b170cf4d1ffe90823ac771e05f174615c6efb1f5bf1c0dc4f2d",
		"r": "0x5a56baae2c580ea09ca974b4d14830b2304ff19c45e7cf19ea1f9aac1f926e9",
		"s": "0x15ef6223c4d8c793aaf6ff9c9915915986413095afa547f990a14f6521e0a0d"
	}
};


const Demo = () => {
	const [instructions, setInstructions] = useState(`You are a DeFi instruction parser. Output format must be:\nOPERATION|ARG1|ARG2|...\n\nValid operations:\nSWAP, e.g. SWAP|token1|amount|token2\nLIQ (Provide liquidity), e.g. LIQ|token1|token1_amount|token2.\n\nBy default, use USDC as the second token and eth as the first. The output should not contain anything other than the instruction.`);
	const [message, setMessage] = useState('swap 1 eth');
	const [response, setResponse] = useState<LLMSaysSuccess | null>(mockResponse);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);


	const handleSubmit = async (e: SubmitEvent) => {
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
		} catch (err: any) {
			if (err.message) {
				setError(err.message);
			}
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
							</div >
						</div >

						<div>
							<h3 className="font-medium mb-2">Response:</h3>
							<div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
								{response.response.join('\n')}
							</div >
						</div >

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
					</CardContent >
				</Card >
			)}
		</div >
	);
};

export default Demo;
