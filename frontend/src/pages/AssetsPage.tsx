import { useMemo, useState } from "react";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
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
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
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
  useUpdateAssetMutation
} from "../features/assets/assetsApi.js";
import { useGetCompanyUsersQuery } from "../features/users/usersApi.js";

// Brand names
const BRANDS = [
  "Model Sanayi Merkezi",
  "Model Kuyum Merkezi",
  "İNNO Gayrimenkul",
  "Bio Rota",
  "Net İnşaat",
  "Som Prefabrik"
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

  const {
    data: assetDetails,
    isFetching: isFetchingDetails,
    refetch: refetchDetails
  } = useGetAssetDetailsQuery(passwordAssetId ?? 0, {
    skip: !passwordAssetId
  });

  const currentBrand = BRANDS[currentTab];

  // Filter assets by current brand (or show unassigned assets in first tab)
  const rows = useMemo<AssetSummary[]>(() => {
    const allAssets = (data?.assets ?? []).filter(Boolean);
    // Show assets matching current brand OR assets without a brand (unassigned)
    return allAssets.filter((asset: AssetSummary) => 
      asset.brand === currentBrand || !asset.brand
    );
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
        await createAsset(values).unwrap();
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
          {getTypeIcon(params.row.type)}
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
              setPasswordAssetId(params.row.id);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
            <EditIcon fontSize="small" />
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

      <Dialog open={Boolean(passwordAssetId)} onClose={() => setPasswordAssetId(null)}>
        <DialogTitle>Password Details</DialogTitle>
        <DialogContent>
          {isFetchingDetails ? (
            <Typography>Loading…</Typography>
          ) : (
            <Stack spacing={1}>
              <Typography variant="subtitle2">URL</Typography>
              <Typography>{assetDetails?.asset.url ?? ""}</Typography>
              <Typography variant="subtitle2">Username</Typography>
              <Typography>{assetDetails?.asset.username ?? ""}</Typography>
              <Typography variant="subtitle2">Password</Typography>
              <Typography>{assetDetails?.asset.password ?? ""}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CloseIcon />} onClick={() => setPasswordAssetId(null)}>
            Close
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
