import { createApi } from "@reduxjs/toolkit/query/react";
import type { TaskStatus, TaskSummary } from "@assetmanagement/common-types";

import { baseQuery } from "../../services/baseQuery.js";

type TasksEndpointBuilder = {
  query<TResult, TQueryArg>(definition: {
    query: (arg: TQueryArg) => {
      url: string;
      method: string;
      body?: unknown;
    };
    providesTags?:
      | Array<{ type: "Tasks"; id: string | number }>
      | ((
          result: TResult | undefined,
          error: unknown,
          arg: TQueryArg
        ) => Array<{ type: "Tasks"; id: string | number }>);
  }): unknown;
  mutation<TResult, TArg>(definition: {
    query: (arg: TArg) => {
      url: string;
      method: string;
      body?: unknown;
    };
    invalidatesTags?:
      | Array<{ type: "Tasks"; id: string | number }>
      | ((
          result: TResult | undefined,
          error: unknown,
          arg: TArg
        ) => Array<{ type: "Tasks"; id: string | number }>);
  }): unknown;
};

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
  endpoints: (builder: TasksEndpointBuilder) => ({
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
    })
  })
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation
} = tasksApi;
