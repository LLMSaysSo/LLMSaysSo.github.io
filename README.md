## Intro

Verify on chain that a response you received is from the LLM provider

## How does it work

```mermaid
sequenceDiagram
    box Agent Environment
    participant Agent
    participant SDK as LLMSaysSo SDK
    end
    participant LLMSaysSo
    participant Contract as Smart Contract
    
    Agent-->>SDK: Request LLM Response
    SDK->>LLMSaysSo: API Request
    Note over LLMSaysSo: Generate Response & Heuristics
    LLMSaysSo->>SDK: Response with Heuristics
    
    Note over SDK: Process Response
    
    SDK-->>Agent: Return Response
    Agent-->>SDK: Request on-chain operation
    Note over SDK: Prepare commitments for operation
    SDK->>Contract: Send proof and commitments
    
    Note over Contract: Verify origin
    Note over Contract: Verify commitments
    Note over Contract: Perform on-chain operation

```
