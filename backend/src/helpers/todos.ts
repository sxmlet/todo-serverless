import { TodosAccess } from './todosAcess'
 import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate.js'
// import * as createError from 'http-errors'

const todoAccess = new TodosAccess()
const attachment = new AttachmentUtils();

export async function createTodo(userId: string, data: CreateTodoRequest): Promise<TodoItem> {
  const todoItem: TodoItem = {
    name: data.name,
    dueDate: data.dueDate,
    userId: userId,
    createdAt: Date.now().toString(),
    done: false,
    todoId: uuid.v4(),
  }
  await todoAccess.createTodoItem(todoItem)
  return todoItem;
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  await todoAccess.deleteTodoItem(userId, todoId)
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string> {
  return await attachment.getPresignedUrl(todoId);
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return await todoAccess.getAllTodoItemsForUser(userId);
}

export async function updateTodo(userId: string, todoId: string, data: UpdateTodoRequest): Promise<TodoUpdate> {
  return await todoAccess.updateTodoItem(userId, todoId, data);
}
