import { getPage } from "src/apis/notion-client/api"

export const getRecordMap = async (pageId: string) => {
  const recordMap = await getPage(pageId)
  return recordMap
}
