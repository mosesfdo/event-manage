import { clsx } from 'clsx'

const LoadingSpinner = ({ 
  size = 'md', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <div className={clsx('loading-spinner', sizeClasses[size])} />
      {text && (
        <p className="text-gray-600 text-sm mt-2">{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner