import { FC, useState } from "react"
import { useSettingsState } from "../../../context/settings"
import Image from 'next/image'
import { Trophy } from "lucide-react"
import LayerSwapApiClient, { Campaign, Leaderboard, Reward } from "../../../lib/layerSwapApiClient"
import { RewardsComponentLeaderboardSceleton } from "../../Sceletons"
import useSWR from "swr"
import { ApiResponse } from "../../../Models/ApiResponse"
import ClickTooltip from "../../Tooltips/ClickTooltip"
import shortenAddress from "../../utils/ShortenAddress"
import { useAccount } from "wagmi"
import { truncateDecimals } from "../../utils/RoundDecimals"
import AddressIcon from "../../AddressIcon";
import Modal from "../../modal/modal";
import Link from "next/link";

type Props = {
    campaign: Campaign
}
const Component: FC<Props> = ({ campaign }) => {
    const [openTopModal, setOpenTopModal] = useState(false)
    const settings = useSettingsState()
    const { address } = useAccount();

    const handleOpenTopModal = () => {
        setOpenTopModal(true)
    }

    const apiClient = new LayerSwapApiClient()
    const { data: leaderboardData, isLoading } = useSWR<ApiResponse<Leaderboard>>(`/campaigns/${campaign?.id}/leaderboard`, apiClient.fetcher, { dedupingInterval: 60000 })
    const { data: rewardsData, isLoading: rewardsIsLoading } = useSWR<ApiResponse<Reward>>(`/campaigns/${campaign.id}/rewards/${address}`, apiClient.fetcher, { dedupingInterval: 60000 })
    const leaderboard = leaderboardData?.data

    if (isLoading) {
        return <RewardsComponentLeaderboardSceleton />
    }

    if (!leaderboard) {
        //TODO handle
        return <></>
    }

    const rewards = rewardsData?.data
    const { resolveImgSrc, networks, currencies } = settings
    const network = networks.find(n => n.internal_name === campaign?.network)
    const position = rewards?.user_reward.position || NaN
    const campaignAsset = currencies.find(c => c?.asset === campaign?.asset)

    const leaderboardRewards = [
        leaderboard.leaderboard_budget * 0.6,
        leaderboard.leaderboard_budget * 0.3,
        leaderboard.leaderboard_budget * 0.1
    ]

    return <div className="space-y-2">
        {leaderboard?.leaderboard?.length > 0 &&
            <div className="flex items-center justify-between">
                <p className="font-bold text-left leading-5">Leaderboard</p>
                <button onClick={handleOpenTopModal} type="button" className=" leading-4 text-base text-primary underline hover:no-underline hover:text-primary/80">
                    Top 10
                </button>
            </div>}
        <p className="text-sm text-primary-text">Users who earn the most throughout the program will be featured here.</p>
        <div className="bg-secondary-700 border border-secondary-700 hover:border-secondary-500 transition duration-200 rounded-lg shadow-lg">
            <div className="p-3">
                {leaderboard?.leaderboard?.length > 0 ? <div className="space-y-6">
                    {
                        leaderboard?.leaderboard?.filter(u => u.position < 4).map(user => (
                            <div key={user.position} className="items-center flex justify-between">
                                <div className="flex items-center">
                                    <p className="text-xl font-medium text-primary-text w-fit mr-1">{user.position}.</p>
                                    <div className="cols-start-2 flex items-center space-x-2">
                                        <AddressIcon address={user.address} size={25} />
                                        <div>
                                            <div className="text-sm font-bold text-primary-text leading-3">
                                                {user?.address && network?.account_explorer_template && <Link target="_blank" className="hover:opacity-80" href={network?.account_explorer_template?.replace("{0}", user?.address)}>
                                                    {user?.position === rewards?.user_reward?.position ? <span className="text-primary">You</span> : shortenAddress(user?.address)}
                                                </Link>}
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-secondary-text leading-3">{truncateDecimals(user.amount, campaignAsset?.precision)} {campaign?.asset}</p>
                                        </div>
                                    </div >
                                </div >
                                {
                                    leaderboard.leaderboard_budget > 0 && <div className="text-right flex items-center space-x-2">
                                        <ClickTooltip text={
                                            <div className="flex items-center space-x-1">
                                                <span>+</span>
                                                <div className="h-3.5 w-3.5 relative">
                                                    <Image
                                                        src={resolveImgSrc(campaign)}
                                                        alt="Project Logo"
                                                        height="40"
                                                        width="40"
                                                        loading="eager"
                                                        className="rounded-full object-contain" />
                                                </div>
                                                <p>
                                                    <span>{leaderboardRewards[user.position - 1]} {campaign?.asset}</span>
                                                </p>
                                            </div>}>
                                            <div className='text-primary-text hover:cursor-pointer hover:text-primary-text ml-0.5 hover:bg-secondary-200 active:ring-2 active:ring-gray-200 active:bg-secondary-400 focus:outline-none cursor-default p-1 rounded'>
                                                <Trophy className="h-4 w-4" aria-hidden="true" />
                                            </div>
                                        </ClickTooltip>
                                    </div>
                                }
                            </div >
                        ))

                    }
                    {
                        position >= 4 && address && rewards?.user_reward &&
                        <div className={position > 4 ? "!mt-0 !pt-0" : ""}>
                            {position > 4 && < div className="text-2xl text-center leading-3 text-secondary-text my-3">
                                ...
                            </div>}
                            <div key={position} className="items-center flex justify-between">
                                <div className="flex items-center">
                                    <p className="text-xl font-medium text-primary-text w-fit mr-1">{position}.</p>
                                    <div className="cols-start-2 flex items-center space-x-2">
                                        <AddressIcon address={address} size={25} />
                                        <div>
                                            <div className="text-sm font-bold text-primary-text leading-3">
                                                {network?.account_explorer_template && <Link target="_blank" className="hover:opacity-80" href={network?.account_explorer_template?.replace("{0}", address)}>
                                                    <span className="text-primary">You</span>
                                                </Link>}
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-secondary-text leading-3">{truncateDecimals(rewards.user_reward.total_amount, campaignAsset?.precision)} {campaign?.asset}</p>
                                        </div>
                                    </div >
                                </div >
                            </div >
                        </div >
                    }
                </div >
                    :
                    <div className="h-8 flex flex-col justify-center items-center text-sm">
                        Here will be leaderboard.
                    </div>
                }
            </div >
        </div >
        <Modal height="full" header='Leaderboard' show={openTopModal} setShow={setOpenTopModal} modalId="leaderBoard">
            <div className="bg-secondary-700 border border-secondary-700 mt-2 hover:border-secondary-500 transition duration-200 rounded-lg shadow-lg text-secondary-text">
                <div className="p-3">
                    <div className="space-y-6">
                        {
                            leaderboard?.leaderboard?.map(user => (
                                <div key={user.position} className="items-center flex justify-between">
                                    <div className="flex items-center">
                                        <p className="text-xl font-medium text-primary-text w-fit mr-1">{user.position}.</p>
                                        <div className="cols-start-2 flex items-center space-x-2">
                                            <AddressIcon address={user.address} size={25} />
                                            <div>
                                                <div className="text-sm font-bold text-primary-text leading-3">
                                                    {user?.address && network?.account_explorer_template && <Link target="_blank" className="hover:opacity-80" href={network?.account_explorer_template?.replace("{0}", user?.address)}>
                                                        {user.position === rewards?.user_reward?.position ? <span className="text-primary">You</span> : shortenAddress(user.address)}
                                                    </Link>}
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-secondary-text leading-3">{truncateDecimals(user.amount, campaignAsset?.precision)} {campaign?.asset}</p>
                                            </div>
                                        </div >
                                    </div >
                                    {
                                        user.position < 4 && leaderboard.leaderboard_budget > 0 &&
                                        <div className="text-right flex items-center space-x-2">
                                            <ClickTooltip text={
                                                <div className="flex items-center space-x-1">
                                                    <span>+</span>
                                                    <div className="h-3.5 w-3.5 relative">
                                                        <Image
                                                            src={resolveImgSrc(campaign)}
                                                            alt="Address Logo"
                                                            height="40"
                                                            width="40"
                                                            loading="eager"
                                                            className="rounded-full object-contain" />
                                                    </div>
                                                    <p>
                                                        <span>{leaderboardRewards[user.position - 1]} {campaign?.asset}</span>
                                                    </p>
                                                </div>
                                            }>
                                                <div className='text-secondary-text hover:cursor-pointer hover:text-primary-text ml-0.5 hover:bg-secondary-200 active:ring-2 active:ring-gray-200 active:bg-secondary-400 focus:outline-none cursor-default p-1 rounded'>
                                                    <Trophy className="h-4 w-4" aria-hidden="true" />
                                                </div>
                                            </ClickTooltip>
                                        </div>
                                    }
                                </div >
                            ))
                        }
                    </div >
                </div >
            </div >
        </Modal >
    </div >
}
export default Component