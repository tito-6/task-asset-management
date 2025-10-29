import { useMemo, useState, useEffect } from "react";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LanguageIcon from "@mui/icons-material/Language";
import BarChartIcon from "@mui/icons-material/BarChart";
import CampaignIcon from "@mui/icons-material/Campaign";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SmsIcon from "@mui/icons-material/Sms";
import PhonelinkLockIcon from "@mui/icons-material/PhonelinkLock";
import MusicNoteIcon from "@mui/icons-material/MusicNote"; // For TikTok
import SearchIcon from "@mui/icons-material/Search"; // For Google
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"; // For Snapchat
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams
} from "@mui/x-data-grid";

import {
  AssetStatusEnum,
  AssetTypeEnum,
  PriorityEnum,
  TwoFactorStatusEnum,
  type AssetSummary
} from "@assetmanagement/common-types";

import { useAppSelector } from "../app/hooks.js";
import AssetFormDialog, {
  type AssetFormValues
} from "../components/AssetFormDialog.js";
import {
  useCreateAssetMutation,
  useGetAssetDetailsQuery,
  useGetCompanyAssetsQuery,
  useUpdateAssetMutation,
  useDeleteAssetMutation
} from "../features/assets/assetsApi.js";
import { useGetCompanyUsersQuery } from "../features/users/usersApi.js";

// Brand names
const BRANDS = [
  "Tümü", // All assets
  "Model Sanayi Merkezi",
  "Model Kuyum Merkezi",
  "INNOGY",
  "Bio Rota",
  "NET Insaat",
  "SOM Prefabrik"
];

const AssetsPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const companyId = user?.companyId ?? null;
  const [currentTab, setCurrentTab] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | null>(null);
  const [passwordAssetId, setPasswordAssetId] = useState<number | null>(null);

  const { data, isLoading } = useGetCompanyAssetsQuery(companyId ?? 0, {
    skip: !companyId
  });

  const { data: usersData } = useGetCompanyUsersQuery(companyId ?? 0, {
    skip: !companyId
  });

  const [createAsset, { isLoading: isCreating }] = useCreateAssetMutation();
  const [updateAsset, { isLoading: isUpdating }] = useUpdateAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<AssetSummary | null>(null);

  const {
    data: assetDetails,
    isFetching: isFetchingDetails,
    refetch: refetchDetails
  } = useGetAssetDetailsQuery(passwordAssetId ?? 0, {
    skip: !passwordAssetId
  });

  // Debug: Log everything about the query
  useEffect(() => {
    console.log('=== PASSWORD QUERY DEBUG ===');
    console.log('passwordAssetId:', passwordAssetId);
    console.log('isFetchingDetails:', isFetchingDetails);
    console.log('assetDetails:', assetDetails);
    if (assetDetails) {
      console.log('assetDetails.asset:', assetDetails.asset);
      console.log('Password value:', assetDetails.asset.password);
      console.log('Password type:', typeof assetDetails.asset.password);
      console.log('Password length:', assetDetails.asset.password?.length);
      console.log('Full asset object:', JSON.stringify(assetDetails.asset, null, 2));
    }
    console.log('=== END DEBUG ===');
  }, [passwordAssetId, assetDetails, isFetchingDetails]);

  const currentBrand = BRANDS[currentTab];

  // Filter assets by current brand (or show unassigned assets in first tab)
  const rows = useMemo<AssetSummary[]>(() => {
    const allAssets = (data?.assets ?? []).filter(Boolean);
    
    // If "Tümü" (All) is selected, show all assets
    if (currentBrand === "Tümü") {
      return allAssets;
    }
    
    // For specific brands, use fuzzy matching
    return allAssets.filter((asset: AssetSummary) => {
      if (!asset.brand) return false; // Don't show unbranded assets in specific brand tabs
      
      const assetBrandLower = asset.brand.toLowerCase();
      const currentBrandLower = currentBrand.toLowerCase();
      
      // Direct match
      if (assetBrandLower === currentBrandLower) return true;
      
      // Fuzzy matching for similar brand names
      if (currentBrand === "INNO" && (
        assetBrandLower.includes("inno") || 
        assetBrandLower.includes("innogy") ||
        assetBrandLower.includes("fb inno") ||
        assetBrandLower.includes("zapier")
      )) return true;
      
      if (currentBrand === "Bio Rota" && assetBrandLower.includes("biorota")) return true;
      if (currentBrand === "NET Insaat" && (assetBrandLower.includes("net") || assetBrandLower === "netidm.com")) return true;
      if (currentBrand === "SOM Prefabrik" && (assetBrandLower.includes("som") || assetBrandLower.includes("prefabrik"))) return true;
      
      return false;
    });
  }, [data, currentBrand]);

  const users = usersData?.users ?? [];

  const defaultFormValues: AssetFormValues | null = useMemo(() => {
    if (!companyId || users.length === 0) {
      return null;
    }

    return {
      companyId,
      brand: currentBrand,
      type: AssetTypeEnum.options[0] ?? "Sosyal Medya",
      url: "",
      username: "",
      password: "",
      responsibleUserId: users[0]?.id,
      email: "",
      status: AssetStatusEnum.options[0] ?? "Aktif",
      twoFactorStatus: TwoFactorStatusEnum.options[0] ?? "Yok",
      priority: PriorityEnum.options[1] ?? "Medium"
    };
  }, [companyId, users, currentBrand]);

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedAsset(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (asset: AssetSummary) => {
    setDialogMode("edit");
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormSubmit = async (values: AssetFormValues) => {
    try {
      if (dialogMode === "create") {
        await createAsset({ ...values, password: values.password || "" }).unwrap();
        setSnackbarMessage("Asset created successfully");
      } else if (selectedAsset) {
        const { password, ...rest } = values;
        console.log("Updating asset with data:", {
          assetId: selectedAsset.id,
          ...rest,
          ...(password ? { password } : {})
        });
        await updateAsset({
          assetId: selectedAsset.id,
          ...rest,
          ...(password ? { password } : {})
        }).unwrap();
        setSnackbarMessage("Asset updated successfully");
      }
    } catch (error) {
      console.error("Failed to save asset:", error);
      setSnackbarMessage(`Failed to save asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteClick = (asset: AssetSummary) => {
    setAssetToDelete(asset);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (assetToDelete) {
      try {
        await deleteAsset(assetToDelete.id).unwrap();
        setSnackbarMessage("Asset deleted successfully");
      } catch (error) {
        setSnackbarMessage("Failed to delete asset");
      }
    }
    setDeleteConfirmOpen(false);
    setAssetToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setAssetToDelete(null);
  };

  // Helper function to get icon for asset type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Sosyal Medya":
        return <FacebookIcon fontSize="small" />;
      case "Web Sitesi":
        return <LanguageIcon fontSize="small" />;
      case "Analitik":
        return <BarChartIcon fontSize="small" />;
      case "Reklam":
        return <CampaignIcon fontSize="small" />;
      case "Entegrasyon":
        return <IntegrationInstructionsIcon fontSize="small" />;
      case "Emlak":
        return <HomeWorkIcon fontSize="small" />;
      case "Profesyonel":
        return <BusinessCenterIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Get platform-specific icon based on URL or username
  const getPlatformIcon = (url: string, username: string, type: string) => {
    const urlLower = url.toLowerCase();
    const usernameLower = username.toLowerCase();
    
    // Social Media platforms
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
      return <FacebookIcon fontSize="small" color="primary" />;
    }
    if (urlLower.includes('instagram.com')) {
      return <InstagramIcon fontSize="small" sx={{ color: '#E4405F' }} />;
    }
    if (urlLower.includes('tiktok.com')) {
      return <MusicNoteIcon fontSize="small" sx={{ color: '#000000' }} />;
    }
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return <TwitterIcon fontSize="small" sx={{ color: '#1DA1F2' }} />;
    }
    if (urlLower.includes('linkedin.com')) {
      return <LinkedInIcon fontSize="small" sx={{ color: '#0A66C2' }} />;
    }
    if (urlLower.includes('youtube.com')) {
      return <YouTubeIcon fontSize="small" sx={{ color: '#FF0000' }} />;
    }
    if (urlLower.includes('pinterest.com')) {
      return <PinterestIcon fontSize="small" sx={{ color: '#E60023' }} />;
    }
    if (urlLower.includes('telegram')) {
      return <TelegramIcon fontSize="small" sx={{ color: '#0088cc' }} />;
    }
    if (urlLower.includes('whatsapp')) {
      return <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />;
    }
    if (urlLower.includes('snapchat')) {
      return <PhotoCameraIcon fontSize="small" sx={{ color: '#FFFC00' }} />;
    }
    
    // Google services
    if (urlLower.includes('google.com') || urlLower.includes('analytics') || 
        urlLower.includes('search console') || urlLower.includes('tag manager')) {
      return <SearchIcon fontSize="small" sx={{ color: '#4285F4' }} />;
    }
    
    // Integration/Automation
    if (urlLower.includes('zapier') || usernameLower.includes('zapier')) {
      return <IntegrationInstructionsIcon fontSize="small" sx={{ color: '#FF4A00' }} />;
    }
    
    // Real estate platforms
    if (urlLower.includes('sahibinden') || urlLower.includes('emlakjet')) {
      return <HomeWorkIcon fontSize="small" sx={{ color: '#FFD500' }} />;
    }
    
    // Meta/Facebook Business
    if (urlLower.includes('business.facebook') || urlLower.includes('meta')) {
      return <BusinessCenterIcon fontSize="small" sx={{ color: '#0668E1' }} />;
    }
    
    // Ads platforms
    if (urlLower.includes('ads') || type === 'Reklam') {
      return <CampaignIcon fontSize="small" sx={{ color: '#34A853' }} />;
    }
    
    // Default icons based on type
    return getTypeIcon(type);
  };

  const columns: GridColDef<AssetSummary>[] = [
    {
      field: "brand",
      headerName: "Brand",
      width: 150,
      resizable: true,
      renderCell: (params: GridRenderCellParams<AssetSummary>) => (
        <Chip
          label={params.row.brand || "Unassigned"}
          color={params.row.brand ? "primary" : "default"}
          size="small"
          variant={params.row.brand ? "filled" : "outlined"}
        />
      )
    },
    {
      field: "type",
      headerName: "Type",
      width: 180,
      resizable: true,
      renderCell: (params: GridRenderCellParams<AssetSummary>) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {getPlatformIcon(params.row.url, params.row.username, params.row.type)}
          <Typography variant="body2">{params.row.type}</Typography>
        </Stack>
      )
    },
    { field: "url", headerName: "URL", width: 250, resizable: true },
    { field: "username", headerName: "Username", width: 150, resizable: true },
    {
      field: "responsible",
      headerName: "Responsible",
      width: 150,
      resizable: true,
      valueGetter: (_value: unknown, row: AssetSummary) => row?.responsibleUser?.name || "N/A"
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 140,
      resizable: true,
      valueGetter: (_value: unknown, row: AssetSummary) => row?.responsibleUser?.phone || "N/A"
    },
    { field: "email", headerName: "Email", width: 200, resizable: true },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      resizable: true,
      renderCell: (params: GridRenderCellParams<AssetSummary>) => (
        <Chip
          icon={params.row.status === "Aktif" ? <CheckCircleIcon /> : <CancelIcon />}
          label={params.row.status}
          color={params.row.status === "Aktif" ? "success" : "default"}
          size="small"
        />
      )
    },
    {
      field: "twoFactorStatus",
      headerName: "2FA",
      width: 150,
      resizable: true,
      renderCell: (params: GridRenderCellParams<AssetSummary>) => (
        <Chip
          icon={params.row.twoFactorStatus === "SMS" ? <SmsIcon /> : params.row.twoFactorStatus === "Authenticator App" ? <PhonelinkLockIcon /> : <CancelIcon />}
          label={params.row.twoFactorStatus}
          color={params.row.twoFactorStatus === "Yok" ? "default" : "primary"}
          size="small"
        />
      )
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      resizable: true,
      renderCell: (params: GridRenderCellParams<AssetSummary>) => (
        <Chip
          label={params.row.priority}
          color={
            params.row.priority === "High"
              ? "error"
              : params.row.priority === "Medium"
                ? "warning"
                : "default"
          }
          size="small"
        />
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 150,
      resizable: true,
      renderCell: (params: GridRenderCellParams<AssetSummary>) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => {
              console.log('EYE ICON CLICKED - Asset ID:', params.row.id);
              setPasswordAssetId(params.row.id);
            }}
            title="View Password"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleOpenEdit(params.row)}
            title="Edit Asset"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(params.row)}
            title="Delete Asset"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Brand Assets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          disabled={!defaultFormValues}
        >
          New Asset for {currentBrand}
        </Button>
      </Box>

      {/* Brand Tabs */}
      <Paper>
        <Tabs 
          value={currentTab} 
          onChange={(_e: React.SyntheticEvent, newValue: number) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {BRANDS.map((brand, index) => (
            <Tab key={brand} label={brand} value={index} />
          ))}
        </Tabs>
      </Paper>

      {/* Brand Header with Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {currentBrand === 'Model Sanayi Merkezi' && (
          <Box
            component="img"
            src="/brands/model-sanayi-merkezi.png"
            alt="Model Sanayi Merkezi Logo"
            sx={{
              height: 60,
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        )}
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          {rows.length} {rows.length === 1 ? 'asset' : 'assets'}
        </Typography>
      </Box>

      {/* DataGrid for current brand */}
      <Paper sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          getRowId={(row: AssetSummary) => row.id}
          columnHeaderHeight={56}
          sx={{
            '& .MuiDataGrid-columnSeparator': {
              visibility: 'visible !important',
              color: 'rgba(224, 224, 224, 1)'
            },
            '& .MuiDataGrid-columnHeader:hover .MuiDataGrid-columnSeparator': {
              color: 'primary.main'
            }
          }}
        />
      </Paper>

      {defaultFormValues && (
        <AssetFormDialog
          open={isDialogOpen}
          title={dialogMode === "create" ? "Create Asset" : "Edit Asset"}
          onClose={handleCloseDialog}
          onSubmit={handleFormSubmit}
          initialValues={
            dialogMode === "create"
              ? defaultFormValues
              : {
                  companyId: selectedAsset?.companyId ?? defaultFormValues.companyId,
                  brand: selectedAsset?.brand,
                  type: selectedAsset?.type ?? defaultFormValues.type,
                  url: selectedAsset?.url ?? "",
                  username: selectedAsset?.username ?? "",
                  password: "",
                  responsibleUserId:
                    selectedAsset?.responsibleUser.id ?? defaultFormValues.responsibleUserId,
                  email: selectedAsset?.email ?? "",
                  status: selectedAsset?.status ?? defaultFormValues.status,
                  twoFactorStatus:
                    selectedAsset?.twoFactorStatus ?? defaultFormValues.twoFactorStatus,
                  priority: selectedAsset?.priority ?? defaultFormValues.priority
                }
              }
          users={users}
        />
      )}

      <Dialog open={Boolean(passwordAssetId)} onClose={() => setPasswordAssetId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Password Details</DialogTitle>
        <DialogContent>
          {isFetchingDetails ? (
            <Typography>Loading…</Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  URL
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
                  <Typography sx={{ wordBreak: 'break-all' }}>
                    {assetDetails?.asset.url ?? "N/A"}
                  </Typography>
                </Paper>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Username
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
                  <Typography>{assetDetails?.asset.username ?? "N/A"}</Typography>
                </Paper>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Password
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography 
                      sx={{ 
                        flex: 1,
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        color: (assetDetails?.asset.password && assetDetails.asset.password.length > 0) ? 'text.primary' : 'text.disabled'
                      }}
                    >
                      {(assetDetails?.asset.password && assetDetails.asset.password.length > 0) 
                        ? assetDetails.asset.password 
                        : "(No password set)"}
                    </Typography>
                    {(assetDetails?.asset.password && assetDetails.asset.password.length > 0) && (
                      <Button
                        size="small"
                        onClick={() => {
                          if (assetDetails?.asset.password) {
                            navigator.clipboard.writeText(assetDetails.asset.password);
                            setSnackbarMessage("Password copied to clipboard!");
                          }
                        }}
                      >
                        Copy
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CloseIcon />} onClick={() => setPasswordAssetId(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Asset?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the asset "{assetToDelete?.url}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        message={snackbarMessage}
        onClose={() => setSnackbarMessage(null)}
      />
    </Stack>
  );
};

export default AssetsPage;
