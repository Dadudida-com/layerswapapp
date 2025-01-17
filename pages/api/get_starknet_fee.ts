import { NextApiRequest, NextApiResponse } from 'next'
import {
    CallData,
    cairo,
    Account,
    EstimateFee,
    RpcProvider
} from 'starknet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const query: StarknetFeeProps = req.query;

    const feeRes = await getStarknetFee(query)

    if (!feeRes) {
        res.status(400).json({ error: { message: "Failed" } })
        return
    } else if (feeRes) {
        res.status(200).json({
            overall_fee: Number(feeRes.overall_fee),
            gas_consumed: Number(feeRes.gas_consumed),
            gas_price: Number(feeRes.gas_price),
            suggestedMaxFee: Number(feeRes.suggestedMaxFee),
        })
        return
    }

    else {
        res.status(500)
    }
}

class StarknetFeeProps {
    nodeUrl?: string = "";
    walletAddress?: string = "";
    contractAddress?: string = "";
    recipient?: string = "";
    watchDogContract?: string = ""
}

const getStarknetFee = async ({ nodeUrl, contractAddress, recipient, watchDogContract }: StarknetFeeProps): Promise<EstimateFee | undefined> => {

    const { BigNumber } = await import("ethers");
debugger
    if (!nodeUrl || !contractAddress || !recipient || !watchDogContract) return

    const amountToWithdraw = BigNumber.from(1);

    const provider = new RpcProvider({
        nodeUrl: nodeUrl,
    });

    const configs = JSON.parse(process.env.NEXT_PUBLIC_STARKNET_FEE_CONFIGS || '')

    const account = new Account(provider, configs.address, configs.private_key);

    const transferCall = {
        contractAddress: contractAddress.toLowerCase(),
        entrypoint: "transfer",
        calldata: CallData.compile(
            {
                recipient: recipient,
                amount: cairo.uint256(amountToWithdraw.toHexString())
            })
    };

    const watch = {
        contractAddress: watchDogContract,
        entrypoint: "watch",
        calldata: [
            "69420"
        ]
    }

    const feeEstimateResponse = await account.estimateFee([transferCall, watch]);

    return feeEstimateResponse;
}
