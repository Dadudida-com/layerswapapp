import { ExternalLink } from 'lucide-react';
import { FC, useEffect } from 'react'
import { useFormWizardaUpdate, useFormWizardState } from '../../../../context/formWizardProvider';
import { useSettingsState } from '../../../../context/settings';
import { useSwapDataState, useSwapDataUpdate } from '../../../../context/swap';
import { SwapStatus } from '../../../../Models/SwapStatus';
import { SwapWithdrawalStep } from '../../../../Models/Wizard';
import shortenAddress from '../../../utils/ShortenAddress';
import { GetSwapStatusStep } from '../../../utils/SwapStatus';
import Steps from '../StepsComponent';
import { SwapItem } from '../../../../lib/layerSwapApiClient';
import WarningMessage from '../../../WarningMessage';
import { CryptoNetwork } from '../../../../Models/CryptoNetwork';
import AverageCompletionTime from '../../../Common/AverageCompletionTime';

const ProcessingStep: FC = () => {

    const { goToStep } = useFormWizardaUpdate<SwapWithdrawalStep>()
    const { currentStepName } = useFormWizardState()
    const { swap } = useSwapDataState()
    const { setInterval } = useSwapDataUpdate()
    const settings = useSettingsState()

    const source_display_name = swap?.source_exchange ? settings?.exchanges?.find(e => e.internal_name == swap?.source_exchange)?.display_name : settings?.networks?.find(e => e.internal_name == swap?.source_network)?.display_name
    useEffect(() => {
        setInterval(10000)
        return () => setInterval(0)
    }, [])

    const swapStatusStep = GetSwapStatusStep(swap)

    useEffect(() => {
        if (swapStatusStep && swapStatusStep !== currentStepName) {
            goToStep(swapStatusStep)
        }
    }, [swapStatusStep])

    let status = 0
    switch (swap.status) {
        case SwapStatus.UserTransferPending:
            if ((swap.has_sucessfull_published_tx || swap.has_pending_deposit) && !swap.input_transaction) status = 1
            else if (swap.input_transaction) status = 2
            break
        case SwapStatus.LsTransferPending:
            status = 3
            break
    }

    const source_network = settings.networks?.find(e => e.internal_name === swap.source_network)
    const destination_network = settings.networks?.find(e => e.internal_name === swap.destination_network)
    const input_tx_explorer = source_network?.transaction_explorer_template
    const output_tx_explorer = destination_network?.transaction_explorer_template

    const Confirmations = ({ swap, status }: { swap: SwapItem, status: number }) => {
        if (swap?.input_transaction?.max_confirmations === 0) {
            return <div>Confirmations: <span className='text-white'>{status === 2 ? swap?.input_transaction?.confirmations : 1}</span>/1</div>
        } else {
            return <div>Confirmations: <span className='text-white'>{((swap?.input_transaction?.confirmations >= swap?.input_transaction?.max_confirmations) ? swap?.input_transaction?.max_confirmations : swap?.input_transaction?.confirmations) ?? 0}</span>/{swap?.input_transaction?.max_confirmations}</div>
        }
    }

    const progress = [
        {
            name: status === 1 ? 'Detecting your transfer' : `Transfer from ${source_display_name} is completed`, status: status > 1 ? 'complete' : 'current', description: status > 1 &&
                <div className='flex items-center space-x-1'>
                    <span>Source Tx </span>
                    <div className='underline hover:no-underline flex items-center space-x-1'>
                        <a target={"_blank"} href={input_tx_explorer.replace("{0}", swap?.input_transaction.transaction_id)}>{shortenAddress(swap.input_transaction.transaction_id)}</a>
                        <ExternalLink className='h-4' />
                    </div>
                </div>
        },
        {
            name: (status === 1 && 'Transfer confirmation') || (status === 2 && ' Waiting for the transfer to get confirmed') || (status === 3 && 'The transfer is confirmed'),
            status: (status === 2 && 'current') || (status === 3 && 'complete') || (status === 1 && 'upcoming'),
            description: status! >= 2 ? <Confirmations swap={swap} status={status} /> : ""
        },
        {
            name: status === 3 ? 'Your assets are on their way' : 'Transfer of assets to your address',
            status: status < 3 ? 'upcoming' : 'current',
            description:
                swap?.output_transaction &&
                <div className='flex items-center space-x-1'>
                    <span>Destination Tx </span>
                    <div className='underline hover:no-underline flex items-center space-x-1'>
                        <a target={"_blank"} href={output_tx_explorer.replace("{0}", swap?.output_transaction.transaction_id)}>{shortenAddress(swap.output_transaction.transaction_id)}</a>
                        <ExternalLink className='h-4' />
                    </div>
                </div>
        },
    ]

    if (!swap) return <></>

    return (
        <div className="w-full flex flex-col h-full">
            <div className="text-left text-primary-text mt-4 space-y-1">
                <p className="block sm:text-lg font-medium text-white">
                    Transfer status
                </p>
                <p className='text-sm flex space-x-1'>
                    Assets will be sent as soon as the transfer is confirmed
                </p>
            </div>
            <div className='flex flex-col h-full justify-center'>
                <Steps steps={progress} />
            </div>
            <WarningMessage messageType='informing'>
                <span className='text-xs sm:text-sm space-x-1 text-primary'>
                    <span className='text-primary-text'>Average completion time:</span> <AverageCompletionTime  destinationNetwork={destination_network}/>
                </span>
            </WarningMessage>
        </div>
    )
}

export default ProcessingStep;
