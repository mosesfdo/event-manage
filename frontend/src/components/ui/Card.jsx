import { clsx } from 'clsx'

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = true,
  ...props 
}) => {
  const classes = clsx(
    'card',
    {
      'hover:shadow-lg transform hover:-translate-y-1': hover,
      'p-0': !padding,
    },
    className
  )
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '' }) => (
  <div className={clsx('card-header', className)}>
    {children}
  </div>
)

const CardBody = ({ children, className = '' }) => (
  <div className={clsx('', className)}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={clsx('border-t border-gray-200 pt-4 mt-6', className)}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card