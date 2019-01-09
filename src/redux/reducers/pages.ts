import { actionTypes } from '~/redux/constants'

const generateDataObj = payload => {
  if (payload) {
    const { categoryId, endReached, isLoadingInitial, isLoadingMore, listItems,
      queryFrom, queryPage, querySort, queryType, selected } = payload
  
    return {
      ...(categoryId ? { categoryId } : {}),
      ...(endReached || endReached === false ? { endReached } : {}),
      ...(isLoadingInitial || isLoadingInitial === false ? { isLoadingInitial } : {}),
      ...(isLoadingMore || isLoadingMore === false ? { isLoadingMore } : {}),
      ...(listItems ? { listItems } : {}),
      ...(queryFrom ? { queryFrom } : {}),
      ...(queryPage ? { queryPage } : {}),
      ...(querySort ? { querySort } : {}),
      ...(queryType ? { queryType } : {}),
      ...(selected ? { selected } : {})
    }
  }

  return {}
}

export default (state = {}, action) => {
  const dataObj = generateDataObj(action.payload)
  
  switch (action.type) {
    case actionTypes.PAGES_SET_QUERY_STATE:
      const pageKey = action.payload.pageKey
      if (!pageKey) {
        return state
      }

      return {
        ...state,
        [pageKey]: {
          ...state[pageKey],
          ...dataObj
        }
      }
    default:
      return state
  }

}
