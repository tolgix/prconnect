import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  IconButton,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  People,
  Campaign,
  Email,
  Analytics,
  Add,
  Visibility,
  MoreVert
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Örnek veriler
const campaignData = [
  { name: 'Ocak', sent: 4000, opened: 2400, clicked: 800 },
  { name: 'Şubat', sent: 3000, opened: 1398, clicked: 600 },
  { name: 'Mart', sent: 2000, opened: 3800, clicked: 1200 },
  { name: 'Nisan', sent: 2780, opened: 3908, clicked: 1400 },
  { name: 'Mayıs', sent: 1890, opened: 4800, clicked: 1600 },
  { name: 'Haziran', sent: 2390, opened: 3800, clicked: 1800 }
];

const pieData = [
  { name: 'Açılanlar', value: 45, color: '#0088FE' },
  { name: 'Tıklananlar', value: 25, color: '#00C49F' },
  { name: 'Açılmayanlar', value: 30, color: '#FFBB28' }
];

const recentCampaigns = [
  {
    id: 1,
    name: 'Yeni Ürün Lansmanı',
    status: 'Gönderildi',
    date: '2024-01-15',
    openRate: 45.2,
    clickRate: 12.8
  },
  {
    id: 2,
    name: 'Basın Toplantısı Duyurusu',
    status: 'Taslak',
    date: '2024-01-14',
    openRate: 0,
    clickRate: 0
  },
  {
    id: 3,
    name: 'Şirket Etkinliği',
    status: 'Gönderildi',
    date: '2024-01-13',
    openRate: 38.7,
    clickRate: 8.3
  }
];

const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp color="success" fontSize="small" />
              <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                +{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {React.cloneElement(icon, { 
            sx: { fontSize: 32, color: `${color}.main` } 
          })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, canEdit } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating data fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Box sx={{ p: 3 }}>
          <Typography>Dashboard yükleniyor...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Hoş geldiniz, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            PR kampanyalarınızın genel durumuna buradan göz atabilirsiniz.
          </Typography>
        </Box>
        {canEdit() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/campaigns/new')}
            size="large"
          >
            Yeni Kampanya
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kampanyalar"
            value="24"
            subtitle="Bu ay 3 yeni"
            icon={<Campaign />}
            color="primary"
            trend={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kontaklar"
            value="1,847"
            subtitle="Aktif gazeteciler"
            icon={<People />}
            color="success"
            trend={8.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Gönderilen E-postalar"
            value="12,439"
            subtitle="Bu ay"
            icon={<Email />}
            color="warning"
            trend={15.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ortalama Açılma Oranı"
            value="42.8%"
            subtitle="Endüstri ortalaması: 35%"
            icon={<Analytics />}
            color="info"
            trend={5.7}
          />
        </Grid>
      </Grid>

      {/* Charts and Recent Activity */}
      <Grid container spacing={3}>
        {/* Campaign Performance Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Kampanya Performansı</Typography>
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#8884d8" name="Gönderilen" />
                  <Bar dataKey="opened" fill="#82ca9d" name="Açılan" />
                  <Bar dataKey="clicked" fill="#ffc658" name="Tıklanan" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Email Performance Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                E-posta Etkileşim Oranları
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Campaigns */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Son Kampanyalar</Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/campaigns')}
                  endIcon={<Visibility />}
                >
                  Tümünü Görüntüle
                </Button>
              </Box>
              <List>
                {recentCampaigns.map((campaign, index) => (
                  <React.Fragment key={campaign.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={campaign.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {campaign.date}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip
                                label={campaign.status}
                                size="small"
                                color={campaign.status === 'Gönderildi' ? 'success' : 'default'}
                                variant="outlined"
                              />
                              {campaign.status === 'Gönderildi' && (
                                <>
                                  <Chip
                                    label={`${campaign.openRate}% açılma`}
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={`${campaign.clickRate}% tıklama`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentCampaigns.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hızlı İşlemler
              </Typography>
              <Grid container spacing={2}>
                {canEdit() && (
                  <>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Campaign />}
                        onClick={() => navigate('/campaigns/new')}
                      >
                        Yeni Kampanya
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<People />}
                        onClick={() => navigate('/contacts/new')}
                      >
                        Kontak Ekle
                      </Button>
                    </Grid>
                  </>
                )}
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Analytics />}
                    onClick={() => navigate('/analytics')}
                  >
                    Analitikler
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => navigate('/press')}
                  >
                    Basın Verileri
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;