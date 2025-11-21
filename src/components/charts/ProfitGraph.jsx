import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

function ProfitGraph({ bookings }) {
  // Calculate profit data for the past 30 days
  const profitData = useMemo(() => {
    const today = new Date();
    const data = [];

    // Initialize data for the past 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      data.push({
        daysAgo: i,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        profit: 0,
      });
    }

    // Calculate profit for each day
    bookings.forEach((booking) => {
      if (booking.status === 'accepted') {
        const bookingStart = new Date(booking.dateRange.start);
        const bookingEnd = new Date(booking.dateRange.end);

        // Calculate number of nights
        const nights = Math.ceil((bookingEnd - bookingStart) / (1000 * 60 * 60 * 24));
        const totalPrice = booking.totalPrice || 0;
        const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice;

        // Distribute profit across the booking dates
        for (let i = 0; i < data.length; i++) {
          const dataDate = new Date(today);
          dataDate.setDate(dataDate.getDate() - data[i].daysAgo);
          dataDate.setHours(0, 0, 0, 0);

          // Check if this date falls within the booking range
          if (dataDate >= bookingStart && dataDate < bookingEnd) {
            data[i].profit += pricePerNight;
          }
        }
      }
    });

    // Round profits to 2 decimal places
    return data.map((item) => ({
      ...item,
      profit: Math.round(item.profit * 100) / 100,
    }));
  }, [bookings]);

  // Calculate total profit
  const totalProfit = useMemo(() => {
    return profitData.reduce((sum, item) => sum + item.profit, 0).toFixed(2);
  }, [profitData]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Profit Overview - Last 30 Days
      </Typography>

      <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
        Total: ${totalProfit}
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={profitData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="daysAgo"
            label={{ value: 'Days Ago', position: 'insideBottom', offset: -5 }}
            reversed
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Profit ($)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
            formatter={(value) => [`$${value}`, 'Profit']}
            labelFormatter={(label) => {
              const item = profitData.find((d) => d.daysAgo === label);
              return item ? `${item.date} (${label} days ago)` : label;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#FF385C"
            strokeWidth={2}
            dot={{ fill: '#FF385C', r: 4 }}
            activeDot={{ r: 6 }}
            name="Daily Profit"
          />
        </LineChart>
      </ResponsiveContainer>

      {profitData.every((item) => item.profit === 0) && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No accepted bookings in the past 30 days
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default ProfitGraph;
