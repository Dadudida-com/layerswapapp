import Layout from '../../components/layout'
import { InferGetServerSidePropsType } from 'next'
import LayerSwapAuthApiClient from '../../lib/userAuthApiClient'
import RewardComponent from '../../components/Rewards/RewardComponent'
import { LayerSwapAppSettings } from '../../Models/LayerSwapAppSettings'
import LayerSwapApiClient from '../../lib/layerSwapApiClient'

export default function RewardsPage({ settings }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    LayerSwapAuthApiClient.identityBaseEndpoint = settings.discovery.identity_url
    let appSettings = new LayerSwapAppSettings(settings)
    
    return (
        <Layout settings={appSettings}>
            <RewardComponent />
        </Layout>
    )
}

export async function getServerSideProps(context) {
    context.res.setHeader(
        'Cache-Control',
        's-maxage=60, stale-while-revalidate'
    );

    var apiClient = new LayerSwapApiClient();
    const { data: settings } = await apiClient.GetSettingsAsync()

    settings.networks = settings.networks.filter((element) =>
        element.status !== "inactive")

    settings.exchanges = settings.exchanges.filter(e => e.status === 'active')

    const resource_storage_url = settings.discovery.resource_storage_url
    if (resource_storage_url[resource_storage_url.length - 1] === "/")
        settings.discovery.resource_storage_url = resource_storage_url.slice(0, -1)

    let isOfframpEnabled = process.env.OFFRAMP_ENABLED != undefined && process.env.OFFRAMP_ENABLED == "true";


    return {
        props: { settings, isOfframpEnabled },
    }
}