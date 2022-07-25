import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { Page } from '~/lib/utility/page'
import { PV } from '~/resources'
import {
  ColumnsWrapper,
  Footer,
  Meta,
  PageHeader,
  PageScrollableContent,
  SideContent,
  TableOfContents
} from '~/components'
import { getDefaultServerSideProps } from '~/services/serverSideHelpers'
import { TutorialSection, TutorialSectionProps } from '~/components/TutorialSection/TutorialSection'
import { mobileAndTabletCheck } from '~/lib/utility/deviceDetection'

type ServerProps = Page
const notAvailableTextMobile = `Feature not available on mobile.`
const notAvailableTextWeb = `Feature not available on web.`

export default function Tutorials(props: ServerProps) {
  /* Initialize */

  const { t } = useTranslation()
  const items = generateItems(t)
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  /* useEffects */

  useEffect(() => {
    const isMobileOrTablet = mobileAndTabletCheck()
    setIsMobileOrTablet(isMobileOrTablet)
    setIsLoading(false)
  }, [])

  /* Meta Tags */

  const meta = {
    currentUrl: `${PV.Config.WEB_BASE_URL}${PV.RoutePaths.web.tutorials}`,
    description: t('pages-tutorials_Description'),
    title: t('pages-tutorials_Title')
  }

  const generateTutorialSectionElements = () => {
    return items.map((item, index) => (
      <TutorialSection
        defaultTypeSelected={isMobileOrTablet ? 'mobile' : 'web'}
        description={item.description}
        id={item.id}
        key={`tutorial-section-${index}`}
        mobileExplanation={item.mobileExplanation}
        mobilePreviewVideoEmbed={item.mobilePreviewVideoEmbed}
        title={item.title}
        webExplanation={item.webExplanation}
        webPreviewVideoEmbed={item.webPreviewVideoEmbed}
      />
    ))
  }

  return (
    <>
      <Meta
        description={meta.description}
        ogDescription={meta.description}
        ogTitle={meta.title}
        ogType='website'
        ogUrl={meta.currentUrl}
        robotsNoIndex={false}
        title={meta.title}
        twitterDescription={meta.description}
        twitterTitle={meta.title}
      />
      <PageHeader text={t('Tutorials')} />
      <PageScrollableContent>
        <ColumnsWrapper
          mainColumnChildren={
            <div className='text-page'>
              <TableOfContents items={items} />
              <hr />
              <div className='tutorial-sections'>
                <h2>Topics</h2>
                {!isLoading && generateTutorialSectionElements()}
              </div>
            </div>
          }
          sideColumnChildren={<SideContent />}
        />
        <Footer />
      </PageScrollableContent>
    </>
  )
}

/* Server-Side Logic */

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx

  const defaultServerProps = await getDefaultServerSideProps(ctx, locale)

  const serverProps: ServerProps = {
    ...defaultServerProps
  }

  return { props: serverProps }
}

