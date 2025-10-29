import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import {
  AssetStatusEnum,
  AssetTypeEnum,
  PriorityEnum,
  TwoFactorStatusEnum,
  type UserSafe
} from "@assetmanagement/common-types";

const assetTypeOptions = AssetTypeEnum.options as readonly string[];
const assetStatusOptions = AssetStatusEnum.options as readonly string[];
const twoFactorOptions = TwoFactorStatusEnum.options as readonly string[];
const priorityOptions = PriorityEnum.options as readonly string[];

const BRAND_OPTIONS = [
  "Model Sanayi Merkezi",
  "Model Kuyum Merkezi",
  "İNNO Gayrimenkul",
  "Bio Rot",
  "Net İnşaat",
  "Som Prefabrik"
];

export type AssetFormValues = {
  companyId: number;
  brand?: string;
  type: string;
  url: string;
  username: string;
  password?: string;
  responsibleUserId?: number;
  email: string;
  status: string;
  twoFactorStatus: string;
  priority: string;
};

type AssetFormDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (values: AssetFormValues) => Promise<void> | void;
  initialValues: AssetFormValues;
  showPasswordField?: boolean;
  users: UserSafe[];
};

const AssetFormDialog = ({
  open,
  title,
  onClose,
  onSubmit,
  initialValues,
  showPasswordField = true,
  users
}: AssetFormDialogProps) => {
  const [formValues, setFormValues] = useState(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleChange = <T extends keyof AssetFormValues>(
    key: T,
    value: AssetFormValues[T]
  ) => {
    setFormValues((prev: AssetFormValues) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(formValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="asset-type-label">Type</InputLabel>
            <Select
              labelId="asset-type-label"
              label="Type"
              value={formValues.type}
              onChange={(event: SelectChangeEvent<string>) =>
                handleChange("type", event.target.value)
              }
            >
              {assetTypeOptions.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select
              labelId="brand-label"
              label="Brand"
              value={formValues.brand ?? ""}
              onChange={(event: SelectChangeEvent<string>) =>
                handleChange("brand", event.target.value)
              }
            >
              {BRAND_OPTIONS.map((brand: string) => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="URL"
            value={formValues.url}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange("url", event.target.value)
            }
            fullWidth
          />
          <TextField
            label="Username"
            value={formValues.username}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange("username", event.target.value)
            }
            fullWidth
          />
          {showPasswordField && (
            <TextField
              label="Password"
              type="password"
              value={formValues.password ?? ""}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleChange("password", event.target.value)
              }
              fullWidth
            />
          )}
          <FormControl fullWidth>
            <InputLabel id="responsible-label">Responsible</InputLabel>
            <Select
              labelId="responsible-label"
              label="Responsible"
              value={formValues.responsibleUserId?.toString() ?? ""}
              onChange={(event: SelectChangeEvent<string>) =>
                handleChange(
                  "responsibleUserId",
                  Number.parseInt(event.target.value, 10)
                )
              }
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Email"
            type="email"
            value={formValues.email}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange("email", event.target.value)
            }
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={formValues.status}
              onChange={(event: SelectChangeEvent<string>) =>
                handleChange("status", event.target.value)
              }
            >
              {assetStatusOptions.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="twofactor-label">2FA Status</InputLabel>
            <Select
              labelId="twofactor-label"
              label="2FA Status"
              value={formValues.twoFactorStatus}
              onChange={(event: SelectChangeEvent<string>) =>
                handleChange("twoFactorStatus", event.target.value)
              }
            >
              {twoFactorOptions.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              label="Priority"
              value={formValues.priority}
              onChange={(event: SelectChangeEvent<string>) =>
                handleChange("priority", event.target.value)
              }
            >
              {priorityOptions.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetFormDialog;
