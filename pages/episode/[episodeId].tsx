import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type { Episode, MediaRef } from 'podverse-shared'
import { useEffect, useState } from 'react'
import { ClipListItem, EpisodeInfo, List, PageHeader, PageScrollableContent,
  Pagination, PodcastPageHeader } from '~/components'
import { scrollToTopOfPageScrollableContent } from '~/components/PageScrollableContent/PageScrollableContent'
import { calcListPageCount } from '~/lib/utility/misc'
import { Page } from '~/lib/utility/page'
import { PV } from '~/resources'
import { getEpisodeById } from '~/services/episode'
import { getMediaRefsByQuery } from '~/services/mediaRef'
import { getServerSideAuthenticatedUserInfo } from '~/services/auth'

interface ServerProps extends Page {
  serverClips: MediaRef[]
  serverClipsFilterPage: number
  serverClipsFilterSort: string
  serverClipsPageCount: number
  serverEpisode: Episode
}

type FilterState = {
  clipsFilterPage?: number
  clipsFilterSort?: string
}

const keyPrefix = 'pages_episode'

/* *TODO*
    Rewrite this file to follow the patterns in pages/podcasts and pages/search.
    Move all functions inside the render function,
    get rid of the filterState,
    stop passing in filterState as a parameter,
    and instead get and set the filterState fields individually.
    Keep the sections in the same order
    (Initialization, useEffects, Client-Side Queries, Render Helpers).
*/

export default function Episode(props: ServerProps) {
  const { serverClips, serverClipsPageCount, serverEpisode,
    serverClipsFilterPage, serverClipsFilterSort } = props
  const { id, podcast } = serverEpisode

  const { t } = useTranslation()

  const [filterState, setFilterState] = useState({
    clipsFilterPage: serverClipsFilterPage,
    clipsFilterSort: serverClipsFilterSort
  } as FilterState)
  const { clipsFilterPage, clipsFilterSort } = filterState
  const [clipsListData, setClipsListData] = useState<MediaRef[]>(serverClips)
  const [clipsPageCount, setClipsPageCount] = useState<number>(serverClipsPageCount)

  const pageTitle = serverEpisode.title || t('untitledEpisode')

  /* useEffects */

  useEffect(() => {
    (async () => {
      const { data } = await clientQueryClips(
        { page: clipsFilterPage, episodeId: id, sort: clipsFilterSort },
        filterState
      )
      const [newClipsListData, newClipsListCount] = data
      setClipsListData(newClipsListData)
      setClipsPageCount(calcListPageCount(newClipsListCount))
      scrollToTopOfPageScrollableContent()
    })()
  }, [clipsFilterPage, clipsFilterSort])

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PodcastPageHeader
        episode={serverEpisode}
        podcast={podcast} />
      <PageScrollableContent>
        <div className='row'>
          <div className='column flex-stretch'>
            <EpisodeInfo
              episode={serverEpisode}
              includeMediaItemControls />
            <PageHeader
              isSubHeader
              sortOnChange={(selectedItems: any[]) => {
                const selectedItem = selectedItems[0]
                setFilterState({ clipsFilterPage: 1, clipsFilterSort: selectedItem.key })
              }}
              sortOptions={generateSortOptions(t)}
              sortSelected={clipsFilterSort}
              text={t('Clips')} />
            <List>
              {generateClipListElements(clipsListData, serverEpisode)}
            </List>
            <Pagination
              currentPageIndex={clipsFilterPage}
              handlePageNavigate={(newPage) => {
                setFilterState({ clipsFilterPage: newPage, clipsFilterSort })
              }}
              handlePageNext={() => {
                const newPage = clipsFilterPage + 1
                if (newPage <= clipsPageCount) {
                  setFilterState({ clipsFilterPage: newPage, clipsFilterSort })
                }
              }}
              handlePagePrevious={() => {
                const newPage = clipsFilterPage - 1
                if (newPage > 0) {
                  setFilterState({ clipsFilterPage: newPage, clipsFilterSort })
                }
              }}
              pageCount={clipsPageCount} />
          </div>
        </div>
      </PageScrollableContent>
    </>
  )
}

/* Client-Side Queries */

type ClientQueryClips = {
  episodeId?: string
  page?: number
  sort?: string
}

const clientQueryClips = async (
  { episodeId, page, sort }: ClientQueryClips,
  filterState: FilterState
) => {
  const finalQuery = {
    episodeId,
    ...(page ? { page } : { page: filterState.clipsFilterPage }),
    ...(sort ? { sort } : { sort: filterState.clipsFilterSort })
  }
  return getMediaRefsByQuery(finalQuery)
}

/* Render Helpers */

const generateSortOptions = (t: any) => [
  { label: t('Chronological'), key: PV.Filters.sort._chronological },
  { label: t('Recent'), key: PV.Filters.sort._mostRecent },
  { label: t('Top - Past Day'), key: PV.Filters.sort._topPastDay },
  { label: t('Top - Past Week'), key: PV.Filters.sort._topPastWeek },
  { label: t('Top - Past Month'), key: PV.Filters.sort._topPastMonth },
  { label: t('Top - Past Year'), key: PV.Filters.sort._topPastYear },
  { label: t('Top - All Time'), key: PV.Filters.sort._topAllTime },
  { label: t('Oldest'), key: PV.Filters.sort._oldest },
  { label: t('Random'), key: PV.Filters.sort._random }
]

const generateClipListElements = (listItems: MediaRef[], episode: Episode) => {
  return listItems.map((listItem, index) => {
    listItem.episode = episode
    return (
      <ClipListItem
        mediaRef={listItem}
        podcast={episode.podcast}
        key={`${keyPrefix}-${index}`} />
    )
  })
}

/* Server-Side Logic */

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale, params, req } = ctx
  const { cookies } = req
  const { episodeId } = params

  const userInfo = await getServerSideAuthenticatedUserInfo(cookies)

  const episodeResponse = await getEpisodeById(episodeId as string)
  const serverEpisode = episodeResponse.data

  const serverClipsFilterSort = PV.Filters.sort._topPastYear
  const serverClipsFilterPage = 1

  const clipsResponse = await getMediaRefsByQuery({
    episodeId,
    sort: serverClipsFilterSort
  })
  const [clipsListData, clipsListDataCount] = clipsResponse.data
  const serverClips = clipsListData
  const serverClipsPageCount = calcListPageCount(clipsListDataCount)

  const props: ServerProps = {
    serverUserInfo: userInfo,
    ...(await serverSideTranslations(locale, PV.i18n.fileNames.all)),
    serverCookies: cookies,
    serverClips,
    serverClipsFilterPage,
    serverClipsFilterSort,
    serverClipsPageCount,
    serverEpisode
  }

  return { props }
}
