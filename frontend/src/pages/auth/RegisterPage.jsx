import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const { confirmPassword, ...userData } = data
      await registerUser(userData)
      navigate('/events')
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed'
      setError('root', { message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in here
          </Link>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            required
            {...register('firstName', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters'
              }
            })}
            error={errors.firstName?.message}
          />

          <Input
            label="Last Name"
            required
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters'
              }
            })}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          required
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          error={errors.email?.message}
          helperText="Use your college email address"
        />

        <Input
          label="Student ID"
          required
          {...register('studentId', {
            required: 'Student ID is required',
            pattern: {
              value: /^[A-Z0-9]+$/i,
              message: 'Student ID should contain only letters and numbers'
            }
          })}
          error={errors.studentId?.message}
        />

        <div>
          <label className="form-label">Role</label>
          <select
            className="form-input"
            {...register('role', { required: 'Role is required' })}
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="club_admin">Club Admin</option>
            <option value="faculty">Faculty</option>
          </select>
          {errors.role && (
            <p className="form-error">{errors.role.message}</p>
          )}
        </div>

        <Input
          label="Password"
          type="password"
          required
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            }
          })}
          error={errors.password?.message}
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        />

        <Input
          label="Confirm Password"
          type="password"
          required
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
          error={errors.confirmPassword?.message}
        />

        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('acceptTerms', {
              required: 'You must accept the terms and conditions'
            })}
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="form-error">{errors.acceptTerms.message}</p>
        )}

        {errors.root && (
          <div className="text-error text-sm text-center">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
        >
          Create Account
        </Button>
      </form>
    </div>
  )
}

export default RegisterPage