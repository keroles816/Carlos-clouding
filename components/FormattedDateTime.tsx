import { cn, formatDateTime } from '@/lib/utils'
import { format } from 'path'
import React from 'react'

const FormattedDateTime = ({
    createDate,
    className
}:{createDate:string,className?:string}) => {
  return (
    <p className={cn('body-1 text-light-200 ', className)}>

    {formatDateTime(createDate)}

    </p>
  )
}

export default FormattedDateTime