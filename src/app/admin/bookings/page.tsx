'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import {
  Package,
  Gift,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  Power,
  PowerOff,
  Users,
  DollarSign,
  RefreshCw,
  Wallet,
  LogOut,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useBookings } from '@/hooks/useBookings';
import type { Booking, BookingStatus } from '@/types/booking';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; dotColor: string }> = {
  pending_payment: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700', dotColor: 'bg-yellow-500' },
  awaiting_offline_payment: { label: 'Awaiting', color: 'bg-orange-50 text-orange-700', dotColor: 'bg-orange-500' },
  paid: { label: 'Completed', color: 'bg-green-50 text-green-700', dotColor: 'bg-green-500' },
  canceled: { label: 'Canceled', color: 'bg-red-50 text-red-700', dotColor: 'bg-red-500' },
};

const TIME_WINDOW_LABELS: Record<string, string> = {
  morning: '9am - 12pm',
  afternoon: '12pm - 5pm',
  evening: '5pm - 8pm',
};

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];


export default function AdminBookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [bookingsEnabled, setBookingsEnabled] = useState(true);
  const [isTogglingBookings, setIsTogglingBookings] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<string>('all');
  
  const { data: allBookings, isLoading, error, refetch, isRefetching } = useBookings('all');

  // Filter bookings based on active tab, search, and date range
  const filteredBookings = useMemo(() => {
    if (!allBookings) return [];
    
    let filtered = [...allBookings];
    
    // Tab filter
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(b => b.status === 'pending_payment' || b.status === 'awaiting_offline_payment');
        break;
      case 'completed':
        filtered = filtered.filter(b => b.status === 'paid');
        break;
      case 'canceled':
        filtered = filtered.filter(b => b.status === 'canceled');
        break;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.customer_name.toLowerCase().includes(query) ||
        (b.email?.toLowerCase().includes(query) ?? false) ||
        b.phone.includes(query) ||
        b.id.toLowerCase().includes(query)
      );
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(b => {
        const bookingDate = parseISO(b.date);
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        
        switch (dateRange) {
          case 'today':
            return bookingDay.getTime() === today.getTime();
          case 'tomorrow': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return bookingDay.getTime() === tomorrow.getTime();
          }
          case 'thisWeek': {
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
            return bookingDay >= today && bookingDay <= endOfWeek;
          }
          case 'next7days': {
            const next7 = new Date(today);
            next7.setDate(next7.getDate() + 7);
            return bookingDay >= today && bookingDay <= next7;
          }
          case 'next30days': {
            const next30 = new Date(today);
            next30.setDate(next30.getDate() + 30);
            return bookingDay >= today && bookingDay <= next30;
          }
          case 'upcoming':
            return bookingDay >= today;
          case 'past':
            return bookingDay < today;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [allBookings, activeTab, searchQuery, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  // Reset page when tab changes - biome incorrectly flags this as unnecessary
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeTab change should reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Count by status
  const counts = useMemo(() => ({
    all: allBookings?.length || 0,
    pending: allBookings?.filter(b => b.status === 'pending_payment' || b.status === 'awaiting_offline_payment').length || 0,
    completed: allBookings?.filter(b => b.status === 'paid').length || 0,
    canceled: allBookings?.filter(b => b.status === 'canceled').length || 0,
  }), [allBookings]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredBookings.length;
    const revenue = filteredBookings.reduce((sum, b) => sum + (b.estimated_total || 0), 0);
    const avgOrder = total > 0 ? revenue / total : 0;
    
    return { total, revenue, avgOrder };
  }, [filteredBookings]);

  // Fetch booking status and waitlist count
  useEffect(() => {
    async function fetchStatus() {
      try {
        const [statusRes, waitlistRes] = await Promise.all([
          fetch('/api/settings/bookings'),
          fetch('/api/waitlist'),
        ]);
        
        const statusData = await statusRes.json();
        setBookingsEnabled(statusData.enabled);

        if (waitlistRes.ok) {
          const waitlistData = await waitlistRes.json();
          setWaitlistCount(waitlistData.waitlist?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    }
    fetchStatus();
  }, []);

  const toggleBookings = async () => {
    setIsTogglingBookings(true);
    try {
      const res = await fetch('/api/settings/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !bookingsEnabled }),
      });

      if (res.ok) {
        setBookingsEnabled(!bookingsEnabled);
        toast.success(
          bookingsEnabled 
            ? 'Bookings are now CLOSED' 
            : 'Bookings are now OPEN!'
        );
      } else {
        toast.error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update booking status');
    } finally {
      setIsTogglingBookings(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout API call fails
      router.push('/');
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success('Status updated');
        refetch();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Admin</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Wrapped in Love</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Booking Toggle */}
              <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-full px-2 sm:px-4 py-1.5 sm:py-2">
                {bookingsEnabled ? (
                  <Power className="h-4 w-4 text-green-500" />
                ) : (
                  <PowerOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs sm:text-sm font-medium text-gray-700 hidden xs:inline">
                  {bookingsEnabled ? 'Open' : 'Closed'}
                </span>
                <Switch
                  checked={bookingsEnabled}
                  onCheckedChange={toggleBookings}
                  disabled={isTogglingBookings}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Waitlist Alert */}
        {waitlistCount > 0 && (
          <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{waitlistCount} people on waitlist</p>
                <p className="text-sm text-gray-500">Notify them when spots open up</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {/* Header with Filters */}
            <div className="p-4 sm:p-6 border-b bg-white">
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Title and Actions */}
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Bookings</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>

                {/* Search and Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Date Range */}
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All bookings</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="thisWeek">This week</SelectItem>
                      <SelectItem value="next7days">Next 7 days</SelectItem>
                      <SelectItem value="next30days">Next 30 days</SelectItem>
                      <SelectItem value="upcoming">All upcoming</SelectItem>
                      <SelectItem value="past">Past bookings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Metrics Bar */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-4 border-t text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">{metrics.total}</span> bookings
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">${metrics.revenue.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      <span className="font-semibold text-gray-900">${metrics.avgOrder.toFixed(0)}</span> avg
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 sm:mt-6">
                <TabsList className="bg-transparent p-0 h-auto gap-0 border-0 rounded-none overflow-x-auto flex-nowrap">
                  <TabButton value="all" count={counts.all} active={activeTab === 'all'}>
                    All
                  </TabButton>
                  <TabButton value="pending" count={counts.pending} active={activeTab === 'pending'}>
                    Pending
                  </TabButton>
                  <TabButton value="completed" count={counts.completed} active={activeTab === 'completed'}>
                    Done
                  </TabButton>
                  <TabButton value="canceled" count={counts.canceled} active={activeTab === 'canceled'}>
                    Canceled
                  </TabButton>
                </TabsList>
              </Tabs>
            </div>

            {/* Table Controls */}
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-50/50 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <span className="hidden sm:inline">Show</span>
                <Select value={String(itemsPerPage)} onValueChange={(v) => {
                  setItemsPerPage(Number(v));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[60px] sm:w-[70px] h-7 sm:h-8 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>entries</span>
              </div>
              <div className="text-sm text-gray-500">
                {filteredBookings.length} total
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-12 text-center">
                <p className="text-red-500 mb-4">Failed to load bookings</p>
                <Button variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && filteredBookings.length === 0 && (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No bookings found</p>
                {(searchQuery || dateRange !== 'all') && (
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                )}
              </div>
            )}

            {/* Table */}
            {!isLoading && !error && filteredBookings.length > 0 && (
              <>
                {/* Mobile Card View */}
                <div className="sm:hidden divide-y">
                  {paginatedBookings.map((booking) => (
                    <MobileBookingCard
                      key={booking.id}
                      booking={booking}
                      onStatusChange={updateBookingStatus}
                    />
                  ))}
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden lg:table-cell">Service</TableHead>
                        <TableHead>Bags</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBookings.map((booking, index) => (
                        <BookingRow
                          key={booking.id}
                          booking={booking}
                          index={(currentPage - 1) * itemsPerPage + index + 1}
                          onStatusChange={updateBookingStatus}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-t flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-500">
                      <span className="hidden sm:inline">Showing </span>
                      {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredBookings.length)}
                      <span className="hidden sm:inline"> of {filteredBookings.length}</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600 px-2">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function TabButton({
  value,
  count,
  active,
  children,
}: {
  value: string;
  count: number;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className={`
        relative px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap
        bg-transparent rounded-none border-0 border-b-2 shadow-none
        ring-0 outline-none
        focus:ring-0 focus:outline-none focus:border-b-2 focus:shadow-none
        focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0 focus-visible:border-b-2 focus-visible:shadow-none
        data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-0 data-[state=active]:border-b-2
        transition-colors
        ${active 
          ? 'border-b-pink-500 text-pink-600' 
          : 'border-b-transparent text-gray-500 hover:text-gray-700'
        }
      `}
    >
      {children}
      <span className={`
        ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full
        ${active ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}
      `}>
        {count}
      </span>
    </TabsTrigger>
  );
}

function BookingRow({
  booking,
  index,
  onStatusChange,
}: {
  booking: Booking;
  index: number;
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  const statusConfig = STATUS_CONFIG[booking.status];

  return (
    <TableRow className="hover:bg-gray-50/50">
      <TableCell className="text-center text-gray-500 font-medium">
        {index}
      </TableCell>
      <TableCell>
        <div className="font-medium text-gray-900">
          {format(parseISO(booking.date), 'dd MMM yyyy')}
        </div>
      </TableCell>
      <TableCell className="text-gray-600">
        {booking.time_window ? TIME_WINDOW_LABELS[booking.time_window] : '-'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            {booking.customer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{booking.customer_name}</p>
            <p className="text-xs text-gray-500">{booking.email || booking.phone}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-gray-600 hidden lg:table-cell">
        {booking.service_type === 'pickup_delivery' ? 'Delivery & Pickup' : 'Drop-off & Pick-up'}
      </TableCell>
      <TableCell className="text-gray-900 font-medium">
        {booking.bag_count}
      </TableCell>
      <TableCell className="text-gray-900 font-semibold">
        ${booking.estimated_total || 0}
      </TableCell>
      <TableCell>
        <Badge className={`${statusConfig.color} border-0 gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'pending_payment')}>
              <Clock3 className="h-4 w-4 mr-2 text-yellow-500" />
              Pending Payment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'awaiting_offline_payment')}>
              <Wallet className="h-4 w-4 mr-2 text-orange-500" />
              Awaiting Offline
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'paid')}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Mark Paid
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'canceled')}>
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function MobileBookingCard({
  booking,
  onStatusChange,
}: {
  booking: Booking;
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  const statusConfig = STATUS_CONFIG[booking.status];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
            {booking.customer_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{booking.customer_name}</p>
            <p className="text-xs text-gray-500 truncate">{booking.email || booking.phone}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'pending_payment')}>
              <Clock3 className="h-4 w-4 mr-2 text-yellow-500" />
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'awaiting_offline_payment')}>
              <Wallet className="h-4 w-4 mr-2 text-orange-500" />
              Awaiting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'paid')}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Paid
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'canceled')}>
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-900 font-medium">
            {format(parseISO(booking.date), 'MMM d')}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">
            {booking.time_window ? TIME_WINDOW_LABELS[booking.time_window].split(' ')[0] : '-'}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">{booking.bag_count} bag{booking.bag_count !== 1 ? 's' : ''}</span>
        </div>
        <span className="font-bold text-gray-900">${booking.estimated_total || 0}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <Badge className={`${statusConfig.color} border-0 gap-1.5 text-xs`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
          {statusConfig.label}
        </Badge>
        <span className="text-xs text-gray-400">#{booking.id.slice(0, 6)}</span>
      </div>
    </div>
  );
}
