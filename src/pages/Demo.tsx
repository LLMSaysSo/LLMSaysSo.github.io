import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { merkle, ec, hash, WeierstrassSignatureType } from 'starknet';
// import { SignatureType } from '@noble/curves/abstract/weierstrass';



interface LLMSaysOutput {
	status: 'success' | 'error';
	data: {
		thinking: string[];
		response: string[];
	};
	merkle_tree: {
		leaves: string[];
		root: string;
	};
	signature: {
		r: string;
		s: string;
	};
}

function verifyOrigin(response: LLMSaysOutput) {
	const { r, s } = response.signature;
	const sig = { r: BigInt(r), s: BigInt(s) } as WeierstrassSignatureType;
	ec.starkCurve.verify(r.replace('0x', '0000').slice(-64) + s.replace('0x', '0000').slice(-64), response.merkle_tree.root, '0x58c57fc0f90bac2bbd38c74169bca8d00d2f9be0998a6f21cc176765dde22a8');
	console.log('verifying origin', r, s);
}

function verifyResponse(response: LLMSaysOutput) {
	console.log('verifying response', response);
	const { leaves, root } = response.merkle_tree;

	console.log('expected decommitment', leaves[0])

	const merkle_tree = new merkle.MerkleTree(leaves);
	let proof = merkle_tree.getProof(leaves[0]);
	console.log(proof);
	console.log('signed root match ', merkle_tree.root == root);

	console.log('signed root match ', merkle_tree.root == root);

	console.log('response recommitment', hash.starknetKeccak(response.data.response[0]).toString(16))
}

const mockResponse = {};
// const mockResponse: LLMSaysOutput = {
// 	"status": "success",
// 	"data": {
// 		"thinking": [
// 			"Okay, so I'm trying to figure out how to parse this DeFi instruction. The user provided a swap instruction, and I need to output it in the specified format. Let me break it down step by step.",
// 			"First, the operation is \"swap\". That's straightforward. Now, looking at the arguments. The user wrote \"swap 1 eth\". Hmm, so the first token isn't explicitly mentioned. The default is supposed to be ETH as the first token and USDC as the second. But wait, in this case, the user only provided \"eth\" as the second argument. So I think the first token is missing.",
// 			"Wait, no, maybe I'm misunderstanding. The instruction is \"swap 1 eth\". So the amount is 1, and the token is eth. But according to the default, if only one token is provided, it should be the first token, and the second defaults to USDC. So the operation should be swapping 1 ETH for USDC.",
// 			"So the output should be SWAP|1|ETH|USDC. But wait, the example given was SWAP|token1|amount|token2. So the order is token1, amount, token2. That means the first argument after SWAP is token1, then amount, then token2.",
// 			"Wait, in the example, it's SWAP|token1|amount|token2. So the first token is token1, then the amount, then token2. So in this case, the user's instruction is \"swap 1 eth\". That would translate to token1 being ETH, amount being 1, and since token2 isn't specified, it should default to USDC.",
// 			"So putting it together, the output should be SWAP|ETH|1|USDC. That makes sense because the first token is ETH, the amount is 1, and the second token is USDC by default.",
// 			"I think that's correct. So the final output is SWAP|ETH|1|USDC."
// 		],
// 		"response": [
// 			"SWAP|ETH|1|USDC"
// 		]
// 	},
// 	"merkle_tree": {
// 		"leaves": [
// 			"0x1fc4e9a6e3f7cb7893135a19ee4313ce417f41951004c9b615e9a652df74aed",
// 			"0x393911157f7c411a6655d55deef9458f11ff57503767855d3ee85998f9a63e9",
// 			"0x3c087f4ef9d0dc15fef823bff9c78cc5cca8be0a85234afcfd807f412f40877",
// 			"0x2c4122fb12fe244090f2798a39e02193f4093d09dcc67da16f44ef5e91739f9"
// 		],
// 		"root": "0x5a39f5bf3371b170cf4d1ffe90823ac771e05f174615c6efb1f5bf1c0dc4f2d"
// 	},
// 	"signature": {
// 		"r": "0x5a56baae2c580ea09ca974b4d14830b2304ff19c45e7cf19ea1f9aac1f926e9",
// 		"s": "0x15ef6223c4d8c793aaf6ff9c9915915986413095afa547f990a14f6521e0a0d"
// 	}
// };


const Demo = () => {
	const [instructions, setInstructions] = useState(`You are a DeFi instruction parser. Output format must be:\nOPERATION|ARG1|ARG2|...\n\nValid operations:\nSWAP, e.g. SWAP|token1|amount|token2\nLIQ (Provide liquidity), e.g. LIQ|token1|token1_amount|token2.\n\nBy default, use USDC as the second token and eth as the first. The output should not contain anything other than the instruction.`);
	const [message, setMessage] = useState('swap 1 eth');
	const [response, setResponse] = useState<LLMSaysOutput | null>(mockResponse);
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

			{response && response.data && (
				<Card>
					<CardHeader>
						<CardTitle>Response</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-medium mb-2">Thinking:</h3>
							<div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
								{response.data ? response.data.thinking : ''}
							</div>
						</div>

						<div>
							<h3 className="font-medium mb-2">Response:</h3>
							<div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
								{response.data ? response.data.response : ''}
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