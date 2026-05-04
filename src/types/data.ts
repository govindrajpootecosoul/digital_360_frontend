export type Kpi = {
  id: string
  label: string
  value: string
  delta: string
  positive: boolean
}

export type GrowthPoint = { month: string; count: number }
export type EngagementSlice = { name: string; value: number }

export type ActivityItem = {
  id: string
  title: string
  meta: string
  type: 'reply' | 'deal' | 'content' | 'outreach' | 'strategy'
}

export type Influencer = {
  id: string
  name: string
  platform: string
  category: string
  country: string
  creatorLink: string
  productAsked: string
  compensation: string
  address: string
  contentType: string
  shipmentId: string
  trackingLink: string
  shipmentStatus: string
  assetLink: string
  paymentDetails: string
  followers: number
  status: string
  collaborationType: string
  lastContact: string
  kanbanStatus: string
}

export type OutreachRow = {
  id: string
  influencer: string
  platform: string
  script: string
  hook: string
  variant: string
  dateSent: string
  followUps: number
  status: string
  scriptPerformance: string
}

export type StrategyCard = {
  id: string
  category: string
  platform: string
  hook: string
  scriptPreview: string
  referenceLink: string
  createdAt: string
  status: 'Approved' | 'Under Review' | 'WIP' | 'Rejected'
}

export type DashboardData = {
  kpis: Kpi[]
  growth: GrowthPoint[]
  engagement: EngagementSlice[]
  activity: ActivityItem[]
}
