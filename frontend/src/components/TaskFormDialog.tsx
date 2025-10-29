import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import {
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

import type { AssetSummary, TaskStatus, UserSafe } from "@assetmanagement/common-types";
import { TaskStatusEnum } from "@assetmanagement/common-types";

export type TaskFormValues = {
  title: string;
  description: string;
  handlerId: number;
  assetId: number | null;
  dueDate: string | null;
  files: string[];
  status: TaskStatus;
};

type TaskFormDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  initialValues: TaskFormValues;
  handlers: UserSafe[];
  assets: AssetSummary[];
};

const statusOptions = TaskStatusEnum.options as readonly TaskStatus[];

const TaskFormDialog = ({
  open,
  title,
  onClose,
  onSubmit,
  initialValues,
  handlers,
  assets
}: TaskFormDialogProps) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [fileInput, setFileInput] = useState(initialValues.files.join(", "));

  useEffect(() => {
    setFormValues(initialValues);
    setFileInput(initialValues.files.join(", "));
  }, [initialValues]);

  const handleChange = <T extends keyof TaskFormValues>(
    key: T,
    value: TaskFormValues[T]
  ) => {
    setFormValues((prev: TaskFormValues) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const files = fileInput
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);

    await onSubmit({ ...formValues, files });
    onClose();
  };

  const isValid = formValues.title.trim().length > 0 && formValues.description.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={formValues.title}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange("title", event.target.value)
            }
            fullWidth
            required
            error={formValues.title.trim().length === 0}
            helperText={formValues.title.trim().length === 0 ? "Title is required" : ""}
          />
          <TextField
            label="Description"
            value={formValues.description}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange("description", event.target.value)
            }
            fullWidth
            multiline
            minRows={3}
            required
            error={formValues.description.trim().length === 0}
            helperText={formValues.description.trim().length === 0 ? "Description is required" : ""}
          />
          <FormControl fullWidth>
            <InputLabel id="handler-label">Assign To</InputLabel>
            <Select
              labelId="handler-label"
              label="Assign To"
              value={formValues.handlerId.toString()}
              onChange={(event: SelectChangeEvent<string>) =>
                handleChange("handlerId", Number.parseInt(event.target.value, 10))
              }
            >
              {handlers.map((handler) => (
                <MenuItem key={handler.id} value={handler.id}>
                  {handler.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="asset-label">Related Asset</InputLabel>
            <Select
              labelId="asset-label"
              label="Related Asset"
              value={formValues.assetId ? formValues.assetId.toString() : ""}
              onChange={(event: SelectChangeEvent<string>) => {
                const value = event.target.value;
                handleChange("assetId", value ? Number.parseInt(value, 10) : null);
              }}
            >
              <MenuItem value="">None</MenuItem>
              {assets.map((asset) => (
                <MenuItem key={asset.id} value={asset.id}>
                  {asset.url}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            type="datetime-local"
            value={formValues.dueDate ?? ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange("dueDate", event.target.value || null)
            }
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={formValues.status}
              onChange={(event: SelectChangeEvent<TaskStatus>) =>
                handleChange("status", event.target.value as TaskStatus)
              }
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Files (comma separated URLs)"
            value={fileInput}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setFileInput(event.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskFormDialog;
