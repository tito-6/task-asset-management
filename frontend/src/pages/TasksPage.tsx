import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

import { TaskStatusEnum, type TaskSummary } from "@assetmanagement/common-types";

import { useAppSelector } from "../app/hooks.js";
import TaskFormDialog, {
  type TaskFormValues
} from "../components/TaskFormDialog.js";
import {
  useCreateTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation
} from "../features/tasks/tasksApi.js";
import { useGetCompanyUsersQuery } from "../features/users/usersApi.js";
import { useGetCompanyAssetsQuery } from "../features/assets/assetsApi.js";

const statusColumns = TaskStatusEnum.options as readonly string[];

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

  const handlers = usersData?.users ?? [];
  const assets = assetsData?.assets ?? [];

  const groupedTasks = useMemo(() => {
    const tasks = data?.tasks ?? [];
    return statusColumns.map((status) => ({
      status,
      tasks: tasks.filter((task: TaskSummary) => task.status === status)
    }));
  }, [data]);

  const defaultStatus = statusColumns[0] ?? "To Do";

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
        await createTask({ ...values, assetId: values.assetId ?? undefined }).unwrap();
        setSnackbarMessage("Task created successfully");
      } else if (selectedTask) {
        await updateTask({
          taskId: selectedTask.id,
          ...values,
          assetId: values.assetId ?? undefined
        }).unwrap();
        setSnackbarMessage("Task updated successfully");
      }
    } catch (error) {
      setSnackbarMessage("Failed to save task");
    }
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
        {groupedTasks.map(({ status, tasks }: { status: string; tasks: TaskSummary[] }) => (
          <Grid item xs={12} md={3} key={status}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">{status}</Typography>
              {isLoading && tasks.length === 0 ? (
                <Typography variant="body2">Loading…</Typography>
              ) : (
                tasks.map((task: TaskSummary) => (
                  <Card key={task.id} variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{task.title}</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {task.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={`Handler: ${task.handler.name}`} size="small" />
                        {task.assetId && <Chip label={`Asset #${task.assetId}`} size="small" />}
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
                    </CardActions>
                  </Card>
                ))
              )}
            </Stack>
          </Grid>
        ))}
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
