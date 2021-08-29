import {ChainId, Currency, Token} from "@safemoon/sdk";

export default function getTokenSymbol(token: Token | Currency | undefined, chainId: ChainId | undefined) {
    return (
        token?.symbol !== "ETH"
        ? token?.symbol
            : chainId === ChainId.BSC_TESTNET || chainId === ChainId.BSC_MAINNET
            ? "BNB"
            : "ETH"
    )

}