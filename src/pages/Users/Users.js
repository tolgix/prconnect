import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  PersonAdd,
  FilterList
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../contexts/AuthContext';

// Mock data
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@prconnect.com',
    role: 'superadmin',
    isActive: true,
    lastLogin: '2024-01-15 14:30',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Mehmet Özkan',
    email: 'mehmet@prconnect.com',
    role: 'manager',
    isActive: true,
    lastLogin: '2024-01-15 10:15',
    createdAt: '2024-01-05'
  },
  {
    id: 3,
    name: 'Ayşe Demir',
    email: 'ayse@prconnect.com',
    role: 'dataentry',
    isActive: true,
    lastLogin: '2024-01-14 16:45',
    createdAt: '2024-01-10'
  },
  {
    id: 4,
    name: 'Can Yılmaz',
    email: 'can@prconnect.com',
    role: 'viewer',
    isActive: false,
    lastLogin: '2024-01-12 09:20',
    createdAt: '2024-01-12'
  }
];

const Users = () => {
  const { isAdmin, canManage } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEdit = () => {
    setDialogType('edit');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDialogType('delete');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleAddUser = () => {
    setDialogType('add');
    setOpenDialog(true);
  };

  const getRoleChip = (role) => {
    const roleConfig = {
      superadmin: { label: 'Süper Admin', color: 'error' },
      manager: { label: 'Yönetici', color: 'primary' },
      dataentry: { label: 'Veri Giriş', color: 'info' },
      viewer: { label: 'Görüntüleyici', color: 'default' }
    };
    
    const config = roleConfig[role] || { label: role, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {params.row.name.charAt(0).toUpperCase()}
        </Avatar>
      ),
      sortable: false,
      filterable: false
    },
    {
      field: 'name',
      headerName: 'Ad Soyad',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      )
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 150,
      renderCell: (params) => getRoleChip(params.row.role)
    },
    {
      field: 'isActive',
      headerName: 'Durum',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Aktif' : 'Pasif'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'lastLogin',
      headerName: 'Son Giriş',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.lastLogin}
        </Typography>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Kayıt Tarihi',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.createdAt}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 100,
      renderCell: (params) => (
        isAdmin() && (
          <IconButton
            onClick={(e) => handleMenuClick(e, params.row)}
            size="small"
          >
            <MoreVert />
          </IconButton>
        )
      ),
      sortable: false,
      filterable: false
    }
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesStatus = selectedStatus === '' || 
                         (selectedStatus === 'active' && user.isActive) ||
                         (selectedStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!canManage()) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Yetkisiz Erişim
        </Typography>
        <Typography>
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Kullanıcı Yönetimi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistem kullanıcılarını yönetin, roller atayın ve yetkileri düzenleyin.
          </Typography>
        </Box>
        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
            size="large"
          >
            Yeni Kullanıcı
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Toplam Kullanıcı
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {mockUsers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Aktif Kullanıcı
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {mockUsers.filter(u => u.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Yöneticiler
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {mockUsers.filter(u => u.role === 'superadmin' || u.role === 'manager').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Bu Ay Eklenen
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                2
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={selectedRole}
                  label="Rol"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="superadmin">Süper Admin</MenuItem>
                  <MenuItem value="manager">Yönetici</MenuItem>
                  <MenuItem value="dataentry">Veri Giriş</MenuItem>
                  <MenuItem value="viewer">Görüntüleyici</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Durum"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('');
                  setSelectedStatus('');
                }}
              >
                Temizle
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#fafafa',
                borderBottom: '2px solid #e0e0e0',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'add' && 'Yeni Kullanıcı Ekle'}
          {dialogType === 'edit' && 'Kullanıcı Düzenle'}
          {dialogType === 'delete' && 'Kullanıcı Sil'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <Typography>
              "{selectedUser?.name}" kullanıcısını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </Typography>
          ) : (
            <Typography>
              {dialogType === 'add' ? 'Yeni kullanıcı ekleme' : 'Kullanıcı düzenleme'} formu burada olacak.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button 
            variant="contained" 
            color={dialogType === 'delete' ? 'error' : 'primary'}
          >
            {dialogType === 'delete' ? 'Sil' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;