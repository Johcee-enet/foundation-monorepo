import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import { FaArrowLeftLong } from 'react-icons/fa6'

type NavSystem = {
    page: string
    push: string
}

const ReturnHeader = (props: NavSystem) => {
    return (
        <div className="return-header">
            <Link href={props.push} className="text-3xl">
                <FaArrowLeftLong />
            </Link>
            <p className="font-semibold capitalize text-2xl">{props.page}</p>
        </div>
    )
}

export default ReturnHeader
