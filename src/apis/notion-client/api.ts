import { NotionAPI } from "notion-client"
import { ExtendedRecordMap } from "notion-types"
import { getBlockCollectionId, getPageContentBlockIds } from "notion-utils"

// Notion sits behind Cloudflare, which answers got's default User-Agent
// ("got (https://github.com/sindresorhus/got)") with a 403 HTML page.
// Pass a browser-like UA on every request instead.
export const gotOptions = {
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  },
}

export const notionApi = new NotionAPI()

// Since early 2026 Notion returns every record as { value: { value, role } }
// instead of { value, role }. notion-client 6.x and react-notion-x 6.x still
// expect the flat shape, so flatten each table before anything reads it.
const unwrapTable = (table: any) => {
  if (!table) return table
  const out: any = {}
  for (const [id, entry] of Object.entries<any>(table)) {
    const inner = entry?.value
    out[id] =
      inner && typeof inner === "object" && "value" in inner && "role" in inner
        ? { ...entry, role: inner.role, value: inner.value }
        : entry
  }
  return out
}

const TABLES = ["block", "collection", "collection_view", "notion_user", "space"]

export const unwrapRecordMap = <T extends Record<string, any>>(recordMap: T): T => {
  const out: any = { ...recordMap }
  for (const table of TABLES) {
    if (out[table]) out[table] = unwrapTable(out[table])
  }
  return out
}

// Drop-in for notionApi.getPage(): same steps (page chunk → missing blocks →
// collection queries → signed urls) but unwraps after every fetch, so the
// collection_view detection and react-notion-x both see flat records.
export const getPage = async (pageId: string): Promise<ExtendedRecordMap> => {
  const raw = await notionApi.getPageRaw(pageId, { gotOptions })
  const recordMap = unwrapRecordMap(raw.recordMap) as ExtendedRecordMap
  if (!recordMap?.block) throw new Error(`Notion page not found "${pageId}"`)

  recordMap.collection = recordMap.collection ?? {}
  recordMap.collection_view = recordMap.collection_view ?? {}
  recordMap.notion_user = recordMap.notion_user ?? {}
  recordMap.collection_query = {}
  recordMap.signed_urls = {}

  for (;;) {
    const missing = getPageContentBlockIds(recordMap).filter(
      (id) => !recordMap.block[id]
    )
    if (!missing.length) break
    const res = await notionApi.getBlocks(missing, gotOptions)
    recordMap.block = { ...recordMap.block, ...unwrapTable(res.recordMap.block) }
  }

  const contentBlockIds = getPageContentBlockIds(recordMap)
  const views = contentBlockIds.flatMap((id) => {
    const block = recordMap.block[id]?.value
    const collectionId =
      block &&
      (block.type === "collection_view" || block.type === "collection_view_page") &&
      getBlockCollectionId(block, recordMap)
    return collectionId
      ? (block.view_ids ?? []).map((viewId) => ({ collectionId, viewId }))
      : []
  })

  for (const { collectionId, viewId } of views) {
    const view = recordMap.collection_view[viewId]?.value
    try {
      const res = await notionApi.getCollectionData(collectionId, viewId, view, {
        gotOptions,
      })
      const fetched = unwrapRecordMap(res.recordMap)
      recordMap.block = { ...recordMap.block, ...fetched.block }
      recordMap.collection = { ...recordMap.collection, ...fetched.collection }
      recordMap.collection_view = {
        ...recordMap.collection_view,
        ...fetched.collection_view,
      }
      recordMap.notion_user = { ...recordMap.notion_user, ...fetched.notion_user }
      recordMap.collection_query[collectionId] = {
        ...recordMap.collection_query[collectionId],
        [viewId]: (res.result as any)?.reducerResults,
      }
    } catch (err: any) {
      console.warn("NotionAPI collectionQuery error", pageId, err.message)
    }
  }

  await notionApi.addSignedUrls({ recordMap, contentBlockIds, gotOptions })
  return recordMap
}
