import { createApi } from "@reduxjs/toolkit/query/react";
import type { TaskStatus, TaskSummary } from "@assetmanagement/common-types";

import { baseQuery } from "../../services/baseQuery.js";

export type CreateTaskPayload = {
  title: string;
  description: string;
  handlerId: number;
  assetId?: number;
  dueDate?: string;
  files?: string[];
  status?: TaskStatus;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  taskId: number;
};

export type TaskListResponse = {
  tasks: TaskSummary[];
};

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery,
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    getTasks: builder.query<TaskListResponse, void>({
      query: () => ({
        url: "/tasks",
        method: "GET"
      }),
      providesTags: (result: TaskListResponse | undefined) =>
        result
          ? [
              ...result.tasks.map(({ id }) => ({ type: "Tasks" as const, id })),
              { type: "Tasks" as const, id: "LIST" }
            ]
          : [{ type: "Tasks" as const, id: "LIST" }]
    }),
    createTask: builder.mutation<TaskSummary, CreateTaskPayload>({
      query: (body: CreateTaskPayload) => ({
        url: "/tasks",
        method: "POST",
        body
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }]
    }),
    updateTask: builder.mutation<TaskSummary, UpdateTaskPayload>({
      query: ({ taskId, ...body }: UpdateTaskPayload) => ({
        url: `/tasks/${taskId}`,
        method: "PUT",
        body
      }),
      invalidatesTags: (
        _result: TaskSummary | undefined,
        _error: unknown,
        { taskId }: { taskId: number }
      ) => [{ type: "Tasks", id: taskId }, { type: "Tasks", id: "LIST" }]
    }),
    deleteTask: builder.mutation<{ message: string }, number>({
      query: (taskId: number) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE"
      }),
      invalidatesTags: (_result, _error, taskId) => [
        { type: "Tasks", id: taskId },
        { type: "Tasks", id: "LIST" }
      ]
    })
  })
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} = tasksApi;
