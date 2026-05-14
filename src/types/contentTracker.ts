export type ContentCategory = {
  id: string
  name: string
}

export type ContentTrackerEntry = {
  id: string
  categoryId: string
  subCategory: string
  country: string
  date: string
  day: string
  contentType: string
  campaignTheme: string
  idea: string
  copy: string
  designerName: string
  designerStatus: string
  platform: string
  topic: string
  scripts: string
  hook: string
  isOwn?: boolean
  postLink?: string
  referenceLink: string
  views: number
  likes: number
  /** Count or free-form notes; stored as string. */
  comments: string
}

export type ContentTrackerSeed = {
  categories: ContentCategory[]
  entries: ContentTrackerEntry[]
}
