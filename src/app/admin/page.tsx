'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarDays,
  Package,
  DollarSign,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { Booking, BookingStatus } from '@/types/booking';
import { SERVICE_TYPE_LABELS, TIME_WINDOW_LABELS, STATUS_LABELS } from '@/types/booking';

type FilterOption = 'all' | 'today' | 'week' | 'upcoming' | 'past';

const FILTER_LABELS: Record<FilterOption, string> = {
  all: 'All Bookings',
  today: 'Today',
  week: 'This Week',
  upcoming: 'Upcoming',
  past: 'Past',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  awaiting_offline_payment: 'bg-orange-100 text-orange-800 border-orange-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  canceled: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOption>('upcoming');

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings?filter=${filter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data.bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  // Calculate stats
  const totalBags = bookings.reduce((sum, b) => sum + b.bag_count, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.estimated_total, 0);
  const paidBookings = bookings.filter((b) => b.status === 'paid').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E6]">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#1A3D2E]">
                Admin Dashboard
              </h1>
              <p className="text-[#4A6358]">
                Manage and view all gift wrapping bookings
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as FilterOption)}
              >
                <SelectTrigger className="w-[180px] border-[#D4C5A9]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(FILTER_LABELS) as [FilterOption, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={fetchBookings}
                disabled={loading}
                className="border-[#D4C5A9]"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-[#D4C5A9]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#4A6358]">
                  Total Bookings
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-[#1A3D2E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A3D2E]">{bookings.length}</div>
              </CardContent>
            </Card>

            <Card className="border-[#D4C5A9]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#4A6358]">
                  Total Bags
                </CardTitle>
                <Package className="h-4 w-4 text-[#1A3D2E]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A3D2E]">{totalBags}</div>
              </CardContent>
            </Card>

            <Card className="border-[#D4C5A9]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#4A6358]">
                  Est. Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-[#C9A962]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A3D2E]">
                  ${totalRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4C5A9]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#4A6358]">
                  Paid
                </CardTitle>
                <Users className="h-4 w-4 text-[#C9A962]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A3D2E]">
                  {paidBookings} / {bookings.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Table */}
          <Card className="border-[#D4C5A9]">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1A3D2E]" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-lg font-medium text-[#1A3D2E] mb-2">
                    Problem fetching bookings
                  </p>
                  <p className="text-[#4A6358] mb-4">{error}</p>
                  <Button onClick={fetchBookings} variant="outline" className="border-[#D4C5A9]">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CalendarDays className="h-12 w-12 text-[#4A6358] mb-4" />
                  <p className="text-lg font-medium text-[#1A3D2E] mb-2">
                    No bookings found
                  </p>
                  <p className="text-[#4A6358]">
                    {filter === 'all'
                      ? 'No bookings have been made yet.'
                      : `No bookings match the "${FILTER_LABELS[filter]}" filter.`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#D4C5A9]">
                        <TableHead className="text-[#1A3D2E]">Customer</TableHead>
                        <TableHead className="text-[#1A3D2E]">Date</TableHead>
                        <TableHead className="text-[#1A3D2E]">Time</TableHead>
                        <TableHead className="text-center text-[#1A3D2E]">Bags</TableHead>
                        <TableHead className="text-[#1A3D2E]">Service</TableHead>
                        <TableHead className="text-[#1A3D2E]">Payment</TableHead>
                        <TableHead className="text-[#1A3D2E]">Status</TableHead>
                        <TableHead className="text-right text-[#1A3D2E]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id} className="border-[#D4C5A9]">
                          <TableCell>
                            <div>
                              <p className="font-medium text-[#1A3D2E]">
                                {booking.customer_name}
                              </p>
                              <p className="text-xs text-[#4A6358]">
                                {booking.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#1A3D2E]">
                            <span className="whitespace-nowrap">
                              {format(parseISO(booking.date), 'MMM d, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="text-[#4A6358]">
                            {booking.time_window
                              ? TIME_WINDOW_LABELS[booking.time_window].split(' ')[0]
                              : 'Any'}
                          </TableCell>
                          <TableCell className="text-center font-medium text-[#1A3D2E]">
                            {booking.bag_count}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-[#4A6358]">
                              {SERVICE_TYPE_LABELS[booking.service_type]
                                .replace('& ', '&\n')
                                .split('\n')[0]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                booking.payment_method === 'stripe'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                              }
                            >
                              {booking.payment_method === 'stripe' ? 'Card' : 'Offline'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={STATUS_COLORS[booking.status]}
                            >
                              {STATUS_LABELS[booking.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-[#1A3D2E]">
                            ${booking.estimated_total}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
