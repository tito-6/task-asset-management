import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { TaskStatusEnum, type TaskSummary, type TaskStatus } from "@assetmanagement/common-types";

import { useAppSelector } from "../app/hooks.js";
import TaskFormDialog, {
  type TaskFormValues
} from "../components/TaskFormDialog.js";
import {
  useCreateTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} from "../features/tasks/tasksApi.js";
import { useGetCompanyUsersQuery } from "../features/users/usersApi.js";
import { useGetCompanyAssetsQuery } from "../features/assets/assetsApi.js";

const statusColumns = TaskStatusEnum.options as readonly string[];

// Define colors for each task status
const getStatusColor = (status: string): { main: string; light: string; dark: string } => {
  switch (status) {
    case "To Do":
      return { main: "#2196F3", light: "#E3F2FD", dark: "#1976D2" }; // Blue
    case "In Progress":
      return { main: "#FF9800", light: "#FFF3E0", dark: "#F57C00" }; // Orange
    case "Done":
      return { main: "#4CAF50", light: "#E8F5E9", dark: "#388E3C" }; // Green
    case "Awaiting Confirmation":
      return { main: "#9C27B0", light: "#F3E5F5", dark: "#7B1FA2" }; // Purple
    default:
      return { main: "#757575", light: "#F5F5F5", dark: "#616161" }; // Grey
  }
};

const TasksPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const companyId = user?.companyId ?? null;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedTask, setSelectedTask] = useState<TaskSummary | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const { data, isLoading } = useGetTasksQuery();
  const { data: usersData } = useGetCompanyUsersQuery(companyId ?? 0, {
    skip: !companyId
  });
  const { data: assetsData } = useGetCompanyAssetsQuery(companyId ?? 0, {
    skip: !companyId
  });

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskSummary | null>(null);

  const handlers = usersData?.users ?? [];
  const assets = assetsData?.assets ?? [];

  const groupedTasks = useMemo(() => {
    const tasks = data?.tasks ?? [];
    return statusColumns.map((status) => ({
      status,
      tasks: tasks.filter((task: TaskSummary) => task.status === status)
    }));
  }, [data]);

  const defaultStatus: TaskStatus = "To Do";

  const defaultFormValues: TaskFormValues | null = useMemo(() => {
    if (!handlers.length) {
      return null;
    }

    return {
      title: "",
      description: "",
      handlerId: handlers[0].id,
      assetId: null,
      dueDate: null,
      files: [],
      status: defaultStatus
    };
  }, [defaultStatus, handlers]);

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedTask(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (task: TaskSummary) => {
    setDialogMode("edit");
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (values: TaskFormValues) => {
    try {
      if (dialogMode === "create") {
        await createTask({ 
          ...values, 
          assetId: values.assetId ?? undefined,
          dueDate: values.dueDate ?? undefined
        }).unwrap();
        setSnackbarMessage("Task created successfully");
      } else if (selectedTask) {
        await updateTask({
          taskId: selectedTask.id,
          ...values,
          assetId: values.assetId ?? undefined,
          dueDate: values.dueDate ?? undefined
        }).unwrap();
        setSnackbarMessage("Task updated successfully");
      }
    } catch (error) {
      setSnackbarMessage("Failed to save task");
    }
  };

  const handleDeleteClick = (task: TaskSummary) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete.id).unwrap();
        setSnackbarMessage("Task deleted successfully");
      } catch (error) {
        setSnackbarMessage("Failed to delete task");
      }
    }
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          disabled={!defaultFormValues}
        >
          New Task
        </Button>
      </Box>

      <Grid container spacing={2}>
        {groupedTasks.map(({ status, tasks }: { status: string; tasks: TaskSummary[] }) => {
          const statusColor = getStatusColor(status);
          return (
            <Grid item xs={12} md={3} key={status}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: statusColor.light,
                    borderLeft: `4px solid ${statusColor.main}`
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold"
                    sx={{ color: statusColor.dark }}
                  >
                    {status}
                  </Typography>
                  <Typography variant="caption" sx={{ color: statusColor.dark }}>
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                  </Typography>
                </Box>
                {isLoading && tasks.length === 0 ? (
                  <Typography variant="body2">Loading…</Typography>
                ) : (
                  tasks.map((task: TaskSummary) => (
                    <Card 
                      key={task.id} 
                      variant="outlined"
                      sx={{
                        borderLeft: `4px solid ${statusColor.main}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 4px 12px ${statusColor.main}40`,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">{task.title}</Typography>
                        <Chip 
                          label={status} 
                          size="small"
                          sx={{
                            backgroundColor: statusColor.main,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Stack>
                      <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                        {task.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                        <Chip 
                          label={`👤 ${task.handler.name}`} 
                          size="small"
                          variant="outlined"
                        />
                        {task.assetId && (
                          <Chip 
                            label={`📦 Asset #${task.assetId}`} 
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => handleOpenEdit(task)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => handleDeleteClick(task)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                ))
              )}
            </Stack>
          </Grid>
          );
        })}
      </Grid>

      {defaultFormValues && (
        <TaskFormDialog
          open={isDialogOpen}
          title={dialogMode === "create" ? "Create Task" : "Edit Task"}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          initialValues={
            dialogMode === "create"
              ? defaultFormValues
              : {
                  title: selectedTask?.title ?? "",
                  description: selectedTask?.description ?? "",
                  handlerId: selectedTask?.handler.id ?? defaultFormValues.handlerId,
                  assetId: selectedTask?.assetId ?? null,
                  dueDate: selectedTask?.dueDate ?? null,
                  files: selectedTask?.files ?? [],
                  status: selectedTask?.status ?? defaultFormValues.status
                }
          }
          handlers={handlers}
          assets={assets}
        />
      )}

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the task "{taskToDelete?.title}"? This action cannot be undone.
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

export default TasksPage;
