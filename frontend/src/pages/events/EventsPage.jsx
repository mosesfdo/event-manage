import { useState, useEffect } from 'react'
import { eventService } from '../../services/eventService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Card from '../../components/ui/Card'

const EventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getEvents()
        setEvents(response.data || [])
      } catch (err) {
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <LoadingSpinner size="lg" text="Loading events..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-error">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="page-header">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600">Discover and register for college events</p>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-600">Check back later for upcoming events.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event._id} hover>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {event.description}
              </p>
              <div className="text-sm text-gray-500">
                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                <p>📍 {event.location}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default EventsPage