const generateItems = (t: any) =>
  [
    { // Add Custom RSS Feeds

      title: `Add Custom RSS Feeds`,
      id: `add-rss`,
      description: `Add RSS feeds directly to listen to your favorite podcasts.`,
      mobileExplanation: `<li>Tap the More Tab, then tap Add Custom RSS Feed.</li> <li>Paste the RSS link for the podcast you'd like to add in the text box here, then tap Save.</li> <li>You will be redirected to the podcast screen and automatically subscribed to it.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).rss.add.mobile,
      webExplanation: notAvailableTextWeb
    },
    { // Add Custom RSS Feeds - with Username and Password

      title: `Add Custom RSS Feeds - with Username and Password`,
      id: `add-rss-password`,
      description: `Add private RSS feeds directly to listen to your favorite podcasts.`,
      mobileExplanation: `<li>Tap the More Tab, then tap Add Custom RSS Feed.</li> <li>Paste the RSS link for the podcast you'd like to add in the text box here, then tap the Include username and password button.</li> <li>Text fields for Username and Password will appear below the RSS link. Enter your username and password for your premium podcast feed, then tap Save.</li> <li>You will be redirected to the podcast screen and automatically subscribed to it.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).rss.addWithLogin.mobile,
      webExplanation: notAvailableTextWeb
    },
    { // Chapters

      title: `Chapters`,
      id: `episodes-chapters`,
      description: `Navigate through chapters on supported podcasts to quickly jump between segments of an episode.`,
      mobileExplanation: `<li>Tap the Miniplayer to expand it.</li> <li>Swipe left until you arrive at the Chapters section.</li> <li>From here you can jump to chapters the Podcaster has labeled on the episode.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).chapters.mobile,
      webExplanation: `TODO:`,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).chapters.web
    },
    { // Clips - Create

      title: `Clips - Create`,
      id: `clips-create`,
      description: `Create a clip of the podcast you are listening to that can be shared with anyone. NOTE: If a podcast inserts dynamic ads, then the timestamps of a clip will not stay exactly accurate.`,
      mobileExplanation: `<li>Tap the Miniplayer to expand it, then tap the Scissors at the top of the screen. Here you can create a clip by assigning a start time and an optional end time.</li> <li>Tap the Start Time button to change it to the current time of the episode.</li> <li> Optionally, tap the End Time button when the relevant part of your clip is finished.</li> <li>If you want your clip to remain private, tap the Public button and select Only with Link.</li> <li>Tap Save Clip when you are done. To view your Clips, tap the My Library tab, then tap My Clips.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).clips.create.mobile,
      webExplanation: `TODO:`,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).clips.create.web
    },
    { // Cross-App Comments

      title: `Cross-App Comments`,
      id: `cross-comments`,
      description: `View cross-app comments and log in to reply.`,
      mobileExplanation: `<li>Tap the Miniplayer to expand it.</li> <li>Swipe left until you arrive at the Comments section.</li> <li>Tapping a comment will open it in a new window where you can log in to reply.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).crossAppComments.mobile,
      webExplanation: `TODO:`,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).crossAppComments.web
    },
    { // Episodes - Download

      title: `Episodes - Download`,
      id: `episodes-download`,
      description: `Download episodes to easily access them later offline.`,
      mobileExplanation: `<li>Starting from the podcast page of your choice, tap the download button on the right side of the episode you'd like to download.</li> <li>To view your downloaded episodes on the podcast's page: tap the filter button, then sort by Downloaded.</li> <li>To view your download progress, tap the My Library tab, then tap Active Downloads.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).episodes.download.mobile,
      webExplanation: notAvailableTextWeb,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).episodes.download.web
    },
    { // Episodes - Mark as Played/Unplayed

      title: `Episodes - Mark as Played/Unplayed`,
      id: `episodes-played`,
      description: `Mark episodes as played or unplayed to keep track of your progress.`,
      mobileExplanation: `<li>From the Podcast page of your choice, tap the More button next to an episode.</li> <li>Tap Mark as Played.</li> <li>A green checkmark will appear next to the episode, indicating you've already played it.</li> <li>To remove the checkmark, tap the More button again and select Mark as Unplayed.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).markAsPlayed.mobile,
      webExplanation: `TODO:`,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).markAsPlayed.web
    },
    { // Playlists - Create
      title: `Playlists - Create`,
      id: `playlists-create`,
      description: `Create playlists of episodes and clips and share them with anyone.`,
      mobileExplanation: `<li>Playlists can be made up of both Podcast Episodes and Podcast Clips.</li> <li>From the Podcast page, tap the more button next to an episode or clip.</li> <li>Tap the Add to Playlist button.</li> <li>Here you can select New to create a new playlist and title it, or select an existing Playlist to add to.</li> <li>Repeat this process for as many episodes or clips as you like.</li> <li>To view your playlists, tap the My Library tab, then tap Playlists.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).playlists.create.mobile,
      webExplanation: `TODO:`,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).playlists.create.web
    },
    { // Podcasts - Subscribe
      
      title: `Podcasts - Subscribe`,
      id: `podcasts-subscribe`,
      description: `Subscribe to podcasts to easily access them later.`,
      mobileExplanation: `<li>Starting from the Podcasts Tab, tap the search bar and type in the name of a podcast. A list will appear below the search bar.</li><li>Tap the podcast you want from the list to go to its page, then tap the Subscribe button to subscribe.</li><li>To view your subscriptions: tap the Podcasts Tab, then tap the Filter button and filter by Subscribed. Your subscribed podcasts will appear in the list.</li>
      `,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).podcasts.subscribe.mobile,
      webExplanation: `TODO:`,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).podcasts.subscribe.web
    },
    { // Sleep Timer

      title: `Sleep Timer`,
      id: `sleep-timer`,
      description: `Set a sleep timer to pause playback when the timer runs out.`,
      mobileExplanation: `<li>Tap the Miniplayer to expand it</li><li>Tap the Crescent Moon at the bottom left of the screen.</li> <li>Input a desired time, then tap Start Timer to activate it.</li> <li>Podverse will pause the podcast you're listening to once the timer is up.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).sleepTimer.mobile,
      webExplanation: notAvailableTextWeb,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).sleepTimer.web
    },
    { // Transcripts

      title: `Transcripts`,
      id: `episodes-transcripts`,
      description: `View episode transcripts when supported and navigate through them.`,
      mobileExplanation: `<li>Tap on the Miniplayer to expand it.</li> <li>Swipe left until you arrive at the Transcript section.</li> <li>Here you can scroll through the provided transcript and tap on sections of text to jump directly to where they were said in the Episode.</li>`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).transcripts.mobile,
      webExplanation: `TODO:`,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).transcripts.web
    },
    { // Videos

      title: `Videos`,
      id: `videos-playback`,
      description: `Watch podcasts that support video playback.`,
      mobileExplanation: `<li>Select a video podcast and play an episode. The video will begin playing in the miniplayer.</li> <li>To see the video in full screen, tap the miniplayer to expand it, then tap the Full Screen button at the top right of the video box.`,
      mobilePreviewVideoEmbed: PV.PreviewVideoEmbeds(t).videos.mobile,
      webExplanation: `TODO:`,
      webPreviewVideoEmbed: PV.PreviewVideoEmbeds(t).videos.web
    },
  ] as TutorialSectionProps[]
