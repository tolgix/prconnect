import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Campaign as CampaignIcon,
  TrendingUp,
  Email,
  OpenInNew
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Mock data
const mockCampaigns = [
  {
    id: 1,
    name: 'Yeni Ürün Lansmanı',
    status: 'sent',
    subject: 'Devrim Niteliğinde Yeni Ürünümüz Tanıtıldı',
    sentAt: '2024-01-15',
    totalSent: 1200,
    opened: 540,
    clicked: 156,
    openRate: 45.0,
    clickRate: 13.0
  },
  {
    id: 2,
    name: 'Basın Toplantısı Duyurusu',
    status: 'draft',
    subject: 'Önemli Basın Toplantısı - 20 Ocak',
    createdAt: '2024-01-14',
    totalSent: 0,
    opened: 0,
    clicked: 0,
    openRate: 0,
    clickRate: 0
  },
  {
    id: 3,
    name: 'Şirket Etkinliği',
    status: 'scheduled',
    subject: 'Yıllık Gala Etkinliğimize Davetlisiniz',
    scheduledAt: '2024-01-20 10:00',
    totalSent: 0,
    opened: 0,
    clicked: 0,
    openRate: 0,
    clickRate: 0
  }
];

const getStatusChip = (status) => {
  const statusConfig = {
    draft: { label: 'Taslak', color: 'default' },
    scheduled: { label: 'Zamanlandı', color: 'info' },
    sending: { label: 'Gönderiliyor', color: 'warning' },
    sent: { label: 'Gönderildi', color: 'success' },
    failed: { label: 'Başarısız', color: 'error' }
  };
  
  const config = statusConfig[status] || { label: status, color: 'default' };
  return <Chip label={config.label} color={config.color} size="small" />;
};

const CampaignCard = ({ campaign }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6" component="div" noWrap>
          {campaign.name}
        </Typography>
        {getStatusChip(campaign.status)}
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {campaign.subject}
      </Typography>
      
      {campaign.status === 'sent' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Performans
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Açılma Oranı
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={campaign.openRate} 
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Typography variant="body2">
                  {campaign.openRate}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Tıklama Oranı
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinearProgress 
                  variant="determinate" 
                  value={campaign.clickRate} 
                  sx={{ flexGrow: 1, mr: 1 }}
                  color="secondary"
                />
                <Typography variant="body2">
                  {campaign.clickRate}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {campaign.status === 'sent' && `Gönderildi: ${campaign.sentAt}`}
          {campaign.status === 'scheduled' && `Zamanlandı: ${campaign.scheduledAt}`}
          {campaign.status === 'draft' && `Oluşturuldu: ${campaign.createdAt}`}
        </Typography>
        <Button size="small" endIcon={<OpenInNew />}>
          Görüntüle
        </Button>
      </Box>
    </CardContent>
  </Card>
);

const Campaigns = () => {
  const { canEdit } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('all');

  const totalCampaigns = mockCampaigns.length;
  const sentCampaigns = mockCampaigns.filter(c => c.status === 'sent').length;
  const draftCampaigns = mockCampaigns.filter(c => c.status === 'draft').length;
  const totalSent = mockCampaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const totalOpened = mockCampaigns.reduce((sum, c) => sum + c.opened, 0);
  const averageOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;

  const filteredCampaigns = selectedStatus === 'all' 
    ? mockCampaigns 
    : mockCampaigns.filter(c => c.status === selectedStatus);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Kampanya Yönetimi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            PR kampanyalarınızı oluşturun, yönetin ve performanslarını takip edin.
          </Typography>
        </Box>
        {canEdit() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
          >
            Yeni Kampanya
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Toplam Kampanya
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {totalCampaigns}
                  </Typography>
                </Box>
                <CampaignIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Gönderilen
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {sentCampaigns}
                  </Typography>
                </Box>
                <Email sx={{ fontSize: 32, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Taslak
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {draftCampaigns}
                  </Typography>
                </Box>
                <CampaignIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Ort. Açılma Oranı
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {averageOpenRate}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 32, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={1}>
            {[
              { key: 'all', label: 'Tümü', count: totalCampaigns },
              { key: 'sent', label: 'Gönderilen', count: sentCampaigns },
              { key: 'draft', label: 'Taslak', count: draftCampaigns },
              { key: 'scheduled', label: 'Zamanlanmış', count: mockCampaigns.filter(c => c.status === 'scheduled').length }
            ].map((tab) => (
              <Grid item key={tab.key}>
                <Button
                  variant={selectedStatus === tab.key ? 'contained' : 'outlined'}
                  onClick={() => setSelectedStatus(tab.key)}
                  size="small"
                >
                  {tab.label} ({tab.count})
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Campaign Grid */}
      <Grid container spacing={3}>
        {filteredCampaigns.map((campaign) => (
          <Grid item xs={12} md={6} lg={4} key={campaign.id}>
            <CampaignCard campaign={campaign} />
          </Grid>
        ))}
        
        {filteredCampaigns.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Kampanya bulunamadı
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Seçili filtreler için kampanya bulunmamaktadır.
                </Typography>
                {canEdit() && (
                  <Button variant="contained" startIcon={<Add />}>
                    İlk Kampanyanızı Oluşturun
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Campaigns;