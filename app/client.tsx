'use client'

import dynamic from 'next/dynamic'

const Luncher = dynamic(() => import('@/app/luncher'), { ssr: false })

export default function Client() {
  return <Luncher />
}
